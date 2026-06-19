import { useEffect, useState } from "react";
import { getPublicEvents, type StrapiEvent } from "../services/strapi";
import { useLanguage } from "../context/LanguageContext";

function formatDate(iso: string, locale: string) {
  const date = new Date(iso);
  const intlLocale = locale === "de" ? "de-DE" : "en-GB";
  return {
    date: date.toLocaleDateString(intlLocale, { day: "numeric", month: "long" }),
    time: date.toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function Home({ onShowLogin }: { onShowLogin: () => void }) {
  const { locale, t } = useLanguage();
  const [events, setEvents] = useState<StrapiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicEvents(locale)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locale]);

  return (
    <main className="homePage">
      <section className="homeHero">
        <h1>{t("home.title")}</h1>
        <p>{t("home.subtitle")}</p>
        <button className="btnLogin" onClick={onShowLogin}>
          {t("home.registerCta")}
        </button>
      </section>

      <section className="sectionBlock eventsSection" aria-labelledby="open-events-heading">
        <div className="sectionTitleRow">
          <h1 id="open-events-heading">{t("home.openEvents")}</h1>
        </div>

        {loading ? (
          <p>{t("common.loading")}</p>
        ) : events.length === 0 ? (
          <p>{t("home.noOpenEvents")}</p>
        ) : (
          <div className="eventsTable" role="list">
            {events.map((event) => {
              const { date, time } = formatDate(event.eventDate, locale);
              return (
                <article className="eventRow public" role="listitem" key={event.id}>
                  <div className="eventNameCell">
                    <h3>{event.eventName}</h3>
                    <p>{event.club?.clubName ?? t("common.unknownClub")}</p>
                  </div>

                  <div className="eventDateCell">
                    <strong>{date}</strong>
                    <span>{time}</span>
                  </div>

                  <div className="eventLocationCell">
                    <strong>
                      {event.location?.roomName ?? event.location?.locationName ?? t("common.tba")}
                    </strong>
                    {event.location?.building && <span>{event.location.building}</span>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
