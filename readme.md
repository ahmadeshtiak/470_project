# AutoForge – 360° Car Customization & Exchange Hub

AutoForge – 360° Car Customization & Exchange Hub is a web-based platform that allows users to buy, sell, customize, and exchange cars and car parts in one integrated system. The platform enables users to browse car listings, customize vehicle features like color and accessories, and view real-time visual changes. It also supports secure purchasing, payment processing, and transaction management. Users can save and share customized designs, negotiate deals through live chat, and manage their profiles easily. The main goal is to provide a complete digital solution for car customization, trading, and exchange with an interactive user experience.

---

## Mandatory Module: Identity & Security (Auth)
* **Secure Multi-Role Auth:** Signup, Login, and Logout functionality for Buyers, Sellers, and Admins.
* **MFA via OTP:** Account creation/verification using Email or SMS-based OTP (using a free service like Nodemailer).
* **Password Recovery System:** Secure JWT-based "Forgot Password" flow via email.

---

## Requirement 1
* **Role-Based Access Control (RBAC):** Admin dashboard to promote/demote users and manage permissions.
* **Self-Service Profile Management:** Users can update bios, profile pictures, and contact details.
* **Comprehensive Car Listing (CRUD):** Admins/Sellers can add/edit/delete cars with metadata (Model, Year, Brand, Condition).
* **Parts & Components Repository:** Sellers can upload images and descriptions for car parts.
* **Advanced Multi-Criteria Search:** Search, browse and filtering options help users find specific cars or parts quickly.

---

## Requirement 2
* **Persistent Shopping Cart:** Users will be able to view their carts while shopping.
* **Seller Analytics Lite:** A small dashboard for sellers to see how many "Views" or "Saves" their listings have received.
* **Modular Customization Engine:** Users can select a car model and customize features like color, rims, or accessories.
* **Real-Time Visualizer Integration:** Visual changes are displayed in real-time using an integrated 3D or 2D visualization API.
* **Dynamic Pricing Calculator:** As users add premium rims or custom paint, the "Estimated Total" updates in real-time.

---

## Requirement 3
* **Design "Snap & Share":** Generate a unique URL or downloadable image of the customized car design.
* **The "Virtual Garage":** A private library where users can save multiple customized "Dream Builds" to compare later.
* **Multi-Method Checkout:** Users will be able to pay their fees with different payment methods.
* **Automated PDF Invoice Generator:** Users can generate and download a formal PDF invoice for parts/cars even before purchasing.
* **Automated Tax/Fee Calculator:** Logic to calculate registration fees or VAT based on the car’s price and region.

---

## Requirement 4
* **Order Tracking System:** A status timeline (Pending → Processing → Dispatched → Delivered) for car parts.
* **Transaction History Ledger:** Transaction history and confirmation notifications are available for users and admins.
* **Real-Time Negotiation Chat:** A live chat system for buyers and sellers to discuss prices.
* **Exchange Request Portal:** A formal "Swap" request system where users can propose trading one car/part for another.
* **Community Trust Score:** A rating and review system where users rate each other after a successful exchange or purchase.