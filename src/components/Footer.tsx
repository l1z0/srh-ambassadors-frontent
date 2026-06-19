import { GraduationCap } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="siteFooter">
      <div className="footerMain">
        <div className="footerLogo">
          <span>Club Hub</span>
          <GraduationCap size={28} strokeWidth={2.5} />
        </div>
        <nav className="footerNav">
          <a href="#">{t("footer.about")}</a>
          <a href="#">{t("footer.contact")}</a>
          <a href="#">{t("footer.terms")}</a>
        </nav>
      </div>
      <div className="footerMeta">
        <span>{t("footer.copyright")}</span>
        <span>{t("footer.designedBy")}</span>
      </div>
    </footer>
  );
}
