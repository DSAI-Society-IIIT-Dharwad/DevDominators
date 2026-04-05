// src/components/DemoControls.tsx

import { useState } from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";

export function DemoControls() {

  const { triggerAlert, resetDemo } = useData();
  const navigate = useNavigate();

  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {

    setLoading(true);
    setStatus("Simulating competitor price drop...");

    await triggerAlert();

    setStatus("Redirecting to Alerts page 🔔");

    setLoading(false);

    setTimeout(() => {
      navigate("/alerts");
    }, 1200);
  };

  const handleReset = async () => {

    setLoading(true);
    setStatus("Resetting demo data...");

    await resetDemo();

    setStatus("Demo reset complete ✅");
    setLoading(false);

    setTimeout(() => setStatus(""), 3000);

  };

  return (

    <div 
      style={{
        position: "fixed",

        /* CHANGED HERE */
        bottom: "100px",     // distance from bottom
        left: "0%",        // center horizontally
        transform: "none",

        background: "#0b1220",
        border: "1px solid #1f2937",
        borderRadius: "14px",
        padding: "18px",
        zIndex: 9999,
        minWidth: "220px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        textAlign: "center"
      }}
    >

      <p
        style={{
          color: "#9CA3AF",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "12px",
          fontWeight: "600"
        }}
      >
        🎮 DEMO CONTROLS
      </p>

      <button
        onClick={handleTrigger}
        disabled={loading}
        style={{
          display: "block",
          width: "100%",
          background: loading ? "#7f1d1d" : "#ef4444",
          color: "white",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          cursor: loading ? "wait" : "pointer",
          marginBottom: "10px",
          fontWeight: "bold",
          fontSize: "13px"
        }}
      >
        🚨 Simulate Competitor Alert
      </button>

      <button
        onClick={handleReset}
        disabled={loading}
        style={{
          display: "block",
          width: "100%",
          background: loading ? "#064e3b" : "#10b981",
          color: "white",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          cursor: loading ? "wait" : "pointer",
          fontWeight: "bold",
          fontSize: "13px"
        }}
      >
        ✅ Reset Demo
      </button>

      {status && (
        <p
          style={{
            color: "#e5e7eb",
            fontSize: "12px",
            marginTop: "12px",
            lineHeight: "1.4"
          }}
        >
          {status}
        </p>
      )}

    </div>

  );
}