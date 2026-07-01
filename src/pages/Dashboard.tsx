import { useEffect, useState } from "react";
import {
  getClubs,
  getEvents,
  registerForEvent,
  type StrapiClub,
  type StrapiEvent,
} from "../services/strapi";
import type { EventItem } from "../types/event";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import MyClubs from "../components/MyClubs";
import NextEventCard from "../components/NextEventCard";
import EventTable from "../components/EventTable";

function toEventItem(
  ev: StrapiEvent,
  locale: string,
  unknownClub: string,
  tba: string,
  userId?: number,
): EventItem {
  const date = new Date(ev.eventDate);
  const intlLocale = locale === "de" ? "de-DE" : "en-GB";
  const isAttending = !!userId && ev.attendees?.some((a) => a.id === userId);
  return {
    id: ev.id,
    eventName: ev.eventName,
    club: ev.club?.clubName ?? unknownClub,
    eventDate: date.toLocaleDateString(intlLocale, { day: "numeric", month: "long" }),
    time: date.toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit" }),
    location: ev.location?.locationName ?? tba,
    status: isAttending ? "registered" : "register",
  };
}

type Props = {
  onSeeAllClubs?: () => void;
  onViewEvent?: (event: StrapiEvent) => void;
};

export default function Dashboard({ onSeeAllClubs, onViewEvent }: Props) {
  const { token, user } = useAuth();
  const { locale, t } = useLanguage();
  const [events, setEvents] = useState<StrapiEvent[]>([]);
  const [clubs, setClubs] = useState<StrapiClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  function loadData() {
    return Promise.all([getEvents(token, locale), getClubs(token, locale)])
      .then(([eventsData, clubsData]) => {
        setEvents(eventsData);
        setClubs(clubsData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t("login.genericError"));
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, [token, locale]);

  async function handleRegister(eventId: number) {
    const event = events.find((ev) => ev.id === eventId);
    if (!event) return;

    setRegisterError(null);
    try {
      await registerForEvent(event.documentId, token);
      await loadData();
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : t("login.genericError"));
    }
  }

  if (loading) {
    return <main className="dashboard"><p>{t("common.loading")}</p></main>;
  }

  const eventItems = events.map((ev) =>
    toEventItem(ev, locale, t("common.unknownClub"), t("common.tba"), user?.id),
  );
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
      {registerError && (
        <div className="dashboardError">
          <p>{registerError}</p>
        </div>
      )}

      {eventItems.length > 0 ? (
        <NextEventCard
          event={eventItems[0]}
          onViewDetail={() => onViewEvent?.(events[0])}
          onRegister={() => handleRegister(eventItems[0].id)}
        />
      ) : (
        !error && <p>{t("dashboard.noUpcoming")}</p>
      )}

      <EventTable events={eventItems} onRegister={handleRegister} />

      <MyClubs clubs={myClubs} currentUserId={user?.id} onSeeAllClick={onSeeAllClubs} />
    </main>
  );
}
