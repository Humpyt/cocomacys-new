import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { RequireAuth } from './components/admin/RequireAuth';

// Storefront pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Women = lazy(() => import('./pages/Women').then(m => ({ default: m.Women })));
const Men = lazy(() => import('./pages/Men').then(m => ({ default: m.Men })));
const ProductPage = lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));

// Customer pages
const CustomerLogin = lazy(() => import('./pages/customer/Login').then(m => ({ default: m.Login })));
const CustomerRegister = lazy(() => import('./pages/customer/Register').then(m => ({ default: m.Register })));
const CustomerAccount = lazy(() => import('./pages/customer/Account').then(m => ({ default: m.Account })));
const CustomerOrders = lazy(() => import('./pages/customer/Orders').then(m => ({ default: m.CustomerOrders })));
const Wishlist = lazy(() => import('./pages/customer/Wishlist').then(m => ({ default: m.Wishlist })));

// Admin pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const Login = lazy(() => import('./pages/admin/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const Products = lazy(() => import('./pages/admin/Products').then(m => ({ default: m.Products })));
const ProductForm = lazy(() => import('./pages/admin/ProductForm').then(m => ({ default: m.ProductForm })));
const HomepageSections = lazy(() => import('./pages/admin/HomepageSections').then(m => ({ default: m.HomepageSections })));
const Orders = lazy(() => import('./pages/admin/Orders').then(m => ({ default: m.Orders })));
const Collections = lazy(() => import('./pages/admin/Collections').then(m => ({ default: m.Collections })));
const CollectionForm = lazy(() => import('./pages/admin/CollectionForm').then(m => ({ default: m.CollectionForm })));
const Clearance = lazy(() => import('./pages/admin/Clearance').then(m => ({ default: m.Clearance })));
const Import = lazy(() => import('./pages/admin/Import').then(m => ({ default: m.Import })));

function PageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <WishlistProvider>
        <CartProvider>
          <Router>
          <Suspense fallback={<PageSkeleton />}>
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
            <Route path="/customer/wishlist" element={<><Header /><Wishlist /><Footer /></>} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<RequireAuth><AdminLayout><Dashboard /></AdminLayout></RequireAuth>} />
            <Route path="/admin/products" element={<RequireAuth><AdminLayout><Products /></AdminLayout></RequireAuth>} />
            <Route path="/admin/products/new" element={<RequireAuth><AdminLayout><ProductForm /></AdminLayout></RequireAuth>} />
            <Route path="/admin/products/:id/edit" element={<RequireAuth><AdminLayout><ProductForm /></AdminLayout></RequireAuth>} />
            <Route path="/admin/homepage-sections" element={<RequireAuth><AdminLayout><HomepageSections /></AdminLayout></RequireAuth>} />
            <Route path="/admin/orders" element={<RequireAuth><AdminLayout><Orders /></AdminLayout></RequireAuth>} />
            <Route path="/admin/collections" element={<RequireAuth><AdminLayout><Collections /></AdminLayout></RequireAuth>} />
            <Route path="/admin/collections/new" element={<RequireAuth><AdminLayout><CollectionForm /></AdminLayout></RequireAuth>} />
            <Route path="/admin/collections/:id/edit" element={<RequireAuth><AdminLayout><CollectionForm /></AdminLayout></RequireAuth>} />
            <Route path="/admin/clearance" element={<RequireAuth><AdminLayout><Clearance /></AdminLayout></RequireAuth>} />
            <Route path="/admin/import" element={<RequireAuth><AdminLayout><Import /></AdminLayout></RequireAuth>} />
          </Routes>
          </Suspense>
          <CartDrawer />
        </Router>
        </CartProvider>
        </WishlistProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}
