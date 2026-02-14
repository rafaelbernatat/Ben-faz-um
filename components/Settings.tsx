import React, { useState, useEffect } from "react";
import { AppData } from "../types";
import {
  Cloud,
  CheckCircle,
  Users,
  Info,
  AlertTriangle,
  Github,
  Send,
  Lock,
  ExternalLink,
  Moon,
  Sun,
} from "lucide-react";

interface SettingsProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

const Settings: React.FC<SettingsProps> = ({
  data,
  onUpdate,
  theme,
  onThemeChange,
}) => {
  const [firebaseUrl] = useState(
    localStorage.getItem("fb_url") ||
      "https://ben-faz-1-default-rtdb.firebaseio.com/",
  );
  const [githubToken, setGithubToken] = useState(
    localStorage.getItem("gh_token") || "",
  );
  const [githubRepo, setGithubRepo] = useState(
    localStorage.getItem("gh_repo") || "rafaelbernatat/Ben-faz-um",
  );
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<string>("");
  const [pushResult, setPushResult] = useState<{
    success?: boolean;
    msg?: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("fb_url", firebaseUrl);
  }, [firebaseUrl]);

  useEffect(() => {
    localStorage.setItem("gh_token", githubToken);
    const cleanRepo = githubRepo
      .replace("https://github.com/", "")
      .replace(".git", "")
      .trim();
    localStorage.setItem("gh_repo", cleanRepo);
  }, [githubToken, githubRepo]);

  const handleChange = (field: keyof typeof data.details, value: any) => {
    onUpdate({
      ...data,
      details: { ...data.details, [field]: value },
    });
  };

  const fetchFile = async (path: string) => {
    try {
      const resp = await fetch(path);
      if (resp.ok) return await resp.text();
      return null;
    } catch (e) {
      return null;
    }
  };

  const pushToGithub = async () => {
    const repoPath = githubRepo
      .replace("https://github.com/", "")
      .replace(".git", "")
      .trim();
    if (!githubToken || !repoPath) {
      alert("Configure o Token e o Repositório primeiro!");
      return;
    }

    setIsPushing(true);
    setPushResult(null);
    setPushStatus("Conectando ao GitHub...");

    const headers = {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    };

    try {
      // 1. Tentar pegar a branch main
      let lastCommitSha = "";
      const refResp = await fetch(
        `https://api.github.com/repos/${repoPath}/git/refs/heads/main`,
        { headers },
      );

      if (!refResp.ok) {
        // Repositório provavelmente vazio. Vamos inicializar com index.html
        setPushStatus("Repo vazio! Inicializando main...");
        const indexContent =
          (await fetchFile("./index.html")) ||
          "<html><body>Site em construção</body></html>";

        const initResp = await fetch(
          `https://api.github.com/repos/${repoPath}/contents/index.html`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              message: "🚀 Initial commit via Mobile App",
              content: btoa(unescape(encodeURIComponent(indexContent))),
              branch: "main",
            }),
          },
        );

        if (!initResp.ok) {
          const err = await initResp.json();
          throw new Error(err.message || "Erro ao inicializar repositório.");
        }

        // Esperar um pouco para o GitHub processar a criação da branch
        await new Promise((r) => setTimeout(r, 2000));

        // Tentar pegar o SHA novamente
        const retryRef = await fetch(
          `https://api.github.com/repos/${repoPath}/git/refs/heads/main`,
          { headers },
        );
        const retryData = await retryRef.json();
        lastCommitSha = retryData.object.sha;
      } else {
        const refData = await refResp.json();
        lastCommitSha = refData.object.sha;
      }

      // 2. Preparar Árvore de Arquivos Completa
      setPushStatus("Lendo arquivos do app...");
      const files = [
        "index.html",
        "index.tsx",
        "App.tsx",
        "types.ts",
        "constants.ts",
        "metadata.json",
      ];
      const components = [
        "Dashboard.tsx",
        "BudgetManager.tsx",
        "GuestList.tsx",
        "VendorList.tsx",
        "Settings.tsx",
        "BottomNav.tsx",
      ];
      const treeData = [];

      for (const file of files) {
        const content = await fetchFile(`./${file}`);
        if (content)
          treeData.push({ path: file, mode: "100644", type: "blob", content });
      }
      for (const comp of components) {
        const content = await fetchFile(`./components/${comp}`);
        if (content)
          treeData.push({
            path: `components/${comp}`,
            mode: "100644",
            type: "blob",
            content,
          });
      }

      // 3. Criar a Tree
      setPushStatus("Enviando arquivos...");
      const treeResp = await fetch(
        `https://api.github.com/repos/${repoPath}/git/trees`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ base_tree: lastCommitSha, tree: treeData }),
        },
      );
      const treeResult = await treeResp.json();

      // 4. Criar o Commit
      setPushStatus("Confirmando...");
      const commitResp = await fetch(
        `https://api.github.com/repos/${repoPath}/git/commits`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: "Update via Mobile App 📱",
            tree: treeResult.sha,
            parents: [lastCommitSha],
          }),
        },
      );
      const commitResult = await commitResp.json();

      // 5. Atualizar a Branch
      setPushStatus("Finalizando...");
      await fetch(
        `https://api.github.com/repos/${repoPath}/git/refs/heads/main`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ sha: commitResult.sha }),
        },
      );

      setPushResult({ success: true, msg: "Tudo pronto! App no GitHub." });
    } catch (e: any) {
      setPushResult({ success: false, msg: e.message || "Erro no deploy" });
    } finally {
      setIsPushing(false);
      setPushStatus("");
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          ⚙️ Cantinho dos Ajustes
        </h2>
      </div>

      {/* GitHub Sync Section */}
      <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Github className="w-24 h-24" />
        </div>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="bg-brand-500 p-2.5 rounded-xl">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Publicar no GitHub</h3>
            <p className="text-slate-400 text-xs">
              O repositório pode estar vazio
            </p>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
              Token de Acesso
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=App%20Festa%20Ben"
              target="_blank"
              className="text-[10px] text-brand-400 mt-2 inline-flex items-center gap-1 ml-1 hover:underline"
            >
              Criar novo token no GitHub <ExternalLink className="w-2 h-2" />
            </a>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
              Repositório
            </label>
            <input
              type="text"
              placeholder="usuario/nome-do-repo"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <button
            onClick={pushToGithub}
            disabled={isPushing}
            className={`w-full py-4 rounded-2xl flex flex-col items-center justify-center gap-1 text-sm font-bold transition-all shadow-lg active:scale-95 ${
              isPushing ? "bg-slate-800" : "bg-brand-600 hover:bg-brand-500"
            }`}
          >
            <div className="flex items-center gap-2">
              {isPushing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isPushing ? "Publicando..." : "Subir agora para o GitHub"}
            </div>
            {pushStatus && (
              <span className="text-[10px] font-normal text-white/50">
                {pushStatus}
              </span>
            )}
          </button>

          {pushResult && (
            <div
              className={`text-xs text-center p-3 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in-95 ${pushResult.success ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
            >
              {pushResult.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              {pushResult.msg}
            </div>
          )}
        </div>
      </div>

      {/* Info do Evento */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          {theme === "dark" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}{" "}
          Tema
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onThemeChange("light")}
            className={`p-3 rounded-2xl border text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${theme === "light" ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            <Sun className="w-4 h-4" /> Claro
          </button>
          <button
            onClick={() => onThemeChange("dark")}
            className={`p-3 rounded-2xl border text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${theme === "dark" ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            <Moon className="w-4 h-4" /> Escuro
          </button>
        </div>
      </div>

      {/* Info do Evento */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Users className="w-4 h-4" /> Dados Básicos
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase">
              Nome da Celebração
            </label>
            <input
              type="text"
              value={data.details.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase">
                Data
              </label>
              <input
                type="date"
                value={data.details.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase">
                Teto de Gastos
              </label>
              <input
                type="number"
                value={data.details.totalBudget}
                onChange={(e) =>
                  handleChange("totalBudget", parseFloat(e.target.value) || 0)
                }
                onFocus={(e) => e.target.select()}
                className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 font-bold text-brand-600 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Database Connection */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Cloud className="w-4 h-4" /> Sincronização em Nuvem
        </h3>
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-[11px] text-blue-800 leading-tight">
            Você e sua esposa estão conectados ao mesmo banco de dados.
            Alterações aparecem em ambos os aparelhos automaticamente.
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-500 font-medium truncate">
            {firebaseUrl}
          </span>
        </div>
      </div>

      <div className="text-center pt-8">
        <button
          onClick={() => {
            if (
              confirm(
                "Isso apagará apenas os dados salvos NESTE aparelho e recarregará da nuvem. Continuar?",
              )
            ) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 mx-auto hover:text-red-500 transition-colors"
        >
          <AlertTriangle className="w-3 h-3" />
          Redefinir Cache Local
        </button>
      </div>
    </div>
  );
};

export default Settings;
