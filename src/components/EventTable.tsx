import type { EventItem } from "../types/event";
import { StatusBadge } from "./StatusBadge";
import { useLanguage } from "../context/LanguageContext";

interface EventTableProps {
  events: EventItem[];
  onRegister?: (id: number) => void;
}

export default function EventTable({ events, onRegister }: EventTableProps) {
  const { t } = useLanguage();
  return (
    <section className="sectionBlock eventsSection" aria-labelledby="upcoming-events-heading">
      <div className="sectionTitleRow">
        <h1 id="upcoming-events-heading">{t("eventsTable.title")}</h1>
        <a className="seeAll" href="#">{t("common.seeAll")}</a>
      </div>

      <div className="eventsTable" role="list">
        {events.map((event) => (
          <article className="eventRow" role="listitem" key={event.id}>
            <div className="eventNameCell">
              <h3>{event.eventName}</h3>
              <p>{event.club}</p>
            </div>

            <div className="eventDateCell">
              <strong>{event.eventDate}</strong>
              <span>{event.time}</span>
            </div>

            <div className="eventLocationCell">
              <strong>{event.location}</strong>
            </div>

            <div className="eventStatusCell">
              <StatusBadge status={event.status} asButton onClick={() => onRegister?.(event.id)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
