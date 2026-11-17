import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import AuthModal from "./components/auth/AuthModal.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";
import VendorProfile from "./pages/VendorProfile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminProfile from "./pages/AdminProfile.jsx";

function AppContent() {
  const { user } = useAuth();
  const [route, setRoute] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.startsWith("#products")) return "products";
    if (hash.startsWith("#user-profile")) return "user-profile";
    if (hash.startsWith("#vendor-profile")) return "vendor-profile";
    if (hash.startsWith("#admin-profile")) return "admin-profile";
    if (hash.startsWith("#profile")) return "smart-profile";
    if (hash.startsWith("#customer")) return "customer";
    if (hash.startsWith("#vendor") || hash.startsWith("#studio")) return "vendor";
    if (hash.startsWith("#admin")) return "admin";
    return "home";
  });

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith("#products")) {
        setRoute("products");
      } else if (hash.startsWith("#user-profile")) {
        setRoute("user-profile");
      } else if (hash.startsWith("#vendor-profile")) {
        setRoute("vendor-profile");
      } else if (hash.startsWith("#admin-profile")) {
        setRoute("admin-profile");
      } else if (hash.startsWith("#profile")) {
        setRoute("smart-profile");
      } else if (hash.startsWith("#customer")) {
        setRoute("customer");
      } else if (hash.startsWith("#vendor") || hash.startsWith("#studio")) {
        setRoute("vendor");
      } else if (hash.startsWith("#admin")) {
        setRoute("admin");
      } else {
        setRoute("home");
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleRoleRedirect = (authedUser) => {
    if (authedUser.role === "admin") {
      window.location.hash = "#admin";
    } else if (authedUser.role === "vendor") {
      window.location.hash = "#vendor";
    } else {
      window.location.hash = "#customer";
    }
  };

  const renderCurrentView = () => {
    // Smart profile route: directs to user, vendor, or admin profile based on role
    if (route === "smart-profile") {
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
      case "products":
        return <ProductsPage />;
      case "customer":
        return (
          <ProtectedRoute allowedRoles={["customer", "vendor", "admin"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        );
      case "user-profile":
        return (
          <ProtectedRoute allowedRoles={["customer", "vendor", "admin"]}>
            <UserProfile />
          </ProtectedRoute>
        );
      case "vendor":
        return (
          <ProtectedRoute allowedRoles={["vendor", "admin"]}>
            <VendorDashboard />
          </ProtectedRoute>
        );
      case "vendor-profile":
        return (
          <ProtectedRoute allowedRoles={["vendor", "admin"]}>
            <VendorProfile />
          </ProtectedRoute>
        );
      case "admin":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        );
      case "admin-profile":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminProfile />
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
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
