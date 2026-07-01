import { useState } from "react";
import {
  createLocation,
  updateLocation,
  LOCATION_TYPES,
  type StrapiLocation,
} from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

type Props = {
  location?: StrapiLocation;
  onClose: () => void;
  onSaved: () => void;
};

export default function LocationFormModal({ location, onClose, onSaved }: Props) {
  const { token } = useAuth();
  const { locale, t } = useLanguage();
  const isEditing = !!location;
  const [locationName, setLocationName] = useState(location?.locationName ?? "");
  const [capacity, setCapacity] = useState(location ? String(location.capacity) : "");
  const [locationType, setLocationType] = useState<string>(location?.locationType ?? LOCATION_TYPES[0]);
  const [locationDescription, setLocationDescription] = useState(location?.locationDescription ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const capacityNum = Number(capacity);
    if (!locationName.trim() || !capacity || Number.isNaN(capacityNum) || capacityNum <= 0) {
      setError(t("locationForm.errorRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const input = {
        locationName: locationName.trim(),
        capacity: capacityNum,
        locationType,
        locationDescription: locationDescription.trim() || undefined,
      };
      if (isEditing) {
        await updateLocation(location!.documentId, input, token);
      } else {
        await createLocation(input, token, locale);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("locationForm.errorSubmit"));
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
          <label htmlFor="locationName">{t("locationForm.name")}</label>
          <input
            id="locationName"
            type="text"
            placeholder={t("locationForm.namePlaceholder")}
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="formField">
          <label htmlFor="locationCapacity">{t("locationForm.capacity")}</label>
          <input
            id="locationCapacity"
            type="number"
            min={1}
            max={50}
            placeholder={t("locationForm.capacityPlaceholder")}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        <div className="formField">
          <label htmlFor="locationType">{t("locationForm.type")}</label>
          <select id="locationType" value={locationType} onChange={(e) => setLocationType(e.target.value)}>
            {LOCATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`locationForm.types.${type}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="formField">
          <label htmlFor="locationDescription">{t("locationForm.description")}</label>
          <textarea
            id="locationDescription"
            placeholder={t("locationForm.descriptionPlaceholder")}
            value={locationDescription}
            onChange={(e) => setLocationDescription(e.target.value)}
            maxLength={200}
            rows={3}
          />
        </div>

        {error && <p className="loginError">{error}</p>}

        <div className="modalActions">
          <button type="button" className="publishButton" onClick={handleSave} disabled={submitting}>
            {submitting
              ? t("locationForm.submitting")
              : isEditing
                ? t("locationForm.save")
                : t("locationForm.add")}
          </button>
        </div>
      </div>
    </div>
  );
}
