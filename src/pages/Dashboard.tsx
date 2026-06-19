import { useEffect, useState } from "react";
import {
  getClubs,
  getEvents,
  type StrapiClub,
  type StrapiEvent,
} from "../services/strapi";
import type { EventItem } from "../types/event";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import MyClubs from "../components/MyClubs";
import NextEventCard from "../components/NextEventCard";
import EventTable from "../components/EventTable";

function toEventItem(ev: StrapiEvent, locale: string, unknownClub: string, tba: string): EventItem {
  const date = new Date(ev.eventDate);
  const intlLocale = locale === "de" ? "de-DE" : "en-GB";
  return {
    id: ev.id,
    eventName: ev.eventName,
    club: ev.club?.clubName ?? unknownClub,
    eventDate: date.toLocaleDateString(intlLocale, { day: "numeric", month: "long" }),
    time: date.toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit" }),
    location: ev.location?.roomName ?? ev.location?.locationName ?? tba,
    building: ev.location?.building,
    status: "register",
  };
}

export default function Dashboard({ onSeeAllClubs }: { onSeeAllClubs?: () => void }) {
  const { token, user } = useAuth();
  const { locale, t } = useLanguage();
  const [events, setEvents] = useState<StrapiEvent[]>([]);
  const [clubs, setClubs] = useState<StrapiClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getEvents(token, locale), getClubs(token, locale)])
      .then(([eventsData, clubsData]) => {
        setEvents(eventsData);
        setClubs(clubsData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t("login.genericError"));
      })
      .finally(() => setLoading(false));
  }, [token, locale]);

  if (loading) {
    return <main className="dashboard"><p>{t("common.loading")}</p></main>;
  }

  const eventItems = events.map((ev) => toEventItem(ev, locale, t("common.unknownClub"), t("common.tba")));
  const myClubs = clubs.filter(
    (club) => club.owner?.id === user?.id || club.members?.some((m) => m.id === user?.id),
  );

  return (
    <main className="dashboard">
      {error && (
        <div className="dashboardError">
          <p>{t("dashboard.loadError")} <strong>{error}</strong></p>
          <p>{t("dashboard.loadErrorHint")}</p>
        </div>
      )}

      {eventItems.length > 0 ? (
        <NextEventCard event={eventItems[0]} />
      ) : (
        !error && <p>{t("dashboard.noUpcoming")}</p>
      )}

      <EventTable events={eventItems} />

      <MyClubs clubs={myClubs} currentUserId={user?.id} onSeeAllClick={onSeeAllClubs} />
    </main>
  );
}
