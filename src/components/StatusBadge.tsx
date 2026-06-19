import type { EventStatus } from "../types/event";
import { useLanguage } from "../context/LanguageContext";

interface StatusBadgeProps {
  status: EventStatus;
  asButton?: boolean;
}

export function StatusBadge({ status, asButton = false }: StatusBadgeProps) {
  const { t } = useLanguage();
  const className = `statusBadge status-${status}`;
  const label = t(`status.${status}`);

  if (asButton && status === "register") {
    return <button className={className}>{label}</button>;
  }

  return <span className={className}>{label}</span>;
}
