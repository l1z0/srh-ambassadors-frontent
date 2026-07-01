import { useEffect, useState } from "react";
import { AMBASSADOR_ROLE_NAME, getNewsArticles, type StrapiNewsArticle } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AddNewsModal from "../components/AddNewsModal";

type CategoryFilter = "club" | "event" | "website";

function formatDate(iso: string, locale: string) {
  const intlLocale = locale === "de" ? "de-DE" : "en-GB";
  return new Date(iso).toLocaleDateString(intlLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NewsPage() {
  const { token, user, ambassadorMode } = useAuth();
  const { locale, t } = useLanguage();
  const [articles, setArticles] = useState<StrapiNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("club");
  const [showAddModal, setShowAddModal] = useState(false);
  const isAmbassador = user?.role?.name === AMBASSADOR_ROLE_NAME;
  const canAddNews = isAmbassador && ambassadorMode;

  function loadArticles() {
    return getNewsArticles(token, locale)
      .then(setArticles)
      .catch((err) => setError(err instanceof Error ? err.message : t("login.genericError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadArticles();
  }, [token, locale]);

  const visibleArticles = articles.filter((article) => article.category === category);

  return (
    <main className="dashboard">
      <div className="myClubsHeader">
        <h1>{t("newsPage.title")}</h1>
        {canAddNews && (
          <button type="button" className="manageLink" onClick={() => setShowAddModal(true)}>
            {t("newsPage.add")}
          </button>
        )}
      </div>

      {showAddModal && (
        <AddNewsModal onClose={() => setShowAddModal(false)} onCreated={loadArticles} />
      )}

      <div className="clubFilterTabs">
        <button
          type="button"
          className={`filterTab${category === "club" ? " active" : ""}`}
          onClick={() => setCategory("club")}
        >
          {t("newsPage.clubNews")}
        </button>
        <button
          type="button"
          className={`filterTab${category === "event" ? " active" : ""}`}
          onClick={() => setCategory("event")}
        >
          {t("newsPage.eventNews")}
        </button>
        <button
          type="button"
          className={`filterTab${category === "website" ? " active" : ""}`}
          onClick={() => setCategory("website")}
        >
          {t("newsPage.websiteNews")}
        </button>
      </div>

      {error && (
        <div className="dashboardError">
          <p>{t("newsPage.loadError")} <strong>{error}</strong></p>
        </div>
      )}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : !error && visibleArticles.length === 0 ? (
        <p>{t("newsPage.empty")}</p>
      ) : (
        <div className="newsCardList">
          {visibleArticles.map((article) => {
            const meta = [
              article.author?.username,
              t(`newsPage.category.${article.category}`),
              formatDate(article.createdAt, locale),
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <article className="newsCard" key={article.id}>
                <div className="newsCardInfo">
                  <p className="newsCardMeta">{meta}</p>
                  <h2>{article.Title}</h2>
                  {article.Article && <p className="newsCardBody">{article.Article}</p>}
                </div>

                <button type="button" className="detailsButton newsCardButton">
                  {t("myClubsPage.viewDetail")}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
