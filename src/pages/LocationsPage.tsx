import { useEffect, useRef, useState } from "react";
import { getLocations, LOCATION_TYPES, type StrapiLocation } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LocationFormModal from "../components/LocationFormModal";

type SortOrder = "asc" | "desc" | null;

export default function LocationsPage() {
  const { token } = useAuth();
  const { locale, t } = useLanguage();
  const [locations, setLocations] = useState<StrapiLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StrapiLocation | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const filterPanelRef = useRef<HTMLDivElement>(null);

  function loadLocations() {
    return getLocations(token, locale)
      .then(setLocations)
      .catch((err) => setError(err instanceof Error ? err.message : t("login.genericError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLocations();
  }, [token, locale]);

  const query = search.trim().toLowerCase();
  let visibleLocations = locations
    .filter((loc) => loc.locationName.toLowerCase().includes(query))
    .filter((loc) => !typeFilter || loc.locationType === typeFilter);

  if (sortOrder === "asc") {
    visibleLocations = [...visibleLocations].sort((a, b) => (a.capacity ?? 0) - (b.capacity ?? 0));
  } else if (sortOrder === "desc") {
    visibleLocations = [...visibleLocations].sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0));
  }

  const hasActiveFilter = sortOrder !== null || typeFilter !== "";

  return (
    <main className="dashboard">
      <div className="myClubsHeader">
        <h1>{t("locationsPage.title")}</h1>
        <button type="button" className="manageLink" onClick={() => setShowAddModal(true)}>
          {t("locationsPage.add")}
        </button>
      </div>

      <div className="discoverToolbar">
        <div className="discoverSearchWrap">
          <span className="discoverSearchIcon" aria-hidden="true" />
          <input
            type="search"
            className="discoverSearchInput"
            placeholder={t("locationsPage.searchPlaceholder")}
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

      {(showAddModal || editingLocation) && (
        <LocationFormModal
          location={editingLocation ?? undefined}
          onClose={() => {
            setShowAddModal(false);
            setEditingLocation(null);
          }}
          onSaved={loadLocations}
        />
      )}

      {error && (
        <div className="dashboardError">
          <p>{t("locationsPage.loadError")} <strong>{error}</strong></p>
        </div>
      )}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : !error && visibleLocations.length === 0 ? (
        <p>{t("locationsPage.empty")}</p>
      ) : (
        <div className="myClubsList">
          {visibleLocations.map((location) => (
            <article className="myClubCard" key={location.id}>
              <div className="myClubInfo">
                <h2>{location.locationName}</h2>
                <p>{t("locationsPage.capacity", { n: location.capacity })}</p>
                <p>{t(`locationForm.types.${location.locationType}`)}</p>
              </div>

              <div className="myClubActions">
                <button type="button" className="viewDetailButton" onClick={() => setEditingLocation(location)}>
                  {t("locationsPage.edit")}
                </button>
                <button type="button" className="joinButton">
                  {t("myClubsPage.viewDetail")}
                </button>
              </div>
            </article>
          ))}
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
                {t("locationsPage.capacityAsc")}
              </button>
              <button
                type="button"
                className={`discoverFilterOption${sortOrder === "desc" ? " active" : ""}`}
                onClick={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
              >
                {t("locationsPage.capacityDesc")}
              </button>
            </div>

            <div className="discoverFilterSection">
              <p className="discoverFilterSectionLabel">{t("locationsPage.filterLocationType")}</p>
              <select
                className="discoverTypeSelect"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">{t("locationsPage.locationTypePlaceholder")}</option>
                {LOCATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`locationForm.types.${type}`)}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                className="discoverFilterClear"
                onClick={() => { setSortOrder(null); setTypeFilter(""); }}
              >
                {t("discoverClubs.clearFilter")}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
