import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { AMBASSADOR_ROLE_NAME, STRAPI_URL } from "../services/strapi";

function avatarUrl(avatar?: { url: string } | null): string | undefined {
  if (!avatar?.url) return undefined;
  return avatar.url.startsWith("http") ? avatar.url : `${STRAPI_URL}${avatar.url}`;
}

type IconName =
  | "home"
  | "backpack"
  | "balloons"
  | "megaphone"
  | "marker"
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

export type SidebarView = "home" | "clubs" | "events" | "news" | "locations" | "profile";

type SidebarProps = {
  expanded: boolean;
  onToggle: () => void;
  activeView?: SidebarView;
  onHomeClick?: () => void;
  onClubsClick?: () => void;
  onEventsClick?: () => void;
  onNewsClick?: () => void;
  onLocationsClick?: () => void;
  onProfileClick?: () => void;
};

export function Sidebar({
  expanded,
  onToggle,
  activeView = "home",
  onHomeClick,
  onClubsClick,
  onEventsClick,
  onNewsClick,
  onLocationsClick,
  onProfileClick,
}: SidebarProps) {
  const { user, ambassadorMode } = useAuth();
  const { t } = useLanguage();
  const isAmbassador = user?.role?.name === AMBASSADOR_ROLE_NAME;
  const showLocations = isAmbassador && ambassadorMode;
  const avatarSrc = avatarUrl(user?.avatar);

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
          className={`navItem navHome${activeView === "home" ? " active" : ""}`}
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
          className={`navItem navClubs${activeView === "clubs" ? " active" : ""}`}
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
          className={`navItem navEvents${activeView === "events" ? " active" : ""}`}
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
        <a
          className={`navItem navNews${activeView === "news" ? " active" : ""}`}
          href="#"
          aria-label={t("nav.news")}
          onClick={(e) => {
            e.preventDefault();
            onNewsClick?.();
          }}
        >
          <SidebarIcon name="megaphone" />
          <span className="navLabel">{t("nav.news")}</span>
        </a>
        {showLocations && (
          <a
            className={`navItem navLocations${activeView === "locations" ? " active" : ""}`}
            href="#"
            aria-label={t("nav.locations")}
            onClick={(e) => {
              e.preventDefault();
              onLocationsClick?.();
            }}
          >
            <SidebarIcon name="marker" />
            <span className="navLabel">{t("nav.locations")}</span>
          </a>
        )}
      </nav>

      <nav className="bottomNav">
        <a
          className={`navItem profileItem${activeView === "profile" ? " active" : ""}`}
          href="#"
          aria-label={t("nav.profile")}
          onClick={(e) => {
            e.preventDefault();
            onProfileClick?.();
          }}
        >
          <span
            className="profileAvatar"
            style={avatarSrc ? { backgroundImage: `url(${avatarSrc})`, backgroundSize: "cover" } : undefined}
          />
          {user && <span className="navLabel">{user.username}</span>}
        </a>
      </nav>
    </aside>
  );
}
