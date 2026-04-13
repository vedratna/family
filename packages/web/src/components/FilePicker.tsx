import { useRef, useState } from "react";

const DEFAULT_ACCEPT = "image/*,video/*";
const DEFAULT_MAX_FILES = 4;
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface FilePickerProps {
  onSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxBytesPerFile?: number;
  disabled?: boolean;
}

export function FilePicker({
  onSelect,
  accept = DEFAULT_ACCEPT,
  multiple = true,
  maxFiles = DEFAULT_MAX_FILES,
  maxBytesPerFile = DEFAULT_MAX_BYTES,
  disabled = false,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValidationError(null);
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);

    if (files.length > maxFiles) {
      setValidationError(`Maximum ${String(maxFiles)} files allowed.`);
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const oversized = files.find((f) => f.size > maxBytesPerFile);
    if (oversized) {
      const maxMB = Math.round(maxBytesPerFile / (1024 * 1024));
      setValidationError(`File "${oversized.name}" exceeds ${String(maxMB)} MB limit.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    onSelect(files);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        data-testid="file-input"
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--color-border-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-primary)] transition-colors disabled:opacity-50"
      >
        Attach Media
      </button>
      {validationError !== null && <p className="mt-1 text-xs text-red-600">{validationError}</p>}
    </div>
  );
}
