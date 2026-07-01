import { useEffect, useState } from "react";
import { getClubs, getEvents, type StrapiClub, type StrapiEvent } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { StatusBadge } from "../components/StatusBadge";
import CreateEventModal from "../components/CreateEventModal";

type FilterTab = "attending" | "pending";

type Props = {
  onViewEvent?: (event: StrapiEvent) => void;
};

export default function MyEventsPage({ onViewEvent }: Props) {
  const { token, user } = useAuth();
  const { locale, t } = useLanguage();
  const [events, setEvents] = useState<StrapiEvent[]>([]);
  const [clubs, setClubs] = useState<StrapiClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("attending");
  const [showManage, setShowManage] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function loadEvents() {
    return getEvents(token, locale)
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : t("login.genericError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadEvents();
    getClubs(token, locale)
      .then(setClubs)
      .catch(() => setClubs([]));
  }, [token, locale]);

  const ownedClubs = clubs.filter((club) => !!user && club.owner?.id === user.id);

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
        {ownedClubs.length > 0 && (
          <button type="button" className="manageLink" onClick={() => setShowManage(true)}>
            {t("myEventsPage.manage")}
          </button>
        )}
      </div>

      {showManage && (
        <div className="modalOverlay" onClick={() => setShowManage(false)}>
          <div className="managePopover" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modalBackLink" onClick={() => setShowManage(false)}>
              {t("common.back")}
            </button>
            <button
              type="button"
              className="managePopoverLink"
              onClick={() => {
                setShowManage(false);
                setShowCreateModal(true);
              }}
            >
              {t("myEventsPage.manageCreate")}
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateEventModal
          ownedClubs={ownedClubs}
          onClose={() => setShowCreateModal(false)}
          onCreated={loadEvents}
        />
      )}

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
                <button
                  type="button"
                  className="eventViewDetailButton desktopOnly"
                  onClick={() => onViewEvent?.(event)}
                >
                  {t("myEventsPage.viewDetail")}
                </button>
                <span className="mobileOnly">
                  <StatusBadge status="registered" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
