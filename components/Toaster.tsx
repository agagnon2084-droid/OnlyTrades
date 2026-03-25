"use client";
import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-raw)",
          borderLeft: "2px solid var(--accent-acid)",
          borderRadius: "0",
          fontSize: "12px",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.05em",
        },
        success: {
          iconTheme: { primary: "var(--accent-acid)", secondary: "var(--bg-void)" },
        },
        error: {
          iconTheme: { primary: "var(--accent-burn)", secondary: "var(--bg-void)" },
          style: {
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-raw)",
            borderLeft: "2px solid var(--accent-burn)",
            borderRadius: "0",
            fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
          },
        },
      }}
    />
  );
}
