import { Typography } from "antd";

const { Text } = Typography;

function InvestorSupportTicketThread({ thread = [] }) {
  if (!thread.length) {
    return <Text type="secondary">No messages on this ticket yet.</Text>;
  }

  return (
    <div className="investor-support-thread">
      {thread.map((entry) => (
        <div
          key={entry.id}
          className={`investor-support-thread-item investor-support-thread-item--${entry.role}`}
        >
          <div className="investor-support-thread-meta">
            <Text strong className="investor-support-thread-author">
              {entry.authorLabel}
            </Text>
            <Text type="secondary" className="investor-support-thread-time">
              {entry.timeDisplay}
            </Text>
          </div>

          {entry.summaryLines?.length ? (
            <div className="investor-support-thread-summary">
              {entry.summaryLines.map((line) => (
                <Text key={line} type="secondary" className="investor-support-thread-summary-line">
                  {line}
                </Text>
              ))}
            </div>
          ) : null}

          {entry.body ? (
            <Text className="investor-support-thread-body" style={{ whiteSpace: "pre-wrap" }}>
              {entry.body}
            </Text>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default InvestorSupportTicketThread;
