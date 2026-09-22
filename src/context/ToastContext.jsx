import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = React.useMemo(() => ({
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 md:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-5 fade-in ${
              t.type === "success"
                ? "bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/30"
                : t.type === "error"
                ? "bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/30"
                : t.type === "warning"
                ? "bg-slate-900/95 text-white border-amber-500/50 shadow-amber-950/30"
                : "bg-slate-900/95 text-white border-indigo-500/50 shadow-indigo-950/30"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
              {t.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
              {t.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />}
              {t.type === "info" && <Info className="h-5 w-5 text-sky-400 shrink-0" />}
              <span className="text-sm font-medium leading-snug break-words">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log("[Toast Success]", msg),
      error: (msg) => console.error("[Toast Error]", msg),
      info: (msg) => console.log("[Toast Info]", msg),
      warning: (msg) => console.warn("[Toast Warning]", msg),
    };
  }
  return context;
}
