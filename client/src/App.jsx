import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { CartProvider, useCart } from "./context/CartContext.jsx";
import { AssistantProvider } from "./context/AssistantContext.jsx";
import AuthModal from "./components/auth/AuthModal.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";
import VendorProfile from "./pages/VendorProfile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminProfile from "./pages/AdminProfile.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrderConfirmationPage from "./pages/OrderConfirmationPage.jsx";
import MyOrdersPage from "./pages/MyOrdersPage.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";
import AssistantButton from "./components/assistant/AssistantButton.jsx";
import AssistantDrawer from "./components/assistant/AssistantDrawer.jsx";

function AppContent() {
  const { user } = useAuth();
  const { setCartOpen } = useCart();
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.startsWith("#cart")) {
      return "home";
    }
    if (hash.startsWith("#my-orders") || hash.startsWith("#orders")) return "my-orders";
    if (hash.startsWith("#order-confirmation")) return "order-confirmation";
    if (hash.startsWith("#checkout")) return "checkout";
    if (hash.startsWith("#product") && !hash.startsWith("#products")) return "product-detail";
    if (hash.startsWith("#products")) return "products";
    if (hash.startsWith("#vendor") || hash.startsWith("#studio")) return "vendor";
    if (hash.startsWith("#admin")) return "admin";
    if (
      hash.startsWith("#profile") ||
      hash.startsWith("#user-profile") ||
      hash.startsWith("#vendor-profile") ||
      hash.startsWith("#admin-profile") ||
      hash.startsWith("#customer")
    ) {
      return "profile";
    }
    return "home";
  });

  useEffect(() => {
    if (window.location.hash.toLowerCase().startsWith("#cart")) {
      setCartOpen(true);
    }
  }, [setCartOpen]);

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith("#cart")) {
        setCartOpen(true);
      } else if (hash.startsWith("#my-orders") || hash.startsWith("#orders")) {
        setRoute("my-orders");
      } else if (hash.startsWith("#order-confirmation")) {
        setRoute("order-confirmation");
      } else if (hash.startsWith("#checkout")) {
        setRoute("checkout");
      } else if (hash.startsWith("#product") && !hash.startsWith("#products")) {
        setRoute("product-detail");
      } else if (hash.startsWith("#products")) {
        setRoute("products");
      } else if (hash.startsWith("#vendor") || hash.startsWith("#studio")) {
        setRoute("vendor");
      } else if (hash.startsWith("#admin")) {
        setRoute("admin");
      } else if (
        hash.startsWith("#profile") ||
        hash.startsWith("#user-profile") ||
        hash.startsWith("#vendor-profile") ||
        hash.startsWith("#admin-profile") ||
        hash.startsWith("#customer")
      ) {
        setRoute("profile");
      } else {
        setRoute("home");
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setCartOpen]);

  const handleRoleRedirect = (authedUser) => {
    if (authedUser.role === "admin") {
      window.location.hash = "#admin";
    } else if (authedUser.role === "vendor") {
      window.location.hash = "#vendor";
    } else {
      window.location.hash = "#profile";
    }
  };

  const renderCurrentView = () => {
    // Role-tailored single Profile route:
    // Admin -> AdminProfile
    // Vendor -> VendorProfile (shows both artisan shop details & personal user details)
    // Customer -> UserProfile
    if (route === "profile") {
      if (user?.role === "admin") {
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
          </ProtectedRoute>
        );
      }
      if (user?.role === "vendor") {
        return (
          <ProtectedRoute allowedRoles={["vendor", "admin"]}>
            <VendorProfile />
          </ProtectedRoute>
        );
      }
      return (
        <ProtectedRoute allowedRoles={["customer", "vendor", "admin"]}>
          <UserProfile />
        </ProtectedRoute>
      );
    }

    switch (route) {
      case "my-orders":
        return (
          <ProtectedRoute allowedRoles={["customer", "vendor", "admin"]}>
            <MyOrdersPage />
          </ProtectedRoute>
        );
      case "order-confirmation":
        return (
          <ProtectedRoute allowedRoles={["customer", "vendor", "admin"]}>
            <OrderConfirmationPage />
          </ProtectedRoute>
        );
      case "checkout":
        return (
          <ProtectedRoute allowedRoles={["customer", "vendor", "admin"]}>
            <CheckoutPage />
          </ProtectedRoute>
        );
      case "product-detail":
        return <ProductDetailPage />;
      case "products":
        return <ProductsPage />;
      case "vendor":
        return (
          <ProtectedRoute allowedRoles={["vendor", "admin"]}>
            <VendorDashboard />
          </ProtectedRoute>
        );
      case "admin":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        );
      case "home":
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      <AuthModal onRoleRedirect={handleRoleRedirect} />
      {renderCurrentView()}
      <CartDrawer />
      <MobileBottomNav />
      <AssistantButton />
      <AssistantDrawer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AssistantProvider>
          <AppContent />
        </AssistantProvider>
      </CartProvider>
    </AuthProvider>
  );
}
