import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCSV<T>(
  data: T[],
  columns: { header: string; key: keyof T | ((row: T) => any) }[],
  filename: string
) {
  const csvHeaders = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(",");
  const csvRows = data.map(row => {
    return columns.map(col => {
      const val = typeof col.key === "function" ? col.key(row) : row[col.key];
      const strVal = val === null || val === undefined ? "" : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    }).join(",");
  });
  const csvContent = [csvHeaders, ...csvRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF<T>(
  title: string,
  data: T[],
  columns: { header: string; key: keyof T | ((row: T) => any) }[]
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const tableHeaders = columns.map(col => `<th>${col.header}</th>`).join("");
  const tableRows = data.map(row => {
    return `<tr>${columns.map(col => {
      const val = typeof col.key === "function" ? col.key(row) : row[col.key];
      return `<td>${val === null || val === undefined ? "" : String(val)}</td>`;
    }).join("")}</tr>`;
  }).join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          h1 { font-size: 20px; margin-bottom: 20px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #fafafa; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
