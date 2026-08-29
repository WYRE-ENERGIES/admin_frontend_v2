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

/** Strip [TAG] prefix from ticket subject for investor-facing display. */
export const stripTicketSubjectPrefix = (subject, subjectTag) => {
  let text = String(subject || "").trim();
  if (!text) return text;

  const tag = subjectTag ? String(subjectTag).toUpperCase() : null;
  if (tag) {
    const prefix = `[${tag}]`;
    if (text.toUpperCase().startsWith(prefix)) {
      text = text.slice(prefix.length).trim();
    }
  }

  return text.replace(/^\[[^\]]+\]\s*/i, "").trim() || String(subject || "").trim();
};

function cleanInvestorDescriptionLine(line) {
  let text = String(line || "");

  if (/^Investor:\s*/i.test(text)) {
    text = text
      .replace(/^Investor:\s*[A-Z]{2,4}-\d+\s*/i, "Investor: ")
      .replace(/^Investor:\s*\(([^)]+)\)/i, "Investor: $1")
      .replace(/\b[A-Z]{2,4}-\d+\b/g, "")
      .replace(/\(\s*\)/g, "");
  } else {
    text = text.replace(/\s*\([A-Z]{2,4}-\d+\)\s*/gi, " ");
  }

  return text.replace(/\s{2,}/g, " ").trimEnd();
}

/** Remove internal refs (investor ID, branch ID) from ticket description body. */
export const sanitizeInvestorTicketDescription = (description) => {
  if (description == null || description === "") return description;

  return String(description)
    .split("\n")
    .filter((line) => !/^\s*Branch ID\s*:/i.test(line))
    .map((line) => cleanInvestorDescriptionLine(line))
    .join("\n")
    .trim();
};

function asResponseArray(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.results)) return value.results;
  return [];
}

/** Collect staff / Wyre replies from flexible ticket detail payload shapes. */
export const extractSupportTicketResponses = (item) => {
  if (!item || typeof item !== "object") return [];

  const sources = [
    item.staff_notes,
    item.responses,
    item.staff_responses,
    item.thread,
    item.messages,
    item.notes,
  ];

  for (const source of sources) {
    const list = asResponseArray(source);
    if (list.length) return list;
  }

  const singles = [item.latest_response, item.last_response, item.latest_staff_note];
  for (const single of singles) {
    if (single && typeof single === "object" && !Array.isArray(single)) {
      return [single];
    }
  }

  return [];
};

function mapSupportTicketResponse(note, index) {
  const body = String(note.body ?? note.message ?? note.text ?? note.content ?? "").trim();
  if (!body) return null;

  const authorRaw = note.author_display ?? note.author_name ?? note.author ?? "";
  const authorLabel = String(authorRaw).includes("@") || !authorRaw ? "Wyre" : authorRaw;

  return {
    id: String(note.id ?? note.note_id ?? note.response_id ?? `response-${index}`),
    role: "staff",
    authorLabel,
    body,
    createdAt: note.created_at || null,
    timeDisplay: note.created_at_display || formatTicketTime(note.created_at),
  };
}

function parseTicketDescriptionThread(description) {
  const sanitized = sanitizeInvestorTicketDescription(description);
  if (!sanitized) return { summaryLines: [], message: "" };

  const summaryLines = [];
  const messageLines = [];
  let inMessage = false;

  for (const rawLine of String(sanitized).split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const messageMatch = line.match(/^Message:\s*(.*)$/i);
    if (messageMatch) {
      inMessage = true;
      if (messageMatch[1]) messageLines.push(messageMatch[1]);
      continue;
    }

    if (inMessage) {
      messageLines.push(line);
      continue;
    }

    if (/request\s*\(investor portal\)/i.test(line)) continue;
    summaryLines.push(line);
  }

  return {
    summaryLines,
    message: messageLines.join("\n").trim(),
  };
}

function buildStructuredSummaryLines(item) {
  if (!item || typeof item !== "object") return [];

  const lines = [];
  if (item.topic) lines.push(`Topic: ${item.topic}`);

  const projectLabel = [item.project_id != null ? `#${item.project_id}` : null, item.project_name]
    .filter(Boolean)
    .join(" — ");
  if (projectLabel) lines.push(`Project: ${projectLabel}`);

  if (item.amount_intended != null && item.amount_intended !== "") {
    lines.push(`Amount intended: ${item.amount_intended}`);
  }

  if (item.repayment_preference) {
    lines.push(`Repayment preference: ${item.repayment_preference}`);
  }

  return lines;
}

/** Build chronological thread: investor opening message + Wyre responses. */
export const buildInvestorSupportTicketThread = ({
  description,
  displayDescription,
  createdAt,
  createdDisplay,
  responses = [],
  message: explicitMessage,
  summaryLines: structuredSummary = [],
}) => {
  const parsed = parseTicketDescriptionThread(description);
  const summaryLines = structuredSummary.length ? structuredSummary : parsed.summaryLines;
  const message = explicitMessage || parsed.message;
  const fallbackBody = displayDescription || description || "";
  const thread = [];

  const initialBody = message || (summaryLines.length ? summaryLines.join("\n") : fallbackBody);
  if (initialBody || summaryLines.length) {
    thread.push({
      id: "initial",
      role: "investor",
      authorLabel: "You",
      summaryLines: message ? summaryLines : [],
      body: initialBody,
      createdAt,
      timeDisplay: createdDisplay || formatTicketTime(createdAt),
    });
  }

  responses.forEach((note, index) => {
    const mapped = mapSupportTicketResponse(note, index);
    if (mapped) thread.push(mapped);
  });

  thread.sort((a, b) => {
    if (a.id === "initial") return -1;
    if (b.id === "initial") return 1;
    const ta = a.createdAt ? dayjs(a.createdAt).valueOf() : 0;
    const tb = b.createdAt ? dayjs(b.createdAt).valueOf() : 0;
    return ta - tb;
  });

  return thread;
};

export { buildStructuredSummaryLines };
