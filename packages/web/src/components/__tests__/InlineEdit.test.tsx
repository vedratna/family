import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { InlineEdit } from "../InlineEdit";

describe("InlineEdit", () => {
  it("displays value in default state", () => {
    render(<InlineEdit value="Hello" onSave={vi.fn()} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("clicking switches to input mode with focused input", () => {
    render(<InlineEdit value="Hello" onSave={vi.fn()} />);
    fireEvent.click(screen.getByText("Hello"));
    const input = screen.getByDisplayValue("Hello");
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveFocus();
  });

  it("typing and pressing Enter calls onSave with new value", () => {
    const onSave = vi.fn();
    render(<InlineEdit value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText("Hello"));
    const input = screen.getByDisplayValue("Hello");
    fireEvent.change(input, { target: { value: "World" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSave).toHaveBeenCalledWith("World");
  });

  it("pressing Escape exits without calling onSave", () => {
    const onSave = vi.fn();
    render(<InlineEdit value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText("Hello"));
    const input = screen.getByDisplayValue("Hello");
    fireEvent.change(input, { target: { value: "World" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onSave).not.toHaveBeenCalled();
    // Back to display mode
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("blur calls onSave", () => {
    const onSave = vi.fn();
    render(<InlineEdit value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText("Hello"));
    const input = screen.getByDisplayValue("Hello");
    fireEvent.change(input, { target: { value: "Updated" } });
    fireEvent.blur(input);
    expect(onSave).toHaveBeenCalledWith("Updated");
  });

  it("empty trimmed value reverts to original", () => {
    const onSave = vi.fn();
    render(<InlineEdit value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText("Hello"));
    const input = screen.getByDisplayValue("Hello");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("does not call onSave when value is unchanged", () => {
    const onSave = vi.fn();
    render(<InlineEdit value="Hello" onSave={onSave} />);
    fireEvent.click(screen.getByText("Hello"));
    const input = screen.getByDisplayValue("Hello");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not enter edit mode when disabled", () => {
    render(<InlineEdit value="Hello" onSave={vi.fn()} disabled={true} />);
    fireEvent.click(screen.getByText("Hello"));
    expect(screen.queryByDisplayValue("Hello")).toBeNull();
  });

  it("renders textarea for multiline mode", () => {
    render(<InlineEdit value="Multiline text" onSave={vi.fn()} multiline={true} />);
    fireEvent.click(screen.getByText("Multiline text"));
    const textarea = screen.getByDisplayValue("Multiline text");
    expect(textarea.tagName).toBe("TEXTAREA");
  });
});
