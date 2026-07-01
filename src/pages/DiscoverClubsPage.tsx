import { useEffect, useRef, useState } from "react";
import { getClubs, joinClub, STRAPI_URL, type StrapiClub } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function clubImageUrl(club: StrapiClub): string | null {
  const url = club.clubPicture?.url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

type SortOrder = "asc" | "desc" | null;

type Props = {
  onViewClub?: (club: StrapiClub) => void;
};

export default function DiscoverClubsPage({ onViewClub }: Props) {
  const { token, user } = useAuth();
  const { locale, t } = useLanguage();
  const [clubs, setClubs] = useState<StrapiClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const filterPanelRef = useRef<HTMLDivElement>(null);

  function loadClubs() {
    return getClubs(token, locale)
      .then(setClubs)
      .catch((err) => setError(err instanceof Error ? err.message : t("login.genericError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadClubs();
  }, [token, locale]);

  function isDiscoverable(club: StrapiClub) {
    if (!club.isApproved) return false;
    if (!user) return true;
    const isOwner = club.owner?.id === user.id;
    const isMember = club.members?.some((m) => m.id === user.id);
    const isPending = club.pendingMembers?.some((m) => m.id === user.id);
    return !isOwner && !isMember && !isPending;
  }

  const allTypes = Array.from(
    new Set(clubs.filter(isDiscoverable).map((c) => c.clubType).filter(Boolean)),
  ).sort();

  const query = search.trim().toLowerCase();
  let visibleClubs = clubs
    .filter(isDiscoverable)
    .filter((club) => club.clubName.toLowerCase().includes(query))
    .filter((club) => !typeFilter || club.clubType === typeFilter);

  if (sortOrder === "asc") {
    visibleClubs = [...visibleClubs].sort(
      (a, b) => (a.members?.length ?? 0) - (b.members?.length ?? 0),
    );
  } else if (sortOrder === "desc") {
    visibleClubs = [...visibleClubs].sort(
      (a, b) => (b.members?.length ?? 0) - (a.members?.length ?? 0),
    );
  }

  const hasActiveFilter = sortOrder !== null || typeFilter !== "";

  async function handleJoin(club: StrapiClub) {
    setJoinError(null);
    setJoiningId(club.id);
    try {
      await joinClub(club.documentId, token);
      await loadClubs();
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setJoiningId(null);
    }
  }

  function clearFilter() {
    setSortOrder(null);
    setTypeFilter("");
  }

  return (
    <main className="dashboard">
      <div className="myClubsHeader">
        <h1>{t("discoverClubs.title")}</h1>
      </div>

      <div className="discoverToolbar">
        <div className="discoverSearchWrap">
          <span className="discoverSearchIcon" aria-hidden="true" />
          <input
            type="search"
            className="discoverSearchInput"
            placeholder={t("discoverClubs.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className={`discoverFilterButton${hasActiveFilter ? " active" : ""}`}
          aria-label={t("discoverClubs.filter")}
          onClick={() => setShowFilter(true)}
        >
          <span className="discoverFilterIcon" />
        </button>
      </div>

      {error && (
        <div className="dashboardError">
          <p>
            {t("myClubsPage.loadError")} <strong>{error}</strong>
          </p>
        </div>
      )}
      {joinError && (
        <div className="dashboardError">
          <p>{joinError}</p>
        </div>
      )}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : !error && visibleClubs.length === 0 ? (
        <p>{t("discoverClubs.empty")}</p>
      ) : (
        <div className="myClubsList">
          {visibleClubs.map((club) => {
            const imageUrl = clubImageUrl(club);
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
                  <p>{club.clubType}</p>
                </div>

                <div className="myClubActions">
                  <button
                    type="button"
                    className="viewDetailButton desktopOnly"
                    onClick={() => onViewClub?.(club)}
                  >
                    {t("myClubsPage.viewDetail")}
                  </button>
                  <button
                    type="button"
                    className="joinButton"
                    disabled={joiningId === club.id}
                    onClick={() => handleJoin(club)}
                  >
                    {joiningId === club.id
                      ? t("discoverClubs.requesting")
                      : t("discoverClubs.requestToJoin")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showFilter && (
        <div
          className="modalOverlay"
          onClick={(e) => {
            if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
              setShowFilter(false);
            }
          }}
        >
          <div className="discoverFilterPanel" ref={filterPanelRef}>
            <button
              type="button"
              className="discoverFilterClose"
              aria-label={t("common.cancel")}
              onClick={() => setShowFilter(false)}
            >
              ×
            </button>

            <div className="discoverFilterSection">
              <button
                type="button"
                className={`discoverFilterOption${sortOrder === "asc" ? " active" : ""}`}
                onClick={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
              >
                {t("discoverClubs.membersAsc")}
              </button>
              <button
                type="button"
                className={`discoverFilterOption${sortOrder === "desc" ? " active" : ""}`}
                onClick={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
              >
                {t("discoverClubs.membersDesc")}
              </button>
            </div>

            <div className="discoverFilterSection">
              <p className="discoverFilterSectionLabel">{t("discoverClubs.clubType")}</p>
              <select
                className="discoverTypeSelect"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">{t("discoverClubs.clubTypePlaceholder")}</option>
                {allTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilter && (
              <button type="button" className="discoverFilterClear" onClick={clearFilter}>
                {t("discoverClubs.clearFilter")}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
