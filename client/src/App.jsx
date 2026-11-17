import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";

export default function App() {
  const [route, setRoute] = useState(() => {
    return window.location.hash === "#products" ? "products" : "home";
  });

  useEffect(() => {
    function handleHashChange() {
      if (window.location.hash === "#products") {
        setRoute("products");
      } else {
        setRoute("home");
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (route === "products") {
    return <ProductsPage />;
  }

  return <HomePage />;
}
