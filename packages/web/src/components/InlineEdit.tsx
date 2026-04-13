import { useCallback, useEffect, useRef, useState } from "react";

interface InlineEditProps {
  value: string;
  onSave: (next: string) => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function InlineEdit({
  value,
  onSave,
  multiline = false,
  placeholder,
  className = "",
  disabled = false,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (editing) {
      const el = inputRef.current;
      if (el) {
        el.focus();
        // Move cursor to end
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    }
  }, [editing]);

  // Keep draft in sync when value changes externally while not editing
  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [value, editing]);

  const commitEdit = useCallback(() => {
    if (savingRef.current) {
      return;
    }
    savingRef.current = true;

    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      // Reject empty — revert
      setDraft(value);
    } else if (trimmed !== value) {
      onSave(trimmed);
    }
    setEditing(false);
    savingRef.current = false;
  }, [draft, value, onSave]);

  const cancelEdit = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleClick = () => {
    if (disabled) {
      return;
    }
    setDraft(value);
    setEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      cancelEdit();
    }
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commitEdit();
    }
  };

  if (editing) {
    if (multiline) {
      return (
        <div>
          <textarea
            ref={(el) => {
              inputRef.current = el;
            }}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
            }}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full resize-y rounded border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)] ${className}`}
            rows={3}
          />
        </div>
      );
    }

    return (
      <input
        ref={(el) => {
          inputRef.current = el;
        }}
        type="text"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
        }}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-primary)] ${className}`}
      />
    );
  }

  if (multiline) {
    return (
      <p
        role="button"
        tabIndex={disabled ? undefined : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
          }
        }}
        className={`cursor-pointer whitespace-pre-wrap text-sm text-[var(--color-text-primary)] ${disabled ? "cursor-default" : ""} ${className}`}
      >
        {value.length > 0 ? value : (placeholder ?? "")}
      </p>
    );
  }

  return (
    <span
      role="button"
      tabIndex={disabled ? undefined : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      className={`cursor-pointer text-sm text-[var(--color-text-primary)] ${disabled ? "cursor-default" : ""} ${className}`}
    >
      {value.length > 0 ? value : (placeholder ?? "")}
    </span>
  );
}
