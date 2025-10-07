import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Auburn Hills Taskboard"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {process.env.NEXT_PUBLIC_APP_NAME || "Auburn Hills Taskboard"}
            </h1>
            <a
              className="rounded bg-accent px-4 py-2 text-white hover:opacity-90"
              href="/api/calendar/auth"
            >
              Link Google Calendar
            </a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
