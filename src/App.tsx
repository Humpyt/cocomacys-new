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
const Home = lazy(() => import('./pages/Home'));
const Women = lazy(() => import('./pages/Women'));
const Men = lazy(() => import('./pages/Men'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

// Customer pages
const CustomerLogin = lazy(() => import('./pages/customer/Login'));
const CustomerRegister = lazy(() => import('./pages/customer/Register'));
const CustomerAccount = lazy(() => import('./pages/customer/Account'));
const CustomerOrders = lazy(() => import('./pages/customer/Orders'));
const Wishlist = lazy(() => import('./pages/customer/Wishlist'));

// Admin pages
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const HomepageSections = lazy(() => import('./pages/admin/HomepageSections'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Collections = lazy(() => import('./pages/admin/Collections'));
const CollectionForm = lazy(() => import('./pages/admin/CollectionForm'));
const Clearance = lazy(() => import('./pages/admin/Clearance'));
const Import = lazy(() => import('./pages/admin/Import'));

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
