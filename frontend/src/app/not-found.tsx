"use client";

import Link from "next/link";
import { ArrowLeft, Compass, Home } from "lucide-react";
import { withBasePath } from "@/lib/base-path";

export default function NotFound() {
  return (
    <main className="not-found-shell px-4 py-10 sm:px-6">
      <section className="not-found-card mx-auto max-w-3xl">
        <div className="not-found-badge">
          <Compass className="h-4 w-4" />
          Page unavailable
        </div>

        <p className="not-found-code">404</p>
        <h1 className="not-found-title">That page is outside the attendance map.</h1>
        <p className="not-found-description">
          The link may be outdated, or the page may have moved. You can head back to the
          Smart Attendance System landing page and continue from there.
        </p>

        <div className="not-found-actions">
          <Link href={withBasePath("/")} className="not-found-primary-link">
            <Home className="h-4 w-4" />
            Go to homepage
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="not-found-secondary-link"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}
