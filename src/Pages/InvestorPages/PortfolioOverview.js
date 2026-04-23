import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Segmented,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
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
import { fetchInvestorPortfolioOverview } from "../../redux/actions/investor/investor.action";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const currency = (value) => {
  if (value === null || value === undefined) return "---";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₦${num.toLocaleString("en-NG")}`;
};

function MetricCard({ label, value, subLabel, variant }) {
  return (
    <Card
      className={`investor-metric-card ${
        variant === "primary" ? "investor-metric-card--primary" : ""
      }`}
      bordered={false}
    >
      <div className="investor-metric-label">{label}</div>
      <div className="investor-metric-value">{value}</div>
      {subLabel ? <div className="investor-metric-sub">{subLabel}</div> : null}
    </Card>
  );
}

function PortfolioOverview() {
  const dispatch = useDispatch();
  const portfolioOverview = useSelector((s) => s.investorPage.portfolioOverview);

  const [range, setRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [projectFilter, setProjectFilter] = useState("All");

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
      return financedProjects.filter((p) => p.status === "On track");
    return financedProjects.filter((p) => p.status !== "On track");
  }, [financedProjects, projectFilter]);

  const activity = portfolioOverview.activity || [];
  const chartData = portfolioOverview.chartData || [];
  const kpis = portfolioOverview.kpis || {};

  const columns = useMemo(
    () => [
      {
        title: "Project / Branch",
        key: "project",
        render: (_, row) => (
          <div className="investor-project-cell">
            <div className="investor-project-name">{row.project}</div>
            <div className="investor-project-branch">{row.branch}</div>
          </div>
        ),
      },
      { title: "System", dataIndex: "system", key: "system", width: 110 },
      { title: "Your share", dataIndex: "share", key: "share", width: 110 },
      { title: "Invested", dataIndex: "invested", key: "invested", width: 130 },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status) => {
          const normalized = String(status || "").toLowerCase();
          if (normalized === "on track") return <Tag color="green">On track</Tag>;
          if (normalized === "on_track") return <Tag color="green">On track</Tag>;
          if (normalized === "overdue") return <Tag color="red">Overdue</Tag>;
          return <Tag color="gold">{status}</Tag>;
        },
      },
    ],
    []
  );

  return (
    <div className="investor-page">
      <div className="investor-header">
        <div className="investor-header-left">
          <Title level={3} className="investor-page-title">
            Portfolio overview
          </Title>
          <Text type="secondary" className="investor-page-subtitle">
            Solar receivables across financed branches
          </Text>
        </div>

        <div className="investor-header-actions">
          <RangePicker
            value={range}
            onChange={(next) => {
              if (!next) return;
              setRange(next);
            }}
            allowClear={false}
            className="investor-range"
          />
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
          <MetricCard
            label="Total invested"
            value={
              kpis.totalInvested?.amount != null
                ? currency(kpis.totalInvested.amount)
                : "—"
            }
            subLabel={kpis.totalInvested?.sub}
            variant="primary"
          />
          <MetricCard
            label="Repayments / Outstanding"
            value={
              kpis.repaymentTotals?.received != null
                ? currency(kpis.repaymentTotals.received)
                : "—"
            }
            subLabel={
              kpis.repaymentTotals?.outstanding != null
                ? `Outstanding: ${currency(kpis.repaymentTotals.outstanding)}`
                : kpis.repaymentTotals?.sub
            }
          />
          <MetricCard
            label="Portfolio generation"
            value={kpis.portfolioGeneration?.value ?? "—"}
            subLabel={kpis.portfolioGeneration?.sub}
          />
          <MetricCard
            label="CO₂ offset"
            value={kpis.co2?.value ?? "—"}
            subLabel={kpis.co2?.sub}
          />
        </div>
      </Spin>

      <div className="investor-grid">
        <Card
          title={
            <div className="investor-card-title">
              <span className="investor-card-heading">Financed projects</span>
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
              className="investor-table"
              columns={columns}
              dataSource={filteredProjects}
              pagination={false}
              size="middle"
              rowKey="key"
              loading={portfolioOverview.loading}
            />
          </div>
        </Card>

        <div className="investor-right">
          <Card
            title={
              <div className="investor-card-title">
                <span className="investor-card-heading">Performance snapshot</span>
                <Tag color="default" className="investor-tag-muted">This quarter</Tag>
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
                    <Bar dataKey="solar" stackId="a" fill="#5C12A7" name="Solar generation" />
                    <Bar dataKey="site" stackId="a" fill="#FFC205" name="Site load (proxy)" />
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
            title={<span className="investor-card-heading investor-card-heading--caps">Recent payment activity</span>}
            className="investor-card"
            bordered={false}
            style={{ marginTop: 14 }}
          >
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              {activity.length ? (
                activity.map((a) => (
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
                ))
              ) : (
                <Text type="secondary">
                  {portfolioOverview.loading ? "Loading activity…" : "No recent payment activity."}
                </Text>
              )}
            </Space>
          </Card>
        </div>
      </div>

      <Card className="investor-support-card" bordered={false}>
        <div className="investor-support-inner">
          <div>
            <div className="investor-support-title">
              Questions about a project or repayment?
            </div>
            <div className="investor-support-sub">
              Investors contact Wyre only — we coordinate with the customer. This
              opens your existing support ticket flow when implemented.
            </div>
          </div>
          <Button type="primary" className="investor-support-cta">Contact Wyre support</Button>
        </div>
      </Card>
    </div>
  );
}

export default PortfolioOverview;

