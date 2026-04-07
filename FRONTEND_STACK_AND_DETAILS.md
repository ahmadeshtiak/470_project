# Frontend Stack and Details Documentation

## Overview
This document provides a comprehensive overview of the frontend part of the MotorWala project, a web application for buying, selling, and customizing vehicles. The frontend is built as a modern React-based single-page application (SPA) with 3D visualization capabilities.

## Tech Stack

### Core Framework
- **React 18.2.0**: The main frontend framework using functional components and hooks
- **React DOM 18.2.0**: For rendering React components to the DOM
- **React Scripts 5.0.1**: Build tool and development server (Create React App)

### Routing
- **React Router DOM 6.14.2**: Client-side routing for navigation between different pages/views

### HTTP Client
- **Axios 1.13.2**: For making HTTP requests to the backend API

### Real-time Communication
- **Socket.io Client 4.7.5**: Enables real-time features like chat and notifications

### 3D Rendering and Visualization
- **Three.js 0.168.0**: Core 3D graphics library
- **@react-three/fiber 8.18.0**: React renderer for Three.js
- **@react-three/drei 9.122.0**: Useful helpers and abstractions for React Three Fiber

### Build Tools
- **PostCSS**: CSS processing (configured via postcss.config.js)
- **Tailwind CSS**: Utility-first CSS framework (basic configuration)

## User Interface

### UI Type
- **Single Page Application (SPA)**: Built with React, all navigation happens client-side
- **Responsive Design**: Uses Tailwind CSS for responsive layouts
- **Component-based Architecture**: Modular React components for reusability

### HTML Structure
- Standard HTML5 document (`public/index.html`)
- Root div with id="root" where React mounts the application
- Meta tags include theme color matching the app's color scheme (#2a1a1f)
- Viewport meta tag for mobile responsiveness

### JavaScript/Type
- **JavaScript (ES6+)**: Modern JavaScript with JSX syntax
- **JSX**: XML-like syntax extension for React components
- **Functional Components**: Modern React pattern with hooks

### CSS and Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Custom CSS Variables**: Defined in `src/styles/theme.css` for consistent theming
- **CSS Modules**: Scoped styling where needed
- **PostCSS**: CSS processing pipeline

## State Management
- **React Context API**: For global state management
  - `AuthContext`: User authentication state
  - `CartContext`: Shopping cart functionality
  - `ChatContext`: Real-time chat state

## Project Structure and File Purposes

### Root Files
- `package.json`: Project dependencies, scripts, and metadata
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration
- `public/index.html`: Main HTML template
- `public/manifest.json`: Web app manifest for PWA features
- `public/robots.txt`: Search engine crawling instructions
- `public/models/`: Directory for 3D car model files (.glb format)

### Source Directory (`src/`)

#### Main Entry Points
- `index.js`: Application entry point, renders App component
- `App.js`: Main application component with routing setup
- `App.css`: Global application styles
- `index.css`: Base CSS resets and global styles

#### Components (`components/`)
- `Navbar.js`: Main navigation bar component
- `MainLayout.jsx`: Layout wrapper for authenticated pages
- `Cart.jsx`: Shopping cart component
- `CarImage.jsx`: Image display component for cars
- `CarVisualizer.jsx`: 3D car visualization component
- `ChatBox.jsx`: Real-time chat interface
- `ImageCarousel.jsx`: Image slideshow component
- `AdminUsers.js`: Admin panel for user management
- `User.js`: User profile component
- `authController.js`: Authentication-related UI logic

#### Pages (`pages/`)
- `Login.js` & `Signup.js`: Authentication pages
- `Dashboard.js`: User dashboard
- `EditProfile.js`: Profile editing page
- `CarList.jsx`: List of available cars
- `CarDetail.jsx`: Individual car details page
- `AddCar.jsx` & `EditCar.jsx`: Car management pages
- `Customise.jsx`: Car customization interface
- `CustomizationStudio.jsx`: Advanced 3D customization studio
- `PartList.jsx` & `PartDetail.jsx`: Parts listing and details
- `AddPart.jsx` & `EditPart.jsx`: Parts management
- `LatestListings.jsx` & `LatestParts.jsx`: Recent items pages
- `MyOrders.jsx`: User's order history
- `Checkout.jsx`: Payment and checkout process
- `Invoice.jsx`: Order invoice display
- `TransactionHistory.jsx`: Payment transaction history
- `AdminTransactions.jsx`: Admin transaction management
- `UploadDesign.jsx` & `MyDesigns.jsx`: User design upload and management
- `SellerMessages.jsx` & `SellerOrders.jsx`: Seller-specific pages

#### Context (`context/`)
- `AuthContext.js`: Authentication state and methods
- `CartContext.js`: Shopping cart state management
- `ChatContext.js`: Chat functionality state

#### API (`api/`)
- `adminApi.js`: API calls for admin functions

#### Utils (`utils/`)
- `axios.js`: Axios instance configuration
- `carFilters.js`: Car filtering logic
- `colorMap.js`: Color name to hex mapping for customization
- `customizationData.js`: Dummy data for customization features

#### Styles (`styles/`)
- `theme.css`: Custom CSS variables and theme definitions

## Themes and Design

### Color Scheme
**Dark Burgundy Theme** - A sophisticated dark color palette:
- Primary Background: `#2a1a1f` (Dark burgundy)
- Secondary Background: `#3d2a2f` (Lighter burgundy)
- Accent Background: `#6b4a4f` (Medium burgundy)
- Text Primary: `#ffffff` (White)
- Text Secondary: `#e0e0e0` (Light gray)
- Border Color: `#4a3a3f` (Muted burgundy)
- Button Background: `#6b4a4f` (Medium burgundy)
- Button Hover: `#8a5a5f` (Lighter burgundy)
- Brand Maroon: `#8b3a42` (Deep maroon)
- Danger: `#ff4444` (Red)
- Success: `#44ff44` (Green)

### Car Customization Colors
Extensive color palette defined in `colorMap.js` including:
- White variants (Pearl White, Platinum White, etc.)
- Black variants (Midnight Black, Super Black, etc.)
- Silver variants (Celestial Silver, High-Tech Silver, etc.)
- Gray variants (Magnetic Gray, Hampton Gray, etc.)
- Red variants (Super Red, Rallye Red, etc.)
- And many more color options

### Fonts
- **Primary Font Family**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`
- Clean, modern sans-serif fonts for readability
- System fonts for optimal performance

### Design Elements
- **Navigation**: Dark header with brand maroon accent border
- **Forms**: Rounded containers with secondary background
- **Buttons**: Burgundy-themed with hover effects
- **Layout**: Responsive container with max-width 1200px
- **3D Models**: GLTF/GLB format car models for visualization

## Key Features and Functionality

### Authentication
- User registration and login
- Protected routes using React Router
- JWT token-based authentication

### Car Management
- Browse, view, add, edit cars
- 3D visualization using Three.js
- Customization studio with color and part options

### E-commerce Features
- Shopping cart functionality
- Checkout process
- Order management and invoices
- Transaction history

### Real-time Features
- Chat system using Socket.io
- Real-time notifications

### Admin Panel
- User management
- Transaction oversight
- Content management

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for different screen sizes

## Development and Build Process

### Scripts
- `npm start`: Development server on localhost:3000
- `npm build`: Production build
- `npm test`: Run test suite
- `npm eject`: Eject from Create React App (irreversible)

### Environment
- Development: Hot reloading, source maps
- Production: Minified bundle, optimized assets

### Browser Support
- Modern browsers (Chrome, Firefox, Safari latest versions)
- Progressive Web App capabilities (manifest.json)

## Dependencies and Libraries

### Runtime Dependencies
- React ecosystem for UI
- Three.js ecosystem for 3D graphics
- Axios for API communication
- Socket.io for real-time features

### Development Dependencies
- React Scripts (includes Webpack, Babel, ESLint)
- PostCSS and Tailwind for styling

This documentation covers all major aspects of the frontend stack. For specific implementation details, refer to the individual component and page files in the codebase.</content>
<parameter name="filePath">d:\Badhon\Codes\BRACU\motowala\FRONTEND_STACK_AND_DETAILS.md