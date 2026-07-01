import type { EventStatus } from "../types/event";
import { useLanguage } from "../context/LanguageContext";

interface StatusBadgeProps {
  status: EventStatus;
  asButton?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function StatusBadge({ status, asButton = false, onClick, disabled }: StatusBadgeProps) {
  const { t } = useLanguage();
  const className = `statusBadge status-${status}`;
  const label = t(`status.${status}`);

  if (asButton && status === "register") {
    return (
      <button className={className} onClick={onClick} disabled={disabled}>
        {label}
      </button>
    );
  }

  return <span className={className}>{label}</span>;
}
