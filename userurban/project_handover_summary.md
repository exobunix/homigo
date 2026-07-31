# Project Handover: UserUrban (Service Booking App)

## Project Overview
Building a service booking application (similar to Urban Company) using **React Native (Expo)** with **TypeScript**.

## Current Status
The frontend UI and navigation flow for the "Customer" side are largely complete. The app currently uses **dummy data** for vendors and services. We are at the stage of transitioning to a real **MongoDB backend**.

## Recent Implementations
1.  **Sub-Category Selection Flow:**
    *   **Home Screen:** Tapping a category (e.g., "Women's Salon") opens a modal to select a sub-category (e.g., "Skin", "Hair").
    *   **Category Screen:** Lists vendors filtered by the selected category and sub-category.
    *   **Vendor Profile:** Displays vendor details with a **Tabbed Interface** (Services, About, Reviews). Automatically selects the relevant sub-category tab.

2.  **Cart Functionality:**
    *   Implemented `CartContext` for managing items.
    *   Sticky cart footer appears when items are added.

3.  **Backend Prep:**
    *   Created `.env` file for `MONGODB_URI`.
    *   Planned shared database architecture for User and Vendor apps.

## Key Files
*   `src/screens/customer/Home.tsx`: Main entry, handles category selection & modal.
*   `src/screens/customer/CategoryScreen.tsx`: Lists vendors.
*   `src/screens/customer/VendorProfileScreen.tsx`: Vendor details, services list, tabs.
*   `src/navigation/AppNavigator.tsx`: Navigation stack configuration.
*   `.env`: Contains MongoDB connection string (needs to be filled).

## Next Steps (Immediate)
1.  **Backend Connection:**
    *   Install `react-native-dotenv` or similar to read the `.env` file.
    *   Create an API service layer (`src/services/api.ts`) to fetch data from MongoDB instead of using static arrays.
2.  **Data Migration:**
    *   Move the static `VENDORS`, `SERVICES`, and `SUB_CATEGORIES` data from the `.tsx` files into the MongoDB database.

## How to Continue
Copy this entire summary and paste it into your new chat session. It provides all the context needed for the AI to pick up exactly where we left off.
