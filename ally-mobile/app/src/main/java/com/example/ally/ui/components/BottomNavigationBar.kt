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
import androidx.navigation.NavController
import com.example.ally.R
import com.example.ally.navigation.ScreenRoutes

@Composable
fun AllyBottomNav(navController: NavController, currentRoute: String?) {
    Surface(
        shadowElevation = 0.dp,
        color = Color.White
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            BottomNavItem(
                iconRes = R.drawable.ic_home,
                label = "Home",
                selected = currentRoute == ScreenRoutes.LANDING,
                onClick = { if (currentRoute != ScreenRoutes.LANDING) navController.navigate(ScreenRoutes.LANDING) }
            )
            BottomNavItem(
                iconRes = R.drawable.ic_chat,
                label = "Chat",
                selected = currentRoute == ScreenRoutes.CHAT,
                onClick = { if (currentRoute != ScreenRoutes.CHAT) navController.navigate(ScreenRoutes.CHAT) }
            )
            BottomNavItem(
                iconRes = R.drawable.ic_resources,
                label = "Resources",
                selected = currentRoute == ScreenRoutes.RESOURCES,
                onClick = { if (currentRoute != ScreenRoutes.RESOURCES) navController.navigate(ScreenRoutes.RESOURCES) }
            )
            BottomNavItem(
                iconRes = R.drawable.ic_lawyers,
                label = "Lawyers",
                selected = currentRoute == ScreenRoutes.LAWYERS,
                onClick = { if (currentRoute != ScreenRoutes.LAWYERS) navController.navigate(ScreenRoutes.LAWYERS) }
            )            
            BottomNavItem(
                iconRes = R.drawable.ic_account,
                label = "Account",
                selected = currentRoute == ScreenRoutes.ACCOUNT,
                onClick = { if (currentRoute != ScreenRoutes.ACCOUNT) navController.navigate(ScreenRoutes.ACCOUNT) }
            )
        }
    }
}

@Composable
fun BottomNavItem(
    iconRes: Int,
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .padding(vertical = 8.dp)
            .clickable(onClick = onClick)
    ) {
        Image(
            painter = painterResource(id = iconRes),
            contentDescription = label,
            modifier = Modifier.size(28.dp),
            colorFilter = ColorFilter.tint(if (selected) Color(0xFF3B76F6) else Color(0xFF424242))
        )
    }
}
