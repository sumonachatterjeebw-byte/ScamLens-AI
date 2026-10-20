package com.scamlens.shield

import android.content.Context
import org.json.JSONObject
import java.util.regex.Pattern

data class FindingItem(
    val id: String,
    val category: String,
    val severity: String,
    val quote: String,
    val explanation: String
)

class RuleEngine(private val context: Context) {

    fun evaluate(text: String, rulesJsonString: String): List<FindingItem> {
        val findings = mutableListOf<FindingItem>()
        try {
            val json = JSONObject(rulesJsonString)
            val rulesArray = json.getJSONArray("rules")

            for (i in 0 until rulesArray.length()) {
                val rule = rulesArray.getJSONObject(i)
                val id = rule.getString("id")
                val category = rule.getString("category")
                val patternStr = rule.getString("pattern")
                val severity = rule.getString("severity")
                val explanation = rule.getString("explanation")

                val pattern = Pattern.compile(patternStr, Pattern.CASE_INSENSITIVE)
                val matcher = pattern.matcher(text)

                if (matcher.find()) {
                    val quote = matcher.group(0) ?: ""
                    // Check suppressors if any
                    val suppressors = rule.optJSONArray("suppressors")
                    var isSuppressed = false
                    if (suppressors != null) {
                        for (j in 0 until suppressors.length()) {
                            val supPat = Pattern.compile(suppressors.getString(j), Pattern.CASE_INSENSITIVE)
                            if (supPat.matcher(text).find()) {
                                isSuppressed = true
                                break
                            }
                        }
                    }

                    if (!isSuppressed && quote.isNotEmpty()) {
                        findings.add(
                            FindingItem(
                                id = id,
                                category = category,
                                severity = severity,
                                quote = quote,
                                explanation = explanation
                            )
                        )
                    }
                }
            }
        } catch (e: Exception) {
            // Safe fallback: never crash
        }
        return findings
    }
}
