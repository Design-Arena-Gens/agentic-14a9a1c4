import { ChangeEvent } from "react";
import { Vec3 } from "@/lib/collision";

type VectorField = "x" | "y" | "z";

type Props = {
  label: string;
  value: Vec3;
  onChange: (value: Vec3) => void;
  step?: number;
};

const fields: VectorField[] = ["x", "y", "z"];

function handleNumberChange(
  event: ChangeEvent<HTMLInputElement>,
  field: VectorField,
  current: Vec3,
  onChange: (value: Vec3) => void
) {
  const nextValue = event.target.value;
  const parsed = Number(nextValue);

  if (Number.isNaN(parsed)) {
    return;
  }

  onChange({ ...current, [field]: parsed });
}

export function VectorInput({ label, value, onChange, step = 0.1 }: Props) {
  return (
    <label className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white/80 p-4 shadow-sm ring-1 ring-transparent transition focus-within:border-zinc-400 focus-within:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-500/20">
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
        {label}
      </span>
      <div className="grid grid-cols-3 gap-3">
        {fields.map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <span className="text-xs uppercase text-zinc-400 dark:text-zinc-500">
              {field}
            </span>
            <input
              type="number"
              value={value[field]}
              onChange={(event) =>
                handleNumberChange(event, field, value, onChange)
              }
              step={step}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/30"
            />
          </div>
        ))}
      </div>
    </label>
  );
}
