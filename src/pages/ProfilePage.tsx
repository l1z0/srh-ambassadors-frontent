import { useRef, useState } from "react";
import { AMBASSADOR_ROLE_NAME, STRAPI_URL, updateProfile, uploadImage } from "../services/strapi";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function avatarUrl(avatar?: { url: string } | null): string | null {
  if (!avatar?.url) return null;
  return avatar.url.startsWith("http") ? avatar.url : `${STRAPI_URL}${avatar.url}`;
}

type EditingField = "username" | "email" | null;

export default function ProfilePage() {
  const { user, token, logout, updateUser, ambassadorMode, setAmbassadorMode } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [nameDraft, setNameDraft] = useState(user?.username ?? "");
  const [emailDraft, setEmailDraft] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const isAmbassador = user.role?.name === AMBASSADOR_ROLE_NAME;
  const avatarSrc = avatarUrl(user.avatar);

  async function handlePickAvatar(file: File | undefined) {
    if (!file) return;
    setUploadingAvatar(true);
    setError(null);
    try {
      const avatarId = await uploadImage(file, token);
      const updated = await updateProfile(user!.id, { avatarId }, token);
      updateUser({ avatar: updated.avatar });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveField(field: "username" | "email") {
    const value = field === "username" ? nameDraft.trim() : emailDraft.trim();
    if (!value) {
      setError(t("profilePage.errorRequired"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile(user!.id, { [field]: value }, token);
      updateUser(field === "username" ? { username: updated.username } : { email: updated.email });
      setEditingField(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditingField(null);
    setNameDraft(user!.username);
    setEmailDraft(user!.email);
  }

  return (
    <main className="dashboard">
      <div className="myClubsHeader">
        <h1>{t("profilePage.title")}</h1>
      </div>

      <div className="profilePageLayout">
        <div className="profileAvatarLarge">
          {avatarSrc && <img src={avatarSrc} alt="" />}
          <button
            type="button"
            className="profileAvatarEditButton"
            aria-label={t("profilePage.changePicture")}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
          >
            <span className="profilePencilIcon" aria-hidden="true" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            hidden
            onChange={(e) => handlePickAvatar(e.target.files?.[0])}
          />
        </div>

        <div className="profileFieldsList">
          <div className="profileField">
            <span className="profileFieldLabel">{t("profilePage.name")}</span>
            {editingField === "username" ? (
              <>
                <input
                  className="profileFieldInput"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={20}
                  autoFocus
                />
                <button
                  type="button"
                  className="profileFieldSaveButton"
                  onClick={() => handleSaveField("username")}
                  disabled={saving}
                >
                  {t("common.save")}
                </button>
                <button type="button" className="profileFieldCancelButton" onClick={cancelEdit}>
                  {t("common.cancel")}
                </button>
              </>
            ) : (
              <>
                <span className="profileFieldValue">{user.username}</span>
                <button
                  type="button"
                  className="profileFieldEditButton"
                  aria-label={t("profilePage.editName")}
                  onClick={() => setEditingField("username")}
                >
                  <span className="profilePencilIcon" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <div className="profileField">
            <span className="profileFieldLabel">{t("profilePage.email")}</span>
            {editingField === "email" ? (
              <>
                <input
                  className="profileFieldInput"
                  type="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="profileFieldSaveButton"
                  onClick={() => handleSaveField("email")}
                  disabled={saving}
                >
                  {t("common.save")}
                </button>
                <button type="button" className="profileFieldCancelButton" onClick={cancelEdit}>
                  {t("common.cancel")}
                </button>
              </>
            ) : (
              <>
                <span className="profileFieldValue">{user.email}</span>
                <button
                  type="button"
                  className="profileFieldEditButton"
                  aria-label={t("profilePage.editEmail")}
                  onClick={() => setEditingField("email")}
                >
                  <span className="profilePencilIcon" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <div className="profileField">
            <span className="profileFieldLabel">{t("profilePage.role")}</span>
            <span className="profileFieldValue">{user.role?.name ?? t("common.unknown")}</span>
          </div>

          <div className="profileField">
            <span className="profileFieldLabel">{t("profileModal.language")}</span>
            <button
              type="button"
              className={`profileModalLangOption${locale === "en" ? " active" : ""}`}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
            /
            <button
              type="button"
              className={`profileModalLangOption${locale === "de" ? " active" : ""}`}
              onClick={() => setLocale("de")}
            >
              DE
            </button>
          </div>

          {isAmbassador && (
            <div className="profileField">
              <span className="profileFieldLabel">{t("profileModal.ambassadorMode")}</span>
              <button
                type="button"
                role="switch"
                aria-checked={ambassadorMode}
                className={`profileModalToggle${ambassadorMode ? " on" : ""}`}
                onClick={() => setAmbassadorMode(!ambassadorMode)}
              >
                <span className="profileModalToggleKnob" />
              </button>
            </div>
          )}

          {error && <p className="loginError">{error}</p>}

          <div className="profileActions">
            <button type="button" className="deleteProfileButton">
              {t("profilePage.deleteProfile")}
            </button>
            <button type="button" className="btnLogin" onClick={logout}>
              {t("profileModal.logout")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
