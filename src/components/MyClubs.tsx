import type { StrapiClub } from "../services/strapi";
import { useLanguage } from "../context/LanguageContext";

type Props = {
  clubs: StrapiClub[];
  currentUserId?: number;
  onSeeAllClick?: () => void;
};

export default function MyClubs({ clubs, currentUserId, onSeeAllClick }: Props) {
  const { t } = useLanguage();
  return (
    <section className="clubsSection">
      <div className="sectionTitleRow">
        <h1>{t("myClubsWidget.title")}</h1>
        <a
          className="seeAll"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSeeAllClick?.();
          }}
        >
          {t("common.seeAll")}
        </a>
      </div>

      <div className="clubCards">
        {clubs.slice(0, 3).map((club) => (
          <article className="clubCard" key={club.id}>
            {club.owner?.id === currentUserId && (
              <span className="ownerBadge">{t("myClubsWidget.owner")}</span>
            )}

            <h3>{club.clubName}</h3>

            <p>{t("myClubsWidget.upcomingEvents", { n: club.events?.length ?? 0 })}</p>
            <p>{t("myClubsWidget.nextIn")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
