import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Select, Spin, Table, Tag, Typography } from "antd";
import InvestorPillSegmented from "../../components/investor/InvestorPillSegmented";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import InvestorResponsiveDataView from "../../components/investor/InvestorResponsiveDataView";
import { InvestorPaymentMobileList } from "../../components/investor/InvestorMobileDataLists";
import {
  fetchInvestorFinancedInvestments,
  fetchInvestorPayments,
  fetchInvestorProjectPayoutSchedule,
} from "../../redux/actions/investor/investor.action";

const { Text, Title } = Typography;

/** Default list pagination: 5 rows, with an opt-in size changer up to 20. */
const INVESTOR_TABLE_PAGINATION = {
  pageSize: 5,
  showSizeChanger: true,
  pageSizeOptions: ["5", "10", "15", "20"],
  hideOnSinglePage: true,
};

/** Percentage width for investor payment tables (sums to 100% per table). */
const investorColPct = (pct, col) => ({ ...col, width: `${pct}%` });

function scheduleStatusTag(statusKey, label, title) {
  const t = String(statusKey || label || "").toLowerCase();
  const tag =
    t.includes("paid") ? (
      <Tag color="blue" className="investor-schedule-status-tag">
        {label}
      </Tag>
    ) : t.includes("scheduled") ? (
      <Tag color="green" className="investor-schedule-status-tag">
        {label}
      </Tag>
    ) : t.includes("overdue") ? (
      <Tag color="red" className="investor-schedule-status-tag">
        {label}
      </Tag>
    ) : t.includes("pending") ? (
      <Tag color="gold" className="investor-schedule-status-tag">
        {label}
      </Tag>
    ) : (
      <Tag color="default" className="investor-schedule-status-tag">
        {label}
      </Tag>
    );
  return title ? <span title={title}>{tag}</span> : tag;
}

function InvestorPayments() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { payments: bundle, paymentsLoading } = useSelector((s) => s.investorPage);

  const [range, setRange] = useState([
    dayjs().month(0).date(1),
    dayjs().month(3).endOf("month"),
  ]);
  const [ledgerYear, setLedgerYear] = useState(String(dayjs().year()));

  const [investmentOptions, setInvestmentOptions] = useState([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState(null);
  const [payoutSchedule, setPayoutSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const rangeKey = `${range[0]?.format("YYYY-MM-DD")}_${range[1]?.format("YYYY-MM-DD")}`;

  const loadPayments = useCallback(() => {
    const start = range[0]?.format("YYYY-MM-DD");
    const end = range[1]?.format("YYYY-MM-DD");
    dispatch(
      fetchInvestorPayments({
        start,
        end,
        ledgerYear: Number(ledgerYear),
      })
    );
  }, [dispatch, range, ledgerYear]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments, rangeKey, ledgerYear]);

  const loadInvestments = useCallback(async () => {
    setInvestmentsLoading(true);
    const res = await dispatch(fetchInvestorFinancedInvestments());
    setInvestmentsLoading(false);
    if (!res.fulfilled) return;
    const list = res.data || [];
    setInvestmentOptions(list);
    const fromQuery = searchParams.get("investment_id");
    const queryId = fromQuery != null && fromQuery !== "" ? Number(fromQuery) : null;
    const matchFromQuery =
      queryId != null && list.some((p) => Number(p.investmentId) === queryId);
    if (matchFromQuery) {
      setSelectedInvestmentId(queryId);
    } else if (list.length) {
      setSelectedInvestmentId((prev) =>
        prev != null && list.some((p) => Number(p.investmentId) === prev)
          ? prev
          : Number(list[0].investmentId)
      );
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  const loadPayoutSchedule = useCallback(async (investmentId) => {
    if (investmentId == null) {
      setPayoutSchedule(null);
      return;
    }
    setScheduleLoading(true);
    const res = await dispatch(fetchInvestorProjectPayoutSchedule(investmentId));
    setScheduleLoading(false);
    if (!res.fulfilled) {
      setPayoutSchedule(null);
      return;
    }
    setPayoutSchedule(res.data);
  }, [dispatch]);

  useEffect(() => {
    if (selectedInvestmentId != null) {
      loadPayoutSchedule(selectedInvestmentId);
    }
  }, [selectedInvestmentId, loadPayoutSchedule]);

  const handleInvestmentChange = (value) => {
    const id = value != null ? Number(value) : null;
    setSelectedInvestmentId(id);
    if (id != null) {
      setSearchParams({ investment_id: String(id) }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const investmentSelectOptions = useMemo(
    () =>
      investmentOptions.map((p) => ({
        value: Number(p.investmentId),
        label: p.name,
      })),
    [investmentOptions]
  );

  const kpis = useMemo(() => {
    const k = bundle?.kpis;
    if (!k) return [];
    return [
      { key: "1", ...k.totalCredited },
      { key: "2", ...k.dueNext30 },
      { key: "3", ...k.overdue90 },
      { key: "4", ...k.nextPaymentDue },
    ];
  }, [bundle?.kpis]);

  const scheduleCols = [
    investorColPct(11, { title: "Due", dataIndex: "due", key: "due" }),
    investorColPct(34, { title: "Project", dataIndex: "project", key: "project", ellipsis: true }),
    investorColPct(16, {
      title: "Total due",
      dataIndex: "totalDue",
      key: "totalDue",
      align: "right",
      render: (v) => <span className="investor-table-nowrap">{v}</span>,
    }),
    investorColPct(16, {
      title: "Your credit",
      dataIndex: "yourCredit",
      key: "yourCredit",
      align: "right",
      render: (v) => <span className="investor-pay-pos investor-table-nowrap">{v}</span>,
    }),
    investorColPct(23, {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v, row) => (
        <div className="investor-schedule-status-cell">
          {scheduleStatusTag(row.statusKey, v, row.statusDetail)}
        </div>
      ),
    }),
  ];

  const repaymentHistoryCols = useMemo(
    () => [
      investorColPct(22, { title: "Paid date", dataIndex: "paidDate", key: "paidDate" }),
      investorColPct(38, {
        title: "Project",
        dataIndex: "projectName",
        key: "projectName",
        ellipsis: true,
      }),
      investorColPct(22, {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        render: (v) => <span className="investor-table-nowrap investor-pay-pos">{v}</span>,
      }),
      investorColPct(18, {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (v, row) => {
          const t = String(row.statusKey || v || "").toLowerCase();
          const color = t === "full" ? "green" : t === "partial" ? "gold" : "default";
          return (
            <Tag color={color} className="investor-schedule-status-tag">
              {v}
            </Tag>
          );
        },
      }),
    ],
    []
  );

  const payoutScheduleCols = [
    investorColPct(17, { title: "Due date", dataIndex: "due", key: "due" }),
    investorColPct(17, {
      title: "Amount due",
      dataIndex: "amountDue",
      key: "amountDue",
      align: "right",
      render: (v) => <span className="investor-table-nowrap">{v}</span>,
    }),
    investorColPct(17, {
      title: "Amount paid",
      dataIndex: "amountPaid",
      key: "amountPaid",
      align: "right",
      render: (v) => <span className="investor-table-nowrap">{v}</span>,
    }),
    investorColPct(16, {
      title: "Remaining",
      dataIndex: "amountRemaining",
      key: "amountRemaining",
      align: "right",
      render: (v, row) => {
        const raw = String(row.statusKey || "");
        const isOver = raw.includes("overdue") || (v && v.startsWith("-"));
        return <span className={`investor-table-nowrap${isOver ? " investor-pay-neg" : ""}`}>{v}</span>;
      },
    }),
    investorColPct(15, { title: "Paid date", dataIndex: "paidDate", key: "paidDate" }),
    investorColPct(18, {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v, row) => (
        <div className="investor-schedule-status-cell">
          {scheduleStatusTag(row.statusKey, v, row.statusDetail)}
        </div>
      ),
    }),
  ];

  const health = bundle?.receivableHealth;
  const ledgerMeta = bundle?.ledgerMeta;
  const scheduleSummary = payoutSchedule?.summary;

  const ledgerYearOptions = useMemo(() => {
    const current = dayjs().year();
    return [
      { value: String(current), label: String(current) },
      { value: String(current - 1), label: String(current - 1) },
    ];
  }, []);

  const scheduleMobileFields = useMemo(
    () => [
      { key: "due", label: "Due" },
      { key: "project", label: "Project" },
      { key: "totalDue", label: "Total due" },
      {
        key: "yourCredit",
        label: "Your credit",
        render: (row) => <span className="investor-pay-pos">{row.yourCredit}</span>,
      },
      {
        key: "status",
        label: "Status",
        render: (row) => scheduleStatusTag(row.statusKey, row.status, row.statusDetail),
      },
    ],
    []
  );

  const payoutInstallmentMobileFields = useMemo(
    () => [
      { key: "due", label: "Due date" },
      { key: "amountDue", label: "Amount due" },
      { key: "amountPaid", label: "Amount paid" },
      { key: "amountRemaining", label: "Remaining" },
      { key: "paidDate", label: "Paid date" },
      {
        key: "status",
        label: "Status",
        render: (row) => scheduleStatusTag(row.statusKey, row.status, row.statusDetail),
      },
    ],
    []
  );

  const ledgerMobileFields = useMemo(
    () => [
      { key: "paidDate", label: "Paid date" },
      { key: "projectName", label: "Project" },
      {
        key: "amount",
        label: "Amount",
        render: (row) => <span className="investor-pay-pos">{row.amount}</span>,
      },
      {
        key: "status",
        label: "Status",
        render: (row) => {
          const t = String(row.statusKey || row.status || "").toLowerCase();
          const color = t === "full" ? "green" : t === "partial" ? "gold" : "default";
          return (
            <Tag color={color} className="investor-schedule-status-tag">
              {row.status}
            </Tag>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="investor-page investor-payments-page">
      <InvestorPageHeader title="Payments & receivables" />

      <Spin spinning={paymentsLoading} wrapperClassName="investor-payments-spin">
        <div className="investor-payments-body">
        <div className="investor-metrics investor-metrics--four">
          {kpis.map((k) => (
            <Card
              key={k.key}
              bordered={false}
              className={`investor-metric-card${
                k.primary ? " investor-metric-card--primary" : ""
              }${k.isPastDue ? " investor-metric-card--alert" : ""}`}
            >
              <div className="investor-metric-label">{k.label}</div>
              <div className="investor-metric-value">{k.value}</div>
              <div className="investor-metric-sub">{k.sub}</div>
            </Card>
          ))}
        </div>

        <Card
          title="Payment schedule"
          bordered={false}
          className="investor-card investor-payments-schedule-card"
          extra={
            <Select
              showSearch
              allowClear
              placeholder="Select investment"
              optionFilterProp="label"
              loading={investmentsLoading}
              className="investor-payments-investment-select"
              value={selectedInvestmentId ?? undefined}
              options={investmentSelectOptions}
              onChange={handleInvestmentChange}
              notFoundContent={investmentsLoading ? "Loading…" : "No financed investments"}
            />
          }
        >
          {payoutSchedule ? (
            <>
              <div className="investor-payments-schedule-head">
                <Text className="investor-payments-schedule-meta">
                  {payoutSchedule.projectName}
                  {scheduleSummary
                    ? ` · ${scheduleSummary.totalInstallments} installments · ${scheduleSummary.paidCount} paid · ${scheduleSummary.openCount} open`
                    : ""}
                </Text>
                {scheduleSummary ? (
                  <div className="investor-payments-schedule-summary">
                    <div>
                      <span className="investor-mini-label">Total due</span>
                      <span className="investor-mini-value">{scheduleSummary.totalDue}</span>
                    </div>
                    <div>
                      <span className="investor-mini-label">Total paid</span>
                      <span className="investor-mini-value investor-pay-pos">{scheduleSummary.totalPaid}</span>
                    </div>
                    <div>
                      <span className="investor-mini-label">Remaining</span>
                      <span className="investor-mini-value">{scheduleSummary.totalRemaining}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : !scheduleLoading && !investmentsLoading ? (
            <Text type="secondary">Select a financed investment to view its payout schedule.</Text>
          ) : null}

          <Spin spinning={scheduleLoading}>
            <InvestorResponsiveDataView
              desktop={
                <div className="table-responsive-wrapper investor-table-wrap">
                  <Table
                    className="investor-table investor-schedule-table"
                    columns={payoutScheduleCols}
                    dataSource={payoutSchedule?.installments || []}
                    pagination={INVESTOR_TABLE_PAGINATION}
                    size="small"
                    rowKey="key"
                    tableLayout="fixed"
                    locale={{ emptyText: "No installments for this investment" }}
                  />
                </div>
              }
              mobile={
                <InvestorPaymentMobileList
                  rows={payoutSchedule?.installments || []}
                  fields={payoutInstallmentMobileFields}
                  loading={scheduleLoading}
                  emptyText="No installments for this investment"
                />
              }
            />
          </Spin>
        </Card>

        <Card
          title="Upcoming schedule"
          bordered={false}
          className="investor-card investor-card--upcoming-schedule investor-payments-upcoming-card"
        >
          <InvestorResponsiveDataView
            desktop={
              <div className="table-responsive-wrapper investor-table-wrap">
                <Table
                  className="investor-table investor-schedule-table"
                  columns={scheduleCols}
                  dataSource={bundle?.schedule || []}
                  pagination={INVESTOR_TABLE_PAGINATION}
                  size="small"
                  rowKey="key"
                  tableLayout="fixed"
                  locale={{ emptyText: "No upcoming installments" }}
                />
              </div>
            }
            mobile={
              <InvestorPaymentMobileList
                rows={bundle?.schedule || []}
                fields={scheduleMobileFields}
                loading={paymentsLoading}
                emptyText="No upcoming installments"
              />
            }
          />
        </Card>

        <div className="investor-payments-bottom-split">
          <Card
            title={
              <div className="investor-ledger-head">
                <Title level={5} style={{ margin: 0 }}>
                  Repayment history
                </Title>
                <InvestorPillSegmented
                  options={ledgerYearOptions}
                  value={ledgerYear}
                  onChange={setLedgerYear}
                />
              </div>
            }
            bordered={false}
            className="investor-card investor-card--payout-history"
          >
            <div className="investor-payout-history-body">
              <InvestorResponsiveDataView
                desktop={
                  <div className="table-responsive-wrapper investor-table-wrap">
                    <Table
                      className="investor-table investor-ledger-table"
                      columns={repaymentHistoryCols}
                      dataSource={bundle?.ledger || []}
                      pagination={{
                        ...INVESTOR_TABLE_PAGINATION,
                        ...(ledgerMeta?.total != null ? { total: ledgerMeta.total } : {}),
                      }}
                      size="small"
                      rowKey="key"
                      tableLayout="fixed"
                      locale={{ emptyText: `No repayment history for ${ledgerYear}` }}
                    />
                  </div>
                }
                mobile={
                  <InvestorPaymentMobileList
                    rows={bundle?.ledger || []}
                    fields={ledgerMobileFields}
                    loading={paymentsLoading}
                    emptyText={`No repayment history for ${ledgerYear}`}
                  />
                }
              />
            </div>
          </Card>

          <Card title="Receivable health" bordered={false} className="investor-card investor-card--receivable-health">
            <div className="investor-health-lines">
              <div>
                <span className="investor-mini-label">Weighted days past due (portfolio)</span>
                <span className="investor-mini-value">{health?.dpd ?? "—"}</span>
              </div>
              <div>
                <span className="investor-mini-label">Projects with any overdue line</span>
                <span className="investor-mini-value">{health?.projectsOverdue ?? "—"}</span>
              </div>
              <div>
                <span className="investor-mini-label">Expected IRR range (model)</span>
                <span className="investor-mini-value">{health?.irrRange ?? "—"}</span>
              </div>
            </div>
            {health?.disclaimer ? (
              <Text type="secondary" className="investor-health-disclaimer">
                {health.disclaimer}
              </Text>
            ) : null}
          </Card>
        </div>
        </div>
      </Spin>

      <Card className="investor-tax-bar" bordered={false}>
        <div className="investor-tax-bar-inner">
          <div>
            <div className="investor-support-title">Tax / compliance exports</div>
            <div className="investor-support-sub">
              Request formal statements for your records.
            </div>
          </div>
          <Button className="investor-btn-light">Request statement</Button>
        </div>
      </Card>
    </div>
  );
}

export default InvestorPayments;
