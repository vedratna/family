import { useEffect, useCallback } from "react";

interface LightboxProps {
  url: string | null;
  isVideo?: boolean;
  onClose: () => void;
}

export function Lightbox({ url, isVideo = false, onClose }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (url === null) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [url, handleKeyDown]);

  if (url === null) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      data-testid="lightbox-backdrop"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl font-bold hover:opacity-80 z-10"
        aria-label="Close"
      >
        X
      </button>
      {isVideo ? (
        <video
          src={url}
          controls
          autoPlay
          className="max-w-[90vw] max-h-[90vh] rounded-lg"
          data-testid="lightbox-video"
        />
      ) : (
        <img
          src={url}
          alt=""
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          data-testid="lightbox-image"
        />
      )}
    </div>
  );
}
