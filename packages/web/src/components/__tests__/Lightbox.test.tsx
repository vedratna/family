import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { Lightbox } from "../Lightbox";

describe("Lightbox", () => {
  it("renders nothing when url is null", () => {
    const { container } = render(<Lightbox url={null} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders image when url is provided", () => {
    render(<Lightbox url="https://example.com/photo.jpg" onClose={vi.fn()} />);
    const img = screen.getByTestId("lightbox-image");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toBe("https://example.com/photo.jpg");
  });

  it("renders video when isVideo is true", () => {
    render(<Lightbox url="https://example.com/video.mp4" isVideo onClose={vi.fn()} />);
    const video = screen.getByTestId("lightbox-video");
    expect(video).toBeTruthy();
    expect(video.getAttribute("src")).toBe("https://example.com/video.mp4");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<Lightbox url="https://example.com/photo.jpg" onClose={onClose} />);
    const closeBtn = screen.getByLabelText("Close");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<Lightbox url="https://example.com/photo.jpg" onClose={onClose} />);
    const backdrop = screen.getByTestId("lightbox-backdrop");
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(<Lightbox url="https://example.com/photo.jpg" onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
