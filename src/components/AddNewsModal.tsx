import { useEffect, useState } from "react";
import { createNewsArticle, getClubs, type StrapiClub } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

type Category = "club" | "event" | "website";
const CATEGORIES: Category[] = ["club", "event", "website"];

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function AddNewsModal({ onClose, onCreated }: Props) {
  const { token } = useAuth();
  const { locale, t } = useLanguage();
  const [title, setTitle] = useState("");
  const [article, setArticle] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [clubId, setClubId] = useState<string>("");
  const [membersOnly, setMembersOnly] = useState(false);
  const [clubs, setClubs] = useState<StrapiClub[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClubs(token, locale)
      .then(setClubs)
      .catch(() => setClubs([]));
  }, [token, locale]);

  async function handleCreate() {
    if (!title.trim() || !article.trim()) {
      setError(t("newsForm.errorRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createNewsArticle(
        {
          Title: title.trim(),
          Article: article.trim(),
          category,
          membersOnly: !!clubId && membersOnly,
          clubId: clubId ? Number(clubId) : undefined,
        },
        token,
        locale,
      );
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("newsForm.errorSubmit"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="proposeClubModal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modalBackLink" onClick={onClose}>
          {t("common.back")}
        </button>

        <div className="formField">
          <label htmlFor="newsTitle">{t("newsForm.title")}</label>
          <input
            id="newsTitle"
            type="text"
            placeholder={t("newsForm.titlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={40}
          />
        </div>

        <div className="formField">
          <label htmlFor="newsArticle">{t("newsForm.article")}</label>
          <textarea
            id="newsArticle"
            placeholder={t("newsForm.articlePlaceholder")}
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            maxLength={1000}
            rows={4}
          />
        </div>

        <div className="formField">
          <label htmlFor="newsCategory">{t("newsForm.category")}</label>
          <select
            id="newsCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t(`newsPage.category.${cat}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="formField">
          <label htmlFor="newsClub">{t("newsForm.club")}</label>
          <select id="newsClub" value={clubId} onChange={(e) => setClubId(e.target.value)}>
            <option value="">{t("newsForm.noClub")}</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.clubName}
              </option>
            ))}
          </select>
        </div>

        <div className="formField formFieldCheckbox">
          <label htmlFor="newsMembersOnly">
            <input
              id="newsMembersOnly"
              type="checkbox"
              checked={membersOnly}
              disabled={!clubId}
              onChange={(e) => setMembersOnly(e.target.checked)}
            />
            {t("newsForm.membersOnly")}
          </label>
        </div>

        {error && <p className="loginError">{error}</p>}

        <div className="modalActions">
          <button type="button" className="publishButton" onClick={handleCreate} disabled={submitting}>
            {submitting ? t("newsForm.submitting") : t("newsForm.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
