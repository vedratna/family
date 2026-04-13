import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, it, expect, vi } from "vitest";

import { ErrorBoundary } from "../ErrorBoundary";

function ThrowingChild({ message }: { message: string }): React.ReactNode {
  throw new Error(message);
}

function GoodChild() {
  return <p>All good</p>;
}

describe("ErrorBoundary", () => {
  it("renders fallback UI when a child throws", () => {
    // Suppress console.error from React and componentDidCatch
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <ThrowingChild message="Test explosion" />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test explosion")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();

    spy.mockRestore();
  });

  it("renders children normally when no error", () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("All good")).toBeInTheDocument();
  });
});
