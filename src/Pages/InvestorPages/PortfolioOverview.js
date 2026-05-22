import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Card,
  DatePicker,
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
import { DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
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
import { fetchInvestorPortfolioOverview } from "../../redux/actions/investor/investor.action";
import { formatCompactNgn } from "../../helpers/investorPortfolioMappers";

dayjs.extend(relativeTime);

const PORTFOLIO_ACTIVITY_PREVIEW_LIMIT = 5;

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TextArea } = Input;

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

  const [range, setRange] = useState([
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
      {
        title: "Installation",
        key: "installation",
        width: 200,
        render: (_, row) => (
          <div className="investor-project-cell">
            <div className="investor-project-name">{row.installationTitle}</div>
            <div className="investor-project-branch">{row.installationSub}</div>
          </div>
        ),
      },
      {
        title: "Status (last posted)",
        key: "status",
        width: 170,
        render: (_, row) => (
          <HealthCell
            dot={row.healthDot}
            label={row.healthLabel}
            posted={formatPosted(row)}
          />
        ),
      },
      {
        title: "Capacity (kWp)",
        dataIndex: "capacityKwp",
        key: "capacityKwp",
        width: 120,
      },
      {
        title: "Project cost",
        dataIndex: "projectCostDisplay",
        key: "projectCostDisplay",
        width: 120,
      },
      {
        title: "ROI",
        key: "kpiRemark",
        width: 140,
        render: (_, row) => (
          <div className="investor-financed-kpi-cell">
            <div className="investor-financed-kpi-main">{row.kpiRemarkMain}</div>
            {row.kpiRemarkSub ? (
              <Text type="secondary" className="investor-financed-kpi-sub">
                {row.kpiRemarkSub}
              </Text>
            ) : null}
          </div>
        ),
      },
      {
        title: "Energy yield (kWh)",
        key: "energy",
        width: 140,
        render: (_, row) => (
          <div className="investor-financed-energy-cell">
            <div className="investor-financed-energy-kwh">{row.energyKwhDisplay}</div>
            <Text type="secondary" className="investor-financed-energy-ngn">
              {row.energyValueDisplay}
            </Text>
          </div>
        ),
      },
      {
        title: "Carbon offset",
        dataIndex: "carbonDisplay",
        key: "carbonDisplay",
        width: 110,
      },
      {
        title: "Portfolio score",
        key: "repayment",
        width: 200,
        render: (_, row) => (
          <div className="investor-financed-repay-cell">
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
      },
    ],
    []
  );

  const openSupport = () => {
    supportForm.resetFields();
    supportForm.setFieldsValue({ topic: "General support", priority: "Normal" });
    setSupportOpen(true);
  };

  const submitSupport = async () => {
    try {
      const values = await supportForm.validateFields();
      message.success("Your request has been sent to Wyre support.");
      setSupportOpen(false);
      supportForm.resetFields();
      return values;
    } catch {
      return null;
    }
  };

  return (
    <div className="investor-page">
      <div className="investor-header">
        <div className="investor-header-left">
          <Title level={3} className="investor-page-title">
            Portfolio overview
          </Title>
          <Text type="secondary" className="investor-page-subtitle">
            Solar receivables across your financed branches
          </Text>
        </div>

        <div className="investor-header-actions">
          {/* <RangePicker
            value={range}
            onChange={(next) => {
              if (!next) return;
              setRange(next);
            }}
            allowClear={false}
            className="investor-range"
          /> */}
          <Button icon={<FileTextOutlined />} className="investor-btn-light investor-header-btn">
            Export statement
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} className="investor-header-btn investor-header-btn--primary">
            Download report
          </Button>
        </div>
      </div>

      {portfolioOverview.error ? (
        <Alert
          type="error"
          showIcon
          className="investor-alert"
          message={portfolioOverview.error}
        />
      ) : null}

      {!portfolioOverview.error && portfolioOverview.partialErrors?.length ? (
        <Alert
          type="info"
          showIcon
          className="investor-alert"
          message="Some sections could not be loaded. You can try another date range or refresh the page."
        />
      ) : null}

      {portfolioOverview.alert ? (
        <Alert
          type={portfolioOverview.alert.type}
          showIcon
          className="investor-alert"
          message={portfolioOverview.alert.message}
        />
      ) : null}

      <Spin spinning={portfolioOverview.loading}>
        <div className="investor-metrics">
          <Card
            bordered={false}
            className="investor-metric-card investor-metric-card--primary"
          >
            <div className="investor-metric-label">Total invested</div>
            <div className="investor-metric-value">
              {kpis.primaryInvested?.amount != null
                ? formatCompactNgn(kpis.primaryInvested.amount)
                : "—"}
            </div>
            <div className="investor-metric-primary-stack">
              <div>
                Payments received{" "}
                {kpis.primaryInvested?.paymentsReceived != null
                  ? formatCompactNgn(kpis.primaryInvested.paymentsReceived)
                  : "—"}
              </div>
              <div>
                Outstanding{" "}
                {kpis.primaryInvested?.outstanding != null
                  ? formatCompactNgn(kpis.primaryInvested.outstanding)
                  : "—"}
              </div>
            </div>
          </Card>

          <Card bordered={false} className="investor-metric-card">
            <div className="investor-metric-label">Portfolio score</div>
            <div className="investor-metric-value">
              {kpis.portfolioScore?.display ?? "—"}
            </div>
            <div className="investor-metric-sub">{kpis.portfolioScore?.sub}</div>
          </Card>

          <Card bordered={false} className="investor-metric-card">
            <div className="investor-metric-label">Portfolio generation</div>
            <div className="investor-metric-value">
              {kpis.portfolioGeneration?.value ?? "—"}
            </div>
            {(kpis.portfolioGeneration?.nairaSub ?? kpis.portfolioGeneration?.sub) ? (
              <div className="investor-metric-sub">
                {kpis.portfolioGeneration?.nairaSub ?? kpis.portfolioGeneration?.sub}
              </div>
            ) : null}
          </Card>

          <Card bordered={false} className="investor-metric-card">
            <div className="investor-metric-label">CO₂ offset</div>
            <div className="investor-metric-value">{kpis.co2?.value ?? "—"}</div>
            <div className="investor-metric-sub">{kpis.co2?.sub}</div>
          </Card>
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
        <div className="table-responsive-wrapper investor-table-wrap">
          <Table
            className="investor-table investor-financed-table"
            columns={columns}
            dataSource={filteredProjects}
            pagination={false}
            size="middle"
            rowKey="key"
            loading={portfolioOverview.loading}
            scroll={{ x: 1100 }}
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
            Aggregated for branches you finance (telemetry may vary by site).
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
          <Button key="create" type="primary" onClick={submitSupport}>
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
              <Select
                options={[
                  { value: "General support", label: "General support" },
                  { value: "Project inquiry", label: "Project inquiry" },
                  { value: "Repayment inquiry", label: "Repayment inquiry" },
                  { value: "Generation dispute", label: "Generation dispute" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="priority"
              label="Priority"
              className="investor-modal-item"
              rules={[{ required: true, message: "Select a priority" }]}
            >
              <Select
                options={[
                  { value: "Normal", label: "Normal" },
                  { value: "High", label: "High" },
                  { value: "Urgent", label: "Urgent" },
                ]}
              />
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
