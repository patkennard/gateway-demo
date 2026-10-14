"use client";

import { useEffect, useState } from "react";
import type { ServiceStatus } from "@/lib/legacy";

type Result = {
  summary: string;
  data: { services: ServiceStatus[]; checkedAt: string };
};

export default function Page() {
  // useState = a variable that, when changed via its setter, re-renders the UI.
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulateFail, setSimulateFail] = useState(false);

  // useEffect = "run this after render, and again whenever simulateFail changes".
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/summarize${simulateFail ? "?fail=1" : ""}`)
      .then(async (res) => {
        const text = await res.text();
        let body;
        try {
          body = JSON.parse(text);
        } catch {
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        }
        if (!res.ok) throw new Error([body.error, body.detail].filter(Boolean).join(": ") || `HTTP ${res.status}`);
        setResult(body);
      })
      .catch((e: Error) => {
        setResult(null);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [simulateFail]);

  return (
    <main>
      <h1>Service status</h1>

      <label>
        <input
          type="checkbox"
          checked={simulateFail}
          onChange={(e) => setSimulateFail(e.target.checked)}
        />{" "}
        Simulate legacy API failure
      </label>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {result && (
        <>
          <h2>AI summary</h2>
          <p>{result.summary}</p>

          <h2>Raw data from legacy API</h2>
          <table cellPadding={6}>
            <thead>
              <tr>
                <th align="left">Service</th>
                <th align="left">Status</th>
                <th align="right">Latency (ms)</th>
                <th align="left">Region</th>
              </tr>
            </thead>
            <tbody>
              {result.data.services.map((s) => (
                <tr key={s.service}>
                  <td>{s.service}</td>
                  <td>{s.status}</td>
                  <td align="right">{s.latencyMs}</td>
                  <td>{s.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <small>Checked at {result.data.checkedAt}</small>
        </>
      )}
    </main>
  );
}
