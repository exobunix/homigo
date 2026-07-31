# Backend Integration Plan: Shared Database Architecture

## 1. The Core Concept: Single Source of Truth
To achieve the functionality where vendors add services that appear in the user app, and users make bookings that appear in the vendor app, you **MUST use the SAME database** (or a single backend API that connects to one database).

### Why?
*   **Data Consistency:** Both apps need to see the exact same data. If a vendor updates a price, the user must see the new price immediately.
*   **Real-time Sync:** When a user books a slot, that slot must instantly become "unavailable" for others and appear in the vendor's schedule.

## 2. Proposed Database Structure
Here is a simplified schema example (assuming a NoSQL structure like Firebase or MongoDB, but applicable to SQL too):

### A. Users Collection (Customers)
*   `userId`: string
*   `name`: string
*   `phone`: string
*   `savedAddresses`: array

### B. Vendors Collection (Service Providers)
*   `vendorId`: string
*   `businessName`: string
*   `category`: string (e.g., "Women's Salon")
*   `subCategories`: array (e.g., ["hair", "skin"])
*   `rating`: number
*   `isVerified`: boolean

### C. Services Collection
*   `serviceId`: string
*   `vendorId`: string (Link to Vendor)
*   `title`: string
*   `price`: number
*   `description`: string
*   `category`: string
*   `subCategory`: string
*   `isActive`: boolean

### D. Bookings Collection
*   `bookingId`: string
*   `customerId`: string (Link to User)
*   `vendorId`: string (Link to Vendor)
*   `serviceIds`: array
*   `totalAmount`: number
*   `status`: enum ("pending", "confirmed", "completed", "cancelled")
*   `scheduledTime`: timestamp

## 3. Data Flow

### Scenario 1: Vendor Adds a Service
1.  **Vendor App:** Vendor fills out "Add Service" form.
2.  **Action:** App sends `POST /services` request to the Backend.
3.  **Database:** New record created in `Services` collection with `vendorId`.
4.  **User App:** When a user opens the `VendorProfileScreen`, the app requests `GET /services?vendorId=XYZ`. The new service appears automatically.

### Scenario 2: User Books a Service
1.  **User App:** User selects services and clicks "Pay".
2.  **Action:** App sends `POST /bookings` request.
3.  **Database:** New record created in `Bookings` collection with `status: "pending"`.
4.  **Vendor App:** The vendor's "Dashboard" listens for changes in `Bookings` where `vendorId == myId`. The new booking pops up instantly.

## 4. Recommended Tech Stack
Since you are using React Native (Expo), these are the easiest integrations:

1.  **Firebase (Google):**
    *   **Pros:** Real-time database (Firestore) built-in. Perfect for "instant" updates like bookings. Easy authentication.
    *   **Cons:** Can get expensive at very high scale.

2.  **Supabase (PostgreSQL):**
    *   **Pros:** Open source, SQL based, great real-time capabilities.
    *   **Cons:** Slightly more setup than Firebase for simple things.

3.  **Custom Node.js/Express + MongoDB/Postgres:**
    *   **Pros:** Full control.
    *   **Cons:** You have to build and host the API yourself.

## 5. Next Steps for Your Project
Currently, your app uses **Dummy Data** (static arrays like `VENDORS` and `ALL_SERVICES` in the code).

To make this real:
1.  **Choose a Backend:** (e.g., Firebase).
2.  **Setup API/Service Layer:** Create a `src/services/api.ts` file.
3.  **Replace Dummy Data:**
    *   Instead of `const services = ALL_SERVICES.filter(...)`
    *   You will write `const services = await api.getServicesForVendor(vendorId)`

**Would you like to start setting up a mock API service structure to prepare for this?**
