package com.example.ally.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.ally.R
import com.example.ally.navigation.ScreenRoutes

@Composable
fun AccountScreen(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(32.dp))
        
        // Account Icon Circle
        Box(
            modifier = Modifier
                .size(97.dp)
                .clip(CircleShape)
                .background(Color(0xFFDBEAFE)),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_account),
                contentDescription = "Account",
                modifier = Modifier.size(70.dp),
                colorFilter = ColorFilter.tint(Color(0xFF3B76F6))
            )
        }
        
        Spacer(modifier = Modifier.height(30.dp))
        
        // Account Access Title
        Text(
            text = "Account Access",
            fontSize = 23.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF424242),
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(17.dp))
        
        // Description Text
        Text(
            text = "Create an account or login through our web\nplatform to unlock full features",
            fontSize = 16.sp,
            color = Color(0xFF5D5D5D),
            textAlign = TextAlign.Center,
            lineHeight = 19.sp
        )
        
        Spacer(modifier = Modifier.height(51.dp))
        
        // Create Account Button
        Button(
            onClick = { /* TODO: Open web browser */ },
            modifier = Modifier
                .fillMaxWidth()
                .height(38.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF3B76F6)
            ),
            shape = RoundedCornerShape(5.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.ic_arrow_right),
                    contentDescription = null,
                    modifier = Modifier.size(24.dp),
                    colorFilter = ColorFilter.tint(Color(0xFFFFFFEE))
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Create Account on Web",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFFFFFFEE)
                )
            }
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Log In Button
        OutlinedButton(
            onClick = { /* TODO: Open web browser */ },
            modifier = Modifier
                .fillMaxWidth()
                .height(38.dp),
            border = BorderStroke(1.dp, Color(0xFF3B76F6)),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = Color(0xFFF8FAFC),
                contentColor = Color(0xFF424242)
            ),
            shape = RoundedCornerShape(5.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.ic_arrow_right),
                    contentDescription = null,
                    modifier = Modifier.size(21.dp),
                    colorFilter = ColorFilter.tint(Color(0xFF424242))
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Log In on Web",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF424242)
                )
            }
        }
        
        Spacer(modifier = Modifier.height(40.dp))
        
        // Divider Line
        HorizontalDivider(
            modifier = Modifier.fillMaxWidth(),
            thickness = 1.dp,
            color = Color(0xFFE2E8F0)
        )
        
        Spacer(modifier = Modifier.height(20.dp))
        
        // Why create an account section
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = "Why create an account?",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF424242),
                modifier = Modifier.align(Alignment.Start)
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Benefit 1
            BenefitItem(
                number = "1",
                text = "Connect directly with lawyers and legal professionals"
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Benefit 2
            BenefitItem(
                number = "2",
                text = "Save and track your legal cases and inquiries"
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Benefit 3
            BenefitItem(
                number = "3",
                text = "Access personalized legal resources and advice"
            )
        }
        
        Spacer(modifier = Modifier.height(65.dp))
        
        // Bottom explanatory text
        Text(
            text = "The ALLY mobile app is designed for preliminary information. For full features and secure communication with legal professionals,\n\nplease use our web platform.",
            fontSize = 14.sp,
            color = Color(0xFF424242),
            textAlign = TextAlign.Center,
            lineHeight = 17.sp
        )
        
        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
fun BenefitItem(number: String, text: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(22.dp)
                .clip(CircleShape)
                .background(Color(0xFFC2E0FE)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = number,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF3B76F6)
            )
        }
        
        Spacer(modifier = Modifier.width(5.dp))
        
        Text(
            text = text,
            fontSize = 15.sp,
            color = Color(0xFF424242),
            lineHeight = 18.sp
        )
    }
}
