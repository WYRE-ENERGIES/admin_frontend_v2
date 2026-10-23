import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;

function escapeHtml(value) {
  return String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function groupRowsBySection(rows) {
  const groups = [];
  const map = new Map();

  rows.forEach((row) => {
    const section = row.Section || "Details";
    if (!map.has(section)) {
      const group = { title: section, rows: [] };
      map.set(section, group);
      groups.push(group);
    }
    map.get(section).rows.push(row);
  });

  return groups;
}

function renderTable(headers, bodyRows) {
  const head = headers
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join("");
  const body = bodyRows
    .map(
      (row) =>
        `<tr>${headers.map((h) => `<td>${escapeHtml(row[h])}</td>`).join("")}</tr>`
    )
    .join("");

  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function buildReportHtml(title, rows) {
  const groups = groupRowsBySection(rows);
  const generated = dayjs().format("DD MMM YYYY, HH:mm");

  const sectionsHtml = groups
    .map((group) => {
      const sample = group.rows[0] || {};
      const headers = Object.keys(sample).filter((key) => key !== "Section");
      if (!headers.length) return "";

      const isMetricTable =
        headers.includes("Label") &&
        headers.includes("Value") &&
        headers.length <= 3;

      if (isMetricTable) {
        const metricRows = group.rows.map((row) => ({
          Label: row.Label,
          Value: row.Detail ? `${row.Value} (${row.Detail})` : row.Value,
        }));
        return `
          <section class="investor-pdf-section">
            <h2>${escapeHtml(group.title)}</h2>
            ${renderTable(["Label", "Value"], metricRows)}
          </section>
        `;
      }

      return `
        <section class="investor-pdf-section">
          <h2>${escapeHtml(group.title)}</h2>
          ${renderTable(headers, group.rows)}
        </section>
      `;
    })
    .join("");

  return `
    <div class="investor-pdf-root">
      <header class="investor-pdf-header">
        <div class="investor-pdf-brand">Wyre Investor</div>
        <h1>${escapeHtml(title)}</h1>
        <p>Generated ${escapeHtml(generated)}</p>
      </header>
      ${sectionsHtml}
    </div>
  `;
}

export async function downloadInvestorPdf({ title, filename, rows }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, reason: "empty" };
  }

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;background:#ffffff;color:#111827;";
  container.innerHTML = `
    <style>
      .investor-pdf-root { font-family: Arial, Helvetica, sans-serif; padding: 28px; }
      .investor-pdf-header { margin-bottom: 24px; border-bottom: 2px solid #5c3592; padding-bottom: 16px; }
      .investor-pdf-brand { color: #5c3592; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
      .investor-pdf-header h1 { margin: 0 0 6px; font-size: 24px; line-height: 1.2; }
      .investor-pdf-header p { margin: 0; color: #667085; font-size: 12px; }
      .investor-pdf-section { margin-bottom: 22px; page-break-inside: avoid; }
      .investor-pdf-section h2 { margin: 0 0 10px; font-size: 14px; color: #5c3592; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { border: 1px solid #d0d5dd; padding: 7px 8px; text-align: left; vertical-align: top; word-break: break-word; }
      th { background: #f4ebff; color: #344054; font-weight: 700; }
      tr:nth-child(even) td { background: #fafafa; }
    </style>
    ${buildReportHtml(title, rows)}
  `;

  document.body.appendChild(container);

  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = PAGE_WIDTH_MM;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= PAGE_HEIGHT_MM;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= PAGE_HEIGHT_MM;
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    return { ok: true };
  } finally {
    document.body.removeChild(container);
  }
}
