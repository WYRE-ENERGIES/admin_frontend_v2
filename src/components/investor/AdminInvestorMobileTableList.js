import { useEffect, useMemo, useState } from "react";
import { Pagination, Spin, Typography } from "antd";

const { Text } = Typography;

const ACTION_COLUMN_KEYS = new Set(["actions", "action", "schedule", "sched", "respond"]);
const BADGE_COLUMN_KEYS = new Set([
  "status",
  "health",
  "lineStatus",
  "stateUi",
  "state",
  "line",
  "priority",
  "kyc",
]);

function isActionColumn(col) {
  return ACTION_COLUMN_KEYS.has(col.key) || String(col.title || "").toLowerCase() === "actions";
}

function isBadgeColumn(col) {
  return BADGE_COLUMN_KEYS.has(col.key);
}

function getCellValue(col, row, index) {
  if (col.render) {
    const value = col.dataIndex != null ? row[col.dataIndex] : undefined;
    return col.render(value, row, index);
  }
  if (col.dataIndex != null) {
    const value = row[col.dataIndex];
    return value ?? "—";
  }
  return "—";
}

function AdminInvestorMobileTableList({
  columns = [],
  dataSource = [],
  loading = false,
  rowKey = "key",
  emptyText = "No records",
  pagination,
  mobileTitleKey,
  mobileSubtitleKey,
  onRowClick,
}) {
  const pageSize = typeof pagination === "object" ? pagination.pageSize || 10 : 10;
  const paginate = pagination !== false;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [dataSource, columns]);

  const { titleCol, subtitleCol, badgeCol, fieldCols, actionCols } = useMemo(() => {
    const titleColResolved = mobileTitleKey
      ? columns.find((c) => c.key === mobileTitleKey || c.dataIndex === mobileTitleKey)
      : columns.find((c) => !isActionColumn(c));

    const subtitleColResolved = mobileSubtitleKey
      ? columns.find((c) => c.key === mobileSubtitleKey || c.dataIndex === mobileSubtitleKey)
      : null;

    const actionColsResolved = columns.filter(isActionColumn);
    const badgeColResolved = columns.find(
      (c) => c !== titleColResolved && c !== subtitleColResolved && isBadgeColumn(c)
    );

    const fieldColsResolved = columns.filter(
      (c) =>
        c !== titleColResolved &&
        c !== subtitleColResolved &&
        c !== badgeColResolved &&
        !isActionColumn(c)
    );

    return {
      titleCol: titleColResolved,
      subtitleCol: subtitleColResolved,
      badgeCol: badgeColResolved,
      fieldCols: fieldColsResolved,
      actionCols: actionColsResolved,
    };
  }, [columns, mobileTitleKey, mobileSubtitleKey]);

  const total = dataSource.length;
  const start = paginate ? (page - 1) * pageSize : 0;
  const pageItems = paginate ? dataSource.slice(start, start + pageSize) : dataSource;

  if (loading) {
    return (
      <div className="investor-mobile-data-list-wrap">
        <Spin size="small" />
      </div>
    );
  }

  if (!total) {
    return (
      <div className="investor-mobile-data-list-wrap">
        <Text type="secondary">{emptyText}</Text>
      </div>
    );
  }

  return (
    <div className="investor-mobile-data-list-wrap">
      <ul className="investor-mobile-data-list">
        {pageItems.map((row, rowIndex) => {
          const index = start + rowIndex;
          const key = row[rowKey] ?? index;
          return (
            <li
              key={key}
              className={`investor-mobile-data-card${onRowClick ? " investor-mobile-data-card--clickable" : ""}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
            >
              <div className="investor-mobile-data-card__head">
                <div className="investor-mobile-data-card__lead">
                  <div className="investor-mobile-data-card__title">
                    {titleCol ? getCellValue(titleCol, row, index) : "—"}
                  </div>
                  {subtitleCol ? (
                    <div className="investor-mobile-data-card__subtitle">
                      {getCellValue(subtitleCol, row, index)}
                    </div>
                  ) : null}
                </div>
                {badgeCol ? (
                  <div className="investor-mobile-data-card__badge">
                    {getCellValue(badgeCol, row, index)}
                  </div>
                ) : null}
              </div>
              {fieldCols.length > 0 ? (
                <dl className="investor-mobile-data-card__grid investor-mobile-data-card__grid--compact">
                  {fieldCols.map((col) => (
                    <div
                      key={col.key || col.dataIndex}
                      className="investor-mobile-data-card__field"
                    >
                      <dt>{col.title}</dt>
                      <dd>{getCellValue(col, row, index)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {actionCols.length > 0 ? (
                <div
                  className="investor-mobile-data-card__actions"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  {actionCols.map((col) => (
                    <span key={col.key || col.dataIndex}>
                      {getCellValue(col, row, index)}
                    </span>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {paginate && total > pageSize ? (
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

export default AdminInvestorMobileTableList;
