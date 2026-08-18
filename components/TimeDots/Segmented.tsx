"use client";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
}

export default function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
}: SegmentedProps<T>) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-black/5 p-0.5 dark:bg-white/10">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={
              "rounded-full font-medium transition-colors " +
              (size === "sm" ? "min-h-7 px-2.5 text-xs" : "min-h-8 px-3 text-sm") +
              " " +
              (active
                ? "bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                : "text-zinc-600 hover:text-zinc-900 active:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-100 dark:active:text-zinc-50")
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
