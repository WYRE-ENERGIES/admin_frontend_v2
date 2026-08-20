import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Segmented,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DollarOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link, useLocation } from "react-router-dom";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import {
  createInvestorSupportTicket,
  fetchInvestorPortfolioOverview,
  fetchInvestorTotalDeposited,
} from "../../redux/actions/investor/investor.action";
import { formatCompactNgn } from "../../helpers/investorPortfolioMappers";
import {
  SUPPORT_PRIORITY_OPTIONS,
  SUPPORT_TOPIC_OPTIONS,
} from "../../helpers/investorTicketUi";
import {
  buildPortfolioReportRows,
} from "../../helpers/investorReportExport";
import { runInvestorReportDownload } from "../../helpers/investorReportDownload";

dayjs.extend(relativeTime);

const PORTFOLIO_ACTIVITY_PREVIEW_LIMIT = 5;

const INVESTOR_METRIC_GRADIENT = {
  background: "linear-gradient(135deg, #5C12A7, #4c1d95)",
};
const INVESTOR_METRIC_DECORATION = { background: "rgba(255,255,255,0.06)" };

const { Title, Text } = Typography;
const { TextArea } = Input;

/** Percentage width for financed projects table (sums to 100%). */
const financedColPct = (pct, col) => ({ ...col, width: `${pct}%` });

function formatPosted(row) {
  if (row.statusPosted && row.statusPosted !== "—") return row.statusPosted;
  if (row.lastPostedIso) {
    const d = dayjs(row.lastPostedIso);
    if (d.isValid()) return d.fromNow();
  }
  return "—";
}

function HealthCell({ dot, label, posted }) {
  const dotClass = `investor-health-dot investor-health-dot--${dot}`;
  return (
    <div className="investor-financed-status-cell">
      <div className="investor-financed-status-top">
        <span className={dotClass} aria-hidden />
        <span className="investor-financed-status-label">{label}</span>
      </div>
      <Text type="secondary" className="investor-financed-status-posted">
        {posted}
      </Text>
    </div>
  );
}

function PortfolioOverview() {
  const dispatch = useDispatch();
  const location = useLocation();
  const portfolioOverview = useSelector((s) => s.investorPage.portfolioOverview);
  const supportCreateLoading = useSelector((s) => s.investorPage.supportTickets?.createLoading);

  const [range] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [projectFilter, setProjectFilter] = useState("All");
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportForm] = Form.useForm();

  const rangeKey = `${range[0]?.format("YYYY-MM")}_${range[1]?.format("YYYY-MM")}`;

  useEffect(() => {
    if (!range[0] || !range[1]) return;
    dispatch(
      fetchInvestorPortfolioOverview(
        range[0].format("YYYY-MM"),
        range[1].format("YYYY-MM")
      )
    );
  }, [dispatch, rangeKey]);

  useEffect(() => {
    dispatch(fetchInvestorTotalDeposited());
  }, [dispatch]);

  const financedProjects = portfolioOverview.financedProjects || [];

  const filteredProjects = useMemo(() => {
    if (projectFilter === "All") return financedProjects;
    if (projectFilter === "On track")
      return financedProjects.filter((p) => p.isOnTrack);
    return financedProjects.filter((p) => p.needsAttention);
  }, [financedProjects, projectFilter]);

  const activity = portfolioOverview.activity || [];
  const chartData = portfolioOverview.chartData || [];
  const kpis = portfolioOverview.kpis || {};
  const isWalletInvestor = Boolean(kpis.totalDeposited?.isWalletInvestor);

  const paymentsPagePath = location.pathname.startsWith("/__investor_preview")
    ? "/__investor_preview/payments"
    : "/payments";

  const activityPreview = useMemo(
    () => activity.slice(0, PORTFOLIO_ACTIVITY_PREVIEW_LIMIT),
    [activity]
  );
  const hasMoreActivity = activity.length > PORTFOLIO_ACTIVITY_PREVIEW_LIMIT;

  const columns = useMemo(
    () => [
      financedColPct(14, {
        title: "Installation",
        key: "installation",
        ellipsis: true,
        render: (_, row) => (
          <div className="investor-project-cell">
            <div className="investor-project-name" title={row.installationTitle}>
              {row.installationTitle}
            </div>
            <div className="investor-project-branch" title={row.installationSub}>
              {row.installationSub}
            </div>
          </div>
        ),
      }),
      financedColPct(12, {
        title: "Status",
        key: "status",
        render: (_, row) => (
          <HealthCell
            dot={row.healthDot}
            label={row.healthLabel}
            posted={formatPosted(row)}
          />
        ),
      }),
      financedColPct(11, {
        title: "kWp",
        dataIndex: "capacityKwp",
        key: "capacityKwp",
        align: "right",
        className: "investor-financed-col-numeric",
        render: (v) => <span className="investor-table-nowrap">{v}</span>,
      }),
      financedColPct(12, {
        title: "Project cost",
        key: "projectCostDisplay",
        align: "right",
        className: "investor-financed-col-numeric",
        render: (_, row) => (
          <div
            className="investor-financed-cost-cell"
            title={`${row.projectCostDisplay} · Invested ${row.investedDisplay}`}
          >
            <div className="investor-financed-cost-main">{row.projectCostDisplay}</div>
            <Text type="secondary" className="investor-financed-cost-invested">
              Invested {row.investedDisplay}
            </Text>
          </div>
        ),
      }),
      financedColPct(12, {
        title: "Yield (kWh)",
        key: "energy",
        align: "right",
        className: "investor-financed-col-numeric",
        render: (_, row) => (
          <div
            className="investor-financed-energy-cell"
            title={`${row.energyKwhDisplay} ${row.energyValueDisplay}`}
          >
            <div className="investor-financed-energy-kwh">{row.energyKwhDisplay}</div>
            <Text type="secondary" className="investor-financed-energy-ngn">
              {row.energyValueDisplay}
            </Text>
          </div>
        ),
      }),
      financedColPct(11, {
        title: "ROI",
        key: "kpiRemark",
        align: "right",
        className: "investor-financed-col-numeric",
        render: (_, row) => (
          <span
            className="investor-financed-kpi-main investor-table-nowrap"
            title={row.kpiRemarkSub || row.kpiRemarkMain}
          >
            {row.kpiRemarkMain}
          </span>
        ),
      }),
      financedColPct(14, {
        title: "Repayment",
        key: "repayment",
        ellipsis: true,
        render: (_, row) => (
          <div className="investor-financed-repay-cell" title={`${row.repaymentMain} · ${row.repaymentSub}`}>
            <div className="investor-financed-repay-main">{row.repaymentMain}</div>
            <div
              className={
                row.repaymentOverdue
                  ? "investor-financed-repay-sub investor-financed-repay-sub--overdue"
                  : "investor-financed-repay-sub"
              }
            >
              {row.repaymentSub}
            </div>
          </div>
        ),
      }),
      financedColPct(14, {
        title: "Carbon offset",
        dataIndex: "carbonDisplay",
        key: "carbonDisplay",
        align: "right",
        className: "investor-financed-col-numeric",
        render: (v) => <span className="investor-table-nowrap">{v}</span>,
      }),
    ],
    []
  );

  const submitSupport = async () => {
    try {
      const values = await supportForm.validateFields();
      const res = await dispatch(createInvestorSupportTicket(values));
      if (!res.fulfilled) {
        message.error(res.message || "Could not create support ticket");
        return;
      }
      message.success(res.message || "Your request has been sent to Wyre support.");
      setSupportOpen(false);
      supportForm.resetFields();
    } catch {
      /* validation */
    }
  };

  const openSupport = () => {
    supportForm.resetFields();
    supportForm.setFieldsValue({ topic: "General support", priority: "Normal" });
    setSupportOpen(true);
  };

  const handleDownloadReport = async () => {
    const { title, filename, rows } = buildPortfolioReportRows(portfolioOverview, range);
    await runInvestorReportDownload({
      title,
      filename,
      rows,
      emptyMessage: "Load portfolio data before downloading a report.",
    });
  };

  return (
    <div className="investor-page">
      <InvestorPageHeader
        title="Portfolio overview"
        onDownloadReport={handleDownloadReport}
      />

      <Spin spinning={portfolioOverview.loading}>
        <div
          className={`investor-metrics${isWalletInvestor ? " investor-metrics--five" : ""}`}
        >
          {isWalletInvestor ? (
            <div className="admin-investor-metric" style={INVESTOR_METRIC_GRADIENT}>
              <div
                className="admin-investor-metric-decoration admin-investor-metric-decoration--xl"
                style={INVESTOR_METRIC_DECORATION}
              />
              <div className="admin-investor-metric-mid">
                <div className="admin-investor-metric-icon">
                  <WalletOutlined />
                </div>
                <Text className="admin-investor-metric-label">Total deposited</Text>
              </div>
              <div className="admin-investor-metric-value">{kpis.totalDeposited.display}</div>
              {kpis.totalDeposited?.sub ? (
                <div className="admin-investor-metric-badges">
                  <span className="admin-investor-metric-badge">{kpis.totalDeposited.sub}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="admin-investor-metric" style={INVESTOR_METRIC_GRADIENT}>
            <div
              className="admin-investor-metric-decoration admin-investor-metric-decoration--xl"
              style={INVESTOR_METRIC_DECORATION}
            />
            <div className="admin-investor-metric-mid">
              <div className="admin-investor-metric-icon">
                <DollarOutlined />
              </div>
              <Text className="admin-investor-metric-label">Total receivables</Text>
            </div>
            <div className="admin-investor-metric-value">
              {kpis.primaryReceivables?.totalReceivable != null
                ? formatCompactNgn(kpis.primaryReceivables.totalReceivable)
                : "—"}
            </div>
            <div className="admin-investor-metric-badges">
              {kpis.primaryReceivables?.compositionSub ? (
                <span
                  className="admin-investor-metric-badge"
                  title={kpis.primaryReceivables.compositionSub}
                >
                  {kpis.primaryReceivables.compositionSub}
                </span>
              ) : null}
              <span
                className="admin-investor-metric-badge"
                title={`Payments received ${
                  kpis.primaryReceivables?.paymentsReceived != null
                    ? formatCompactNgn(kpis.primaryReceivables.paymentsReceived)
                    : "—"
                }`}
              >
                Payments received{" "}
                {kpis.primaryReceivables?.paymentsReceived != null
                  ? formatCompactNgn(kpis.primaryReceivables.paymentsReceived)
                  : "—"}
              </span>
              <span
                className="admin-investor-metric-badge"
                title={`Outstanding ${
                  kpis.primaryReceivables?.outstanding != null
                    ? formatCompactNgn(kpis.primaryReceivables.outstanding)
                    : "—"
                }`}
              >
                Outstanding{" "}
                {kpis.primaryReceivables?.outstanding != null
                  ? formatCompactNgn(kpis.primaryReceivables.outstanding)
                  : "—"}
              </span>
            </div>
          </div>

          <div className="admin-investor-metric" style={INVESTOR_METRIC_GRADIENT}>
            <div
              className="admin-investor-metric-decoration admin-investor-metric-decoration--xl"
              style={INVESTOR_METRIC_DECORATION}
            />
            <div className="admin-investor-metric-mid">
              <div className="admin-investor-metric-icon">
                <PieChartOutlined />
              </div>
              <Text className="admin-investor-metric-label">Portfolio score</Text>
            </div>
            <div className="admin-investor-metric-value">
              {kpis.portfolioScore?.display ?? "—"}
            </div>
            {(kpis.portfolioScore?.summary && kpis.portfolioScore.summary !== "—") ||
            kpis.portfolioScore?.sub ? (
              <div
                className="admin-investor-metric-caption"
                title={
                  kpis.portfolioScore?.summary && kpis.portfolioScore.summary !== "—"
                    ? kpis.portfolioScore.summary
                    : kpis.portfolioScore.sub
                }
              >
                {kpis.portfolioScore?.summary && kpis.portfolioScore.summary !== "—"
                  ? kpis.portfolioScore.summary
                  : kpis.portfolioScore.sub}
              </div>
            ) : null}
          </div>

          <div className="admin-investor-metric" style={INVESTOR_METRIC_GRADIENT}>
            <div
              className="admin-investor-metric-decoration admin-investor-metric-decoration--xl"
              style={INVESTOR_METRIC_DECORATION}
            />
            <div className="admin-investor-metric-mid">
              <div className="admin-investor-metric-icon">
                <ThunderboltOutlined />
              </div>
              <Text className="admin-investor-metric-label">Portfolio generation</Text>
            </div>
            <div className="admin-investor-metric-value">
              {kpis.portfolioGeneration?.value ?? "—"}
            </div>
            {(kpis.portfolioGeneration?.nairaSub ?? kpis.portfolioGeneration?.sub) ? (
              <div className="admin-investor-metric-badges">
                <span className="admin-investor-metric-badge">
                  {kpis.portfolioGeneration.nairaSub ?? kpis.portfolioGeneration.sub}
                </span>
              </div>
            ) : null}
          </div>

          <div className="admin-investor-metric" style={INVESTOR_METRIC_GRADIENT}>
            <div
              className="admin-investor-metric-decoration admin-investor-metric-decoration--xl"
              style={INVESTOR_METRIC_DECORATION}
            />
            <div className="admin-investor-metric-mid">
              <div className="admin-investor-metric-icon">
                <CloudOutlined />
              </div>
              <Text className="admin-investor-metric-label">CO₂ offset</Text>
            </div>
            <div className="admin-investor-metric-value">{kpis.co2?.value ?? "—"}</div>
            {kpis.co2?.sub ? (
              <div className="admin-investor-metric-badges">
                <span className="admin-investor-metric-badge">{kpis.co2.sub}</span>
              </div>
            ) : null}
          </div>
        </div>
      </Spin>

      <Card
        title={
          <div className="investor-card-title">
            <span className="investor-card-heading investor-card-heading--financed">
              Financed
            </span>
            <Segmented
              options={["All", "On track", "Attention"]}
              value={projectFilter}
              onChange={setProjectFilter}
              size="small"
              className="investor-segmented"
            />
          </div>
        }
        className="investor-card"
        bordered={false}
      >
        <div className="table-responsive-wrapper investor-table-wrap investor-table-wrap--financed">
          <Table
            className="investor-table investor-financed-table"
            columns={columns}
            dataSource={filteredProjects}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "15", "20"],
              hideOnSinglePage: true,
            }}
            size="middle"
            rowKey="key"
            loading={portfolioOverview.loading}
            tableLayout="fixed"
            locale={{ emptyText: "No financed projects in this period" }}
          />
        </div>
        <div className="investor-financed-legend">
          <span className="investor-financed-legend-item">
            <span className="investor-health-dot investor-health-dot--green" />{" "}
            Active (normal production)
          </span>
          <span className="investor-financed-legend-item">
            <span className="investor-health-dot investor-health-dot--yellow" />{" "}
            Underperforming (production {"<"} 70%)
          </span>
          <span className="investor-financed-legend-item">
            <span className="investor-health-dot investor-health-dot--red" />{" "}
            Inactive (zero output during daylight)
          </span>
        </div>
      </Card>

      <div className="investor-grid investor-grid--bottom">
        <Card
          title={
            <div className="investor-card-title">
              <span className="investor-card-heading">Performance snapshot</span>
              <Tag color="default" className="investor-tag-muted">
                This quarter
              </Tag>
            </div>
          }
          className="investor-card"
          bordered={false}
        >
          <div className="investor-chart-wrap">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="solar"
                    stackId="a"
                    fill="#FFC205"
                    name="Solar generation"
                  />
                  <Bar
                    dataKey="site"
                    stackId="a"
                    fill="#B39DDB"
                    name="Site load (proxy)"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Text type="secondary">
                {portfolioOverview.loading
                  ? "Loading chart…"
                  : "No performance data for this range."}
              </Text>
            )}
          </div>
          <Text type="secondary" className="investor-chart-footnote">
            Aggregated for projects you finance (telemetry may vary by site).
          </Text>
        </Card>

        <Card
          title={
            <span className="investor-card-heading investor-card-heading--caps">
              Recent payment activity
            </span>
          }
          className="investor-card investor-card--activity"
          bordered={false}
        >
          {activity.length ? (
            <>
              <div className="investor-activity-panel">
                {activityPreview.map((a) => (
                  <div key={a.key} className="investor-activity-row">
                    <div className="investor-activity-left">
                      <div className="investor-activity-date">{a.date}</div>
                      <div className="investor-activity-label">{a.label}</div>
                    </div>
                    <div
                      className={`investor-activity-amount ${
                        a.isBad ? "is-bad" : "is-good"
                      }`}
                    >
                      {a.amount}
                    </div>
                  </div>
                ))}
              </div>
              {hasMoreActivity ? (
                <Link to={paymentsPagePath} className="investor-activity-view-all">
                  View all {activity.length} payments →
                </Link>
              ) : null}
            </>
          ) : (
            <Text type="secondary">
              {portfolioOverview.loading
                ? "Loading activity…"
                : "No recent payment activity."}
            </Text>
          )}
        </Card>
      </div>

      <Card className="investor-support-card" bordered={false}>
        <div className="investor-support-inner">
          <div>
            <div className="investor-support-title">
              Questions about a project or repayment?
            </div>
            <div className="investor-support-sub">
              Investors contact Wyre only — we coordinate with the customer on your
              behalf.
            </div>
          </div>
          <Button type="primary" className="investor-support-cta" onClick={openSupport}>
            Contact Wyre support
          </Button>
        </div>
      </Card>

      <Modal
        title="Contact Wyre support"
        open={supportOpen}
        onCancel={() => setSupportOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setSupportOpen(false)}>
            Cancel
          </Button>,
          <Button key="create" type="primary" loading={supportCreateLoading} onClick={submitSupport}>
            Create support ticket
          </Button>,
        ]}
        destroyOnClose
        width={560}
      >
        <Text type="secondary" className="investor-support-modal-subtitle">
          Creates a general support ticket (separate from investment tickets).
        </Text>

        <Form form={supportForm} layout="vertical" style={{ marginTop: 14 }}>
          <div className="investor-modal-grid">
            <Form.Item
              name="topic"
              label="Topic"
              className="investor-modal-item"
              rules={[{ required: true, message: "Select a topic" }]}
            >
              <Select options={SUPPORT_TOPIC_OPTIONS} />
            </Form.Item>
            <Form.Item
              name="priority"
              label="Priority"
              className="investor-modal-item"
              rules={[{ required: true, message: "Select a priority" }]}
            >
              <Select options={SUPPORT_PRIORITY_OPTIONS} />
            </Form.Item>
          </div>

          <Form.Item name="message" label="Message">
            <TextArea rows={4} placeholder="Write your request to Wyre (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default PortfolioOverview;
