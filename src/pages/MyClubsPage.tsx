import { useEffect, useState } from "react";
import {
  approveMember,
  getClubs,
  rejectMember,
  STRAPI_URL,
  type StrapiClub,
} from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import ProposeClubModal from "../components/ProposeClubModal";

type FilterTab = "member" | "pending";

type Props = {
  onDiscoverClubs?: () => void;
  onViewClub?: (club: StrapiClub) => void;
};

function clubImageUrl(club: StrapiClub): string | null {
  const url = club.clubPicture?.url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

export default function MyClubsPage({ onDiscoverClubs, onViewClub }: Props) {
  const { token, user } = useAuth();
  const { locale, t } = useLanguage();
  const [clubs, setClubs] = useState<StrapiClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<FilterTab>("member");
  const [actionError, setActionError] = useState<string | null>(null);
  const [showManage, setShowManage] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showEditClubs, setShowEditClubs] = useState(false);

  function loadClubs() {
    return getClubs(token, locale)
      .then(setClubs)
      .catch((err) => setError(err instanceof Error ? err.message : t("login.genericError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadClubs();
  }, [token, locale]);

  function isOwner(club: StrapiClub) {
    return !!user && club.owner?.id === user.id;
  }

  function isMember(club: StrapiClub) {
    return !!user && club.members?.some((m) => m.id === user.id);
  }

  function isPending(club: StrapiClub) {
    return !!user && club.pendingMembers?.some((m) => m.id === user.id);
  }

  const myClubs = clubs.filter((club) => isOwner(club) || isMember(club));
  const pendingClubs = clubs.filter((club) => isPending(club));
  const visibleClubs = tab === "member" ? myClubs : pendingClubs;

  async function handleApprove(clubDocumentId: string, userId: number) {
    setActionError(null);
    try {
      await approveMember(clubDocumentId, userId, token);
      await loadClubs();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("login.genericError"));
    }
  }

  async function handleReject(clubDocumentId: string, userId: number) {
    setActionError(null);
    try {
      await rejectMember(clubDocumentId, userId, token);
      await loadClubs();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t("login.genericError"));
    }
  }

  return (
    <main className="dashboard">
      <div className="myClubsHeader">
        <h1>{t("myClubsPage.title")}</h1>
        <button type="button" className="manageLink" onClick={() => setShowManage(true)}>
          {t("myClubsPage.manage")}
        </button>
      </div>

      {showManage && (
        <div className="modalOverlay" onClick={() => setShowManage(false)}>
          <div className="managePopover" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modalBackLink" onClick={() => setShowManage(false)}>
              {t("common.back")}
            </button>
            <button
              type="button"
              className="managePopoverLink"
              onClick={() => {
                setShowManage(false);
                setShowEditClubs(true);
              }}
            >
              {t("myClubsPage.manageEdit")}
            </button>
            <button
              type="button"
              className="managePopoverLink"
              onClick={() => {
                setShowManage(false);
                setShowProposeModal(true);
              }}
            >
              {t("myClubsPage.managePropose")}
            </button>
            <button
              type="button"
              className="managePopoverLink"
              onClick={() => {
                setShowManage(false);
                onDiscoverClubs?.();
              }}
            >
              {t("myClubsPage.manageFind")}
            </button>
          </div>
        </div>
      )}

      {showProposeModal && (
        <ProposeClubModal onClose={() => setShowProposeModal(false)} onCreated={loadClubs} />
      )}

      {showEditClubs && (
        <div className="modalOverlay" onClick={() => setShowEditClubs(false)}>
          <div className="editClubsModal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="editClubsClose"
              aria-label={t("common.cancel")}
              onClick={() => setShowEditClubs(false)}
            >
              ×
            </button>
            {myClubs.length === 0 ? (
              <p className="editClubsEmpty">{t("myClubsPage.empty")}</p>
            ) : (
              <ul className="editClubsList">
                {myClubs.map((club) => (
                  <li className="editClubsRow" key={club.id}>
                    <span className="editClubsName">{club.clubName}</span>
                    <button
                      type="button"
                      className="editClubsDeleteButton"
                      aria-label={t("myClubsPage.leaveClub")}
                      onClick={() => {
                        /* placeholder — leave/delete club not yet implemented */
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6" />
                        <path d="M10,11v6M14,11v6" />
                        <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="clubFilterTabs">
        <button
          type="button"
          className={`filterTab${tab === "member" ? " active" : ""}`}
          onClick={() => setTab("member")}
        >
          {t("myClubsPage.tabMember")}
        </button>
        <button
          type="button"
          className={`filterTab${tab === "pending" ? " active" : ""}`}
          onClick={() => setTab("pending")}
        >
          {t("myClubsPage.tabPending")}
        </button>
      </div>

      {error && (
        <div className="dashboardError">
          <p>{t("myClubsPage.loadError")} <strong>{error}</strong></p>
        </div>
      )}
      {actionError && (
        <div className="dashboardError">
          <p>{actionError}</p>
        </div>
      )}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : !error && visibleClubs.length === 0 ? (
        <p>{t("myClubsPage.empty")}</p>
      ) : (
        <div className="myClubsList">
          {visibleClubs.map((club) => {
            const imageUrl = clubImageUrl(club);
            const owner = isOwner(club);
            const pending = club.pendingMembers ?? [];
            return (
              <article className="myClubCard" key={club.id}>
                {imageUrl ? (
                  <img className="myClubImage" src={imageUrl} alt="" />
                ) : (
                  <div className="myClubImagePlaceholder" aria-hidden="true" />
                )}

                <div className="myClubInfo">
                  <h2>{club.clubName}</h2>
                  <p>{t("myClubsPage.members", { n: club.members?.length ?? 0 })}</p>
                  <p>{t("myClubsPage.upcomingEvents", { n: club.events?.length ?? 0 })}</p>

                  {owner && tab === "member" && pending.length > 0 && (
                    <div className="pendingApprovals">
                      <p className="pendingApprovalsTitle">{t("myClubsPage.pendingRequests")}</p>
                      {pending.map((requester) => (
                        <div className="pendingApprovalRow" key={requester.id}>
                          <span>{requester.username}</span>
                          <div className="pendingApprovalButtons">
                            <button
                              type="button"
                              className="approveButton"
                              onClick={() => handleApprove(club.documentId, requester.id)}
                            >
                              {t("myClubsPage.approve")}
                            </button>
                            <button
                              type="button"
                              className="rejectButton"
                              onClick={() => handleReject(club.documentId, requester.id)}
                            >
                              {t("myClubsPage.reject")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="myClubActions">
                  {owner && !club.isApproved && (
                    <span className="myClubPendingBadge">{t("myClubsPage.pendingApprovalBadge")}</span>
                  )}
                  {owner && club.isApproved && (
                    <span className="myClubOwnerBadge">{t("myClubsPage.ownerBadge")}</span>
                  )}
                  <button
                    type="button"
                    className="viewDetailButton desktopOnly"
                    onClick={() => onViewClub?.(club)}
                  >
                    {t("myClubsPage.viewDetail")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
