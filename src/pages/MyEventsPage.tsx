import { useEffect, useState } from "react";
import { getEvents, type StrapiEvent } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

type FilterTab = "attending" | "pending";

export default function MyEventsPage() {
  const { token, user } = useAuth();
  const { locale, t } = useLanguage();
  const [events, setEvents] = useState<StrapiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("attending");

  useEffect(() => {
    getEvents(token, locale)
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : t("login.genericError")))
      .finally(() => setLoading(false));
  }, [token, locale]);

  function isOrganizer(event: StrapiEvent) {
    return !!user && event.club?.owner?.id === user.id;
  }

  function isAttending(event: StrapiEvent) {
    return !!user && event.attendees?.some((a) => a.id === user.id);
  }

  const attendingEvents = events.filter((event) => isOrganizer(event) || isAttending(event));
  const visibleEvents = tab === "attending" ? attendingEvents : [];

  return (
    <main className="dashboard">
      <div className="myClubsHeader">
        <h1>{t("myEventsPage.title")}</h1>
        <span className="manageLink">{t("myEventsPage.manage")}</span>
      </div>

      <div className="clubFilterTabs">
        <button
          type="button"
          className={`filterTab${tab === "attending" ? " active" : ""}`}
          onClick={() => setTab("attending")}
        >
          {t("myEventsPage.tabAttending")}
        </button>
        <button
          type="button"
          className={`filterTab${tab === "pending" ? " active" : ""}`}
          onClick={() => setTab("pending")}
        >
          {t("myEventsPage.tabPending")}
        </button>
      </div>

      {error && (
        <div className="dashboardError">
          <p>{t("myEventsPage.loadError")} <strong>{error}</strong></p>
        </div>
      )}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : !error && visibleEvents.length === 0 ? (
        <p>{tab === "attending" ? t("myEventsPage.emptyAttending") : t("myEventsPage.emptyPending")}</p>
      ) : (
        <div className="eventCardList">
          {visibleEvents.map((event) => (
            <article className="eventCard" key={event.id}>
              <div className="eventCardInfo">
                <h2>{event.eventName}</h2>
                <p>{t("myEventsPage.attendees", { n: event.attendees?.length ?? 0 })}</p>
                <p>{t("myEventsPage.pendingApprovals")}</p>
              </div>

              <div className="eventCardActions">
                {isOrganizer(event) && (
                  <span className="eventOrganizerBadge">{t("myEventsPage.organizer")}</span>
                )}
                <button type="button" className="eventViewDetailButton">
                  {t("myEventsPage.viewDetail")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
