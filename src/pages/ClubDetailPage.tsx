import { useEffect, useState } from "react";
import { getEvents, joinClub, leaveClub, STRAPI_URL, type StrapiClub, type StrapiEvent } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function clubImageUrl(club: StrapiClub): string | null {
  const url = club.clubPicture?.url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

function formatDate(iso: string, locale: string) {
  const date = new Date(iso);
  const intlLocale = locale === "de" ? "de-DE" : "en-GB";
  return {
    date: date.toLocaleDateString(intlLocale, { day: "numeric", month: "long" }),
    time: date.toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit" }),
  };
}

type Tab = "events" | "members";

type Props = {
  club: StrapiClub;
  onBack: () => void;
  onViewEvent?: (event: StrapiEvent) => void;
};

export default function ClubDetailPage({ club: initialClub, onBack, onViewEvent }: Props) {
  const { token, user } = useAuth();
  const { locale, t } = useLanguage();
  const [club, setClub] = useState(initialClub);
  const [events, setEvents] = useState<StrapiEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [tab, setTab] = useState<Tab>("events");

  useEffect(() => {
    setClub(initialClub);
  }, [initialClub]);

  useEffect(() => {
    getEvents(token, locale)
      .then((allEvents) => setEvents(allEvents.filter((event) => event.club?.id === club.id)))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [token, locale, club.id]);

  const isOwner = !!user && club.owner?.id === user.id;
  const isMember = !!user && club.members?.some((m) => m.id === user.id);
  const isPending = !!user && club.pendingMembers?.some((m) => m.id === user.id);
  const canJoin = !!user && !isOwner && !isMember && !isPending;

  async function handleJoin() {
    setJoinError(null);
    setJoining(true);
    try {
      await joinClub(club.documentId, token);
      setClub((prev) => ({
        ...prev,
        pendingMembers: [...(prev.pendingMembers ?? []), { id: user!.id, username: user!.username }],
      }));
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    setJoinError(null);
    setLeaving(true);
    try {
      await leaveClub(club.documentId, token);
      setClub((prev) => ({
        ...prev,
        members: (prev.members ?? []).filter((m) => m.id !== user!.id),
      }));
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setLeaving(false);
    }
  }

  const imageUrl = clubImageUrl(club);
  const members = club.members ?? [];

  return (
    <main className="dashboard">
      <button type="button" className="pageBackLink" onClick={onBack}>
        {t("common.back")}
      </button>

      <div className="clubDetailLayout">
        <article className="clubDetailCard">
          <div className="clubDetailHeader">
            <h1>{club.clubName}</h1>
            <div className="clubDetailBadges">
              <span className="clubDetailBadge">
                <span className="clubDetailBadgeIcon clubDetailBadgeIconBookmark" aria-hidden="true" />
                {club.clubType}
              </span>
              <span className="clubDetailBadge">
                <span className="clubDetailBadgeIcon clubDetailBadgeIconMembers" aria-hidden="true" />
                {t("myClubsPage.members", { n: members.length })}
              </span>
            </div>
          </div>
          <p className="clubDetailDescription">{club.clubDescription}</p>
        </article>

        <div className="clubDetailSide">
          {imageUrl ? (
            <img className="clubDetailImage" src={imageUrl} alt="" />
          ) : (
            <div className="clubDetailImagePlaceholder" aria-hidden="true" />
          )}

          {canJoin && (
            <button type="button" className="joinButton clubDetailJoinButton" disabled={joining} onClick={handleJoin}>
              {joining ? t("discoverClubs.requesting") : t("discoverClubs.requestToJoin")}
            </button>
          )}
          {isPending && <p className="clubDetailJoinNote">{t("clubDetail.requestPending")}</p>}
          {joinError && <p className="clubDetailJoinError">{joinError}</p>}

          {isOwner && (
            <button
              type="button"
              className="viewDetailButton clubDetailManageButton"
              onClick={() => { /* manage club — placeholder */ }}
            >
              {t("clubDetail.manageClub")}
            </button>
          )}
          {isMember && !isOwner && (
            <button
              type="button"
              className="viewDetailButton clubDetailManageButton"
              disabled={leaving}
              onClick={handleLeave}
            >
              {leaving ? t("common.loading") : t("clubDetail.manageMembership")}
            </button>
          )}
        </div>
      </div>

      <div className="clubFilterTabs">
        <button
          type="button"
          className={`filterTab${tab === "events" ? " active" : ""}`}
          onClick={() => setTab("events")}
        >
          {t("clubDetail.upcomingEvents")}
        </button>
        <button
          type="button"
          className={`filterTab${tab === "members" ? " active" : ""}`}
          onClick={() => setTab("members")}
        >
          {t("clubDetail.tabMembers")}
        </button>
      </div>

      {tab === "events" ? (
        <section className="sectionBlock">
          {loadingEvents ? (
            <p>{t("common.loading")}</p>
          ) : events.length === 0 ? (
            <p>{t("clubDetail.noEvents")}</p>
          ) : (
            <div className="eventsTable" role="list">
              {events.map((event) => {
                const { date, time } = formatDate(event.eventDate, locale);
                return (
                  <article className="eventRow" role="listitem" key={event.id}>
                    <div className="eventNameCell">
                      <h3>{event.eventName}</h3>
                      <p>{club.clubName}</p>
                    </div>

                    <div className="eventDateCell">
                      <strong>{date}</strong>
                      <span>{time}</span>
                    </div>

                    <div className="eventLocationCell">
                      <strong>{event.location?.locationName ?? t("common.tba")}</strong>
                    </div>

                    <div className="eventStatusCell">
                      <button
                        type="button"
                        className="eventViewDetailButton desktopOnly"
                        onClick={() => onViewEvent?.(event)}
                      >
                        {t("myEventsPage.viewDetail")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="sectionBlock">
          {members.length === 0 ? (
            <p>{t("clubDetail.noMembers")}</p>
          ) : (
            <div className="attendeeCardList">
              {members.map((member) => {
                const initial = member.username.charAt(0).toUpperCase();
                const isClubOwner = club.owner?.id === member.id;
                return (
                  <div className="attendeeCard" key={member.id}>
                    <div className="attendeeAvatar">
                      {initial}
                      {isClubOwner && (
                        <span className="attendeeHostBadge">{t("myClubsPage.ownerBadge")}</span>
                      )}
                    </div>
                    <p className="attendeeName">{member.username}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
