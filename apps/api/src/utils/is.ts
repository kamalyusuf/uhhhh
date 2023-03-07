export const isobject = (x: unknown) => {
  if (
    typeof x !== "object" ||
    Array.isArray(x) ||
    x instanceof Date ||
    x === null
  )
    return false;

  return true;
};

export const isfunction = (x: unknown): x is Function =>
  typeof x === "function";

export const isisodate = (date: string) =>
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(date);
