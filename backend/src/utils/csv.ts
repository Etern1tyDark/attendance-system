const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue =
    value instanceof Date ? value.toISOString() : String(value);
  const escapedValue = stringValue.replace(/"/g, '""');

  if (/[",\n]/.test(escapedValue)) {
    return `"${escapedValue}"`;
  }

  return escapedValue;
};

export default function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  const csvRows = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
  ];

  return csvRows.join("\n");
}
