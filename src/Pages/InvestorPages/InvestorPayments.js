import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Select, Spin, Table, Tabs, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import {
  fetchInvestorFinancedInvestments,
  fetchInvestorPayments,
  fetchInvestorProjectPayoutSchedule,
} from "../../redux/actions/investor/investor.action";

const { Text, Title } = Typography;

const LEDGER_PAGE_SIZE = 10;

function scheduleStatusTag(statusKey, label) {
  const t = String(statusKey || label || "").toLowerCase();
  if (t.includes("paid")) return <Tag color="blue">{label}</Tag>;
  if (t.includes("scheduled")) return <Tag color="green">{label}</Tag>;
  if (t.includes("overdue")) return <Tag color="red">{label}</Tag>;
  if (t.includes("pending")) return <Tag color="gold">{label}</Tag>;
  return <Tag color="default">{label}</Tag>;
}

function InvestorPayments() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    payments: bundle,
    paymentsLoading,
    paymentsPartialErrors,
  } = useSelector((s) => s.investorPage);
  const loadError = bundle?.loadError;

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
  const [scheduleError, setScheduleError] = useState(null);

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
    setScheduleError(null);
    const res = await dispatch(fetchInvestorProjectPayoutSchedule(investmentId));
    setScheduleLoading(false);
    if (!res.fulfilled) {
      setScheduleError(res.message || "Could not load payment schedule");
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
    { title: "Due", dataIndex: "due", key: "due", width: 96 },
    { title: "Branch", dataIndex: "branch", key: "branch", ellipsis: true },
    { title: "Total due", dataIndex: "totalDue", key: "totalDue", width: 104, align: "right" },
    {
      title: "Your credit",
      dataIndex: "yourCredit",
      key: "yourCredit",
      width: 104,
      align: "right",
      render: (v) => <span className="investor-pay-pos investor-table-nowrap">{v}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 108,
      render: (v, row) => scheduleStatusTag(row.statusKey, v),
    },
  ];

  const payoutScheduleCols = [
    { title: "#", dataIndex: "installmentNumber", key: "installmentNumber", width: 48 },
    { title: "Due date", dataIndex: "due", key: "due", width: 120 },
    { title: "Amount due", dataIndex: "amountDue", key: "amountDue", width: 120 },
    { title: "Amount paid", dataIndex: "amountPaid", key: "amountPaid", width: 120 },
    {
      title: "Remaining",
      dataIndex: "amountRemaining",
      key: "amountRemaining",
      width: 120,
      render: (v, row) => {
        const raw = String(row.statusKey || "");
        const isOver = raw.includes("overdue") || (v && v.startsWith("-"));
        return <span className={isOver ? "investor-pay-neg" : undefined}>{v}</span>;
      },
    },
    { title: "Paid date", dataIndex: "paidDate", key: "paidDate", width: 120 },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v, row) => scheduleStatusTag(row.statusKey, v),
    },
  ];

  const ledgerCols = [
    { title: "Date", dataIndex: "date", key: "date", width: 104 },
    { title: "Type", dataIndex: "type", key: "type", width: 96 },
    { title: "Ref", dataIndex: "ref", key: "ref", ellipsis: true },
    { title: "Customer", dataIndex: "customer", key: "customer", width: 104, align: "right" },
    {
      title: "Allocation",
      dataIndex: "allocation",
      key: "allocation",
      width: 104,
      align: "right",
      render: (v) => <span className="investor-pay-pos investor-table-nowrap">{v}</span>,
    },
    { title: "Effect", dataIndex: "effect", key: "effect", width: 96, align: "right" },
  ];

  const health = bundle?.receivableHealth;
  const ledgerMeta = bundle?.ledgerMeta;
  const scheduleSummary = payoutSchedule?.summary;

  const ledgerTabYears = useMemo(() => {
    const current = dayjs().year();
    return [
      { key: String(current), label: String(current) },
      { key: String(current - 1), label: String(current - 1) },
    ];
  }, []);

  return (
    <div className="investor-page investor-payments-page">
      {loadError ? (
        <Alert type="error" showIcon message="Could not load payments" description={loadError} />
      ) : null}

      {paymentsPartialErrors?.length ? (
        <Alert
          type="warning"
          showIcon
          closable
          message="Some payment data could not be loaded"
          description="Showing the sections that are available. Refresh the page or try again later."
        />
      ) : null}

      <InvestorPageHeader
        title="Payments & receivables"
        subtitle="Schedule, payouts, receivable health, and cash ledger from your Wyre portfolio."
        range={range}
        onRangeChange={setRange}
      />

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
              style={{ minWidth: 280 }}
              value={selectedInvestmentId ?? undefined}
              options={investmentSelectOptions}
              onChange={handleInvestmentChange}
              notFoundContent={investmentsLoading ? "Loading…" : "No financed investments"}
            />
          }
        >
          {scheduleError ? (
            <Alert type="error" showIcon message={scheduleError} style={{ marginBottom: 12 }} />
          ) : null}

          {payoutSchedule ? (
            <>
              <Text type="secondary" className="investor-payments-schedule-meta">
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
            </>
          ) : !scheduleLoading && !investmentsLoading ? (
            <Text type="secondary">Select a financed investment to view its payout schedule.</Text>
          ) : null}

          <Spin spinning={scheduleLoading}>
            <div className="table-responsive-wrapper investor-table-wrap">
              <Table
                className="investor-table"
                columns={payoutScheduleCols}
                dataSource={payoutSchedule?.installments || []}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                  hideOnSinglePage: true,
                }}
                size="small"
                rowKey="key"
                tableLayout="fixed"
                locale={{ emptyText: "No installments for this investment" }}
              />
            </div>
          </Spin>
        </Card>

        <div className="investor-payments-split">
          <Card
            title="Upcoming schedule"
            bordered={false}
            className="investor-card"
          >
            <div className="table-responsive-wrapper investor-table-wrap">
              <Table
                className="investor-table"
                columns={scheduleCols}
                dataSource={bundle?.schedule || []}
                pagination={false}
                size="small"
                rowKey="key"
                tableLayout="fixed"
                locale={{ emptyText: "No upcoming installments" }}
              />
            </div>
          </Card>

          <div className="investor-payments-stack">
            <Card
              title="Payout history"
              bordered={false}
              className="investor-card investor-card--payout-history"
            >
              {(bundle?.payoutHistory || []).length === 0 ? (
                <Text type="secondary">No payouts recorded yet.</Text>
              ) : (
                <div className="investor-payments-payout-list">
                  {(bundle?.payoutHistory || []).map((row) => (
                    <div key={row.key} className="investor-activity-row investor-payments-ph-row">
                      <div className="investor-activity-left">
                        <div className="investor-activity-label">{row.line}</div>
                      </div>
                      <div
                        className={`investor-activity-amount ${
                          row.isBad ? "is-bad" : "is-good"
                        }`}
                      >
                        {row.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Receivable health" bordered={false} className="investor-card">
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

        <Card
          title={
            <div className="investor-ledger-head">
              <Title level={5} style={{ margin: 0 }}>
                All cash movements
              </Title>
              <Tabs
                size="small"
                activeKey={ledgerYear}
                onChange={setLedgerYear}
                items={ledgerTabYears}
              />
            </div>
          }
          bordered={false}
          className="investor-card"
        >
          <div className="table-responsive-wrapper investor-table-wrap">
            <Table
              className="investor-table"
              columns={ledgerCols}
              dataSource={bundle?.ledger || []}
              pagination={{
                pageSize: LEDGER_PAGE_SIZE,
                showSizeChanger: false,
                hideOnSinglePage: true,
                ...(ledgerMeta?.total != null ? { total: ledgerMeta.total } : {}),
              }}
              size="small"
              rowKey="key"
              tableLayout="fixed"
              locale={{ emptyText: `No ledger entries for ${ledgerYear}` }}
            />
          </div>
        </Card>
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
