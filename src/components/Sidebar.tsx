import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import ProfileModal from "./ProfileModal";

type IconName =
  | "home"
  | "backpack"
  | "balloons"
  | "megaphone"
  | "bell"
  | "settings"
  | "angle-double-small-right";

function SidebarIcon({ name, size = 28 }: { name: IconName; size?: number }) {
  const url = `/icons/fi-rr-${name}.svg`;
  return (
    <span
      className="sidebarIcon"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
      }}
    />
  );
}

export type SidebarView = "home" | "clubs" | "events";

type SidebarProps = {
  expanded: boolean;
  onToggle: () => void;
  activeView?: SidebarView;
  onHomeClick?: () => void;
  onClubsClick?: () => void;
  onEventsClick?: () => void;
};

export function Sidebar({
  expanded,
  onToggle,
  activeView = "home",
  onHomeClick,
  onClubsClick,
  onEventsClick,
}: SidebarProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <aside className={`sidebar${expanded ? " expanded" : ""}`} aria-label="Primary navigation">
      <button
        className="collapseButton"
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        onClick={onToggle}
      >
        <SidebarIcon name="angle-double-small-right" size={24} />
      </button>

      <nav className="mainNav">
        <a
          className={`navItem${activeView === "home" ? " active" : ""}`}
          href="#"
          aria-label={t("nav.home")}
          onClick={(e) => {
            e.preventDefault();
            onHomeClick?.();
          }}
        >
          <SidebarIcon name="home" />
          <span className="navLabel">{t("nav.home")}</span>
        </a>
        <a
          className={`navItem${activeView === "clubs" ? " active" : ""}`}
          href="#"
          aria-label={t("nav.clubs")}
          onClick={(e) => {
            e.preventDefault();
            onClubsClick?.();
          }}
        >
          <SidebarIcon name="backpack" />
          <span className="navLabel">{t("nav.clubs")}</span>
        </a>
        <a
          className={`navItem${activeView === "events" ? " active" : ""}`}
          href="#"
          aria-label={t("nav.events")}
          onClick={(e) => {
            e.preventDefault();
            onEventsClick?.();
          }}
        >
          <SidebarIcon name="balloons" />
          <span className="navLabel">{t("nav.events")}</span>
        </a>
        <a className="navItem" href="#" aria-label={t("nav.news")}>
          <SidebarIcon name="megaphone" />
          <span className="navLabel">{t("nav.news")}</span>
        </a>
      </nav>

      <nav className="bottomNav">
        <a className="navItem" href="#" aria-label={t("nav.notifications")}>
          <SidebarIcon name="bell" />
          <span className="navLabel">{t("nav.notifications")}</span>
        </a>
        <a className="navItem" href="#" aria-label={t("nav.settings")}>
          <SidebarIcon name="settings" />
          <span className="navLabel">{t("nav.settings")}</span>
        </a>
        <a
          className="navItem profileItem"
          href="#"
          aria-label={t("nav.profile")}
          onClick={(e) => {
            e.preventDefault();
            setShowProfileModal(true);
          }}
        >
          <span className="profileAvatar" />
          {user && <span className="navLabel">{user.username}</span>}
        </a>
      </nav>

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </aside>
  );
}
