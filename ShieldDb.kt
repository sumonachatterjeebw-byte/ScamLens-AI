package com.scamlens.shield

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class CallEventRecord(
    val id: String,
    val timestamp: Long,
    val last4Digits: String,
    val signals: List<String>,
    val userAction: String
)

object ShieldDb {
    private const val PREFS_NAME = "scamlens_shield_history"
    private const val EVENTS_KEY = "call_events_log"
    private const val THIRTY_DAYS_MS = 30L * 24 * 60 * 60 * 1000

    fun recordEvent(context: Context, number: String, signals: List<String>, userAction: String = "received") {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val historyAllowed = context.getSharedPreferences("scamlens_prefs", Context.MODE_PRIVATE)
            .getBoolean("store_local_history", true)
        if (!historyAllowed) return

        val now = System.currentTimeMillis()
        val last4 = if (number.length > 4) number.takeLast(4) else number

        val events = getAllEvents(context).toMutableList()
        // Auto-purge events older than 30 days
        val pruned = events.filter { now - it.timestamp < THIRTY_DAYS_MS }.toMutableList()

        pruned.add(
            CallEventRecord(
                id = "EVT_${System.currentTimeMillis()}",
                timestamp = now,
                last4Digits = last4,
                signals = signals,
                userAction = userAction
            )
        )

        val array = JSONArray()
        for (evt in pruned) {
            val obj = JSONObject()
            obj.put("id", evt.id)
            obj.put("timestamp", evt.timestamp)
            obj.put("last4Digits", evt.last4Digits)
            obj.put("signals", JSONArray(evt.signals))
            obj.put("userAction", evt.userAction)
            array.put(obj)
        }

        prefs.edit().putString(EVENTS_KEY, array.toString()).apply()
    }

    fun getAllEvents(context: Context): List<CallEventRecord> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val str = prefs.getString(EVENTS_KEY, "[]") ?: "[]"
        val list = mutableListOf<CallEventRecord>()
        try {
            val array = JSONArray(str)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val signalsArr = obj.getJSONArray("signals")
                val sigs = mutableListOf<String>()
                for (j in 0 until signalsArr.length()) {
                    sigs.add(signalsArr.getString(j))
                }
                list.add(
                    CallEventRecord(
                        id = obj.getString("id"),
                        timestamp = obj.getLong("timestamp"),
                        last4Digits = obj.getString("last4Digits"),
                        signals = sigs,
                        userAction = obj.optString("userAction", "received")
                    )
                )
            }
        } catch (e: Exception) {
            // ignore
        }
        return list
    }

    fun getCallCountInPastHour(context: Context, number: String): Int {
        val now = System.currentTimeMillis()
        val oneHourAgo = now - 60 * 60 * 1000
        val last4 = if (number.length > 4) number.takeLast(4) else number
        val events = getAllEvents(context)
        return events.count { it.last4Digits == last4 && it.timestamp >= oneHourAgo }
    }

    fun clearHistory(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
    }
}
