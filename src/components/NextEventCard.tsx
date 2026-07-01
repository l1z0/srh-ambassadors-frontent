import { StatusBadge } from "./StatusBadge";
import type { EventItem } from "../types/event";
import { useLanguage } from "../context/LanguageContext";

type Props = {
  event: EventItem;
  onViewDetail?: () => void;
  onRegister?: () => void;
};

export default function NextEventCard({ event, onViewDetail, onRegister }: Props) {
  const { t } = useLanguage();

  return (
    <section className="sectionBlock">
      <h1>{t("nextEvent.title")}</h1>

      <article className="nextEventCard">
        <div className="nextEventContent">
          <p className="clubNameLarge">{event.club}</p>
          <h2>{event.eventName}</h2>
          <div className="eventMetaLarge">
            <p>{event.eventDate} · {event.time}</p>
            <p>{event.location || t("nextEvent.locationTba")}</p>
          </div>
        </div>

        <div className="nextEventActions">
          <StatusBadge status={event.status} asButton onClick={onRegister} />
          <button className="detailsButton desktopOnly" onClick={onViewDetail}>
            {t("nextEvent.viewDetail")}
          </button>
        </div>
      </article>
    </section>
  );
}
