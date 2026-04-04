// src/components/DemoControls.tsx
// REPLACE ENTIRE FILE

import { useState } from "react";
import { useData } from "../context/DataContext";

export function DemoControls() {
  const { triggerAlert, resetDemo } = useData();
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    setStatus("Simulating...");
    await triggerAlert();
    setStatus("Alert triggered! Check dashboard.");
    setLoading(false);
    setTimeout(() => setStatus(""), 4000);
  };

  const handleReset = async () => {
    setLoading(true);
    setStatus("Resetting...");
    await resetDemo();
    setStatus("Reset complete!");
    setLoading(false);
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <div style={{
      position:     "fixed",
      bottom:       "24px",
      right:        "24px",
      background:   "#111827",
      border:       "1px solid #374151",
      borderRadius: "12px",
      padding:      "16px",
      zIndex:       9999,
      minWidth:     "220px",
      boxShadow:    "0 4px 24px rgba(0,0,0,0.5)"
    }}>
      <p style={{
        color:          "#6B7280",
        fontSize:       "10px",
        textTransform:  "uppercase",
        letterSpacing:  "1px",
        marginBottom:   "10px",
        fontWeight:     "600"
      }}>
        🎮 Demo Controls
      </p>

      <button
        onClick={handleTrigger}
        disabled={loading}
        style={{
          display:       "block",
          width:         "100%",
          background:    loading ? "#7f1d1d" : "#EF4444",
          color:         "white",
          padding:       "9px 0",
          borderRadius:  "8px",
          border:        "none",
          cursor:        loading ? "wait" : "pointer",
          marginBottom:  "8px",
          fontWeight:    "bold",
          fontSize:      "13px",
          transition:    "background 0.2s"
        }}>
        🚨 Simulate Competitor Alert
      </button>

      <button
        onClick={handleReset}
        disabled={loading}
        style={{
          display:      "block",
          width:        "100%",
          background:   loading ? "#064e3b" : "#10B981",
          color:        "white",
          padding:      "9px 0",
          borderRadius: "8px",
          border:       "none",
          cursor:       loading ? "wait" : "pointer",
          fontWeight:   "bold",
          fontSize:     "13px",
          transition:   "background 0.2s"
        }}>
        ✅ Reset Demo
      </button>

      {status && (
        <p style={{
          color:      "#F9FAFB",
          fontSize:   "11px",
          marginTop:  "10px",
          lineHeight: "1.5",
          textAlign:  "center"
        }}>
          {status}
        </p>
      )}
    </div>
  );
}