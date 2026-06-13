"use client";

import { KeyboardEvent, useState } from "react";
import { Check, Plus, X } from "lucide-react";

export const standardSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "One size"] as const;
export const commonColors = [
  "Black", "White", "Burgundy", "Red", "Blue", "Green", "Pink", "Cream",
  "Gold", "Brown", "Grey", "Purple", "Orange", "Yellow", "Multi-color",
] as const;
export const commonOccasions = [
  "Party", "Birthday", "Wedding", "Date night", "Work", "Church",
  "Casual outing", "Graduation", "Everyday wear", "Holiday",
] as const;

type Props = {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
  customPlaceholder: string;
};

export function ProductOptionsPicker({ label, options, selected, onChange, customPlaceholder }: Props) {
  const [customValue, setCustomValue] = useState("");

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  function addCustom() {
    const value = customValue.trim();
    if (!value) return;
    if (!selected.some((item) => item.toLowerCase() === value.toLowerCase())) onChange([...selected, value]);
    setCustomValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addCustom();
  }

  const standardSet = new Set(options);
  const customSelections = selected.filter((value) => !standardSet.has(value));

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-wine">{label}</legend>
      <p className="mt-0.5 text-xs text-black/45">Tap every option that is available.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button key={option} type="button" aria-pressed={active} onClick={() => toggle(option)}
              className={`flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition ${active ? "border-gold bg-gold text-burgundy" : "border-black/10 bg-white text-black/65"}`}>
              {active ? <Check size={15} /> : null}{option}
            </button>
          );
        })}
      </div>
      {customSelections.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">
        {customSelections.map((option) => <button key={option} type="button" onClick={() => toggle(option)}
          className="flex min-h-10 items-center gap-1.5 rounded-xl bg-burgundy px-3 text-sm font-semibold text-white" aria-label={`Remove ${option}`}>
          {option}<X size={14} />
        </button>)}
      </div> : null}
      <div className="mt-3 flex gap-2">
        <input value={customValue} onChange={(event) => setCustomValue(event.target.value)} onKeyDown={handleKeyDown}
          placeholder={customPlaceholder} className="h-12 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-gold" />
        <button type="button" onClick={addCustom} className="flex h-12 items-center gap-1 rounded-xl bg-burgundy px-4 text-sm font-semibold text-white"><Plus size={16} />Add</button>
      </div>
    </fieldset>
  );
}
