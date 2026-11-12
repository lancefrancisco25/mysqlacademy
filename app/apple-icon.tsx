import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#090a0f",
          borderRadius: "40px",
          border: "4px solid rgba(16, 185, 129, 0.4)",
          boxShadow: "0 0 40px rgba(16, 185, 129, 0.25)",
        }}
      >
        <svg
          width="108"
          height="108"
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
    ),
    {
      ...size,
    }
  );
}
