import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage.jsx";
import ArtisanRegistration from "./pages/ArtisanRegistration.jsx";

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#register") return "register";
    }
    return "home";
  });

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash;
      if (hash === "#register") {
        setCurrentView("register");
      } else if (currentView === "register" && (!hash || hash === "#top" || hash === "#home")) {
        setCurrentView("home");
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [currentView]);

  function handleNavigate(view, targetSectionId) {
    setCurrentView(view);

    if (view === "register") {
      window.location.hash = "register";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (targetSectionId && targetSectionId !== "top") {
        window.location.hash = targetSectionId;
        setTimeout(() => {
          const el = document.getElementById(targetSectionId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 50);
      } else {
        window.history.pushState(null, "", window.location.pathname);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  if (currentView === "register") {
    return <ArtisanRegistration onBack={() => handleNavigate("home", "top")} />;
  }

  return <HomePage onNavigate={handleNavigate} />;
}
