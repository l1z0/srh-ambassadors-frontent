import { StatusBadge } from "./StatusBadge";
import type { EventItem } from "../types/event";
import { useLanguage } from "../context/LanguageContext";

export default function NextEventCard({ event }: { event: EventItem }) {
  const { t } = useLanguage();
  const locationStr = [event.location, event.building].filter(Boolean).join(" · ");

  return (
    <section className="sectionBlock">
      <h1>{t("nextEvent.title")}</h1>

      <article className="nextEventCard">
        <div className="nextEventContent">
          <p className="clubNameLarge">{event.club}</p>
          <h2>{event.eventName}</h2>
          <div className="eventMetaLarge">
            <p>{event.eventDate} · {event.time}</p>
            <p>{locationStr || t("nextEvent.locationTba")}</p>
          </div>
        </div>

        <div className="nextEventActions">
          <StatusBadge status={event.status} />
          <button className="detailsButton">{t("nextEvent.viewDetail")}</button>
        </div>
      </article>
    </section>
  );
}
