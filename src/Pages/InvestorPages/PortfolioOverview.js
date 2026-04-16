import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Segmented,
  Space,
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
  const [range, setRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [projectFilter, setProjectFilter] = useState("All");

  const financedProjects = useMemo(
    () => [
      {
        key: "1",
        project: "Access Ayobo 2",
        branch: "Branch ID 2104 - Lagos",
        system: "45 kWp",
        share: "18%",
        invested: currency(9200000),
        status: "On track",
      },
      {
        key: "2",
        project: "Access Idasho Ibeju",
        branch: "Branch ID 2841 - Lagos",
        system: "60 kWp",
        share: "25%",
        invested: currency(12000000),
        status: "Overdue",
      },
      {
        key: "3",
        project: "Access Akpana",
        branch: "Branch ID 1988 - Oyo",
        system: "30 kWp",
        share: "12%",
        invested: currency(4000000),
        status: "On track",
      },
      {
        key: "4",
        project: "Access Amuwo Odofin",
        branch: "Branch ID 2230 - Lagos",
        system: "52 kWp",
        share: "15%",
        invested: currency(8400000),
        status: "On track",
      },
      {
        key: "5",
        project: "Wyre Office pilot",
        branch: "Branch ID 9001 - HQ",
        system: "15 kWp",
        share: "40%",
        invested: currency(3500000),
        status: "Review",
      },
    ],
    []
  );

  const filteredProjects = useMemo(() => {
    if (projectFilter === "All") return financedProjects;
    if (projectFilter === "On track")
      return financedProjects.filter((p) => p.status === "On track");
    return financedProjects.filter((p) => p.status !== "On track");
  }, [financedProjects, projectFilter]);

  const activity = useMemo(
    () => [
      { key: "a1", date: "Apr 2", label: "Portfolio credit", amount: "+ ₦842,000" },
      { key: "a2", date: "Mar 28", label: "Installment (2104)", amount: "+ ₦310,000" },
      { key: "a3", date: "Mar 15", label: "Missed (2841)", amount: "NO" },
      { key: "a4", date: "Mar 1", label: "Portfolio credit", amount: "+ ₦1.02M" },
    ],
    []
  );

  const chartData = useMemo(
    () => [
      { week: "W1", solar: 18, site: 10 },
      { week: "W2", solar: 22, site: 9 },
      { week: "W3", solar: 16, site: 11 },
      { week: "W4", solar: 25, site: 10 },
      { week: "W5", solar: 21, site: 12 },
      { week: "W6", solar: 23, site: 10 },
    ],
    []
  );

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
            Solar receivables across financed branches — sample data for UI review
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

      <Alert
        type="warning"
        showIcon
        className="investor-alert"
        message={
          <span>
            <b>1 project</b> has an overdue installment (Branch #2841). Wyre has
            been notified. Customer-identifying details are hidden per policy.
          </span>
        }
      />

      <div className="investor-metrics">
        <MetricCard
          label="Total invested"
          value={currency(48200000)}
          subLabel="Across 6 active projects"
          variant="primary"
        />
        <MetricCard
          label="Repayments received"
          value={currency(12400000)}
          subLabel="Lifetime to date"
        />
        <MetricCard
          label="Outstanding"
          value={currency(35800000)}
          subLabel="Principal + scheduled interest"
        />
        <MetricCard
          label="Portfolio generation"
          value="431.3k kWh"
          subLabel="Cumulative (period)"
        />
      </div>

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
            </div>
            <Text type="secondary" className="investor-chart-footnote">
              Placeholder chart — live data would come from Datalog / Deye telemetry
              per branch you finance.
            </Text>
          </Card>

          <Card
            title={<span className="investor-card-heading investor-card-heading--caps">Recent payment activity</span>}
            className="investor-card"
            bordered={false}
            style={{ marginTop: 14 }}
          >
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              {activity.map((a) => (
                <div key={a.key} className="investor-activity-row">
                  <div className="investor-activity-left">
                    <div className="investor-activity-date">{a.date}</div>
                    <div className="investor-activity-label">{a.label}</div>
                  </div>
                  <div
                    className={`investor-activity-amount ${
                      a.amount === "NO" ? "is-bad" : "is-good"
                    }`}
                  >
                    {a.amount}
                  </div>
                </div>
              ))}
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

