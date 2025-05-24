package com.example.ally.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.ally.R
import com.example.ally.navigation.ScreenRoutes

@Composable
fun LandingScreen(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(horizontal = 20.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = buildAnnotatedString {
                withStyle(style = SpanStyle(color = Color(0xFF424242), fontWeight = FontWeight.Medium)) {
                    append("Welcome to ")
                }
                withStyle(style = SpanStyle(color = Color(0xFF3B76F6), fontWeight = FontWeight.Bold)) { // Blue color for ALLY
                    append("ALLY")
                }
            },
            fontSize = 32.sp,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Your legal companion for preliminary guidance",
            fontSize = 12.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF424242), // Kept as per original, seems fine
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(32.dp))
        LandingCard(
            iconRes = R.drawable.ic_chat,
            title = "ALLY AI Assistant",
            description = "Get preliminary legal guidance through our AI Assistant.",
            buttonText = "Start Chat",
            onClick = { navController.navigate(ScreenRoutes.CHAT) }
        )
        Spacer(modifier = Modifier.height(16.dp))
        LandingCard(
            iconRes = R.drawable.ic_resources,
            title = "Legal Resources",
            description = "Explore articles and information on various legal topics.",
            buttonText = "Browse Resources",
            onClick = { navController.navigate(ScreenRoutes.RESOURCES)  }
        )
        Spacer(modifier = Modifier.height(16.dp))
        LandingCard(
            iconRes = R.drawable.ic_lawyers,
            title = "Find a Lawyer",
            description = "Connect with legal professionals for expert advice.",
            buttonText = "Search Lawyers",
            onClick = { /* TODO: navController.navigate(ScreenRoutes.LAWYERS) */ }
        )
        Spacer(modifier = Modifier.weight(1f))
    }
}

@Composable
fun LandingCard(
    iconRes: Int,
    title: String,
    description: String,
    buttonText: String,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xCCEFF5FF)),
        modifier = Modifier
            .fillMaxWidth()
            .height(120.dp)
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(Color(0xFFC7D7FE), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = iconRes),
                    contentDescription = title,
                    modifier = Modifier.size(28.dp)
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = title,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF424242)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = description,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Normal,
                        color = Color(0xFF5D5D5D),
                        lineHeight = 16.sp
                    )
                }
                Row(
                    modifier = Modifier.align(Alignment.End),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = buttonText,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF3B76F6)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Image(
                        painter = painterResource(id = R.drawable.ic_arrow_right),
                        contentDescription = null,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}
