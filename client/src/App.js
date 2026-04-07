import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import MainLayout from './components/MainLayout';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import AdminUsers from './pages/AdminUsers';
import CarList from './pages/CarList';
import AddCar from './pages/AddCar';
import EditCar from './pages/EditCar';
import CarDetail from './pages/CarDetail';
import Customise from './pages/Customise';
import CustomizationStudio from './pages/CustomizationStudio';
import LatestListings from './pages/LatestListings';
import PartList from './pages/PartList';
import PartDetail from './pages/PartDetail';
import AddPart from './pages/AddPart';
import EditPart from './pages/EditPart';
import LatestParts from './pages/LatestParts';
import MyOrders from './pages/MyOrders';
import Cart from './components/Cart';
import Checkout from './pages/Checkout';
import Invoice from './pages/Invoice';
import TransactionHistory from './pages/TransactionHistory';
import AdminTransactions from './pages/AdminTransactions';
import UploadDesign from './pages/UploadDesign';
import MyDesigns from './pages/MyDesigns';
import SellerMessages from './pages/SellerMessages';
import './styles/theme.css';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            <Routes>
            {/* Standard App Routes with Navbar */}
            <Route element={<MainLayout />}>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/cars" element={<CarList />} />
              <Route path="/cars/add" element={<ProtectedRoute><AddCar /></ProtectedRoute>} />
              <Route path="/cars/edit/:id" element={<ProtectedRoute><EditCar /></ProtectedRoute>} />
              <Route path="/cars/:id" element={<CarDetail />} />
              <Route path="/customise/:id" element={<Customise />} />
              <Route path="/customization" element={<CustomizationStudio />} />
              <Route path="/upload-design" element={<UploadDesign />} />
              <Route path="/my-designs" element={<ProtectedRoute><MyDesigns /></ProtectedRoute>} />
              <Route path="/latest-listings" element={<LatestListings />} />
              <Route path="/parts" element={<PartList />} />
              <Route path="/parts/add" element={<ProtectedRoute><AddPart /></ProtectedRoute>} />
              <Route path="/parts/edit/:id" element={<ProtectedRoute><EditPart /></ProtectedRoute>} />
              <Route path="/parts/:id" element={<PartDetail />} />
              <Route path="/latest-parts" element={<LatestParts />} />
              <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><SellerMessages /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
              <Route path="/admin/transactions" element={<ProtectedRoute><AdminTransactions /></ProtectedRoute>} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            </Route>

            {/* Standalone Invoice Routes (No Navbar) */}
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/invoice/:orderId" element={<Invoice />} />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          </ChatProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
