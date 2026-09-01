import { useEffect, useState } from "react";
import { Button, Pagination, Tag, Typography } from "antd";
import { formatTicketTime, statusPillColor } from "../../helpers/investorTicketUi";

const { Text } = Typography;

function StatusBlock({ dot, label, posted }) {
  return (
    <div className="investor-financed-status-cell investor-mobile-data-card__status">
      <div className="investor-financed-status-top">
        <span className={`investor-health-dot investor-health-dot--${dot}`} aria-hidden />
        <span className="investor-financed-status-label">{label}</span>
      </div>
      <Text type="secondary" className="investor-financed-status-posted">
        {posted}
      </Text>
    </div>
  );
}

function InvestorFinancedProjectMobileList({
  projects,
  formatPosted,
  loading,
  emptyText = "No financed projects in this period",
  pageSize = 5,
}) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [projects]);

  const total = projects.length;
  const start = (page - 1) * pageSize;
  const pageItems = projects.slice(start, start + pageSize);

  if (loading) {
    return <Text type="secondary">Loading projects…</Text>;
  }

  if (!total) {
    return <Text type="secondary">{emptyText}</Text>;
  }

  return (
    <div className="investor-mobile-data-list-wrap">
      <ul className="investor-mobile-data-list">
        {pageItems.map((row) => (
          <li key={row.key} className="investor-mobile-data-card">
            <div className="investor-mobile-data-card__head">
              <div className="investor-mobile-data-card__lead">
                <div className="investor-mobile-data-card__title">{row.installationTitle}</div>
                <div className="investor-mobile-data-card__subtitle">{row.installationSub}</div>
              </div>
              <StatusBlock
                dot={row.healthDot}
                label={row.healthLabel}
                posted={formatPosted(row)}
              />
            </div>
            <dl className="investor-mobile-data-card__grid">
              <div className="investor-mobile-data-card__field">
                <dt>kWp</dt>
                <dd>{row.capacityKwp}</dd>
              </div>
              <div className="investor-mobile-data-card__field">
                <dt>Project cost</dt>
                <dd>{row.projectCostDisplay}</dd>
              </div>
              <div className="investor-mobile-data-card__field">
                <dt>Invested</dt>
                <dd>{row.investedDisplay}</dd>
              </div>
              <div className="investor-mobile-data-card__field">
                <dt>Yield</dt>
                <dd>
                  <span>{row.energyKwhDisplay}</span>
                  {row.energyValueDisplay ? (
                    <Text type="secondary" className="investor-mobile-data-card__sub">
                      {row.energyValueDisplay}
                    </Text>
                  ) : null}
                </dd>
              </div>
              <div className="investor-mobile-data-card__field">
                <dt>ROI</dt>
                <dd>{row.kpiRemarkMain}</dd>
              </div>
              <div className="investor-mobile-data-card__field">
                <dt>Repayment</dt>
                <dd>
                  <span>{row.repaymentMain}</span>
                  <span
                    className={
                      row.repaymentOverdue
                        ? "investor-financed-repay-sub investor-financed-repay-sub--overdue"
                        : "investor-financed-repay-sub"
                    }
                  >
                    {row.repaymentSub}
                  </span>
                </dd>
              </div>
              <div className="investor-mobile-data-card__field investor-mobile-data-card__field--wide">
                <dt>Carbon offset</dt>
                <dd>{row.carbonDisplay}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      {total > pageSize ? (
        <Pagination
          className="investor-mobile-data-list__pagination"
          size="small"
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
          showSizeChanger={false}
        />
      ) : null}
    </div>
  );
}

function InvestorSupportTicketMobileList({
  tickets,
  loading,
  onView,
  emptyText,
  pageSize = 5,
}) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [tickets]);

  const total = tickets.length;
  const start = (page - 1) * pageSize;
  const pageItems = tickets.slice(start, start + pageSize);

  if (loading) {
    return <Text type="secondary">Loading tickets…</Text>;
  }

  if (!total) {
    return <Text type="secondary">{emptyText}</Text>;
  }

  return (
    <div className="investor-mobile-data-list-wrap">
      <ul className="investor-mobile-data-list">
        {pageItems.map((ticket) => (
          <li key={ticket.key} className="investor-mobile-data-card">
            <div className="investor-mobile-data-card__head investor-mobile-data-card__head--support">
              <div className="investor-mobile-data-card__lead">
                <div className="investor-mobile-data-card__title">{ticket.subject}</div>
                <div className="investor-mobile-data-card__meta-row">
                  <Tag color={statusPillColor(ticket.status)} className="investor-ticket-pill">
                    {ticket.status}
                  </Tag>
                  <Text type="secondary">{ticket.subjectTagDisplay}</Text>
                </div>
              </div>
              <Button type="link" size="small" onClick={() => onView(ticket.id)}>
                View
              </Button>
            </div>
            <dl className="investor-mobile-data-card__grid investor-mobile-data-card__grid--compact">
              <div className="investor-mobile-data-card__field">
                <dt>Priority</dt>
                <dd>{ticket.priority}</dd>
              </div>
              <div className="investor-mobile-data-card__field">
                <dt>Created</dt>
                <dd>{ticket.createdDisplay || formatTicketTime(ticket.createdAt)}</dd>
              </div>
              <div className="investor-mobile-data-card__field">
                <dt>Updated</dt>
                <dd>{ticket.updatedDisplay || formatTicketTime(ticket.updatedAt)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      {total > pageSize ? (
        <Pagination
          className="investor-mobile-data-list__pagination"
          size="small"
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
          showSizeChanger={false}
        />
      ) : null}
    </div>
  );
}

function InvestorPaymentMobileList({
  rows,
  fields,
  loading,
  emptyText,
  pageSize = 5,
  rowKey = "key",
}) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageItems = rows.slice(start, start + pageSize);

  if (loading) {
    return <Text type="secondary">Loading…</Text>;
  }

  if (!total) {
    return <Text type="secondary">{emptyText}</Text>;
  }

  return (
    <div className="investor-mobile-data-list-wrap">
      <ul className="investor-mobile-data-list">
        {pageItems.map((row) => (
          <li key={row[rowKey]} className="investor-mobile-data-card">
            {fields.map((field) => (
              <div key={field.key} className="investor-mobile-data-card__row">
                <span className="investor-mobile-data-card__row-label">{field.label}</span>
                <span className="investor-mobile-data-card__row-value">
                  {field.render ? field.render(row) : row[field.key]}
                </span>
              </div>
            ))}
          </li>
        ))}
      </ul>
      {total > pageSize ? (
        <Pagination
          className="investor-mobile-data-list__pagination"
          size="small"
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
          showSizeChanger={false}
        />
      ) : null}
    </div>
  );
}

export {
  InvestorFinancedProjectMobileList,
  InvestorSupportTicketMobileList,
  InvestorPaymentMobileList,
};
