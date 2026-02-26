import React, { useState, useEffect, useRef } from "react";
import { FirebaseError } from "firebase/app";
import { AppData, RSVPStatus, TaskStatus, ViewState } from "./types";
import { DEFAULT_DATA, STORAGE_KEY } from "./constants";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import Dashboard from "./components/Dashboard";
import BudgetManager from "./components/BudgetManager";
import GuestList from "./components/GuestList";
import VendorList from "./components/VendorList";
import Settings from "./components/Settings";
import BottomNav from "./components/BottomNav";
import { auth, getDatabaseRestUrl, googleProvider } from "./firebase";

const THEME_STORAGE_KEY = "theme_mode";
const REQUIRED_FIREBASE_ENV_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_DATABASE_URL",
] as const;
const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS || "")
  .split(",")
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);
type ThemeMode = "light" | "dark";

const normalizeAppData = (raw: unknown): AppData => {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_DATA;
  }

  const parsed = raw as Partial<AppData>;

  const categories = Array.isArray(parsed.categories)
    ? parsed.categories.map((category: any) => ({
        id: String(category?.id || crypto.randomUUID()),
        name: String(category?.name || "Categoria"),
        tasks: Array.isArray(category?.tasks)
          ? category.tasks.map((task: any) => ({
              id: String(task?.id || crypto.randomUUID()),
              description: String(task?.description || ""),
              budgeted: Number(task?.budgeted) || 0,
              spent: Number(task?.spent) || 0,
              notes: typeof task?.notes === "string" ? task.notes : undefined,
              status: Object.values(TaskStatus).includes(task?.status)
                ? task.status
                : TaskStatus.TODO,
              completed: Boolean(task?.completed),
            }))
          : [],
      }))
    : [];

  const guests = Array.isArray(parsed.guests)
    ? parsed.guests.map((guest: any) => ({
        id: String(guest?.id || crypto.randomUUID()),
        name: String(guest?.name || ""),
        adults: Math.max(0, Number(guest?.adults) || 0),
        kids: Math.max(0, Number(guest?.kids) || 0),
        status: Object.values(RSVPStatus).includes(guest?.status)
          ? guest.status
          : RSVPStatus.PENDING,
        contact: typeof guest?.contact === "string" ? guest.contact : undefined,
      }))
    : [];

  const vendorServices = Array.isArray(parsed.vendorServices)
    ? parsed.vendorServices.map((service: any) => ({
        id: String(service?.id || crypto.randomUUID()),
        name: String(service?.name || ""),
        selectedOptionId:
          typeof service?.selectedOptionId === "string"
            ? service.selectedOptionId
            : undefined,
        options: Array.isArray(service?.options)
          ? service.options.map((option: any) => ({
              id: String(option?.id || crypto.randomUUID()),
              name: String(option?.name || ""),
              contact: String(option?.contact || ""),
              notes:
                typeof option?.notes === "string" ? option.notes : undefined,
              quote: Math.max(0, Number(option?.quote) || 0),
              rating: Math.max(0, Math.min(5, Number(option?.rating) || 0)),
            }))
          : [],
      }))
    : [];

  return {
    details: {
      title: String(parsed.details?.title || DEFAULT_DATA.details.title),
      date: String(parsed.details?.date || DEFAULT_DATA.details.date),
      theme: String(parsed.details?.theme || DEFAULT_DATA.details.theme),
      totalBudget: Math.max(
        0,
        Number(parsed.details?.totalBudget) || DEFAULT_DATA.details.totalBudget,
      ),
    },
    categories,
    guests,
    vendorServices,
  };
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "fetching">(
    "idle",
  );
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem(
      THEME_STORAGE_KEY,
    ) as ThemeMode | null;
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const isInitialMount = useRef(true);

  console.log(
    "🎯 App component renderizado. authLoading:",
    authLoading,
    "authUser:",
    authUser,
  );

  useEffect(() => {
    console.log("🔐 Iniciando monitoramento de autenticação...");
    let mounted = true;
    let safetyTimeout: NodeJS.Timeout;

    // Timer de segurança: se authLoading não resolver em 10s, força false
    const setSafetyTimeout = () => {
      safetyTimeout = setTimeout(() => {
        if (mounted && authLoading) {
          console.warn("⏰ AuthLoading timeout - forçando false");
          setAuthLoading(false);
        }
      }, 10000);
    };

    setSafetyTimeout();

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log(
        "👤 onAuthStateChanged acionado, user:",
        user?.email || "sem email",
      );
      if (!mounted) {
        console.log("⚠️ Componente desmontado, ignorando update");
        return;
      }

      clearTimeout(safetyTimeout);

      try {
        if (user && ALLOWED_EMAILS.length > 0) {
          const email = user.email?.toLowerCase() || "";
          console.log("🔍 Verificando email:", email, "contra whitelist");
          if (!ALLOWED_EMAILS.includes(email)) {
            console.warn("❌ Email não autorizado:", email);
            await signOut(auth);
            if (mounted) {
              setAuthUser(null);
              setAuthError(
                "Este e-mail não tem permissão para acessar este app.",
              );
              setAuthLoading(false);
            }
            return;
          }
        }

        console.log("✅ Usuário autenticado:", user?.email);
        if (mounted) {
          setAuthUser(user);
          setAuthLoading(false);
        }
      } catch (error) {
        console.error("❌ Erro no onAuthStateChanged:", error);
        if (mounted) {
          setAuthLoading(false);
        }
      }
    });

    return () => {
      console.log("🧹 Limpando monitoramento de autenticação");
      mounted = false;
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  // Inicialização
  useEffect(() => {
    if (authLoading || !authUser) return;

    let mounted = true;

    const init = async () => {
      try {
        let hasLocalData = false;

        // 1. Tentar ler do Cache Local primeiro para ser instantâneo
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const localData = JSON.parse(saved);
            if (mounted) {
              setData(normalizeAppData(localData));
              hasLocalData = true;
              setLoading(false);
            }
          } catch (e) {
            console.error("Erro no cache", e);
          }
        }

        // Se não tem dados locais, carrega dados padrão imediatamente
        if (!hasLocalData && mounted) {
          setData(DEFAULT_DATA);
          setLoading(false);
        }

        // 2. Buscar da Nuvem em Background com timeout
        if (mounted) {
          setSyncStatus("fetching");
        }

        try {
          // Timeout de 5 segundos para busca da nuvem
          const token = await Promise.race([
            authUser.getIdToken(),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error("Token timeout")), 3000),
            ),
          ]);

          const url = getDatabaseRestUrl(token);
          const res = await Promise.race([
            fetch(url),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error("Fetch timeout")), 5000),
            ),
          ]);

          if (res.ok && mounted) {
            const cloudData = await res.json();
            if (cloudData) {
              const normalizedCloudData = normalizeAppData(cloudData);
              setData(normalizedCloudData);
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(normalizedCloudData),
              );
            }
          }
        } catch (e) {
          console.warn("Offline ou Erro Firebase:", e);
          // Falha silenciosa - já tem dados locais ou padrão
        }

        if (mounted) {
          setSyncStatus("idle");
          isInitialMount.current = false;
        }
      } catch (error) {
        console.error("Erro na inicialização:", error);
        if (mounted) {
          setLoading(false);
          setSyncStatus("idle");
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [authLoading, authUser]);

  // Sincronização Automática (Debounce de 2s)
  useEffect(() => {
    if (authLoading || !authUser || isInitialMount.current || loading) return;

    const timer = setTimeout(async () => {
      setSyncStatus("saving");
      try {
        const token = await authUser.getIdToken();
        await fetch(getDatabaseRestUrl(token), {
          method: "PUT",
          body: JSON.stringify(data),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Erro ao salvar remoto");
      } finally {
        setSyncStatus("idle");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [data, authLoading, authUser, loading]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute(
        "content",
        theme === "dark" ? "#0f172a" : "#0ea5e9",
      );
    }
  }, [theme]);

  const updateData = (newData: AppData) => setData(normalizeAppData(newData));

  const handleGoogleSignIn = async () => {
    setAuthError("");

    const missingEnv = REQUIRED_FIREBASE_ENV_VARS.filter(
      (key) => !import.meta.env[key],
    );
    if (missingEnv.length > 0) {
      setAuthError(
        "Configuração do Firebase ausente. Defina as variáveis VITE_FIREBASE_* e faça novo deploy.",
      );
      return;
    }

    try {
      // Timeout de 10s para o popup
      const loginPromise = signInWithPopup(auth, googleProvider);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 10000),
      );

      await Promise.race([loginPromise, timeoutPromise]);
      // onAuthStateChanged cuidará do resto
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/unauthorized-domain") {
          setAuthError(
            "Domínio não autorizado. Adicione em Firebase Console > Authentication > Authorized domains.",
          );
        } else if (error.code === "auth/invalid-api-key") {
          setAuthError("API Key inválida. Revise as variáveis de ambiente.");
        } else if (error.code === "auth/operation-not-allowed") {
          setAuthError("Google Auth desativado no Firebase Console.");
        } else if (error.code === "auth/popup-blocked") {
          setAuthError("Popup bloqueado. Permita popups no seu navegador.");
        } else if (error.code === "auth/network-request-failed") {
          setAuthError("Falha de rede. Verifique sua conexão.");
        } else if (error.code === "auth/popup-closed-by-user") {
          setAuthError("Login cancelado.");
        } else {
          setAuthError(`Erro de autenticação: ${error.message}`);
        }
      } else if (error instanceof Error && error.message === "Timeout") {
        setAuthError("Login demorou muito. Tente novamente.");
      } else {
        setAuthError("Erro ao fazer login. Tente novamente.");
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setCurrentView("dashboard");
    setData(DEFAULT_DATA);
  };

  const balloons = [
    { left: "6%", delay: "-9s", duration: "17s", color: "#f472b6", size: 36 },
    { left: "18%", delay: "-4s", duration: "19s", color: "#38bdf8", size: 32 },
    { left: "32%", delay: "-13s", duration: "21s", color: "#f59e0b", size: 34 },
    { left: "48%", delay: "-7s", duration: "18s", color: "#a78bfa", size: 38 },
    { left: "64%", delay: "-11s", duration: "20s", color: "#22c55e", size: 33 },
    { left: "78%", delay: "-15s", duration: "22s", color: "#fb7185", size: 35 },
    { left: "92%", delay: "-6s", duration: "19s", color: "#06b6d4", size: 31 },
  ];

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">
            Validando acesso...
          </p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-5">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-xl">
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
            Entrar no Planejador
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">
            Use sua conta Google para acessar seus dados com segurança.
          </p>
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
          >
            Entrar com Google
          </button>
          {authError && (
            <p className="text-xs text-red-500 mt-3 text-center">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 dark:text-slate-300 text-sm font-medium">
            Sincronizando...
          </p>
        </div>
      </div>
    );

  return (
    <div className="app-glass relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {balloons.map((balloon, index) => (
          <div
            key={`balloon-${index}`}
            className="party-balloon"
            style={{
              left: balloon.left,
              width: `${balloon.size}px`,
              height: `${balloon.size + 6}px`,
              backgroundColor: balloon.color,
              animationDelay: balloon.delay,
              animationDuration: balloon.duration,
            }}
          >
            <span className="party-balloon-knot" />
            <span className="party-balloon-string" />
          </div>
        ))}

        <div className="absolute -top-24 -left-20 w-64 h-64 rounded-full bg-pink-200/30 blur-3xl dark:bg-pink-700/20" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-700/20" />
        <div className="absolute bottom-10 left-1/4 w-60 h-60 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-700/20" />
      </div>

      {/* Indicador de Sync Discreto */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none">
        {syncStatus === "saving" && (
          <div className="h-full bg-brand-500 animate-pulse w-full"></div>
        )}
        {syncStatus === "fetching" && (
          <div className="h-full bg-green-500 w-1/3 animate-[loading_1.5s_infinite]"></div>
        )}
      </div>

      <main className="relative z-10 max-w-md mx-auto min-h-screen px-4 pt-6 pb-28">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {currentView === "dashboard" && <Dashboard data={data} />}
          {currentView === "budget" && (
            <BudgetManager data={data} onUpdate={updateData} />
          )}
          {currentView === "guests" && (
            <GuestList data={data} onUpdate={updateData} />
          )}
          {currentView === "vendors" && (
            <VendorList data={data} onUpdate={updateData} />
          )}
          {currentView === "settings" && (
            <Settings
              data={data}
              onUpdate={updateData}
              theme={theme}
              onThemeChange={setTheme}
              userEmail={authUser.email || ""}
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </main>

      <BottomNav currentView={currentView} setView={setCurrentView} />

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }

        @keyframes balloon-rise {
          0% { transform: translateY(35vh) translateX(0); opacity: 0; }
          8% { opacity: 0.9; }
          50% { transform: translateY(-8vh) translateX(-10px); }
          100% { transform: translateY(-72vh) translateX(12px); opacity: 0; }
        }

        .party-balloon {
          position: absolute;
          bottom: -70px;
          border-radius: 999px;
          box-shadow:
            inset -4px -8px 0 rgba(255,255,255,.26),
            0 8px 20px rgba(15, 23, 42, .22);
          opacity: .9;
          animation-name: balloon-rise;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          filter: saturate(1.12);
        }

        .party-balloon-knot {
          position: absolute;
          bottom: -5px;
          left: 50%;
          width: 8px;
          height: 8px;
          background: inherit;
          transform: translateX(-50%) rotate(45deg);
          border-radius: 2px;
        }

        .party-balloon-string {
          position: absolute;
          top: calc(100% + 2px);
          left: 50%;
          width: 1.5px;
          height: 54px;
          background: rgba(148, 163, 184, .65);
          transform: translateX(-50%);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
};

export default App;
