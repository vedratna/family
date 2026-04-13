import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { ConfirmModal } from "../ConfirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    open: true,
    title: "Delete item?",
    message: "This action cannot be undone.",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("renders nothing when open=false", () => {
    const { container } = render(<ConfirmModal {...defaultProps} open={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders title, message, and buttons when open=true", () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText("Delete item?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onCancel when Cancel clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onConfirm when Confirm clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("shows loading state when loading=true", () => {
    render(<ConfirmModal {...defaultProps} loading={true} />);
    const btn = screen.getByText("...");
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it("uses custom confirmLabel", () => {
    render(<ConfirmModal {...defaultProps} confirmLabel="Remove" />);
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });
});
