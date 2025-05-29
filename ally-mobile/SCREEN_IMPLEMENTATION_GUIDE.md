# Screen Implementation Guide for ALLY Mobile App

This guide provides a consistent approach for adding new screens to the ALLY mobile application. Follow these steps to maintain code consistency and avoid redundancy.

## Project Structure Overview

```
app/src/main/java/com/example/ally/
├── MainActivity.kt                      # Main activity with navigation setup
├── navigation/
│   └── ScreenRoutes.kt                 # Screen route constants
├── ui/
│   ├── components/
│   │   └── BottomNavigationBar.kt      # Bottom navigation component
│   ├── screens/                        # All screen composables
│   │   ├── LandingScreen.kt
│   │   ├── ChatScreen.kt
│   │   └── [NewScreen].kt              # Add new screens here
│   └── theme/                          # App theming
│       ├── Color.kt
│       ├── Theme.kt
│       └── Type.kt
└── R.drawable/                         # App icons and resources
```

## Libraries & Dependencies

The project uses the following key libraries:

### Core Android & Compose
- `androidx.core:core-ktx` - Android KTX extensions
- `androidx.lifecycle:lifecycle-runtime-ktx` - Lifecycle management
- `androidx.activity:activity-compose` - Compose integration
- `androidx.compose.bom` - Compose Bill of Materials

### Navigation
- `androidx.navigation:navigation-compose` - Compose navigation
- `androidx.navigation:navigation-runtime-android` - Navigation runtime

### UI & Material Design
- `androidx.ui` - Core Compose UI
- `androidx.material3` - Material 3 design system

## Step-by-Step Guide to Add a New Screen

### 1. Define Screen Route

**File to edit:** `app/src/main/java/com/example/ally/navigation/ScreenRoutes.kt`

Add a new constant for your screen:
```kotlin
object ScreenRoutes {
    // ...existing routes...
    const val NEW_SCREEN = "new_screen"  // Replace with actual screen name
}
```

### 2. Create Screen Composable

**File to create:** `app/src/main/java/com/example/ally/ui/screens/[ScreenName]Screen.kt`

Follow this template structure:
```kotlin
package com.example.ally.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.ally.R
import com.example.ally.navigation.ScreenRoutes

@Composable
fun [ScreenName]Screen(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Screen content here
    }
}
```

### 3. Add Navigation Route

**File to edit:** `app/src/main/java/com/example/ally/MainActivity.kt`

Add the composable route inside the NavHost:
```kotlin
NavHost(
    navController = navController,
    startDestination = ScreenRoutes.LANDING,
    modifier = Modifier.padding(innerPadding)
) {
    // ...existing composables...
    composable(ScreenRoutes.NEW_SCREEN) {
        NewScreen(navController = navController)
    }
}
```

### 4. Update Bottom Navigation (if applicable)

**File to edit:** `app/src/main/java/com/example/ally/ui/components/BottomNavigationBar.kt`

If the screen should be accessible via bottom navigation:

1. Update the `AllyBottomNav` composable to include the new route in the condition:
```kotlin
if (currentRoute == ScreenRoutes.LANDING || 
    currentRoute == ScreenRoutes.CHAT ||
    currentRoute == ScreenRoutes.NEW_SCREEN) {
    AllyBottomNav(navController = navController, currentRoute = currentRoute)
}
```

2. Update the existing BottomNavItem click handler (if it already exists):
```kotlin
BottomNavItem(
    iconRes = R.drawable.ic_new_screen,  // Use appropriate icon
    label = "Screen Name",
    selected = currentRoute == ScreenRoutes.NEW_SCREEN,
    onClick = { 
        if (currentRoute != ScreenRoutes.NEW_SCREEN) 
            navController.navigate(ScreenRoutes.NEW_SCREEN) 
    }
)
```

### 5. Screen Icon 

**Location:** `app/src/main/res/drawable/`

Available icons in the project:
- `ic_home.xml` - Home/Landing
- `ic_chat.xml` - Chat
- `ic_resources.xml` - Resources
- `ic_lawyers.xml` - Lawyers
- `ic_account.xml` - Account
- `ic_arrow_right.xml` - Navigation arrow

Aside from these icons always use materials icons.

## Screen Design Patterns

### Common Screen Structure
```kotlin
@Composable
fun ScreenName(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header section
        // Content section
        // Action buttons/navigation
    }
}
```

### Common UI Components
- Use `Color.White` for background
- Standard padding: `24.dp`
- Use Material 3 components (`Button`, `Text`, `Card`, etc.)
- Follow existing color scheme from `ui/theme/Color.kt`

### Navigation Patterns
- Always accept `NavController` as parameter
- Use `navController.navigate(ScreenRoutes.DESTINATION)` for navigation
- Use `navController.popBackStack()` for back navigation

## File Checklist for New Screen

When adding a new screen, ensure you've updated these files:

- [ ] `navigation/ScreenRoutes.kt` - Add route constant
- [ ] `ui/screens/[ScreenName]Screen.kt` - Create screen composable
- [ ] `MainActivity.kt` - Add composable route to NavHost
- [ ] `MainActivity.kt` - Update Scaffold bottomBar condition (if needed)
- [ ] `ui/components/BottomNavigationBar.kt` - Update navigation logic (if applicable)
- [ ] Verify icon exists in `res/drawable/` (if needed)

## Code Quality Guidelines

### Naming Conventions
- Screen files: `[ScreenName]Screen.kt`
- Composable functions: `[ScreenName]Screen()`
- Route constants: `SCREEN_NAME` (uppercase with underscores)

### Import Organization
Follow this order:
1. Android/AndroidX imports
2. Compose imports
3. Third-party libraries
4. Internal project imports

### State Management
- Keep screen state local when possible
- Use `remember` for simple UI state
- Consider `ViewModel` for complex business logic (add dependency if needed)


- Card layouts
- Loading indicators
- Error states



## Example: Adding Resources Screen

Based on the existing structure, here's how you would add the Resources screen:

1. Route already exists: `ScreenRoutes.RESOURCES`
2. Create: `ui/screens/ResourcesScreen.kt`
3. Add to MainActivity NavHost
4. Update bottom navigation condition
5. The `ic_resources.xml` icon already exists

This follows the established pattern and maintains consistency with the current implementation.
