package com.scamlens.shield

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (Telephony.Sms.Intents.SMS_RECEIVED_ACTION != intent.action) return

        val prefs = context.getSharedPreferences("scamlens_prefs", Context.MODE_PRIVATE)
        val smsScanEnabled = prefs.getBoolean("enable_sms_screening", false)
        if (!smsScanEnabled) return

        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        val fullBody = messages.joinToString("") { it.messageBody ?: "" }

        if (fullBody.isBlank()) return

        // Load rules from assets or defaults
        val rulesJson = context.assets.open("rules.json").bufferedReader().use { it.readText() }
        val engine = RuleEngine(context)
        val findings = engine.evaluate(fullBody, rulesJson)

        if (findings.isNotEmpty()) {
            val categories = findings.map { it.category }.distinct()
            val preview = if (fullBody.length > 50) fullBody.take(50) + "..." else fullBody
            AlertNotifier.postSmsAlert(context, preview, categories)
        }
        // CRITICAL PRIVACY GUARANTEE: Never store the message body
    }
}
