import { useEffect, useState } from "react";
import {
  approveClubProposal,
  getClubs,
  rejectClubProposal,
  type StrapiClub,
} from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function AmbassadorHome() {
  const { token } = useAuth();
  const { t, locale } = useLanguage();
  const [clubs, setClubs] = useState<StrapiClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function timeAgo(dateString: string): string {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return t("ambassador.justNow");
    if (minutes < 60) return t("ambassador.minutesAgo", { n: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("ambassador.hoursAgo", { n: hours });
    const days = Math.floor(hours / 24);
    return t("ambassador.daysAgo", { n: days });
  }

  function loadClubs() {
    return getClubs(token, locale)
      .then(setClubs)
      .catch((err) => setError(err instanceof Error ? err.message : t("login.genericError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadClubs();
  }, [token, locale]);

  async function handleApprove(clubDocumentId: string) {
    setActionError(null);
    try {
      await approveClubProposal(clubDocumentId, token);
      await loadClubs();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("login.genericError"));
    }
  }

  async function handleReject(clubDocumentId: string) {
    setActionError(null);
    try {
      await rejectClubProposal(clubDocumentId, token);
      await loadClubs();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("login.genericError"));
    }
  }

  if (loading) {
    return (
      <main className="dashboard">
        <p>{t("common.loading")}</p>
      </main>
    );
  }

  const pending = clubs
    .filter((club) => !club.isApproved)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const featured = pending[0];

  return (
    <main className="dashboard">
      {error && (
        <div className="dashboardError">
          <p>{t("ambassador.loadError")} <strong>{error}</strong></p>
        </div>
      )}
      {actionError && (
        <div className="dashboardError">
          <p>{actionError}</p>
        </div>
      )}

      <div className="sectionBlock">
        <h1>{t("ambassador.pendingApprovals")}</h1>
      </div>

      {featured ? (
        <article className="proposalCard">
          <div>
            <p className="proposalLabel">{t("ambassador.clubProposal")}</p>
            <h2>{featured.clubName}</h2>
            <div className="proposalMeta">
              <p>{t("ambassador.proposedBy", { name: featured.owner?.username ?? t("common.unknown") })}</p>
              <p>{t("ambassador.type", { type: featured.clubType })}</p>
              <p>{t("ambassador.submitted", { time: timeAgo(featured.createdAt) })}</p>
            </div>
          </div>
          <div className="proposalActions">
            <button
              type="button"
              className="approveProposalButton"
              onClick={() => handleApprove(featured.documentId)}
            >
              {t("ambassador.approve")}
            </button>
            <button
              type="button"
              className="rejectProposalButton"
              onClick={() => handleReject(featured.documentId)}
            >
              {t("ambassador.reject")}
            </button>
          </div>
        </article>
      ) : (
        !error && <p>{t("ambassador.noPending")}</p>
      )}

      <section className="sectionBlock approvalQueueSection">
        <div className="sectionTitleRow">
          <h1>{t("ambassador.approvalQueue")}</h1>
          <span className="seeAll">{t("common.seeAll")}</span>
        </div>

        {pending.length > 0 ? (
          <div className="approvalQueueTable" role="list">
            <div className="approvalQueueRow approvalQueueHeader">
              <span>{t("ambassador.colName")}</span>
              <span>{t("ambassador.colType")}</span>
              <span>{t("ambassador.colAuthor")}</span>
              <span>{t("ambassador.colSubmitted")}</span>
            </div>
            {pending.map((club) => (
              <div className="approvalQueueRow" role="listitem" key={club.id}>
                <span className="approvalQueueName">{club.clubName}</span>
                <span>{club.clubType}</span>
                <span>{club.owner?.username ?? t("common.unknown")}</span>
                <span>{timeAgo(club.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          !error && <p>{t("ambassador.emptyQueue")}</p>
        )}
      </section>
    </main>
  );
}
