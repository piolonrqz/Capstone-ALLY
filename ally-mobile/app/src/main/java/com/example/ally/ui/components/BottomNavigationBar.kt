package com.example.ally.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.example.ally.R

@Composable
fun AllyBottomNav() {
    Surface(
        shadowElevation = 0.dp, // Changed from 8.dp to 0.dp to remove shadow
        color = Color.White
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Order changed to match the image
            BottomNavItem(R.drawable.ic_home, "Home", true)
            BottomNavItem(R.drawable.ic_chat, "Chat")
            BottomNavItem(R.drawable.ic_resources, "Resources")
            BottomNavItem(R.drawable.ic_lawyers, "Lawyers")
            BottomNavItem(R.drawable.ic_account, "Account")
        }
    }
}

@Composable
fun BottomNavItem(iconRes: Int, label: String, selected: Boolean = false) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .padding(vertical = 8.dp)
            .clickable { /* TODO: Handle navigation */ } // Make items clickable
    ) {
        Image(
            painter = painterResource(id = iconRes),
            contentDescription = label,
            modifier = Modifier.size(28.dp),
            colorFilter = ColorFilter.tint(if (selected) Color(0xFF3B76F6) else Color(0xFF424242))
        )
    }
}
