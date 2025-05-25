package com.example.ally.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.ally.R

@Composable
fun LawyerProfileScreen(navController: NavController) {
    // Sample lawyer data - in real app this would be passed as parameter or fetched from API
    val lawyer = SampleLawyerData()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        // Header with back button and title
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(95.dp)
                .background(Color.White)
                .padding(bottom = 1.dp)
        ) {
            // Bottom border
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(Color(0xFFE2E8F0))
                    .align(Alignment.BottomCenter)
            )
            
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 28.dp)
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 17.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { navController.popBackStack() },
                    modifier = Modifier.size(18.dp)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = Color(0xFF3B76F6),
                        modifier = Modifier.size(14.dp)
                    )
                }
                
                Spacer(modifier = Modifier.width(30.dp))
                
                Text(
                    text = "Lawyer Profile",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF3B76F6)
                )
            }
        }        // Scrollable content
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 8.dp)
        ) {
            // Main Profile Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(5.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFD9D9D9)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(17.dp)
                ) {
                    // Profile Header Section
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        // Left side - Avatar and basic info
                        Row {
                            // Profile Picture (placeholder circle)
                            Box(
                                modifier = Modifier
                                    .size(67.dp)
                                    .background(Color(0xFFD9D9D9), CircleShape)
                            )
                            
                            Spacer(modifier = Modifier.width(12.dp))
                            
                            Column {
                                Text(
                                    text = lawyer.name,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF424242)
                                )
                                
                                Spacer(modifier = Modifier.height(12.dp))
                                
                                Text(
                                    text = lawyer.title,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Light,
                                    color = Color(0xFF5D5D5D)
                                )
                                
                                Spacer(modifier = Modifier.height(6.dp))
                                
                                Text(
                                    text = lawyer.firm,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Normal,
                                    color = Color(0xFF5D5D5D)
                                )
                            }
                        }
                        
                        // Verification Badge
                        if (lawyer.isVerified) {
                            Box(
                                modifier = Modifier
                                    .background(
                                        Color(0xFFF0FDF4),
                                        RoundedCornerShape(15.dp)
                                    )
                                    .border(
                                        1.dp,
                                        Color(0xFF16A34A),
                                        RoundedCornerShape(15.dp)
                                    )
                                    .padding(horizontal = 6.dp, vertical = 7.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "✓",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF16A34A)
                                    )
                                    Spacer(modifier = Modifier.width(3.dp))
                                    Text(
                                        text = "Verified",
                                        fontSize = 8.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF16A34A)
                                    )
                                }
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Rating and Experience Row
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = "Rating",
                                modifier = Modifier.size(11.dp),
                                tint = Color(0xFFF59E0B)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = lawyer.rating.toString(),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFFF59E0B)
                            )
                        }
                        
                        Spacer(modifier = Modifier.width(12.dp))
                        
                        Text(
                            text = "(${lawyer.reviewCount} reviews)",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF5D5D5D)
                        )
                        
                        Spacer(modifier = Modifier.width(12.dp))
                        
                        Box(
                            modifier = Modifier
                                .size(3.dp)
                                .background(Color(0xFF5D5D5D), CircleShape)
                        )
                        
                        Spacer(modifier = Modifier.width(12.dp))
                        
                        Text(
                            text = "${lawyer.yearsExperience} years exp.",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF5D5D5D)
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // Location
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Location",
                            modifier = Modifier.size(17.dp),
                            tint = Color(0xFF5D5D5D)
                        )
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = lawyer.location,
                            fontSize = 13.sp,
                            color = Color(0xFF5D5D5D)
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Specialties
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        lawyer.specialties.forEach { specialty ->
                            Box(
                                modifier = Modifier
                                    .background(
                                        Color(0xFFF8FAFC),
                                        RoundedCornerShape(100.dp)
                                    )
                                    .border(
                                        1.dp,
                                        Color(0xFF424242),
                                        RoundedCornerShape(100.dp)
                                    )
                                    .padding(horizontal = 11.dp, vertical = 7.dp)
                            ) {
                                Text(
                                    text = specialty,
                                    fontSize = 12.sp,
                                    color = Color(0xFF424242)
                                )
                            }
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // About Section
            Text(
                text = "About",
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF424242)
            )
            
            Spacer(modifier = Modifier.height(18.dp))
            
            Text(
                text = lawyer.about,
                fontSize = 16.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF5D5D5D),
                lineHeight = 19.36.sp
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Education Section
            Text(
                text = "Education",
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF424242)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            lawyer.education.forEach { edu ->
                Text(
                    text = edu,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF5D5D5D)
                )
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Languages Section
            Text(
                text = "Languages",
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF424242)
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                lawyer.languages.forEach { language ->
                    Box(
                        modifier = Modifier
                            .background(
                                Color(0xFFF8FAFC),
                                RoundedCornerShape(100.dp)
                            )
                            .border(
                                1.dp,
                                Color(0xFF424242),
                                RoundedCornerShape(100.dp)
                            )
                            .padding(horizontal = 12.dp, vertical = 7.dp)
                    ) {
                        Text(
                            text = language,
                            fontSize = 12.sp,
                            color = Color(0xFF424242)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Consultation Fee Section
            Text(
                text = "Consultation Fee",
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF424242)
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = lawyer.consultationFee,
                fontSize = 17.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF424242)
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Contact Information Section
            Text(
                text = "Contact Information",
                fontSize = 17.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF424242)
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Email
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Email,
                    contentDescription = "Email",
                    modifier = Modifier.size(17.dp),
                    tint = Color(0xFF424242)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = lawyer.email,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF424242)
                )
            }
            
            Spacer(modifier = Modifier.height(17.dp))
            
            // Phone
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Phone,
                    contentDescription = "Phone",
                    modifier = Modifier.size(17.dp),
                    tint = Color(0xFF424242)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = lawyer.phone,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF424242)
                )
            }
            
            Spacer(modifier = Modifier.height(17.dp))
            
            // Website
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_arrow_right), // Using existing icon as placeholder
                    contentDescription = "Website",
                    modifier = Modifier.size(17.dp),
                    tint = Color(0xFF424242)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = lawyer.website,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF424242)
                )
            }
            
            Spacer(modifier = Modifier.height(50.dp))
        }
        
        // Bottom Button
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(17.dp)
        ) {
            Button(
                onClick = { /* TODO: Implement consultation request */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(38.dp),
                shape = RoundedCornerShape(5.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF3B76F6)
                ),
                border = BorderStroke(1.dp, Color(0xFF3B76F6))
            ) {
                Text(
                    text = "Request Consultation",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFFFFFFEE)
                )
            }
        }
    }
}

// Sample data class and function for demonstration
data class LawyerProfileData(
    val name: String,
    val title: String,
    val firm: String,
    val rating: Double,
    val reviewCount: Int,
    val yearsExperience: Int,
    val location: String,
    val specialties: List<String>,
    val isVerified: Boolean,
    val about: String,
    val education: List<String>,
    val languages: List<String>,
    val consultationFee: String,
    val email: String,
    val phone: String,
    val website: String
)

@Composable
private fun SampleLawyerData(): LawyerProfileData {
    return LawyerProfileData(
        name = "Sarah Johnson",
        title = "Senior Attorney",
        firm = "Johnson & Associates",
        rating = 4.8,
        reviewCount = 124,
        yearsExperience = 15,
        location = "New York, NY",
        specialties = listOf("Family Law", "Divorce"),
        isVerified = true,
        about = "Sarah Johnson is a dedicated family law attorney with over 15 years of experience helping clients navigate complex divorce and custody matters. She is known for her empathetic approach and strong advocacy skills.",
        education = listOf(
            "J.D., Columbia Law School",
            "B.A., in Political Science, NYU"
        ),
        languages = listOf("English", "Spanish"),
        consultationFee = "Initial consultation: ₱1,500",
        email = "sarah@johnsonlaw.example.com",
        phone = "(+63) 9953 342 3532",
        website = "www.johnsonlaw.example.com"
    )
}
