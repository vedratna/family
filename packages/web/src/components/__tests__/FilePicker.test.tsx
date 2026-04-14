import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { FilePicker } from "../FilePicker";

describe("FilePicker", () => {
  it("renders the Attach Media button", () => {
    render(<FilePicker onSelect={vi.fn()} />);
    expect(screen.getByText("Attach Media")).toBeTruthy();
  });

  it("calls onSelect with valid files", () => {
    const onSelect = vi.fn();
    render(<FilePicker onSelect={onSelect} />);
    const input = screen.getByTestId("file-input");

    const file = new File(["hello"], "photo.jpg", { type: "image/jpeg" });
    Object.defineProperty(input, "files", { value: [file] });
    fireEvent.change(input);

    expect(onSelect).toHaveBeenCalledWith([file]);
  });

  it("shows error when too many files are selected", () => {
    const onSelect = vi.fn();
    render(<FilePicker onSelect={onSelect} maxFiles={1} />);
    const input = screen.getByTestId("file-input");

    const files = [
      new File(["a"], "photo1.jpg", { type: "image/jpeg" }),
      new File(["b"], "photo2.jpg", { type: "image/jpeg" }),
    ];
    Object.defineProperty(input, "files", { value: files });
    fireEvent.change(input);

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText("Maximum 1 files allowed.")).toBeTruthy();
  });

  it("shows error when file exceeds max size", () => {
    const onSelect = vi.fn();
    const maxBytes = 100;
    render(<FilePicker onSelect={onSelect} maxBytesPerFile={maxBytes} />);
    const input = screen.getByTestId("file-input");

    const bigFile = new File(["x".repeat(200)], "large.jpg", { type: "image/jpeg" });
    Object.defineProperty(input, "files", { value: [bigFile] });
    fireEvent.change(input);

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText(/exceeds/)).toBeTruthy();
  });

  it("disables button when disabled prop is true", () => {
    render(<FilePicker onSelect={vi.fn()} disabled />);
    const button = screen.getByText("Attach Media");
    expect(button).toHaveProperty("disabled", true);
  });

  it("clicking Attach Media triggers file input", () => {
    render(<FilePicker onSelect={vi.fn()} />);
    const button = screen.getByText("Attach Media");
    const input = screen.getByTestId("file-input");
    const clickSpy = vi.spyOn(input, "click");
    fireEvent.click(button);
    expect(clickSpy).toHaveBeenCalled();
  });

  it("accepts multiple files within limit", () => {
    const onSelect = vi.fn();
    render(<FilePicker onSelect={onSelect} maxFiles={3} />);
    const input = screen.getByTestId("file-input");

    const files = [
      new File(["a"], "photo1.jpg", { type: "image/jpeg" }),
      new File(["b"], "photo2.jpg", { type: "image/jpeg" }),
      new File(["c"], "photo3.jpg", { type: "image/jpeg" }),
    ];
    Object.defineProperty(input, "files", { value: files });
    fireEvent.change(input);

    expect(onSelect).toHaveBeenCalledWith(files);
  });
});
