interface MediaThumbnailProps {
  url: string;
  isVideo?: boolean;
  onClick?: () => void;
}

export function MediaThumbnail({ url, isVideo = false, onClick }: MediaThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border-secondary)] hover:border-[var(--color-border-primary)] transition-colors flex-shrink-0"
    >
      {isVideo ? (
        <video
          src={url}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <img src={url} alt="" className="w-full h-full object-cover" />
      )}
    </button>
  );
}
