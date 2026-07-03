import dayjs from "dayjs";

export const formatTicketTime = (iso) => {
  if (!iso) return "—";
  const d = dayjs(iso);
  if (!d.isValid()) return String(iso);
  return d.format("MMM D, YYYY · h:mm A");
};

export const statusPillColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("resolved") || s.includes("closed")) return "green";
  if (s.includes("review")) return "gold";
  if (s.includes("pending")) return "orange";
  return "blue";
};

export const SUPPORT_TOPIC_OPTIONS = [
  { value: "General support", label: "General support" },
  { value: "Project inquiry", label: "Project inquiry" },
  { value: "Repayment inquiry", label: "Repayment inquiry" },
  { value: "Statement request", label: "Statement request" },
  { value: "Generation dispute", label: "Generation dispute" },
];

export const SUPPORT_PRIORITY_OPTIONS = [
  { value: "Normal", label: "Normal" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
];
