package com.example.ally.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.ally.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LibrarySearchScreen(navController: NavController) {
    var keywords by remember { mutableStateOf("") }
    var exactPhrase by remember { mutableStateOf("") }
    var titleSearch by remember { mutableStateOf("") }
    var resourceType by remember { mutableStateOf("") }
    var jurisdiction by remember { mutableStateOf("") }
    var tags by remember { mutableStateOf("") }
    var fromDate by remember { mutableStateOf("") }
    var toDate by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        // Header with back button and title
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { navController.popBackStack() }) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = Color(0xFF424242)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Image(
                painter = painterResource(id = R.drawable.ic_resources),
                contentDescription = "Resources icon",
                modifier = Modifier.size(28.dp),
                colorFilter = androidx.compose.ui.graphics.ColorFilter.tint(Color(0xFF3B76F6))
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Legal Library",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF3B76F6)
            )
        }
        
        Spacer(modifier = Modifier.height(48.dp))
        
        // Advanced Search title
        Text(
            text = "Advanced Search",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF424242)
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Subtitle
        Text(
            text = "Refine your search with more specific criteria.",
            fontSize = 14.sp,
            fontWeight = FontWeight.Light,
            color = Color(0xFF5D5D5D)
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Keywords Section
        Text(
            text = "Keywords",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF424242)
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = keywords,
            onValueChange = { keywords = it },
            placeholder = {
                Text(
                    text = "All these words",
                    fontSize = 14.sp,
                    color = Color(0xFF5D5D5D)
                )
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(5.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFFF8FAFC),
                unfocusedContainerColor = Color(0xFFF8FAFC),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent
            )

        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Exact Phrase Section
        Text(
            text = "Exact Phrase",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF424242)
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = exactPhrase,
            onValueChange = { exactPhrase = it },
            placeholder = {
                Text(
                    text = "This exact wording or phrase",
                    fontSize = 14.sp,
                    color = Color(0xFF5D5D5D)
                )
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(5.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFFF8FAFC),
                unfocusedContainerColor = Color(0xFFF8FAFC),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent
            )
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Title Search Section
        Text(
            text = "Title Search",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF424242)
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = titleSearch,
            onValueChange = { titleSearch = it },
            placeholder = {
                Text(
                    text = "Search in title",
                    fontSize = 14.sp,
                    color = Color(0xFF5D5D5D)
                )
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(5.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFFF8FAFC),
                unfocusedContainerColor = Color(0xFFF8FAFC),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent
            )
        )
        
        Spacer(modifier = Modifier.height(48.dp))
        
        // Date Range Section
        Text(
            text = "Date Range",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF424242)
        )
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // From Date
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "From",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF424242)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(5.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (fromDate.isEmpty()) "Select Date" else fromDate,
                            fontSize = 14.sp,
                            color = if (fromDate.isEmpty()) Color(0xFF424242) else Color(0xFF424242),
                            modifier = Modifier.weight(1f)
                        )
                        Icon(
                            imageVector = Icons.Default.CalendarToday,
                            contentDescription = "Calendar",
                            tint = Color(0xFF424242),
                            modifier = Modifier.size(19.dp)
                        )
                    }
                }
            }
            
            // To Date
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "To",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF424242)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(5.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC)),
                    border = BorderStroke(1.dp, Color(0xFFE2E8F0))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (toDate.isEmpty()) "Select Date" else toDate,
                            fontSize = 14.sp,
                            color = if (toDate.isEmpty()) Color(0xFF424242) else Color(0xFF424242),
                            modifier = Modifier.weight(1f)
                        )
                        Icon(
                            imageVector = Icons.Default.CalendarToday,
                            contentDescription = "Calendar",
                            tint = Color(0xFF424242),
                            modifier = Modifier.size(19.dp)
                        )
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // Resource Type Section
        Text(
            text = "Resource Type",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF424242)
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = resourceType,
            onValueChange = { resourceType = it },
            placeholder = {
                Text(
                    text = "e.g.,Case Law, Statute, Article",
                    fontSize = 14.sp,
                    color = Color(0xFF5D5D5D)
                )
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(5.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFFF8FAFC),
                unfocusedContainerColor = Color(0xFFF8FAFC),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent
            )
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Jurisdiction Section
        Text(
            text = "Jurisdiction",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF424242)
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = jurisdiction,
            onValueChange = { jurisdiction = it },
            placeholder = {
                Text(
                    text = "e.g., Federal, State, International",
                    fontSize = 14.sp,
                    color = Color(0xFF5D5D5D)
                )
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(5.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFFF8FAFC),
                unfocusedContainerColor = Color(0xFFF8FAFC),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent
            )
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Tags Section
        Text(
            text = "Tags (comma separated)",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF424242)
        )
        Spacer(modifier = Modifier.height(8.dp))
        TextField(
            value = tags,
            onValueChange = { tags = it },
            placeholder = {
                Text(
                    text = "e.g., Criminal, Corporate, Property",
                    fontSize = 14.sp,
                    color = Color(0xFF5D5D5D)
                )
            },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(5.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFFF8FAFC),
                unfocusedContainerColor = Color(0xFFF8FAFC),
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent
            )
        )
        
        Spacer(modifier = Modifier.height(48.dp))
        
        // Action Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Cancel Button
            Button(
                onClick = { navController.popBackStack() },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(5.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0))
            ) {
                Text(
                    text = "Cancel",
                    fontSize = 14.sp,
                    color = Color(0xFF424242),
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
            
            // Search Button
            Button(
                onClick = { 
                    // TODO: Implement search functionality
                    // For now, navigate back to resources with search results
                    navController.popBackStack()
                },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(5.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B76F6)),
                border = BorderStroke(1.dp, Color(0xFF3B76F6))
            ) {
                Text(
                    text = "Search",
                    fontSize = 14.sp,
                    color = Color.White,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
    }
}
