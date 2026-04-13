import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { LoadMoreButton } from "../LoadMoreButton";

describe("LoadMoreButton", () => {
  it("renders with 'Load More' text by default", () => {
    render(<LoadMoreButton onClick={() => undefined} />);
    expect(screen.getByRole("button", { name: "Load More" })).toBeInTheDocument();
  });

  it("renders 'Loading...' when loading", () => {
    render(<LoadMoreButton onClick={() => undefined} loading />);
    expect(screen.getByRole("button", { name: "Loading..." })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<LoadMoreButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders nothing when visible=false", () => {
    const { container } = render(<LoadMoreButton onClick={() => undefined} visible={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("does not call onClick when disabled/loading", () => {
    const onClick = vi.fn();
    render(<LoadMoreButton onClick={onClick} loading />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
