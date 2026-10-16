"use client";

/* ============================================================
   نافذة تأكيد أنيقة (بدلاً من window.confirm)
   ============================================================ */
import React, { createContext, useCallback, useContext, useState } from "react";
import { cx } from "./utils";

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (message: string, options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface State {
  message: string;
  options: ConfirmOptions;
  resolve: (v: boolean) => void;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State | null>(null);

  const confirm = useCallback<ConfirmFn>((message, options = {}) => {
    return new Promise<boolean>((resolve) => {
      setState({ message, options, resolve });
    });
  }, []);

  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => close(false)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {state.options.title && (
              <h3 className="mb-2 text-base font-extrabold text-text">
                {state.options.title}
              </h3>
            )}
            <p className="text-sm leading-relaxed text-muted">{state.message}</p>
            <div className="mt-5 flex justify-start gap-2">
              <button
                type="button"
                onClick={() => close(true)}
                className={cx(
                  "rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90",
                  state.options.danger ? "bg-red-600" : "bg-primary"
                )}
              >
                {state.options.confirmLabel || "تأكيد"}
              </button>
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text transition-colors hover:bg-background"
              >
                {state.options.cancelLabel || "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
