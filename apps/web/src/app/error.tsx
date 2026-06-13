"use client";

import Link from "next/link";

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1.5rem",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, margin: 0 }}>
            Oops!
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1.125rem", margin: 0 }}>
            Đã xảy ra lỗi không mong muốn.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0 }}>
              Error ID: {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.5rem",
                background: "#2563eb",
                color: "white",
                borderRadius: "0.375rem",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              Thử lại
            </button>
            <Link
              href="/"
              style={{
                padding: "0.625rem 1.5rem",
                background: "white",
                color: "#374151",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
