import { ImageResponse } from "next/og";
import { siteConfig } from "@/site.config";

export const alt = "Tic-Tac-Toe — Free online & multiplayer game";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const marks = ["X", "O", "X", "", "O", "", "X", "O", ""];
const tags = ["3 AI difficulties", "Online matchmaking", "4 board styles"];

export default function OpenGraphImage() {
  const line = siteConfig.themeColor.light;
  const sub = "#9ca3af";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          background: siteConfig.themeColor.dark,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: `6px solid ${line}`,
              borderRadius: 16,
            }}
          >
            {[0, 1, 2].map((row) => (
              <div key={row} style={{ display: "flex" }}>
                {[0, 1, 2].map((col) => {
                  const mark = marks[row * 3 + col];
                  return (
                    <div
                      key={col}
                      style={{
                        width: 64,
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight:
                          col < 2
                            ? `3px solid ${line}`
                            : "3px solid transparent",
                        borderBottom:
                          row < 2
                            ? `3px solid ${line}`
                            : "3px solid transparent",
                        fontSize: 44,
                        fontWeight: 700,
                        color:
                          mark === "X"
                            ? siteConfig.accent.yellow
                            : siteConfig.accent.cyan,
                      }}
                    >
                      {mark}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: line,
                lineHeight: 1,
              }}
            >
              Tic-Tac-Toe
            </div>
            <div style={{ fontSize: 38, color: sub, marginTop: 24 }}>
              Play free: AI · Local 2P · Online
            </div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 56, gap: 24 }}>
          {tags.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: 26,
                color: siteConfig.accent.cyan,
                border: `2px solid ${siteConfig.accent.cyan}`,
                borderRadius: 999,
                padding: "8px 22px",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
