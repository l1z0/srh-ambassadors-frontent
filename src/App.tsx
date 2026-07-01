import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AMBASSADOR_ROLE_NAME, type StrapiClub, type StrapiEvent } from "./services/strapi";
import { Sidebar } from "./components/Sidebar";
import Footer from "./components/Footer";
import AmbassadorHome from "./pages/AmbassadorHome";
import ClubDetailPage from "./pages/ClubDetailPage";
import Dashboard from "./pages/Dashboard";
import DiscoverClubsPage from "./pages/DiscoverClubsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import LocationsPage from "./pages/LocationsPage";
import MyClubsPage from "./pages/MyClubsPage";
import MyEventsPage from "./pages/MyEventsPage";
import NewsPage from "./pages/NewsPage";
import ProfilePage from "./pages/ProfilePage";

type GuestView = "home" | "login";
type AuthedView =
  | "dashboard"
  | "myClubs"
  | "myEvents"
  | "discoverClubs"
  | "clubDetail"
  | "eventDetail"
  | "locations"
  | "news"
  | "profile";

function AppContent() {
  const { user, ambassadorMode } = useAuth();
  const [guestView, setGuestView] = useState<GuestView>("home");
  const [authedView, setAuthedView] = useState<AuthedView>("dashboard");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedClub, setSelectedClub] = useState<StrapiClub | null>(null);
  const [clubDetailReturnView, setClubDetailReturnView] = useState<AuthedView>("myClubs");
  const [selectedEvent, setSelectedEvent] = useState<StrapiEvent | null>(null);
  const [eventDetailReturnView, setEventDetailReturnView] = useState<AuthedView>("dashboard");
  const isAmbassador = user?.role?.name === AMBASSADOR_ROLE_NAME;
  const showAmbassadorDashboard = isAmbassador && ambassadorMode;

  function openClubDetail(club: StrapiClub, fromView: AuthedView) {
    setSelectedClub(club);
    setClubDetailReturnView(fromView);
    setAuthedView("clubDetail");
  }

  function openEventDetail(event: StrapiEvent, fromView: AuthedView) {
    setSelectedEvent(event);
    setEventDetailReturnView(fromView);
    setAuthedView("eventDetail");
  }

  return (
    <>
      <div className="appShell">
        {user && (
          <Sidebar
            expanded={sidebarExpanded}
            onToggle={() => setSidebarExpanded((v) => !v)}
            activeView={
              authedView === "myClubs" ||
              authedView === "discoverClubs" ||
              authedView === "clubDetail"
                ? "clubs"
                : authedView === "myEvents" || authedView === "eventDetail"
                  ? "events"
                  : authedView === "news"
                    ? "news"
                    : authedView === "locations"
                      ? "locations"
                      : authedView === "profile"
                        ? "profile"
                        : "home"
            }
            onHomeClick={() => setAuthedView("dashboard")}
            onClubsClick={() => setAuthedView("myClubs")}
            onEventsClick={() => setAuthedView("myEvents")}
            onNewsClick={() => setAuthedView("news")}
            onLocationsClick={() => setAuthedView("locations")}
            onProfileClick={() => setAuthedView("profile")}
          />
        )}
        {user ? (
          authedView === "myClubs" ? (
            <MyClubsPage
              onDiscoverClubs={() => setAuthedView("discoverClubs")}
              onViewClub={(club) => openClubDetail(club, "myClubs")}
            />
          ) : authedView === "discoverClubs" ? (
            <DiscoverClubsPage onViewClub={(club) => openClubDetail(club, "discoverClubs")} />
          ) : authedView === "clubDetail" && selectedClub ? (
            <ClubDetailPage
              club={selectedClub}
              onBack={() => setAuthedView(clubDetailReturnView)}
              onViewEvent={(event) => openEventDetail(event, "clubDetail")}
            />
          ) : authedView === "myEvents" ? (
            <MyEventsPage onViewEvent={(event) => openEventDetail(event, "myEvents")} />
          ) : authedView === "eventDetail" && selectedEvent ? (
            <EventDetailsPage event={selectedEvent} onBack={() => setAuthedView(eventDetailReturnView)} />
          ) : authedView === "locations" && isAmbassador ? (
            <LocationsPage />
          ) : authedView === "news" ? (
            <NewsPage />
          ) : authedView === "profile" ? (
            <ProfilePage />
          ) : showAmbassadorDashboard ? (
            <AmbassadorHome />
          ) : (
            <Dashboard
              onSeeAllClubs={() => setAuthedView("myClubs")}
              onViewEvent={(event) => openEventDetail(event, "dashboard")}
            />
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
