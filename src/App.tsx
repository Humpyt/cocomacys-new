import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Women } from './pages/Women';
import { Men } from './pages/Men';
import { ProductPage } from './pages/ProductPage';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { CartDrawer } from './components/CartDrawer';
// Admin imports
import { RequireAuth } from './components/admin/RequireAuth';
import { AdminLayout } from './components/admin/AdminLayout';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Products } from './pages/admin/Products';
import { ProductForm } from './pages/admin/ProductForm';
import { HomepageSections } from './pages/admin/HomepageSections';
import { Orders } from './pages/admin/Orders';
import { Collections } from './pages/admin/Collections';
import { CollectionForm } from './pages/admin/CollectionForm';
import { Clearance } from './pages/admin/Clearance';
import { Import } from './pages/admin/Import';
// Customer auth imports
import { Login as CustomerLogin } from './pages/customer/Login';
import { Register as CustomerRegister } from './pages/customer/Register';
import { Account as CustomerAccount } from './pages/customer/Account';
import { CustomerOrders } from './pages/customer/Orders';

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <CartProvider>
          <Router>
          <Routes>
            {/* Storefront */}
            <Route path="/" element={<><Header /><Home /><Footer /></>} />
            <Route path="/women" element={<><Header /><Women /><Footer /></>} />
            <Route path="/men" element={<><Header /><Men /><Footer /></>} />
            <Route path="/product" element={<><Header /><ProductPage /><Footer /></>} />
            <Route path="/contact" element={<><Header /><Contact /><Footer /></>} />
            <Route path="/cart" element={<><Header /><Cart /><Footer /></>} />
            <Route path="/checkout" element={<><Header /><Checkout /><Footer /></>} />

            {/* Customer auth routes */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/register" element={<CustomerRegister />} />
            <Route path="/customer/account" element={<><Header /><CustomerAccount /><Footer /></>} />
            <Route path="/customer/orders" element={<><Header /><CustomerOrders /><Footer /></>} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/products"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Products />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <ProductForm />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <ProductForm />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/homepage-sections"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <HomepageSections />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Orders />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/collections"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Collections />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/collections/new"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <CollectionForm />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/collections/:id/edit"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <CollectionForm />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/clearance"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Clearance />
                  </AdminLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/import"
              element={
                <RequireAuth>
                  <AdminLayout>
                    <Import />
                  </AdminLayout>
                </RequireAuth>
              }
            />
          </Routes>
        <CartDrawer />
        </Router>
        </CartProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}
