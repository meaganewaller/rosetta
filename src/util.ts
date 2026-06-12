// Small shared helpers for adapters.

/** Render a string as a single-line YAML scalar, quoting when a plain scalar would be unsafe. */
export function yamlScalar(s: string): string {
  const oneLine = s.replace(/\s+/g, " ").trim();
  if (oneLine === "" || /[:#]/.test(oneLine) || /^\s|\s$/.test(oneLine)) return JSON.stringify(oneLine);
  return oneLine;
}
