import { useState } from "react";
import { leaveEvent, registerForEvent, type StrapiEvent } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { StatusBadge } from "../components/StatusBadge";

function formatDateTime(iso: string, locale: string) {
  const date = new Date(iso);
  const intlLocale = locale === "de" ? "de-DE" : "en-GB";
  return {
    date: date.toLocaleDateString(intlLocale, { day: "numeric", month: "long" }),
    time: date.toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit" }),
  };
}

type Props = {
  event: StrapiEvent;
  onBack: () => void;
};

export default function EventDetailsPage({ event: initialEvent, onBack }: Props) {
  const { user, token } = useAuth();
  const { locale, t } = useLanguage();
  const [event, setEvent] = useState(initialEvent);
  const [registering, setRegistering] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const { date, time } = formatDateTime(event.eventDate, locale);
  const locationStr = event.location?.locationName ?? "";
  const attendees = event.attendees ?? [];
  const hostId = event.host?.id;
  const isAttending = !!user && attendees.some((a) => a.id === user.id);

  async function handleRegister() {
    setRegisterError(null);
    setRegistering(true);
    try {
      await registerForEvent(event.documentId, token);
      setEvent((prev) => ({
        ...prev,
        attendees: [...(prev.attendees ?? []), { id: user!.id, username: user!.username }],
      }));
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setRegistering(false);
    }
  }

  async function handleLeave() {
    setRegisterError(null);
    setLeaving(true);
    try {
      await leaveEvent(event.documentId, token);
      setEvent((prev) => ({
        ...prev,
        attendees: (prev.attendees ?? []).filter((a) => a.id !== user!.id),
      }));
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setLeaving(false);
    }
  }

  return (
    <main className="dashboard">
      <button type="button" className="pageBackLink" onClick={onBack}>
        {t("common.back")}
      </button>

      <div className="eventDetailLayout">
        <article className="eventDetailCard">
          <h1>{event.eventName}</h1>
          <p className="eventDetailDescription">{event.eventDescription}</p>
        </article>

        <div className="eventDetailSide">
          <div className="eventDetailInfoCard">
            {event.club?.clubName && (
              <div className="eventDetailInfoRow">
                <span className="eventDetailInfoIcon eventDetailInfoIconClub" aria-hidden="true" />
                <span>{event.club.clubName}</span>
              </div>
            )}
            <div className="eventDetailInfoRow">
              <span className="eventDetailInfoIcon eventDetailInfoIconCalendar" aria-hidden="true" />
              <span>{date} · {time}</span>
            </div>
            <div className="eventDetailInfoRow">
              <span className="eventDetailInfoIcon eventDetailInfoIconMarker" aria-hidden="true" />
              <span>{locationStr || t("nextEvent.locationTba")}</span>
            </div>
            <div className="eventDetailInfoRow">
              <span className="eventDetailInfoIcon eventDetailInfoIconMembers" aria-hidden="true" />
              <span>{t("eventDetail.attendeeCount", { n: attendees.length })}</span>
            </div>
          </div>

          <StatusBadge
            status={isAttending ? "registered" : "register"}
            asButton
            onClick={handleRegister}
            disabled={registering}
          />
          {isAttending && (
            <button
              type="button"
              className="viewDetailButton eventDetailLeaveButton"
              disabled={leaving}
              onClick={handleLeave}
            >
              {leaving ? t("common.loading") : t("eventDetail.leave")}
            </button>
          )}
          {registerError && <p className="clubDetailJoinError">{registerError}</p>}
        </div>
      </div>

      <section className="sectionBlock">
        <h1>{t("eventDetail.attendees")}</h1>

        {attendees.length === 0 ? (
          <p>{t("eventDetail.noAttendees")}</p>
        ) : (
          <div className="attendeeCardList">
            {attendees.map((attendee) => (
              <article className="attendeeCard" key={attendee.id}>
                <span className="attendeeAvatar">
                  {attendee.username?.[0]?.toUpperCase() ?? "?"}
                  {attendee.id === hostId && (
                    <span className="attendeeHostBadge">{t("eventDetail.host")}</span>
                  )}
                </span>
                <p className="attendeeName">{attendee.username}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
