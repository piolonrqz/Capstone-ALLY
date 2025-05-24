package com.example.ally.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

// --- Data Classes ---
data class ChatMessage(
    val id: String,
    val text: String,
    val timestamp: String,
    val isUserMessage: Boolean
)

// --- Mock Data ---
val mockChatMessages = listOf(
    ChatMessage("1", "Hello! I’m ALLY, your legal assistant.\nHow can I help you today?", "00:12 AM", false),
    ChatMessage("2", "If you have any more question just ask me anytime!", "00:12 AM", false),
    ChatMessage("3", "Hello, I am interested in getting a divorce from my wife. What are the steps involved in the legal process of getting a divorce from her?", "00:15 AM", true),
    ChatMessage("4", "I understand you're asking about divorce. Ending a marriage in the Philippines has specific legal paths.\n\nYou might find helpful articles explaining this in our Legal Resources section – just tap 'Resources' below. Look for topics like 'Annulment' or 'Legal Separation.'\n\nGenerally, 'divorce' isn’t an option here, but procedures like Annulment exist if specific grounds are met from the start of the marriage. Legal Separation allows living apart but doesn’t end the marriage bond.\n\nRemember: This is just general info, not legal advice. These processes are complex, so please consult a qualified lawyer for guidance specific to your situation. You can use the 'Find a Lawyer' feature too!", "00:17 AM", false),
    ChatMessage("5", "Okay i will look for the article about Annulment or Legal Separation first.", "00:15 AM", true) // Figma shows this as 00:15 AM, might be a typo and should be later
)


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    navController: NavController // Added NavController
) {
    var inputText by remember { mutableStateOf("") }
    val messages = remember { mutableStateListOf<ChatMessage>().apply { addAll(mockChatMessages) } }
    val borderColor = Color(0xFFE2E8F0) // Figma border color #E2E8F0

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("ALLY AI Assistant", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF3B76F6)) }, // Color from Figma node 144:1324
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) { // Implemented back navigation
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack, // Standard back icon
                            contentDescription = "Back",
                            tint = Color(0xFF3B76F6) // Color from Figma node 144:1322 (assuming it's the same blue)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color(0xFF3B76F6)
                ),
                modifier = Modifier
                    .drawBehind {
                        val strokeWidthPx = 1.dp.toPx()
                        drawLine(
                            color = borderColor,
                            start = Offset(0f, size.height),
                            end = Offset(size.width, size.height),
                            strokeWidth = strokeWidthPx
                        )
                    }
            )
        },
        contentWindowInsets = WindowInsets.ime.only(WindowInsetsSides.Bottom),

        content = { paddingValuesFromChatScreenScaffold ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValuesFromChatScreenScaffold)
                    .background(Color.White) // Figma fill_1MDSLR
            ) {
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    reverseLayout = true // To show latest messages at the bottom
                ) {
                    items(messages.reversed()) { message -> // Display in correct order
                        ChatMessageItem(message = message)
                    }
                }

                // Input field area
                Column(
                    modifier = Modifier
                        .background(Color.White) // Color from Figma node 144:1326 (backdrop)
                        // Apply only a top border to this Column
                        .drawBehind {
                            val strokeWidthPx = 1.dp.toPx()
                            drawLine(
                                color = borderColor,
                                start = Offset(0f, 0f), // Top edge
                                end = Offset(size.width, 0f), // Top edge
                                strokeWidth = strokeWidthPx
                            )
                        }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = { Text("Ask a legal question...", fontSize = 12.sp, color = Color(0xFF5D5D5D)) }, // Figma 144:1335, style_4E8GBU
                            modifier = Modifier
                                .weight(1f)
                                .border(BorderStroke(1.dp, borderColor), RoundedCornerShape(5.dp)), // Apply border here
                            shape = RoundedCornerShape(5.dp), // Figma 144:1333
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFFF8FAFC), // Figma 144:1333 fill_EFYCZK
                                unfocusedContainerColor = Color(0xFFF8FAFC),
                                disabledContainerColor = Color(0xFFF8FAFC),
                                focusedIndicatorColor = Color.Transparent, // Hide default indicator
                                unfocusedIndicatorColor = Color.Transparent, // Hide default indicator
                                disabledIndicatorColor = Color.Transparent
                                // Removed focusedBorderColor and unfocusedBorderColor
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(
                            onClick = {
                                if (inputText.isNotBlank()) {
                                    // Add message to list (in a real app, send to backend)
                                    messages.add(ChatMessage((messages.size + 1).toString(), inputText, "Now", true))
                                    inputText = ""
                                    // Potentially add a bot reply after a delay for demo
                                }
                            },
                            modifier = Modifier
                                .size(40.dp) // Adjust size as needed
                                .background(Color(0xFF3B76F6), RoundedCornerShape(5.dp)) // Figma 144:1329
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Send,
                                contentDescription = "Send",
                                tint = Color.White // Figma 144:1331 stroke_BDWT7I
                            )
                        }
                    }
                    Text(
                        text = "This is for general information only, not legal advice.", // Figma 144:1334
                        fontSize = 12.sp,
                        color = Color(0xFF5D5D5D), // style_4E8GBU
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp, start = 16.dp, end = 16.dp)
                    )
                }
            }
        }
    )
}

@Composable
fun ChatMessageItem(message: ChatMessage) {
    val bubbleColor = if (message.isUserMessage) Color(0xFF3B76F6) else Color(0xFFEFF4FF) // Figma user: 144:1281, bot: 144:1277
    val textColor = if (message.isUserMessage) Color(0xFFFFFEEE) else Color(0xFF424242) // Figma user: 144:1282, bot: 144:1279
    val alignment = if (message.isUserMessage) Alignment.End else Alignment.Start

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalAlignment = alignment
    ) {
        Surface(
            shape = RoundedCornerShape(5.dp), // Figma
            color = bubbleColor,
            modifier = Modifier.wrapContentWidth()
        ) {
            Text(
                text = message.text,
                color = textColor,
                fontSize = 14.sp, // style_5LGYSP
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
            )
        }
        Text(
            text = message.timestamp,
            fontSize = 12.sp, // style_4E8GBU or style_FWGA03
            color = Color(0xFF5D5D5D), // fill_DK2GP2
            modifier = Modifier.padding(top = 2.dp, start = if (!message.isUserMessage) 4.dp else 0.dp, end = if (message.isUserMessage) 4.dp else 0.dp)
        )
    }
}


