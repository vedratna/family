import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { Toggle } from "../Toggle";

describe("Toggle", () => {
  it("renders with aria-checked=true when checked", () => {
    render(<Toggle checked={true} onChange={() => undefined} label="Notifications" />);
    const btn = screen.getByRole("switch");
    expect(btn).toHaveAttribute("aria-checked", "true");
  });

  it("renders with aria-checked=false when unchecked", () => {
    render(<Toggle checked={false} onChange={() => undefined} label="Notifications" />);
    const btn = screen.getByRole("switch");
    expect(btn).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with negated value when clicked", () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} label="Notifications" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when toggling off", () => {
    const onChange = vi.fn();
    render(<Toggle checked={true} onChange={onChange} label="Notifications" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} disabled label="Notifications" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses label as accessible name", () => {
    render(<Toggle checked={false} onChange={() => undefined} label="Events & Reminders" />);
    expect(screen.getByRole("switch", { name: "Events & Reminders" })).toBeInTheDocument();
  });
});
