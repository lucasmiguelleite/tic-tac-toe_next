import { ImageResponse } from "next/og";
import { siteConfig } from "@/site.config";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// "X" / "O" / empty pattern that reads as a tic-tac-toe board at a glance.
const marks = ["X", "O", "X", "", "O", "", "X", "O", ""];

export default function Icon() {
  const line = siteConfig.themeColor.light;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: siteConfig.themeColor.dark,
          // Keep content inside the maskable safe zone (~10% padding).
          padding: 96,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: `8px solid ${line}`,
            borderRadius: 24,
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
                      width: 96,
                      height: 96,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRight:
                        col < 2 ? `4px solid ${line}` : "4px solid transparent",
                      borderBottom:
                        row < 2 ? `4px solid ${line}` : "4px solid transparent",
                      fontSize: 64,
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
      </div>
    ),
    { ...size }
  );
}
