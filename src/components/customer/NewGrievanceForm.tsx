"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/ui/magnetic-button";

const CATEGORIES = [
  "Product Quality",
  "Delivery",
  "Installation",
  "Warranty",
  "Billing",
  "Other",
];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const fieldClassName =
  "w-full rounded-xl border border-white/15 bg-pacific-dark px-5 py-4 text-white placeholder:text-pacific-mid/60 focus:border-white/40 focus:outline-none";
const labelClassName = "mb-2 block text-sm text-pacific-mid";

export default function NewGrievanceForm() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Product Quality");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Fixed from the previous /api/customer/grievances (plural) —
      // the real route lives at /api/customer/grievance (singular),
      // so every submission through here was silently 404-ing.
      const response = await fetch("/api/customer/grievance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, priority, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Note: image attachments aren't wired up yet — the file input
      // below is currently decorative (not read or uploaded).
      router.push("/customer/grievance");
      router.refresh();
    } catch {
      setError("Network error — please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-3xl border border-white/10 bg-white/[.02] p-10"
    >
      <div>
        <label className={labelClassName}>Subject</label>
        <input
          required
          className={fieldClassName}
          placeholder="Surface chipped after installation"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={labelClassName}>Category</label>
          <select
            className={fieldClassName}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClassName}>Priority</label>
          <select
            className={fieldClassName}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClassName}>Description</label>
        <textarea
          required
          rows={7}
          className={fieldClassName}
          placeholder="Describe your issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className={labelClassName}>
          Attach Images <span className="text-pacific-mid/60">(coming soon)</span>
        </label>
        <input type="file" multiple accept="image/*" disabled className="block opacity-50" />
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <MagneticButton type="submit" disabled={loading} variant="outline-dark" size="lg">
        {loading ? "Submitting..." : "Submit Grievance"}
      </MagneticButton>
    </form>
  );
}
