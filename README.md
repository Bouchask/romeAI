# Campus Room Manager

A React Native (Expo) mobile app for university classroom management. Supports **Student**, **Professor**, and **Admin** roles with role-specific dashboards and features.

## Features

- **Authentication**: Login, Register, Forgot Password (email/password)
- **Student**: Dashboard (today’s classes, modules), weekly schedule, exam schedule, notifications, profile
- **Professor**: Dashboard, create session (module, type, date/time, available rooms), view rooms, session management, profile
- **Admin**: Dashboard (stats), room management, exam management, user management (students/professors), profile

## Tech stack

- React Native (Expo)
- React Navigation (native stack + bottom tabs)
- Context API for auth and role
- Ionicons
- Theme: primary blue, white, light gray

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Assets (required by Expo)**  
   Add these under `assets/` (or update `app.json` to remove/change paths):
   - `icon.png` (1024×1024)
   - `splash.png` (splash screen)
   - `adaptive-icon.png` (Android adaptive icon)

   Or create a new Expo app and copy the `assets` folder from it:
   ```bash
   npx create-expo-app temp-app --template blank
   cp -r temp-app/assets ./
   ```

3. **Start the app**
   ```bash
   npx expo start
   ```
   Then press `a` for Android or `i` for iOS simulator, or scan the QR code with Expo Go.

## How to test roles

On **Login**, choose the role (Student / Professor / Admin), enter any email and password, and tap **Sign In**. The app switches to the corresponding tab set for that role. Use **Logout** from the Profile tab to return to the login screen.

## Project structure

See **SCREENS_AND_NAVIGATION.md** for:

- Full list of screens and routes
- Navigation structure (Auth stack + role-based bottom tabs)
- UI layout notes
- Component and file structure

## Design

- Clean, card-based layout with consistent spacing
- Bottom tab navigation per role
- Primary: blue; secondary: white; accent: light gray
- Cards for modules, rooms, sessions, and list items
