/**
 * ============================================================================
 * File: webapp/src/App.test.tsx
 * Purpose: Smoke test ensuring the app renders without crashing.
 * ============================================================================
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";

vi.mock("@/components/CommandCenterMap", () => ({
  default: () => <div aria-label="SmartCito city command map" />,
}));

vi.mock("@/api/realtime", () => ({
  useRealtimeCommandCenter: () => ({ snapshot: null, connected: false }),
}));

describe("App", () => {
  it("opens the dashboard by default", async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: /Pretoria Command Center/i }),
    ).toBeInTheDocument();
  });
});
