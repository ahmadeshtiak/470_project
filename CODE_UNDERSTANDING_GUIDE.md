# AutoForge: Comprehensive Code Architecture & Feature Implementation Guide

> Complete technical documentation mapping all features from requirements to implementation, including backend data flow and frontend presentation.

---

## Table of Contents
1. [Mandatory Module: Identity & Security (Auth)](#mandatory-module-identity--security-auth)
2. [Requirement 1: Role-Based Access & Profile Management](#requirement-1-role-based-access--profile-management)
3. [Requirement 2: Shopping Cart & Analytics](#requirement-2-shopping-cart--analytics)
4. [Requirement 3: Design & Checkout System](#requirement-3-design--checkout-system)
5. [Requirement 4: Order Management & Community Trust](#requirement-4-order-management--community-trust)

---

## Mandatory Module: Identity & Security (Auth)

### Overview
The authentication system is the foundation of AutoForge, handling user registration, login, email verification via OTP, and password recovery.

### Feature 1.1: Secure Multi-Role Auth (Signup, Login, Logout)

#### Architecture Flow
```
User Signup → OTP Generation → OTP Verification → User Created → Login
```

#### Backend Implementation

**Model:** `server/src/models/User.js`
- Stores user credentials and profile information
- Fields: name, email, password (hashed), phone, address, about, role, otp, otpExpiry, isEmailVerified

**Route:** `server/src/routes/auth.js`

**Signup Process:**
```
POST /api/auth/signup
├─ Validate input (name, email, password)
├─ Check email uniqueness
├─ Hash password with bcrypt
├─ Generate OTP code
├─ Store OTP in User document
├─ Send OTP via Nodemailer (email)
└─ Return: { success: true, message: "OTP sent" }
```

**Verify OTP Process:**
```
POST /api/auth/verify-otp
├─ Find user by email
├─ Check OTP validity (5 min expiry)
├─ Mark isEmailVerified = true
├─ Generate JWT token
├─ Return: { token, user: { id, name, email, role, ... } }
```

**Login Process:**
```
POST /api/auth/login
├─ Find user by email
├─ Compare password with bcrypt
├─ Verify email is verified
├─ Generate JWT token
└─ Return: { token, user: { id, name, email, role, ... } }
```

**Logout Process:**
```
Client-side only
├─ Remove token from localStorage
├─ Clear user from AuthContext
└─ Redirect to login
```

#### Frontend Implementation

**Context:** `client/src/context/AuthContext.js`
- Manages global authentication state
- Methods: signup, verifyOTP, login, logout, refreshUser
- Stores: user, token, loading, error

**Pages:**
- `client/src/pages/Signup.js` - Registration form with OTP input
- `client/src/pages/Login.js` - Email/password login form
- `client/src/pages/ForgotPassword.js` - Password reset via OTP

#### Data Flow (User Registration)
```
Signup Form (Signup.js)
    ↓
AuthContext.signup(name, email, phone, address, about, password)
    ↓
POST /api/auth/signup
    ↓
Generate OTP → Send Email (Nodemailer)
    ↓
User enters OTP in verification form
    ↓
AuthContext.verifyOTP(email, otp)
    ↓
POST /api/auth/verify-otp
    ↓
JWT Token Generated
    ↓
User State Set in AuthContext
    ↓
Redirect to Dashboard/Home
```

#### Data Flow (User Login)
```
Login Form (Login.js)
    ↓
AuthContext.login(email, password)
    ↓
POST /api/auth/login
    ↓
Password Verification → JWT Generation
    ↓
User State Set in AuthContext
    ↓
Token Stored in localStorage
    ↓
Redirect to Dashboard
```

---

### Feature 1.2: MFA via OTP (Email-based)

#### Implementation Details

**Service Used:** Nodemailer (SMTP)
**Location:** `server/src/routes/auth.js`

**OTP Generation:**
- 6-digit random code
- 5-minute expiry time
- Stored in User.otp field

**Email Sending:**
```javascript
POST /api/auth/signup
├─ Generate OTP (000000-999999)
├─ Set otpExpiry = now + 5 minutes
├─ Send email with nodemailer
│  └─ Template: "Your OTP is: XXXXXX"
└─ Return success message
```

**OTP Verification:**
```javascript
POST /api/auth/verify-otp
├─ Find user by email
├─ Check OTP matches
├─ Validate OTP not expired
├─ Set isEmailVerified = true
├─ Clear OTP fields
└─ Return JWT token
```

**Resend OTP:**
```
POST /api/auth/resend-otp
├─ Find user by email
├─ Generate new OTP
├─ Reset otpExpiry
├─ Send new email
└─ Return success message
```

---

### Feature 1.3: Password Recovery System

#### Flow

**Step 1: Request Password Reset**
```
POST /api/auth/request-password-reset
├─ Find user by email
├─ Generate OTP
├─ Send OTP to email
└─ Return success message
```

**Step 2: Reset Password with OTP**
```
POST /api/auth/reset-password
├─ Find user by email
├─ Verify OTP validity
├─ Hash new password
├─ Update User.password
├─ Clear OTP fields
└─ Return success message
```

#### Pages
- `client/src/pages/ForgotPassword.js` - Request reset code
- Integration in Login page - Reset password link

#### Data Flow
```
ForgotPassword Form
    ↓
Enter Email → POST /api/auth/request-password-reset
    ↓
OTP sent to email
    ↓
Enter OTP + New Password → POST /api/auth/reset-password
    ↓
Password Updated → Login with new password
```

---

## Requirement 1: Role-Based Access & Profile Management

### Feature 1: Role-Based Access Control (RBAC)

#### User Roles
- **buyer**: Can purchase, review, rate
- **seller**: Can list cars/parts, receive ratings
- **admin**: Full system access, user management

#### Implementation

**Middleware:** `server/src/middleware/roles.js`
```javascript
// Example: Restrict to seller role
router.post("/cars", auth, checkRole("seller"), async (req, res) => {
  // Only sellers can create cars
});
```

**Role Check in Frontend:**
```javascript
// AuthContext provides user.role
const { user } = useAuth();

if (user?.role === "admin") {
  // Show admin dashboard
}
```

#### Admin Dashboard
**Location:** `client/src/pages/AdminUsers.js`
- View all users
- Promote/demote user roles
- Ban/unban users

**Backend Routes:**
```
PATCH /api/auth/promote/:userId - Promote to seller
PATCH /api/auth/demote/:userId - Demote to buyer
```

---

### Feature 2: Self-Service Profile Management

#### Implementation

**Endpoint:** `server/src/routes/auth.js`
```
PUT /api/auth/profile
├─ Authenticate user
├─ Update: name, email, phone, address, about
├─ Validate all fields
└─ Return updated user object
```

**Context Method:** `client/src/context/AuthContext.js`
```javascript
const updateProfile = async (name, email, phone, address, about) => {
  // Calls PUT /api/auth/profile
  // Updates user state
}
```

**Page:** `client/src/pages/EditProfile.js`
- Form with user fields
- Shows current information
- Updates in real-time

#### Data Flow
```
EditProfile Form
    ↓
AuthContext.updateProfile(fields)
    ↓
PUT /api/auth/profile
    ↓
Validate → Update User document
    ↓
Return updated user
    ↓
Update AuthContext.user
    ↓
Show success message
```

---

### Feature 3: Comprehensive Car Listing (CRUD)

#### Database Model
**Location:** `server/src/models/Car.js`

**Fields:**
- Basic: brand, model, year, price, condition
- Description: description, features
- Specifications: engine, transmission, mileage
- Customization: customizationOptions (colors, rims, tyres, interior, accessories)
- Media: images array
- Seller: seller ID reference
- Metadata: createdAt, updatedAt

#### Create Car (POST)
**Route:** `server/src/routes/cars.js`
```
POST /api/cars
├─ Auth: seller/admin only
├─ File upload: images (multer middleware)
├─ Validate required fields
├─ Create Car document
└─ Return created car object
```

**Frontend:** `client/src/pages/AddCar.jsx`
```
User fills form
    ↓
Upload images via file input
    ↓
POST /api/cars with FormData
    ↓
Store car ID → Redirect to car detail
```

#### Read Car (GET)
**Get Single Car:**
```
GET /api/cars/:id
├─ Fetch car with seller details
├─ Return car object with populated seller
```

**Get All Cars:**
```
GET /api/cars?search=...&filter=...
├─ Optional filters (brand, year, price, condition)
├─ Search by keyword
├─ Pagination (limit, skip)
└─ Return array of cars
```

**Frontend:** `client/src/pages/CarList.jsx` & `client/src/pages/CarDetail.jsx`

#### Update Car (PUT/PATCH)
**Route:** `server/src/routes/cars.js`
```
PATCH /api/cars/:id
├─ Auth: seller owner/admin
├─ Validate ownership
├─ Update allowed fields
└─ Return updated car
```

**Frontend:** `client/src/pages/EditCar.jsx`
```
Load car data → Edit fields → PATCH /api/cars/:id → Redirect
```

#### Delete Car (DELETE)
**Route:** `server/src/routes/cars.js`
```
DELETE /api/cars/:id
├─ Auth: seller owner/admin
├─ Validate ownership
├─ Delete car document
└─ Return success message
```

---

### Feature 4: Parts & Components Repository

#### Database Model
**Location:** `server/src/models/Part.js`

**Fields:**
- name, description, category
- price, quantity
- compatibility (compatible car models)
- images array
- seller ID reference

#### CRUD Operations
Similar to cars implementation:
```
POST /api/parts - Create part (seller/admin)
GET /api/parts - List all parts with filters
GET /api/parts/:id - Get single part detail
PATCH /api/parts/:id - Update part (owner/admin)
DELETE /api/parts/:id - Delete part (owner/admin)
```

**Frontend Pages:**
- `client/src/pages/PartList.jsx` - Browse parts
- `client/src/pages/PartDetail.jsx` - View part details
- `client/src/pages/AddPart.jsx` - Create part
- `client/src/pages/EditPart.jsx` - Edit part

---

### Feature 5: Advanced Multi-Criteria Search & Filtering

#### Search Implementation

**Backend:** `server/src/routes/cars.js` & `server/src/routes/parts.js`
```
GET /api/cars?search=&brand=&year=&priceMin=&priceMax=&condition=&limit=&skip=
├─ Text search on: name, brand, model, description
├─ Filter by: brand, year range, price range, condition
├─ Sort by: newest, price (asc/desc), relevance
├─ Pagination with limit/skip
└─ Return filtered results
```

**Query Building in Express:**
```javascript
let filter = {};
if (req.query.brand) filter.brand = req.query.brand;
if (req.query.year) filter.year = req.query.year;
if (req.query.priceMin) filter.price = { $gte: priceMin };
if (req.query.priceMax) filter.price = { ...filter.price, $lte: priceMax };

const cars = await Car.find({
  ...filter,
  $text: { $search: searchTerm }
}).limit(limit).skip(skip);
```

**Frontend:** `client/src/pages/CarList.jsx`
```
Search Input → Filter Dropdowns → Apply Filters
    ↓
GET /api/cars?search=...&filters=...
    ↓
Display filtered results with pagination
```

**Utilities:** `client/src/utils/carFilters.js`
- Manages filter state
- Builds query parameters
- Handles pagination logic

---

## Requirement 2: Shopping Cart & Analytics

### Feature 1: Persistent Shopping Cart

#### Implementation

**Context:** `client/src/context/CartContext.js`
- Stores cart items in state
- Saves to localStorage for persistence
- Methods: addToCart, removeFromCart, updateQuantity, clearCart

**Storage Structure:**
```javascript
{
  items: [
    {
      _id: "car_id",
      name: "Toyota Camry",
      type: "car",
      quantity: 1,
      price: 2500000,
      customizations: { color: "red", rims: "alloy" }
    },
    {
      _id: "part_id",
      name: "Turbo Charger",
      type: "part",
      quantity: 2,
      price: 50000
    }
  ]
}
```

**Key Features:**
- Auto-calculate total price
- Update customizations before purchase
- Show item count in navbar
- Persist across browser sessions

**Pages:**
- `client/src/pages/Checkout.jsx` - View cart & proceed to payment

#### Data Flow
```
Product Page (Car/Part)
    ↓
User clicks "Add to Cart"
    ↓
CartContext.addToCart(item)
    ↓
Save to localStorage + Update state
    ↓
Show cart count in Navbar
    ↓
Navigate to Checkout
    ↓
Review items → Proceed to payment
```

---

### Feature 2: Seller Analytics Lite

#### Dashboard Overview

**Location:** `client/src/pages/SellerAnalytics.jsx`

**Displays:**
1. **Summary Stats Card:**
   - Total Listings
   - Total Views
   - Total Saves
   - Average Views per Listing
   - Average Saves per Listing

2. **Community Trust Score:**
   - Average Rating (1-5)
   - Total Ratings Count
   - Rating Reviews Dropdown

3. **Top Listings:**
   - Top 5 by Views
   - Top 5 by Saves

4. **All Listings Table:**
   - Listing name, type, views, saves, engagement %

#### Backend Implementation

**Route:** `server/src/routes/analytics.js`

**Models Used:**
- `ListingAnalytics.js` - Stores view/save data
- `Rating.js` - Stores ratings and reviews
- `User.js` - Stores averageRating, totalRatings

**Analytics Dashboard Endpoint:**
```
GET /api/analytics/seller-dashboard
├─ Auth: seller only
├─ Calculate summary stats
│  ├─ Count total listings (Cars + Parts)
│  ├─ Sum total views from ListingAnalytics
│  ├─ Sum total saves from ListingAnalytics
│  └─ Calculate averages
├─ Fetch top listings by views/saves
├─ Fetch all listings with stats
└─ Return: { summary, topByViews, topBySaves, allListings }
```

**Record View Endpoint:**
```
POST /api/analytics/view
├─ Auth: required
├─ Find or create ListingAnalytics record
├─ Increment viewCount
├─ Add viewer userId
└─ Track view timestamp
```

**Record Save Endpoint:**
```
POST /api/analytics/save
├─ Auth: required
├─ Find or create ListingAnalytics record
├─ Toggle saveCount
├─ Track saved by user
```

#### Frontend Data Flow
```
SellerAnalytics Page mounted
    ↓
useEffect() → fetchAnalytics()
    ↓
GET /api/analytics/seller-dashboard
    ↓
Receive: { summary, topByViews, topBySaves, allListings }
    ↓
Render stats cards
    ↓
Render trust score with UserRatingsDropdown
    ↓
Render top listings & table
```

#### User Ratings Integration

**Component:** `client/src/components/UserRatingsDropdown.jsx`
- Dropdown menu showing seller's ratings
- Fetches: GET /api/ratings/:userId
- Displays: Average rating, total count, review list

---

### Feature 3: Modular Customization Engine

#### Implementation

**Customization Data:** `client/src/utils/customizationData.js`
- Stores color options with prices
- Stores rim options with prices
- Stores tyre options with prices
- Stores interior options with prices
- Stores accessories (multiple select) with prices

**Page:** `client/src/pages/Customise.jsx`
```
Car Model Selection
    ↓
Display Customization Options:
  ├─ Color Selector
  ├─ Rims Selector
  ├─ Tyres Selector
  ├─ Interior Selector
  └─ Accessories Checkboxes
    ↓
Real-time Price Update (base + customizations)
    ↓
Save to cart or create order
```

**State Management:**
```javascript
const [selections, setSelections] = useState({
  color: "",
  rims: "",
  tyres: "",
  interior: "",
  accessories: []
});
```

**Price Calculation:**
```javascript
const basePrice = car.price;
const colorPrice = customizationData.colors[color]?.price || 0;
const rimsPrice = customizationData.rims[rims]?.price || 0;
// ... calculate all additions
const totalPrice = basePrice + colorPrice + rimsPrice + ...;
```

#### Data Storage in Orders
```javascript
order.items = [
  {
    product: car_id,
    name: "Toyota Camry",
    price: totalPrice,
    basePrice: car.price,
    customizations: {
      color: { name: "Red", price: 50000 },
      rims: { name: "Alloy 18\"", price: 100000 },
      tyres: { name: "Michelin", price: 150000 },
      interior: { name: "Leather", price: 200000 },
      accessories: [
        { name: "Sunroof", price: 300000 }
      ]
    }
  }
]
```

---

### Feature 4: Real-Time Visualizer Integration

#### Implementation

**Component:** `client/src/components/CarVisualizer.jsx`

**Current Implementation:**
- 3D model viewer using Three.js (if integrated)
- Color change visualization
- Parts/accessories visual representation

**Data Flow:**
```
User selects color from dropdown
    ↓
handleSelectionChange() triggered
    ↓
Update state: selections.color = "red"
    ↓
CarVisualizer receives updated selections
    ↓
Re-render with new color applied
    ↓
Display updated visualization
```

**Model Storage:**
- Location: `public/models/` - 3D model files
- Format: GLTF/GLB files
- Format: Image overlays for 2D visualization

---

### Feature 5: Dynamic Pricing Calculator

#### Implementation

**Location:** `client/src/pages/Customise.jsx` & `client/src/pages/CarDetail.jsx`

**Calculation Logic:**
```javascript
const calculatePrice = (car, customizations) => {
  let total = car.price; // Base price
  
  if (customizations.color) {
    total += customizationData.colors[color].price;
  }
  if (customizations.rims) {
    total += customizationData.rims[rims].price;
  }
  if (customizations.tyres) {
    total += customizationData.tyres[tyres].price;
  }
  if (customizations.interior) {
    total += customizationData.interior[interior].price;
  }
  customizations.accessories.forEach(accessory => {
    total += customizationData.accessories[accessory].price;
  });
  
  return total;
};
```

**Display Components:**
```
Base Price: ৳ 2,500,000
  Color Upgrade (Red): + ৳ 50,000
  Rims Upgrade (18"): + ৳ 100,000
  Tyres Upgrade: + ৳ 150,000
  Interior Upgrade: + ৳ 200,000
  Accessories: + ৳ 300,000
────────────────────
Estimated Total: ৳ 3,300,000
```

**Real-time Update:**
```
onChange event on any customization input
    ↓
calculatePrice() executed
    ↓
Update displayed total price
    ↓
Update cart item with new price
```

---

## Requirement 3: Design & Checkout System

### Feature 1: Design "Snap & Share" (Save & Generate URLs)

#### Implementation

**Database Model:** `server/src/models/UserDesign.js`
```javascript
{
  designName: String,
  userId: ObjectId (ref: User),
  carId: ObjectId (ref: Car),
  customizations: {
    color, rims, tyres, interior, accessories
  },
  design_image: String (base64 or image URL),
  shareable_url: String (unique slug),
  createdAt: Date
}
```

**Routes:** `server/src/routes/designs.js`
```
POST /api/designs - Save current design
GET /api/designs/:designId - Get design by ID
GET /api/designs - Get all user designs
DELETE /api/designs/:designId - Delete design
```

**Save Design Flow:**
```
User designs car with customizations
    ↓
Click "Save Design" button
    ↓
Capture current state (color, accessories, etc.)
    ↓
Generate unique slug: "design-" + UUID
    ↓
POST /api/designs
  {
    designName: "My Red Camry",
    carId: "...",
    customizations: {...},
    shareable_url: "design-abc123"
  }
    ↓
Return shareable URL
    ↓
Display share options: Copy link, Social media buttons
```

**Share URL Format:**
```
https://autoforge.com/design/abc123
    ↓
GET /api/designs/abc123
    ↓
Load design data
    ↓
Display car with customizations
    ↓
"Add to Cart" or "Create Your Own"
```

**Frontend:** `client/src/pages/UploadDesign.jsx` & `client/src/pages/MyDesigns.jsx`
- View all saved designs
- Share designs
- Load design to cart
- Delete designs

---

### Feature 2: Virtual Garage (Design Library)

#### Implementation

**Page:** `client/src/pages/MyDesigns.jsx`

**Features:**
1. **Design List:**
   - Thumbnail preview
   - Car model name
   - Design name
   - Date created
   - Action buttons (Load, Share, Delete)

2. **Design Details:**
   - Show customizations applied
   - Display car visualizer
   - Share URL/link
   - Edit customizations

3. **Compare Designs:**
   - Select multiple designs
   - Side-by-side comparison
   - Highlight differences in customizations

#### Data Flow
```
User navigates to "My Designs"
    ↓
GET /api/designs (user's designs)
    ↓
Receive array of UserDesign objects
    ↓
Display designs in gallery
    ↓
User clicks design
    ↓
Load in customizer with stored customizations
    ↓
User can: Add to cart, Share, Save new version, Delete
```

---

### Feature 3: Multi-Method Checkout

#### Implementation

**Page:** `client/src/pages/Checkout.jsx`

**Payment Methods:**
1. **Cash on Delivery (COD)**
   - Select shipping address
   - Place order
   - Payment on delivery

2. **Mastercard/Credit Card**
   - Card details form
   - Process payment (integrated with Stripe/PayPal if available)
   - Transaction record

**Checkout Flow:**
```
Review Cart Items
    ↓
Enter Shipping Address
    ↓
Select Payment Method (COD / Card)
    ↓
If Card:
  ├─ Enter card details
  ├─ POST /api/orders with paymentMethod="mastercard"
  └─ Process payment
Else (COD):
  ├─ POST /api/orders with paymentMethod="cod"
  └─ Success message
    ↓
Order Created in database
    ↓
Create Transaction record
    ↓
Send confirmation email
    ↓
Redirect to Invoice page
```

**Order Model Fields:**
```javascript
{
  buyer: User ID,
  items: [...], // with product details
  shippingAddress: {
    fullName, phone, address, city, postalCode
  },
  paymentMethod: "cod" || "mastercard",
  paymentStatus: "pending" || "paid" || "failed",
  status: "pending" || "confirmed" || "shipped" || "delivered" || "cancelled",
  transaction: Transaction ID,
  isRatedByBuyer: Boolean
}
```

---

### Feature 4: Automated PDF Invoice Generator

#### Implementation

**Route:** `server/src/routes/orders.js`
```
GET /api/orders/:orderId/invoice
├─ Fetch order with populated details
├─ Generate PDF using PDFKit/Puppeteer
│  ├─ Invoice header (Invoice #, Date, Company logo)
│  ├─ Customer details
│  ├─ Item details (name, qty, price, customizations)
│  ├─ Subtotal, tax, total
│  └─ Payment method, shipping address
├─ Return PDF file
└─ Browser downloads PDF
```

**Frontend:** `client/src/pages/Invoice.jsx`
```
Order ID parameter
    ↓
GET /api/orders/:orderId (fetch order details)
    ↓
Display invoice preview
    ↓
Button: "Download PDF"
    ↓
GET /api/orders/:orderId/invoice
    ↓
Browser downloads PDF file
```

**Invoice Content:**
```
┌──────────────────────────────────────────┐
│         AutoForge E-Commerce             │
│                                          │
│ INVOICE #: INV-2024-001234               │
│ Date: April 23, 2024                     │
│                                          │
│ BILL TO:                                 │
│ Customer Name: Ahmed Khan                │
│ Address: Dhaka, Bangladesh               │
│                                          │
│ ITEMS:                                   │
│ ────────────────────────────────────────│
│ Description          Qty    Unit  Total │
│ Toyota Camry         1    2500K  2500K  │
│   Customizations:                       │
│   - Red Color             50K           │
│   - Alloy 18" Rims       100K           │
│ ────────────────────────────────────────│
│ Subtotal:                       2650000 │
│ Tax (15%):                       397500 │
│ Shipping:                             0 │
│ TOTAL:                          3047500 │
│                                          │
│ Payment Method: Cash on Delivery        │
│ Status: Pending                         │
└──────────────────────────────────────────┘
```

---

### Feature 5: Automated Tax/Fee Calculator

#### Implementation

**Utility Function:** `server/src/utils/` (or inline in orders route)
```javascript
const calculateTaxAndFees = (subtotal, shippingCity) => {
  const TAX_RATE = 0.15; // 15% VAT
  const SHIPPING_RATES = {
    dhaka: 0,
    chittagong: 300,
    sylhet: 500,
    // ...other cities
  };
  
  const tax = subtotal * TAX_RATE;
  const shipping = SHIPPING_RATES[shippingCity] || 500;
  
  return {
    subtotal,
    tax,
    shipping,
    total: subtotal + tax + shipping
  };
};
```

**Order Creation:**
```
POST /api/orders
├─ Calculate subtotal from items
├─ Get shipping city from address
├─ Call calculateTaxAndFees()
├─ Store in order: { subtotal, tax, shipping, total }
└─ Return order with calculated totals
```

**Display in Checkout:**
```
Items Subtotal:     ৳ 3,000,000
  Tax (15%):        ৳   450,000
  Shipping (Dhaka): ৳        0
  ─────────────────────────────
  TOTAL:            ৳ 3,450,000
```

---

## Requirement 4: Order Management & Community Trust

### Feature 1: Order Tracking System

#### Implementation

**Order Status Flow:**
```
Pending (Order created, awaiting confirmation)
    ↓
Confirmed (Seller confirmed, preparing)
    ↓
Shipped (Item dispatched by seller)
    ↓
Delivered (Item received by buyer)
    ✓ Complete or
    ↓
Cancelled (Order cancelled)
```

**Database Model:** `server/src/models/Order.js`

**Update Order Status Route:**
```
PATCH /api/orders/:orderId/status
├─ Auth: seller (item owner) or admin
├─ Validate status transition
├─ Update order status
├─ Create notification
└─ Return updated order
```

**Valid Transitions:**
```
pending → confirmed (seller action)
pending → cancelled (buyer/seller action)
confirmed → shipped (seller action)
confirmed → cancelled (seller action)
shipped → delivered (system or seller)
```

**Timeline Display in Order Page:**
```
┌─────────────────────────────────────┐
│ ✓ Pending (2024-04-20 10:30)        │
│   └─ Your order was placed         │
│                                     │
│ ✓ Confirmed (2024-04-20 14:15)     │
│   └─ Seller confirmed your order   │
│                                     │
│ ✓ Shipped (2024-04-22 09:00)       │
│   └─ Item dispatched                │
│   Tracking: #ABC123 via DHL        │
│                                     │
│ ⏳ Delivered (Est. 2024-04-24)     │
│   └─ Expected delivery soon        │
│                                     │
│ ⭐ Rate Seller (available after)   │
└─────────────────────────────────────┘
```

**Seller Update Flow:**
```
Seller in MyOrders (Received Orders tab)
    ↓
Sees "Mark as Shipped" button
    ↓
Clicks button
    ↓
PATCH /api/orders/:id/status
  { status: "shipped" }
    ↓
Order status updated
    ↓
Notification sent to buyer
    ↓
Buyer sees updated status in timeline
```

---

### Feature 2: Transaction History Ledger

#### Implementation

**Database Model:** `server/src/models/Transaction.js`
```javascript
{
  order: ObjectId (ref: Order),
  buyer: ObjectId (ref: User),
  seller: ObjectId (ref: User),
  amount: Number,
  paymentMethod: "cod" || "mastercard",
  status: "pending" || "completed" || "refunded",
  description: String,
  reference_number: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Routes:** `server/src/routes/transactions.js`
```
GET /api/transactions - User's transactions
GET /api/transactions/:orderId - Transaction for order
POST /api/transactions - Create transaction (internal)
```

**Transaction Creation:**
```
When POST /api/orders is called:
├─ Create Order document
├─ Create Transaction document
│  {
│    order: order._id,
│    buyer: req.userId,
│    seller: item.seller,
│    amount: item.price * quantity,
│    paymentMethod: "cod",
│    status: "pending"
│  }
└─ Link transaction ID in order
```

**Page:** `client/src/pages/TransactionHistory.jsx`

**Display:**
```
Date          | Description            | Amount    | Status
──────────────────────────────────────────────────────────────
2024-04-23    | Toyota Camry Purchase  | ৳3,000,000| Pending
2024-04-22    | Refund - Return        | -৳500,000 | Completed
2024-04-20    | Turbo Charger Purchase | ৳150,000  | Completed
```

**Data Flow:**
```
User navigates to Transaction History
    ↓
GET /api/transactions?limit=20&skip=0
    ↓
Receive array of Transaction objects
    ↓
Group by date / Filter by status
    ↓
Display in table with all details
    ↓
Click transaction → View order details
```

---

### Feature 3: Real-Time Negotiation Chat

#### Implementation

**Database Model:** `server/src/models/Chat.js`
```javascript
{
  buyer: ObjectId (ref: User),
  seller: ObjectId (ref: User),
  product: ObjectId,
  productType: "Car" || "Part",
  messages: [
    {
      sender: ObjectId,
      message: String,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Socket.io Integration:** `server/src/server.js`
```javascript
io.on('connection', (socket) => {
  socket.on('send-message', async (data) => {
    // Save message to database
    // Emit to recipient in real-time
    io.to(recipientSocketId).emit('receive-message', message);
  });
});
```

**Component:** `client/src/components/ChatBox.jsx`

**Features:**
1. **Message Display:**
   - Buyer messages (left aligned)
   - Seller messages (right aligned)
   - Timestamp on each message
   - Real-time delivery

2. **Message Input:**
   - Text input field
   - Send button
   - Character limit (500)

3. **Chat History:**
   - Load previous messages
   - Scroll to latest
   - Search in messages

**Integration in Product Pages:**
```
CarDetail.jsx / PartDetail.jsx
    ↓
User clicks "Contact Seller"
    ↓
ChatBox component opens
    ↓
Socket.io connects to backend
    ↓
User types message → Click send
    ↓
emit('send-message', { buyerId, sellerId, message })
    ↓
Backend saves to Chat collection
    ↓
emit('receive-message') to seller
    ↓
Seller sees message in real-time
```

**Chat List in Dashboard:**
```
Page: /messages or Dashboard sidebar
    ↓
List all active chats (conversations)
    ↓
Show:
  - Seller/Buyer name
  - Product name
  - Last message preview
  - Unread count
    ↓
Click chat → Open ChatBox with full conversation
```

---

### Feature 4: Exchange Request Portal

#### Implementation

**Database Model:** `server/src/models/ExchangeRequest.js`
```javascript
{
  requestedBy: ObjectId (ref: User),
  requestedFrom: ObjectId (ref: User),
  itemOffered: {
    itemType: "car" || "part",
    itemId: ObjectId,
    itemName: String,
    itemImage: String
  },
  itemRequested: {
    itemType: "car" || "part",
    itemId: ObjectId,
    itemName: String,
    itemImage: String
  },
  message: String,
  status: "pending" || "accepted" || "rejected" || "withdrawn",
  responseMessage: String,
  respondedAt: Date,
  expiresAt: Date (30 days),
  createdAt: Date
}
```

**Routes:** `server/src/routes/exchanges.js`
```
POST /api/exchanges - Create exchange request
GET /api/exchanges - Get user's exchange requests
PATCH /api/exchanges/:id - Respond to request (accept/reject)
DELETE /api/exchanges/:id - Withdraw request
```

**Create Exchange Request:**
```
User on Car Detail page
    ↓
Clicks "Propose Exchange"
    ↓
Modal opens:
  ├─ Select my item to offer
  ├─ Select item I want (pre-filled)
  └─ Add message
    ↓
POST /api/exchanges
  {
    requestedFrom: carOwner._id,
    itemOffered: { itemId, itemType, ... },
    itemRequested: { itemId, itemType, ... },
    message: "Want to trade?"
  }
    ↓
Notification sent to car owner
    ↓
Success message to requester
```

**Respond to Exchange:**
```
Seller sees exchange request in dashboard/notifications
    ↓
Clicks "View Request"
    ↓
Sees: My item wanted ← → Offered to me
    ↓
Can choose: Accept / Reject / Message
    ↓
PATCH /api/exchanges/:id
  { status: "accepted", responseMessage: "..." }
    ↓
If accepted:
  ├─ Create two orders (swap items)
  ├─ Update exchange status
  └─ Notify both parties
    ↓
Both users can track shipment like normal order
```

**Page:** `client/src/pages/ExchangeRequestPortal.jsx` & `client/src/pages/ExchangeRequests.jsx`

**Display Requests:**
```
┌─────────────────────────────────────────┐
│ INCOMING REQUESTS:                      │
│                                         │
│ [Image] Honda Civic              Status │
│ Offered by: John Doe (Buyer)     Pending│
│ Wants: Toyota Camry (Your car)         │
│ "Interested in trading?"                │
│ [Accept] [Reject] [Message]            │
│                                         │
├─────────────────────────────────────────┤
│ OUTGOING REQUESTS:                      │
│                                         │
│ Offering: My Civic                      │
│ For: Camry (Ahmed Khan's car)   Pending │
│ Sent: 2 days ago                        │
│ Expires: 28 days from now               │
│ [Withdraw] [Check Status]               │
└─────────────────────────────────────────┘
```

---

### Feature 5: Community Trust Score (Rating & Review System)

#### Implementation

**Database Model:** `server/src/models/Rating.js`
```javascript
{
  ratedBy: ObjectId (ref: User) - The buyer
  ratedUser: ObjectId (ref: User) - The seller
  rating: Number (1-5)
  review: String (optional, max 500 chars)
  order: ObjectId (ref: Order)
  transactionType: "purchase" || "exchange"
  createdAt: Date,
  updatedAt: Date
}
```

**User Model Enhancement:**
```javascript
// Added to User.js
averageRating: { type: Number, default: 0, min: 0, max: 5 }
totalRatings: { type: Number, default: 0, min: 0 }
```

**Routes:** `server/src/routes/ratings.js`
```
POST /api/ratings - Submit rating (buyer only)
GET /api/ratings/:userId - Get all ratings for user
GET /api/ratings/check/:orderId - Check if already rated
DELETE /api/ratings/:ratingId - Delete rating
```

#### Rating Submission Flow

**Where Rating Appears:**
1. **Order Status Page (MyOrders.jsx):**
   - After order status is "shipped" or "delivered"
   - Button: "⭐ Rate Seller"
   - Appears only once (removed after rating)

2. **Product Detail Pages:**
   - Show seller's average rating with dropdown
   - Dropdown shows recent reviews
   - Helps buyer decide before purchase

3. **Seller Analytics:**
   - New "Community Trust Score" card
   - Shows: Average rating (⭐), total count
   - Dropdown button to view all reviews

#### Rating Submission Process

**Component:** `client/src/components/RatingModal.jsx`

```
User clicks "Rate Seller"
    ↓
RatingModal opens with form:
  ├─ 5-star interactive selector
  ├─ Optional review text area (500 char limit)
  └─ Submit button
    ↓
User selects stars
    ↓
User types review (optional)
    ↓
Clicks "Submit Rating"
    ↓
POST /api/ratings
  {
    orderId: "...",
    ratedUserId: "seller_id",
    rating: 5,
    review: "Great seller, fast delivery!"
  }
    ↓
Backend validates:
  ├─ User is order buyer
  ├─ Seller in order items
  ├─ No duplicate rating
  └─ Status is shipped/delivered
    ↓
Create Rating document
    ↓
Update User.averageRating & totalRatings:
  averageRating = sum(all ratings) / count
    ↓
Mark Order.isRatedByBuyer = true
    ↓
AuthContext.refreshUser() called
    ↓
User state updated with new ratings
    ↓
Show success message
    ↓
Button removed, "✓ Rated" badge shown
```

#### Rating Display - UserRatingsDropdown Component

**Location:** `client/src/components/UserRatingsDropdown.jsx`

```
Trigger Button: "⭐ Reviews (n)"
    ↓
On click → Dropdown opens
    ↓
Shows:
  ├─ Header with average rating & count
  ├─ Individual review cards:
  │  ├─ Star rating visualization (★★★★☆)
  │  ├─ Reviewer name
  │  ├─ Review text (truncated at 150 chars)
  │  ├─ Rating label ("Excellent", "Good", etc)
  │  └─ Date posted
  └─ "Load more" option if > 5 reviews
    ↓
GET /api/ratings/:userId?limit=5&skip=0
    ↓
Populate with ratings data
    ↓
Sort by newest first
```

#### Analytics Display - SellerAnalytics.jsx

```
Dashboard loads
    ↓
Fetch analytics data including:
  ├─ User.averageRating
  ├─ User.totalRatings
  └─ Recent ratings from /api/ratings/:userId
    ↓
Display Trust Score Card:
  ├─ Large average rating display (⭐ 4.5)
  ├─ Total ratings count (28 ratings)
  └─ UserRatingsDropdown button
    ↓
User clicks dropdown
    ↓
Shows recent 5 reviews
    ↓
Helps seller monitor reputation
```

#### Data Flow Summary

```
Complete Rating Lifecycle:

1. SUBMISSION
   Order shipped → Rate Seller button
      ↓
   RatingModal → POST /api/ratings
      ↓
   Save Rating → Update User stats

2. DISPLAY
   GET /api/ratings/:userId
      ↓
   UserRatingsDropdown renders
      ↓
   Show on Product pages & Analytics

3. CALCULATION
   POST /api/ratings → Calculate average
      ↓
   Update User.averageRating
      ↓
   AuthContext.refreshUser()
      ↓
   Frontend updates instantly
```

---

## Summary: Feature Implementation Matrix

| Feature | Backend Route | Frontend Page | Database Model | Component |
|---------|---------------|---------------|----------------|-----------|
| Signup/Login | `/auth/signup`, `/auth/login` | Signup.js, Login.js | User.js | AuthContext |
| Password Reset | `/auth/request-password-reset` | ForgotPassword.js | User.js | - |
| Role Management | `/auth/promote/:id` | AdminUsers.js | User.js | - |
| Car CRUD | `/cars` | AddCar.jsx, CarList.jsx, CarDetail.jsx | Car.js | - |
| Parts CRUD | `/parts` | PartList.jsx, PartDetail.jsx | Part.js | - |
| Shopping Cart | (Client-side) | Checkout.jsx | (localStorage) | CartContext |
| Analytics | `/analytics/seller-dashboard` | SellerAnalytics.jsx | ListingAnalytics.js | - |
| Customization | (Client-side) | Customise.jsx, CarDetail.jsx | (localStorage) | CarVisualizer |
| Designs | `/designs` | MyDesigns.jsx, UploadDesign.jsx | UserDesign.js | - |
| Orders | `/orders` | MyOrders.jsx, Invoice.jsx | Order.js | - |
| Transactions | `/transactions` | TransactionHistory.jsx | Transaction.js | - |
| Chat | `/chat` (WebSocket) | ChatBox.jsx | Chat.js | ChatBox |
| Exchanges | `/exchanges` | ExchangeRequestPortal.jsx | ExchangeRequest.js | - |
| Ratings | `/ratings` | MyOrders.jsx, SellerAnalytics.jsx | Rating.js | RatingModal, UserRatingsDropdown |

---

## File Structure Reference

```
server/
├── src/
│   ├── models/
│   │   ├── User.js
│   │   ├── Car.js
│   │   ├── Part.js
│   │   ├── Order.js
│   │   ├── Cart.js (if server-side)
│   │   ├── Chat.js
│   │   ├── ExchangeRequest.js
│   │   ├── Rating.js
│   │   ├── Transaction.js
│   │   ├── ListingAnalytics.js
│   │   ├── UserDesign.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cars.js
│   │   ├── parts.js
│   │   ├── orders.js
│   │   ├── chat.js
│   │   ├── exchanges.js
│   │   ├── ratings.js
│   │   ├── transactions.js
│   │   ├── analytics.js
│   │   ├── designs.js
│   │   └── notifications.js
│   ├── middleware/
│   │   ├── auth.js (JWT verification)
│   │   ├── roles.js (Role checking)
│   │   └── upload.js (File upload multer)
│   └── server.js
│
client/
├── src/
│   ├── pages/
│   │   ├── Signup.js
│   │   ├── Login.js
│   │   ├── ForgotPassword.js
│   │   ├── Dashboard.js
│   │   ├── EditProfile.js
│   │   ├── CarList.jsx
│   │   ├── CarDetail.jsx
│   │   ├── AddCar.jsx
│   │   ├── EditCar.jsx
│   │   ├── PartList.jsx
│   │   ├── PartDetail.jsx
│   │   ├── AddPart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Customise.jsx
│   │   ├── MyDesigns.jsx
│   │   ├── UploadDesign.jsx
│   │   ├── MyOrders.jsx
│   │   ├── Invoice.jsx
│   │   ├── TransactionHistory.jsx
│   │   ├── SellerAnalytics.jsx
│   │   ├── SellerMessages.jsx (Chat)
│   │   ├── ExchangeRequestPortal.jsx
│   │   ├── ExchangeRequests.jsx
│   │   ├── AdminUsers.js
│   │   ├── AdminTransactions.jsx
│   │   └── LandingPage.jsx
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── MainLayout.jsx
│   │   ├── ChatBox.jsx
│   │   ├── ImageCarousel.jsx
│   │   ├── CarVisualizer.jsx
│   │   ├── RatingModal.jsx
│   │   ├── UserRatingsDropdown.jsx
│   │   └── ExchangeModal.jsx
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── CartContext.js
│   │   └── ChatContext.js
│   └── utils/
│       ├── axios.js
│       ├── carFilters.js
│       ├── customizationData.js
│       └── colorMap.js
```

---

## Key Data Flows Visualization

### Complete Purchase Flow
```
Browse Cars (CarList) 
  → View Detail (CarDetail)
  → Customize (Customise)
  → Add to Cart (CartContext)
  → Checkout (Checkout)
  → Select Payment
  → Place Order (POST /api/orders)
  → Create Transaction
  → Generate Invoice
  → Receive Order Confirmation
  → Track Status (MyOrders)
  → Receive Item
  → Rate Seller (RatingModal)
  → Update Analytics
```

### Seller View
```
List Car/Part (AddCar, AddPart)
  → View Analytics (SellerAnalytics)
  → Receive Order (MyOrders - Received tab)
  → Update Status (Confirm/Ship)
  → Receive Rating (UpdateUser.averageRating)
  → Monitor Trust Score
```

### Admin View
```
Login (Admin role)
  → Manage Users (AdminUsers)
  → Promote/Demote roles
  → View Transactions (AdminTransactions)
  → Moderate Platform
```

---

**Last Updated:** April 23, 2024
**Version:** 1.0 - Complete Implementation Guide
