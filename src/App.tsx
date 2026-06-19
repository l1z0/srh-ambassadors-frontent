import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AMBASSADOR_ROLE_NAME } from "./services/strapi";
import { Sidebar } from "./components/Sidebar";
import Footer from "./components/Footer";
import AmbassadorHome from "./pages/AmbassadorHome";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyClubsPage from "./pages/MyClubsPage";
import MyEventsPage from "./pages/MyEventsPage";

type GuestView = "home" | "login";
type AuthedView = "dashboard" | "myClubs" | "myEvents";

function AppContent() {
  const { user, ambassadorMode } = useAuth();
  const [guestView, setGuestView] = useState<GuestView>("home");
  const [authedView, setAuthedView] = useState<AuthedView>("dashboard");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const isAmbassador = user?.role?.name === AMBASSADOR_ROLE_NAME;
  const showAmbassadorDashboard = isAmbassador && ambassadorMode;

  return (
    <>
      <div className="appShell">
        <Sidebar
          expanded={sidebarExpanded}
          onToggle={() => setSidebarExpanded((v) => !v)}
          activeView={
            user && authedView === "myClubs"
              ? "clubs"
              : user && authedView === "myEvents"
                ? "events"
                : "home"
          }
          onHomeClick={() => {
            setGuestView("home");
            setAuthedView("dashboard");
          }}
          onClubsClick={() => {
            if (user) {
              setAuthedView("myClubs");
            } else {
              setGuestView("login");
            }
          }}
          onEventsClick={() => {
            if (user) {
              setAuthedView("myEvents");
            } else {
              setGuestView("login");
            }
          }}
        />
        {user ? (
          authedView === "myClubs" ? (
            <MyClubsPage />
          ) : authedView === "myEvents" ? (
            <MyEventsPage />
          ) : showAmbassadorDashboard ? (
            <AmbassadorHome />
          ) : (
            <Dashboard onSeeAllClubs={() => setAuthedView("myClubs")} />
          )
        ) : guestView === "login" ? (
          <Login onBack={() => setGuestView("home")} />
        ) : (
          <Home onShowLogin={() => setGuestView("login")} />
        )}
        {sidebarExpanded && (
          <div
            className="sidebarOverlay"
            aria-hidden="true"
            onClick={() => setSidebarExpanded(false)}
          />
        )}
      </div>
      {!user && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
