package com.example.ally

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.ally.navigation.ScreenRoutes
import com.example.ally.ui.theme.AllyTheme
import com.example.ally.ui.screens.LandingScreen
import com.example.ally.ui.screens.ChatScreen
import com.example.ally.ui.screens.ResourcesScreen
import com.example.ally.ui.components.AllyBottomNav

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AllyTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                Scaffold(
                    modifier = Modifier.fillMaxSize(),                    bottomBar = {
                        // Show bottom nav only on screens that need it
                        if (currentRoute == ScreenRoutes.LANDING || currentRoute == ScreenRoutes.CHAT || currentRoute == ScreenRoutes.RESOURCES) { // Add other relevant routes
                            AllyBottomNav(navController = navController, currentRoute = currentRoute)
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = ScreenRoutes.LANDING,
                        modifier = Modifier.padding(innerPadding)                    ) {
                        composable(ScreenRoutes.LANDING) {
                            LandingScreen(navController = navController)
                        }                        
                        composable(ScreenRoutes.CHAT) {
                            ChatScreen(navController = navController)
                        }
                        composable(ScreenRoutes.RESOURCES) {
                            ResourcesScreen(navController = navController)
                        }
                        // Add other composables for other screens here
                        // composable(ScreenRoutes.LAWYERS) { LawyersScreen(navController) }
                        // composable(ScreenRoutes.ACCOUNT) { AccountScreen(navController) }
                    }
                }
            }
        }
    }
}



