import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "MySQL Academy – Learn MySQL by Writing Real Queries in Browser";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px 64px",
          backgroundColor: "#090a0f",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.18) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.14) 0%, transparent 40%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#0d1b15",
                border: "2px solid rgba(16, 185, 129, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <ellipse cx="12" cy="5" rx="9" ry="3.2" fill="rgba(16, 185, 129, 0.25)" />
                <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                <path d="M3 12A9 3 0 0 0 21 12" />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", color: "#ffffff" }}>
                MySQL
              </span>
              <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", color: "#10b981" }}>
                Academy
              </span>
            </div>
          </div>

          {/* Platform Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              color: "#34d399",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            <span>Pure In-Browser WebAssembly Terminal</span>
          </div>
        </div>

        {/* Middle Main Content */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "44px",
            width: "100%",
            marginTop: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Left Column: Heading & Value Prop */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1.15, maxWidth: "580px" }}>
            <h1
              style={{
                fontSize: "52px",
                lineHeight: 1.1,
                fontWeight: 900,
                letterSpacing: "-1.5px",
                margin: 0,
                marginBottom: "18px",
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Master MySQL by</span>
              <span style={{ color: "#10b981" }}>Writing Real Queries.</span>
            </h1>

            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.45,
                color: "#94a3b8",
                margin: 0,
                marginBottom: "26px",
              }}
            >
              Interactive in-browser database curriculum with instant automated grading, 6 specialized tracks, and live cohort leaderboard.
            </p>

            {/* Badges row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                <span>16 Modules Across 6 Tracks</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                <span>Automated Query Grading</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                <span>Live Student Leaderboard</span>
              </div>
            </div>
          </div>

          {/* Right Column: Code & Terminal Preview Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 0.95,
              backgroundColor: "#0d1117",
              borderRadius: "16px",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              overflow: "hidden",
            }}
          >
            {/* Terminal Window Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "#161b22",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981" }} />
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                mysql&gt; interactive-terminal
              </span>
            </div>

            {/* SQL Code Body */}
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              <div style={{ color: "#64748b", display: "flex" }}>-- Westfield Academy Database Exam</div>
              <div style={{ display: "flex" }}>
                <span style={{ color: "#f43f5e" }}>SELECT </span>
                <span style={{ color: "#e2e8f0" }}>student_name, score, rank</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ color: "#f43f5e" }}>FROM </span>
                <span style={{ color: "#38bdf8" }}>active_cohort</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ color: "#f43f5e" }}>ORDER BY </span>
                <span style={{ color: "#e2e8f0" }}>score </span>
                <span style={{ color: "#f43f5e" }}>DESC </span>
                <span style={{ color: "#f43f5e" }}>LIMIT </span>
                <span style={{ color: "#a855f7" }}>3</span>
                <span style={{ color: "#e2e8f0" }}>;</span>
              </div>

              {/* Output Table Preview */}
              <div
                style={{
                  marginTop: "8px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  fontSize: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "#34d399", fontWeight: 700 }}>
                  <span>#1 Alice Johnson</span>
                  <span>1,450 pts</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#cbd5e1" }}>
                  <span>#2 Bob Smith</span>
                  <span>1,220 pts</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
                  <span>#3 Carol Williams</span>
                  <span>1,140 pts</span>
                </div>
              </div>

              {/* Status */}
              <div style={{ color: "#10b981", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>3 rows returned in 1.4ms (WASM) • Objective Passed!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <span>https://mysqlacademy.org</span>
          <span>Zero Configuration • Instant Execution • Production Blueprints</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
