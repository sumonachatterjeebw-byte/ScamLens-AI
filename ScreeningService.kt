package com.scamlens.shield

import android.content.Context
import android.os.Build
import android.telecom.Call
import android.telecom.CallScreeningService
import androidx.annotation.RequiresApi

@RequiresApi(Build.VERSION_CODES.Q)
class ScreeningService : CallScreeningService() {

    override fun onScreenCall(callDetails: Call.Details) {
        val number = callDetails.handle?.schemeSpecificPart ?: "Unknown"
        val isIncoming = callDetails.direction == Call.Details.DIRECTION_INCOMING

        if (!isIncoming) {
            respondToCall(callDetails, CallResponse.Builder().build())
            return
        }

        // Observed device facts
        val signals = mutableListOf<String>()
        val prefs = getSharedPreferences("scamlens_prefs", Context.MODE_PRIVATE)

        // 1. Check if caller ID is verified by carrier (STIR/SHAKEN, API 30+)
        var isVerified = false
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val status = callDetails.callerNumberVerificationStatus
            if (status == Call.Details.CALLER_NUMBER_VERIFICATION_STATUS_PASSED) {
                isVerified = true
            } else {
                signals.add("Caller ID not verified by carrier")
            }
        }

        // 2. Check contacts (device lookup only)
        val isInContacts = checkContacts(number)
        if (!isInContacts) {
            signals.add("Number not in saved contacts")
        }

        // 3. Check presentation / withheld
        if (callDetails.handlePresentation == Call.Details.PRESENTATION_RESTRICTED) {
            signals.add("Caller number is withheld/private")
        }

        // 4. Repeated calls check (local counter)
        val callCount = ShieldDb.getCallCountInPastHour(this, number)
        if (callCount >= 2) {
            signals.add("Multiple calls in the past hour (${callCount + 1})")
        }

        // Always allow the call by default per Section 7 specification
        // Silencing is strictly opt-in and off by default
        val silenceSetting = prefs.getBoolean("silence_suspicious_calls", false)
        val shouldSilence = silenceSetting && signals.isNotEmpty()

        val response = CallResponse.Builder()
            .setDisallowCall(false) // Never block automatically
            .setRejectCall(false)   // Never reject automatically
            .setSilenceCall(shouldSilence)
            .setSkipCallLog(false)
            .setSkipNotification(false)
            .build()

        respondToCall(callDetails, response)

        // If unfamiliar number or unverified, post caution notification
        if (signals.isNotEmpty() && !isInContacts) {
            AlertNotifier.postCallAlert(this, number, signals)
        }

        // Record minimal event (last 4 digits only, timestamp, signal count)
        ShieldDb.recordEvent(this, number, signals)
    }

    private fun checkContacts(phoneNumber: String): Boolean {
        // Query ContactsContract locally if permission granted
        return try {
            val uri = android.net.Uri.withAppendedPath(
                android.provider.ContactsContract.PhoneLookup.CONTENT_FILTER_URI,
                android.net.Uri.encode(phoneNumber)
            )
            val cursor = contentResolver.query(uri, arrayOf(android.provider.ContactsContract.PhoneLookup.DISPLAY_NAME), null, null, null)
            val found = cursor != null && cursor.moveToFirst()
            cursor?.close()
            found
        } catch (e: Exception) {
            false
        }
    }
}
