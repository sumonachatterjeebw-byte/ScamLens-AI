package com.scamlens.shield

import android.app.Activity
import android.content.Intent
import android.os.Bundle

class ShareActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (intent?.action == Intent.ACTION_SEND && intent.type == "text/plain") {
            val sharedText = intent.getStringExtra(Intent.EXTRA_TEXT) ?: ""
            val mainIntent = Intent(this, MainActivity::class.java).apply {
                putExtra("EXTRA_SHARED_TEXT", sharedText)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(mainIntent)
        }
        finish()
    }
}
