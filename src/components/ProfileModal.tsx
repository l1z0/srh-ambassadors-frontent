import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

type Props = {
  onClose: () => void;
};

export default function ProfileModal({ onClose }: Props) {
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="profileModal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="profileModalClose" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="profileModalHeader">
          <span className="profileModalAvatar">{user?.username?.[0]?.toUpperCase() ?? "?"}</span>
          <div className="profileModalIdentity">
            <p className="profileModalName">{user?.username}</p>
            <div className="profileModalStatus">
              <span className="profileModalDot" />
              <span>{t("profileModal.online")}</span>
            </div>
          </div>
        </div>

        <div className="profileModalMenu">
          <div className="profileModalRow">
            <span>
              {t("profileModal.language")}{" "}
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
            </span>
          </div>
          <div className="profileModalRow">
            <span>{t("profileModal.profile")}</span>
          </div>
          <button type="button" className="profileModalRow profileModalLogout" onClick={logout}>
            {t("profileModal.logout")}
          </button>
        </div>
      </div>
    </div>
  );
}
