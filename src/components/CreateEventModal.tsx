import { useEffect, useState } from "react";
import {
  createEvent,
  getLocations,
  type StrapiClub,
  type StrapiLocation,
} from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

type Props = {
  ownedClubs: StrapiClub[];
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateEventModal({ ownedClubs, onClose, onCreated }: Props) {
  const { token } = useAuth();
  const { locale, t } = useLanguage();
  const [clubId, setClubId] = useState<number>(ownedClubs[0]?.id);
  const [eventName, setEventName] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [membersOnly, setMembersOnly] = useState(true);
  const [locationId, setLocationId] = useState<string>("");
  const [locations, setLocations] = useState<StrapiLocation[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocations(token, locale)
      .then(setLocations)
      .catch(() => setLocations([]));
  }, [token, locale]);

  async function handleCreate() {
    if (!clubId || !eventName.trim() || !eventDateTime || !eventDescription.trim()) {
      setError(t("createEvent.errorRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createEvent(
        {
          eventName: eventName.trim(),
          eventDate: new Date(eventDateTime).toISOString(),
          eventDescription: eventDescription.trim(),
          membersOnly,
          clubId,
          locationId: locationId ? Number(locationId) : undefined,
        },
        token,
        locale,
      );
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("createEvent.errorSubmit"));
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
          <label htmlFor="eventClub">{t("createEvent.club")}</label>
          <select id="eventClub" value={clubId} onChange={(e) => setClubId(Number(e.target.value))}>
            {ownedClubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.clubName}
              </option>
            ))}
          </select>
        </div>

        <div className="formField">
          <label htmlFor="eventName">{t("createEvent.name")}</label>
          <input
            id="eventName"
            type="text"
            placeholder={t("createEvent.namePlaceholder")}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="formField">
          <label htmlFor="eventDateTime">{t("createEvent.dateTime")}</label>
          <input
            id="eventDateTime"
            type="datetime-local"
            value={eventDateTime}
            onChange={(e) => setEventDateTime(e.target.value)}
          />
        </div>

        <div className="formField">
          <label htmlFor="eventDescription">{t("createEvent.description")}</label>
          <textarea
            id="eventDescription"
            placeholder={t("createEvent.descriptionPlaceholder")}
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            maxLength={200}
            rows={3}
          />
        </div>

        <div className="formField">
          <label htmlFor="eventLocation">{t("createEvent.location")}</label>
          <select id="eventLocation" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            <option value="">{t("createEvent.locationTba")}</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.locationName}
              </option>
            ))}
          </select>
        </div>

        <div className="formField formFieldCheckbox">
          <label htmlFor="eventMembersOnly">
            <input
              id="eventMembersOnly"
              type="checkbox"
              checked={membersOnly}
              onChange={(e) => setMembersOnly(e.target.checked)}
            />
            {t("createEvent.membersOnly")}
          </label>
        </div>

        {error && <p className="loginError">{error}</p>}

        <div className="modalActions">
          <button type="button" className="publishButton" onClick={handleCreate} disabled={submitting}>
            {submitting ? t("createEvent.submitting") : t("createEvent.create")}
          </button>
        </div>
      </div>
    </div>
  );
}
