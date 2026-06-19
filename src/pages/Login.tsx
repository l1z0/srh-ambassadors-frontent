import { useState, type FormEvent } from "react";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

type Mode = "login" | "register";

export default function Login({ onBack }: { onBack?: () => void }) {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(username, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginLogo">
          <span>Club Hub</span>
          <GraduationCap size={38} strokeWidth={2.5} />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {mode === "register" && (
            <div className="loginField">
              <label htmlFor="username">{t("login.username")}</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          )}

          <div className="loginField">
            <label htmlFor="email">{t("login.email")}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="loginField">
            <label htmlFor="password">{t("login.password")}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
          </div>

          {error && <p className="loginError">{error}</p>}

          <div className="loginActions">
            <button
              type="button"
              className="btnRegister"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
            >
              {mode === "register" ? t("login.backToLogin") : t("login.register")}
            </button>
            <button type="submit" className="btnLogin" disabled={loading}>
              {loading ? t("login.pleaseWait") : mode === "register" ? t("login.createAccount") : t("login.login")}
            </button>
          </div>
        </form>

        {onBack && (
          <button type="button" className="loginBackLink" onClick={onBack}>
            {t("login.backToHome")}
          </button>
        )}
      </div>
    </div>
  );
}
