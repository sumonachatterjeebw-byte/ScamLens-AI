package com.scamlens.shield

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val initialNumber = intent.getStringExtra("EXTRA_NUMBER") ?: ""
        val initialSignals = intent.getStringArrayListExtra("EXTRA_SIGNALS") ?: arrayListOf()
        val sharedText = intent.getStringExtra("EXTRA_SHARED_TEXT") ?: ""

        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Color(0xFF1F3A5F),
                    secondary = Color(0xFF0F766E),
                    background = Color(0xFFF7F9FB),
                    surface = Color.White
                )
            ) {
                ShieldApp(
                    initialNumber = initialNumber,
                    initialSignals = initialSignals,
                    sharedText = sharedText,
                    onSimulateCall = { num, sigs ->
                        AlertNotifier.postCallAlert(this, num, sigs)
                    }
                )
            }
        }
    }
}

@Composable
fun ShieldApp(
    initialNumber: String,
    initialSignals: List<String>,
    sharedText: String,
    onSimulateCall: (String, List<String>) -> Unit
) {
    var selectedTab by remember { mutableStateOf(if (initialNumber.isNotEmpty()) 1 else 0) }

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    label = { Text("Permissions") },
                    icon = { Text("🛡️") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    label = { Text("Call Alert") },
                    icon = { Text("📞") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    label = { Text("History") },
                    icon = { Text("📜") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    label = { Text("Settings") },
                    icon = { Text("⚙️") }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(Color(0xFFF7F9FB))
        ) {
            when (selectedTab) {
                0 -> SetupScreen(onSimulate = {
                    onSimulateCall("+1 555 0100", listOf("Number not in saved contacts", "Carrier did not verify caller ID"))
                    selectedTab = 1
                })
                1 -> AlertScreen(number = if (initialNumber.isNotEmpty()) initialNumber else "+1 555 0100", signals = if (initialSignals.isNotEmpty()) initialSignals else listOf("Number not in contacts", "Carrier did not verify caller ID"))
                2 -> HistoryScreen()
                3 -> SettingsScreen()
            }
        }
    }
}

@Composable
fun SetupScreen(onSimulate: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("ScamLens Shield Setup", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color(0xFF14202B))
        Text(
            "Opt-in privacy companion. All checks run locally. Zero internet permissions.",
            fontSize = 14.sp,
            color = Color(0xFF475569),
            modifier = Modifier.padding(vertical = 8.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        Card(
            modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("1. Call Screening Role", fontWeight = FontWeight.Bold, color = Color(0xFF1F3A5F))
                Text("Enables: Heads-up alerts when unfamiliar numbers ring.", fontSize = 13.sp)
                Text("Never does: Never records call audio. Never auto-blocks without your tap.", fontSize = 13.sp, color = Color(0xFF64748B))
            }
        }

        Card(
            modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
            shape = RoundedCornerShape(8.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("2. Read Contacts (Optional)", fontWeight = FontWeight.Bold, color = Color(0xFF1F3A5F))
                Text("Enables: Skips alerts for your friends, family, and trusted colleagues.", fontSize = 13.sp)
                Text("Never does: Never uploads contacts to any server.", fontSize = 13.sp, color = Color(0xFF64748B))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = onSimulate,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1F3A5F))
        ) {
            Text("Simulate Unknown Incoming Call (+1 555 0100)")
        }
    }
}

@Composable
fun AlertScreen(number: String, signals: List<String>) {
    var isReported by remember { mutableStateOf(false) }
    var isBlocked by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("Active Call Screening Details", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF14202B))
        Text("Incoming: $number", fontSize = 16.sp, color = Color(0xFF1F3A5F), fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(vertical = 4.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
                .background(Color(0xFFFEF3C7), RoundedCornerShape(8.dp))
                .padding(12.dp)
        ) {
            Column {
                Text("CAUTION ASSESSMENT — NOT PROOF", fontWeight = FontWeight.Bold, color = Color(0xFF7C2D12), fontSize = 13.sp)
                Text("An unknown or unverified number is not proof of fraud.", fontSize = 12.sp, color = Color(0xFF7C2D12))
            }
        }

        Text("Observed Facts:", fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
        for (sig in signals) {
            Text("• $sig", fontSize = 14.sp, color = Color(0xFF334155), modifier = Modifier.padding(vertical = 2.dp))
        }

        Text("Post-Call Checklist (What did they ask?):", fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 16.dp))
        val checklist = listOf(
            "Asked for OTP, password, or bank PIN",
            "Created intense urgency or threatened arrest",
            "Demanded payment or registration fee",
            "Claimed to be government or official bank representative",
            "Instructed to install AnyDesk/TeamViewer or app"
        )
        for (item in checklist) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                Checkbox(checked = false, onCheckedChange = {})
                Text(item, fontSize = 13.sp)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            OutlinedButton(onClick = { isReported = true }) {
                Text(if (isReported) "Reported" else "Report Number")
            }
            Button(
                onClick = { isBlocked = true },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF991B1B))
            ) {
                Text(if (isBlocked) "Blocked" else "Block Number")
            }
        }
    }
}

@Composable
fun HistoryScreen() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Shield Call History (30 Days)", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Stored strictly on device. Never uploaded.", fontSize = 13.sp, color = Color(0xFF64748B))

        Spacer(modifier = Modifier.height(12.dp))

        Card(modifier = Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color.White)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Call from ...0100", fontWeight = FontWeight.Bold)
                Text("Signals: Number not in contacts • Carrier unverified", fontSize = 13.sp, color = Color(0xFF64748B))
                Text("Time: Just now", fontSize = 12.sp, color = Color(0xFF94A3B8))
            }
        }
    }
}

@Composable
fun SettingsScreen() {
    var silenceCalls by remember { mutableStateOf(false) }
    var smsAlerts by remember { mutableStateOf(true) }
    var storeHistory by remember { mutableStateOf(true) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Shield Settings", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("Silence suspicious calls", fontWeight = FontWeight.SemiBold)
                Text("Off by default per spec; calls ring normally", fontSize = 12.sp, color = Color(0xFF64748B))
            }
            Switch(checked = silenceCalls, onCheckedChange = { silenceCalls = it })
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("Check incoming SMS", fontWeight = FontWeight.SemiBold)
                Text("Runs rule engine locally on received texts", fontSize = 12.sp, color = Color(0xFF64748B))
            }
            Switch(checked = smsAlerts, onCheckedChange = { smsAlerts = it })
        }

        Spacer(modifier = Modifier.height(16.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("Store 30-day event history", fontWeight = FontWeight.SemiBold)
                Text("Stores only last 4 digits and timestamp", fontSize = 12.sp, color = Color(0xFF64748B))
            }
            Switch(checked = storeHistory, onCheckedChange = { storeHistory = it })
        }
    }
}
