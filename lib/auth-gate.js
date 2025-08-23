// lib/auth-gate.js
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "@/styles/Home.module.css";

/** Config */
const LS = {
  loggedIn: "lexisly:auth:loggedIn",
  premium: "lexisly:auth:premium",
};

const AuthCtx = createContext({
  isLoggedIn: false,
  isPremium: false,
  // compat: păstrăm usageCount în shape, dar nu-l mai folosim
  usageCount: 0,
  openAuthModal: (_reason = "signin") => {},
  // compat: acum nu mai gate-uim nimic
  shouldAllowAction: (_opts = { consume: false, reason: "limit" }) => true,
  setLoggedIn: (_v) => {},
  setPremium: (_v) => {},
});

export function AuthProvider({ children }) {
  const [isHydrated, setHydrated] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [isPremium, setPremium] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("signin"); // 'signin' | 'register'
  // suportăm 'limit' pentru compatibilitate, dar fără mesaje despre limită
  const [modalReason, setModalReason] = useState("signin"); // 'signin' | 'upgrade' | 'limit'

  // hydrate from localStorage
  useEffect(() => {
    try {
      const li = localStorage.getItem(LS.loggedIn) === "1";
      const pr = localStorage.getItem(LS.premium) === "1";
      setLoggedIn(li);
      setPremium(pr);
    } catch {}
    setHydrated(true);
  }, []);

  const persistAuth = useCallback((li, pr) => {
    try {
      localStorage.setItem(LS.loggedIn, li ? "1" : "0");
      localStorage.setItem(LS.premium, pr ? "1" : "0");
    } catch {}
  }, []);

  /** Public API */
  const openAuthModal = useCallback((reason = "signin", tab) => {
    // reason: 'signin' | 'upgrade' | 'limit' (compat)
    if (tab) setModalTab(tab);
    else setModalTab(reason === "upgrade" ? "register" : "signin");
    setModalReason(reason);
    setModalOpen(true);
  }, []);

  /**
   * Gate pentru acțiuni de tip "role-play/correct":
   * Acum nu mai există limită → întotdeauna OK.
   */
  const shouldAllowAction = useCallback((_opts = {}) => true, []);

  // Modal actions (mock auth)
  const handleSignIn = useCallback(
    (e) => {
      e?.preventDefault?.();
      setLoggedIn(true);
      persistAuth(true, isPremium);
      setModalOpen(false);
    },
    [isPremium, persistAuth]
  );

  const handleRegister = useCallback(
    (e) => {
      e?.preventDefault?.();
      setLoggedIn(true);
      persistAuth(true, isPremium);
      setModalOpen(false);
    },
    [isPremium, persistAuth]
  );

  const handleUpgrade = useCallback(() => {
    setPremium(true);
    persistAuth(isLoggedIn, true);
    setModalOpen(false);
  }, [isLoggedIn, persistAuth]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isPremium,
      usageCount: 0, // compat
      openAuthModal,
      shouldAllowAction,
      setLoggedIn: (v) => {
        setLoggedIn(Boolean(v));
        persistAuth(Boolean(v), isPremium);
      },
      setPremium: (v) => {
        setPremium(Boolean(v));
        persistAuth(isLoggedIn, Boolean(v));
      },
    }),
    [isLoggedIn, isPremium, openAuthModal, shouldAllowAction, persistAuth]
  );

  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setModalOpen(false);
    }
    if (modalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  return (
    <AuthCtx.Provider value={value}>
      {children}

      {/* Modal */}
      {isHydrated && modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sign in or register"
          className={styles.backdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className={styles.modal}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong>
                {modalReason === "upgrade" && "Go Premium to unlock everything"}
                {modalReason === "signin" && "Welcome back"}
                {modalReason === "limit" && "Create a free account"}
              </strong>
              <button
                onClick={() => setModalOpen(false)}
                className={styles.closeBtn}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.tabs}>
              <button
                onClick={() => setModalTab("signin")}
                className={`${styles.tab} ${
                  modalTab === "signin" ? styles.tabActive : ""
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setModalTab("register")}
                className={`${styles.tab} ${
                  modalTab === "register" ? styles.tabActive : ""
                }`}
              >
                Create account
              </button>
            </div>

            {modalTab === "signin" ? (
              <form onSubmit={handleSignIn} className={styles.form}>
                <input className={styles.input} type="email" placeholder="Email" required />
                <input className={styles.input} type="password" placeholder="Password" required />
                <button className={styles.primaryBtn} type="submit">
                  Sign in
                </button>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => setModalTab("register")}
                >
                  I’m new here
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className={styles.form}>
                <input className={styles.input} type="text" placeholder="Name" required />
                <input className={styles.input} type="email" placeholder="Email" required />
                <input className={styles.input} type="password" placeholder="Password" required />
                <button className={styles.primaryBtn} type="submit">
                  Create account
                </button>
              </form>
            )}

            {!isPremium && (
              <>
                <div className={styles.note} />
                <button className={styles.upgradeBtn} onClick={handleUpgrade}>
                  Upgrade to Premium
                </button>
                <div className={styles.tinyNote}>
                  Unlimited AI role-plays, voice feedback, advanced analytics.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AuthCtx.Provider>
  );
}

export function useAuthGate() {
  return useContext(AuthCtx);
}
