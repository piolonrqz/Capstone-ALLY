package com.example.ally.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
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

data class Lawyer(
    val name: String,
    val rating: Double,
    val reviewCount: Int,
    val yearsExperience: Int,
    val specialties: List<String>,
    val location: String,
    val isVerified: Boolean
)

@Composable
fun LawyersScreen(navController: NavController) {
    // Sample data - in real app this would come from API/database
    val lawyers = remember {
        listOf(
            Lawyer(
                name = "Sarah Johnson",
                rating = 4.8,
                reviewCount = 124,
                yearsExperience = 15,
                specialties = listOf("Family Law", "Divorce"),
                location = "New York, NY",
                isVerified = true
            ),
            Lawyer(
                name = "Michael Chen",
                rating = 4.9,
                reviewCount = 97,
                yearsExperience = 12,
                specialties = listOf("Criminal Law", "Defense"),
                location = "New York, NY",
                isVerified = true
            ),
            Lawyer(
                name = "Emily Rodriguez",
                rating = 4.7,
                reviewCount = 156,
                yearsExperience = 18,
                specialties = listOf("Corporate Law", "Business"),
                location = "New York, NY",
                isVerified = true
            )
        )
    }

    var searchQuery by remember { mutableStateOf("") }
    var sortBy by remember { mutableStateOf("Relevance") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 27.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_lawyers),
                contentDescription = "Lawyers Icon",
                modifier = Modifier.size(25.dp),
                tint = Color(0xFF3B76F6)
            )
            
            Spacer(modifier = Modifier.width(8.dp))
            
            Text(
                text = "Find a Lawyer",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF3B76F6)
            )
        }

        // Search Bar
        Card(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
            shape = RoundedCornerShape(5.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
            border = BorderStroke(1.dp, Color(0xFFE2E8F0))

        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = {
                        Text(
                            text = "Search legal resources...",
                            color = Color(0xFF5D5D5D),
                            fontSize = 12.sp
                        )
                    },
                    modifier = Modifier.weight(1f),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color.Transparent,
                        unfocusedContainerColor = Color.Transparent,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    )
                )
                  IconButton(onClick = { /* TODO: Implement  */ }) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = Color(0xFF000000)
                    )
                }
                
                IconButton(onClick = { /* TODO: Implement filter */ }) {
                    Icon(
                        imageVector = Icons.Default.FilterList,
                        contentDescription = "Filter",
                        tint = Color(0xFF000000)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Results and Sort Section
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 25.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "${lawyers.size} lawyers found",
                fontSize = 14.sp,
                fontWeight = FontWeight.Light,
                color = Color(0xFF424242)
            )
            
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Sort by:",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Light,
                    color = Color(0xFF424242)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Box(
                    modifier = Modifier
                        .background(
                            Color(0xFFF8FAFC),
                            RoundedCornerShape(5.dp)
                        )
                        .border(
                            1.dp,
                            Color(0xFFE2E8F0),
                            RoundedCornerShape(5.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                        .clickable { /* Handle dropdown */ }
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = sortBy,
                            fontSize = 14.sp,
                            color = Color(0xFF424242)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            painter = painterResource(id = R.drawable.ic_arrow_right),
                            contentDescription = "Dropdown",
                            modifier = Modifier.size(12.dp),
                            tint = Color(0xFF424242)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Lawyers List
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 8.dp)
        ) {
            items(lawyers) { lawyer ->
                LawyerCard(lawyer = lawyer)
            }
        }
    }
}

@Composable
fun LawyerCard(lawyer: Lawyer) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 2.dp),
        shape = RoundedCornerShape(5.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(17.dp)
        ) {
            // Name and Verification
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = lawyer.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF424242)
                )
                
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
                            .padding(horizontal = 18.dp, vertical = 4.dp)
                    ) {                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Verified",
                                modifier = Modifier.size(12.dp),
                                tint = Color(0xFF16A34A)
                            )
                            Spacer(modifier = Modifier.width(2.dp))
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

            Spacer(modifier = Modifier.height(8.dp))

            // Rating and Reviews
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "⭐",
                        fontSize = 12.sp
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = lawyer.rating.toString(),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFF59E0B)
                    )
                }
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Text(
                    text = "(${lawyer.reviewCount} reviews)",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF424242)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Box(
                    modifier = Modifier
                        .size(3.dp)
                        .background(Color(0xFF424242), CircleShape)
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Text(
                    text = "${lawyer.yearsExperience} years exp.",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF424242)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Specialties
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
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
                            .padding(horizontal = 11.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = specialty,
                            fontSize = 12.sp,
                            color = Color(0xFF424242)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Location and View Profile Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Location",
                        modifier = Modifier.size(17.dp),
                        tint = Color.Black
                    )
                    Spacer(modifier = Modifier.width(5.dp))
                    Text(
                        text = lawyer.location,
                        fontSize = 13.sp,
                        color = Color(0xFF424242)
                    )
                }
                
                Button(
                    onClick = { /* Navigate to profile */ },
                    modifier = Modifier
                        .height(34.dp),
                    shape = RoundedCornerShape(5.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF3B76F6)
                    ),
                    contentPadding = PaddingValues(horizontal = 12.dp)
                ) {
                    Text(
                        text = "View Profile",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFFFFFEE)
                    )
                }
            }
        }
    }
}
