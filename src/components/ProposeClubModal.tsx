import { useRef, useState, type DragEvent } from "react";
import { CLUB_TYPES, createClub, uploadImage } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const MAX_IMAGE_BYTES = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function ProposeClubModal({ onClose, onCreated }: Props) {
  const { token } = useAuth();
  const { locale, t } = useLanguage();
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [clubType, setClubType] = useState<string>(CLUB_TYPES[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickImage(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(t("proposeClub.errorImageType"));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(t("proposeClub.errorImageSize"));
      return;
    }
    setError(null);
    setImageFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    pickImage(e.dataTransfer.files[0]);
  }

  async function handlePublish() {
    if (!clubName.trim() || !clubDescription.trim()) {
      setError(t("proposeClub.errorRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let clubPictureId: number | undefined;
      if (imageFile) {
        clubPictureId = await uploadImage(imageFile, token);
      }
      await createClub(
        { clubName: clubName.trim(), clubDescription: clubDescription.trim(), clubType, clubPictureId },
        token,
        locale,
      );
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("proposeClub.errorSubmit"));
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
          <label htmlFor="clubName">{t("proposeClub.name")}</label>
          <input
            id="clubName"
            type="text"
            placeholder={t("proposeClub.namePlaceholder")}
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="formField">
          <label htmlFor="clubDescription">{t("proposeClub.description")}</label>
          <textarea
            id="clubDescription"
            placeholder={t("proposeClub.descriptionPlaceholder")}
            value={clubDescription}
            onChange={(e) => setClubDescription(e.target.value)}
            maxLength={200}
            rows={4}
          />
        </div>

        <div className="formField">
          <label>{t("proposeClub.image")}</label>
          <div
            className="imageDropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              hidden
              onChange={(e) => pickImage(e.target.files?.[0])}
            />
            {imageFile ? (
              <p className="imageDropzoneFileName">{imageFile.name}</p>
            ) : (
              <>
                <p className="imageDropzoneLink">{t("proposeClub.uploadHint")}</p>
                <p className="imageDropzoneHint">{t("proposeClub.uploadFormats")}</p>
              </>
            )}
          </div>
        </div>

        <div className="formField">
          <label htmlFor="clubType">{t("proposeClub.type")}</label>
          <select id="clubType" value={clubType} onChange={(e) => setClubType(e.target.value)}>
            {CLUB_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="loginError">{error}</p>}

        <div className="modalActions">
          <button type="button" className="saveDraftButton" disabled title="Drafts aren't supported yet">
            {t("proposeClub.saveDraft")}
          </button>
          <button type="button" className="publishButton" onClick={handlePublish} disabled={submitting}>
            {submitting ? t("proposeClub.submitting") : t("proposeClub.publish")}
          </button>
        </div>
      </div>
    </div>
  );
}
