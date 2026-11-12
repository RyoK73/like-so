"use client";
import { useState, type ComponentProps, type KeyboardEvent } from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

// What went wrong while the text is turned into a number.
// `clamped` is not a failure: the number is out of the range, and `onCommit` is called with the nearest one.
type NumberInputIssue =
  | { type: "empty" }
  | { type: "not-a-number"; raw: string }
  | { type: "clamped"; raw: number; clampedTo: number; bound: "min" | "max" };

type NumberInputProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "min" | "max" | "type"
> & {
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
  onIssue?: (issue: NumberInputIssue) => void;
};

// The user edits the text (draft). Enter or blur turns it into an integer in `min` to `max`, and calls `onCommit` when it differs from `value`.
// Escape discards the draft. The draft is also replaced when `value` changes, even while editing.
const NumberInput = ({
  value,
  min,
  max,
  onCommit,
  onIssue,
  className,
  ...props
}: NumberInputProps) => {
  const [draft, setDraft] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(String(value));
  }

  const commit = () => {
    const text = draft.trim();
    if (text === "") {
      setDraft(String(value));
      onIssue?.({ type: "empty" });
      return;
    }
    const raw = Number(text);
    if (!Number.isFinite(raw)) {
      setDraft(String(value));
      onIssue?.({ type: "not-a-number", raw: text });
      return;
    }

    const rounded = Math.round(raw);
    const next = Math.min(Math.max(rounded, min), max);
    if (next !== rounded) {
      onIssue?.({
        type: "clamped",
        raw,
        clampedTo: next,
        bound: next === min ? "min" : "max",
      });
    }
    setDraft(String(next));
    if (next !== value) onCommit(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commit();
    } else if (e.key === "Escape") {
      setDraft(String(value));
    }
  };

  return (
    <InputPrimitive
      {...props}
      type="text"
      inputMode="decimal"
      data-slot="number-input"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
      className={cn(
        "brush-a h-10 w-16 min-w-0 rotate-0 bg-card px-2 text-center text-body-md transition-colors outline-none focus-visible:border-4 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
};

export { NumberInput };
export type { NumberInputIssue };
