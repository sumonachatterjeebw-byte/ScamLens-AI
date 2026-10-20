package com.scamlens.shield

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

object AlertNotifier {
    private const val CHANNEL_ID = "scamlens_shield_alerts"

    fun postCallAlert(context: Context, number: String, signals: List<String>) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "ScamLens Caution Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Shows transparent, evidence-linked heads-up alerts during unfamiliar calls"
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Mask phone number to last 4 digits for privacy
        val masked = if (number.length > 4) "..." + number.takeLast(4) else number

        val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("EXTRA_NUMBER", number)
            putExtra("EXTRA_SIGNALS", ArrayList(signals))
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Cautious wording required by Section 7 & 8: Never write "scam caller"
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("Unverified / Unknown Caller ($masked)")
            .setContentText("Carrier did not verify caller ID. This is a caution, not proof.")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Observed facts: ${signals.joinToString(" • ")}\nCaution: An unfamiliar number is not proof of fraud. Verify independently.")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .addAction(android.R.drawable.ic_menu_info_details, "Inspect Facts", pendingIntent)
            .build()

        notificationManager.notify(number.hashCode(), notification)
    }

    fun postSmsAlert(context: Context, preview: String, categories: List<String>) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val intent = Intent(context, MainActivity::class.java).apply {
            putExtra("EXTRA_SMS_ALERT", preview)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            1,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("Message Warning Signals Detected")
            .setContentText("Signs: ${categories.joinToString(", ")}. Tap to review evidence.")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Detected signals in incoming SMS: ${categories.joinToString(", ")}.\nOpen ScamLens to see exact evidence quotes.")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
}
