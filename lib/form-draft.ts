export type FormDraft = Record<string, string | string[]>;

export function readDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(`roseden-draft:${key}`);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`roseden-draft:${key}`, JSON.stringify(value));
  } catch {
    // Draft saving is a convenience; full storage must not block the form.
  }
}

export function clearDraft(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`roseden-draft:${key}`);
}

export function formDraft(form: HTMLFormElement): FormDraft {
  const draft: FormDraft = {};
  for (const [name, value] of new FormData(form).entries()) {
    if (typeof value !== "string") continue;
    const existing = draft[name];
    draft[name] = existing === undefined
      ? value
      : Array.isArray(existing) ? [...existing, value] : [existing, value];
  }
  return draft;
}

export function restoreFormDraft(form: HTMLFormElement, draft: FormDraft) {
  for (const [name, value] of Object.entries(draft)) {
    const controls = Array.from(form.elements).filter((element) =>
      element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement
    ).filter((element) => element.name === name);
    for (const control of controls) {
      const values = Array.isArray(value) ? value : [value];
      if (control instanceof HTMLInputElement && (control.type === "checkbox" || control.type === "radio")) {
        control.checked = values.includes(control.value);
      } else {
        control.value = values[0] || "";
      }
      control.dispatchEvent(new Event("input", { bubbles: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
}
