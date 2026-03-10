"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0e1117",
          color: "#e8eaf0",
          fontFamily:
            '"Open Sauce One",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
          padding: "24px",
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: "560px",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            background: "#131720",
            padding: "24px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6b7585",
            }}
          >
            Unexpected error
          </p>
          <h1
            style={{
              margin: "12px 0 0",
              fontSize: "32px",
              lineHeight: 1,
            }}
          >
            Something broke while rendering this page.
          </h1>
          <p
            style={{
              margin: "16px 0 0",
              fontSize: "15px",
              lineHeight: 1.6,
              color: "#c4c8d0",
            }}
          >
            Try rendering the route again. If the error keeps happening, reload the page.
          </p>
          {error.digest ? (
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "12px",
                color: "#6b7585",
              }}
            >
              Digest: {error.digest}
            </p>
          ) : null}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                border: 0,
                borderRadius: "999px",
                background: "#4f8ef7",
                color: "#fff",
                padding: "12px 18px",
                font: "inherit",
                fontWeight: 700,
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "#e8eaf0",
                padding: "12px 18px",
                font: "inherit",
                fontWeight: 700,
              }}
            >
              Reload page
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
