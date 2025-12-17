import * as XLSX from "xlsx";

export const exportToExcel = (data, filename = "export", columns = null) => {
  try {
    let exportData = data;

    if (columns && Array.isArray(columns) && columns.length > 0) {
      exportData = data.map((row) => {
        const mappedRow = {};
        columns.forEach((col) => {
          const key = col.dataIndex || col.key;
          if (key) {
            const value = row[key];

            if (key.includes(".")) {
              const keys = key.split(".");
              mappedRow[col.title || key] = keys.reduce((obj, k) => obj?.[k], row) || "";
            } else {
              mappedRow[col.title || key] = value || "";
            }
          }
        });
        return mappedRow;
      });
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};

export const exportToCSV = (data, filename = "export", columns = null) => {
  try {
    if (!data || data.length === 0) {
      throw new Error("Không có dữ liệu để xuất");
    }

    let exportData = data;

    if (columns && Array.isArray(columns) && columns.length > 0) {
      exportData = data.map((row) => {
        const mappedRow = {};
        columns.forEach((col) => {

          if (col.key === "actions" || col.title === "Hành động") {
            return;
          }

          const key = col.dataIndex || col.key;
          if (key) {
            let value = "";

            if (key.includes(".")) {
              const keys = key.split(".");
              value = keys.reduce((obj, k) => obj?.[k], row) || "";
            } else if (key === "customer") {
              value = row.customerName || row.customer?.name || "";
            } else {
              value = row[key];
            }

            if (value === null || value === undefined) {
              value = "";
            } else if (typeof value === "object") {
              value = JSON.stringify(value);
            } else if (typeof value === "number" && col.dataIndex?.includes("Amount") || col.dataIndex?.includes("price")) {
              value = Number(value).toLocaleString("vi-VN");
            }

            mappedRow[col.title || key] = value;
          }
        });
        return mappedRow;
      });
    }

    const ws = XLSX.utils.json_to_sheet(exportData);

    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    throw error;
  }
};

export const exportToPDF = (tableId, filename = "export") => {
  try {
    const table = document.getElementById(tableId);
    if (!table) {
      throw new Error("Table element not found");
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>${filename}</h2>
          ${table.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    return true;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
};
