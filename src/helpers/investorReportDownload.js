import { message } from "antd";
import { downloadInvestorPdf } from "./investorReportPdf";

export async function runInvestorReportDownload({
  title,
  filename,
  rows,
  emptyMessage,
}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    message.info(emptyMessage || "Nothing to export on this page yet.");
    return false;
  }

  message.loading({ content: "Generating PDF...", key: "investorPdf", duration: 0 });

  try {
    const result = await downloadInvestorPdf({ title, filename, rows });
    if (!result.ok) {
      message.info({
        content: emptyMessage || "Nothing to export on this page yet.",
        key: "investorPdf",
      });
      return false;
    }
    message.success({ content: "Report downloaded.", key: "investorPdf" });
    return true;
  } catch (error) {
    console.error("Investor PDF export failed:", error);
    message.error({ content: "Failed to generate PDF.", key: "investorPdf" });
    return false;
  }
}
