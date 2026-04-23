import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Segmented, Tag, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import { fetchInvestorProjects } from "../../redux/actions/investor/investor.action";

const { Text, Title } = Typography;

const ngn = (n) =>
  `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

function statusTag(status) {
  const s = String(status || "").toLowerCase();
  if (s === "on track") return <Tag color="green">On track</Tag>;
  if (s === "overdue") return <Tag color="red">Overdue</Tag>;
  return <Tag color="gold">{status}</Tag>;
}

function InvestorProjects() {
  const dispatch = useDispatch();
  const { projects: bundle } = useSelector((s) => s.investorPage);
  const [range, setRange] = useState([dayjs().month(0).date(1), dayjs().month(3).endOf("month")]);
  const [viewMode, setViewMode] = useState("Grid");

  useEffect(() => {
    dispatch(fetchInvestorProjects());
  }, [dispatch]);

  const summary = bundle?.summary;
  const list = bundle?.projects || [];

  const kpis = useMemo(
    () => [
      {
        key: "a",
        label: "Active projects",
        value: String(summary?.activeProjects ?? "—"),
        sub: "Financed & monitored",
        primary: true,
      },
      {
        key: "b",
        label: "Portfolio AC capacity",
        value: summary?.portfolioAcKwp != null ? `${summary.portfolioAcKwp} kWp` : "—",
        sub: "Nameplate (your tranches)",
      },
      {
        key: "c",
        label: "Portfolio generation · YTD",
        value: summary?.portfolioGenerationYtdKwh != null ? `${Math.round(summary.portfolioGenerationYtdKwh / 1000)}k kWh` : "—",
        sub: "Telemetry-weighted mock",
      },
      {
        key: "d",
        label: "Attention",
        value: String(summary?.attentionCount ?? "—"),
        sub: "Overdue or under review",
      },
    ],
    [summary]
  );

  return (
    <div className="investor-page investor-projects-page">
      <Alert
        type="info"
        showIcon
        className="investor-mock-banner"
        message="Temporary mockup only — not connected to Wyre backend. For investor dashboard visualization."
      />

      <InvestorPageHeader
        title="Projects"
        subtitle="Financed sites, capacity, and performance signals — sample data only."
        range={range}
        onRangeChange={setRange}
      />

      <div className="investor-metrics investor-metrics--four">
        {kpis.map((k) => (
          <Card
            key={k.key}
            bordered={false}
            className={`investor-metric-card${k.primary ? " investor-metric-card--primary" : ""}`}
          >
            <div className="investor-metric-label">{k.label}</div>
            <div className="investor-metric-value">{k.value}</div>
            <div className="investor-metric-sub">{k.sub}</div>
          </Card>
        ))}
      </div>

      <div className="investor-section-head">
        <Title level={4} className="investor-section-title" style={{ margin: 0 }}>
          All financed projects
        </Title>
        <Segmented
          options={["Grid", "Map (mock)"]}
          value={viewMode}
          onChange={setViewMode}
          size="small"
          className="investor-segmented"
        />
      </div>

      {viewMode === "Map (mock)" ? (
        <Alert
          type="warning"
          showIcon
          message="Map view is a placeholder — no geodata wired yet."
          className="investor-alert"
        />
      ) : (
        <div className="investor-project-grid">
          {list.map((p) => (
            <Card key={p.id} className="investor-project-tile" bordered={false}>
              <div className="investor-project-tile-head">
                <div className="investor-project-tile-name">{p.name}</div>
                {statusTag(p.status)}
              </div>
              <Text type="secondary" className="investor-project-tile-meta">
                {p.branchLabel}
                <br />
                {p.contractStart}
              </Text>
              <div className="investor-project-tile-grid">
                <div>
                  <span className="investor-mini-label">Your share (%)</span>
                  <span className="investor-mini-value">{p.sharePct}%</span>
                </div>
                <div>
                  <span className="investor-mini-label">System size (kWp)</span>
                  <span className="investor-mini-value">{p.systemKwp}</span>
                </div>
                <div>
                  <span className="investor-mini-label">Invested (₦)</span>
                  <span className="investor-mini-value">{ngn(p.investedNgn)}</span>
                </div>
                <div>
                  <span className="investor-mini-label">Outstanding (₦)</span>
                  <span className="investor-mini-value">{ngn(p.outstandingNgn)}</span>
                </div>
                <div>
                  <span className="investor-mini-label">MTD generation (MWh)</span>
                  <span className="investor-mini-value">{p.mtdMwh}</span>
                </div>
                <div>
                  <span className="investor-mini-label">{p.row3Left}</span>
                  <span className="investor-mini-value">{p.row3Right}</span>
                </div>
              </div>
              <div className="investor-project-tile-foot">
                <span className="investor-project-tile-savings">{p.footerLeft}</span>
                <a className="investor-project-tile-link" href="#schedule">
                  {p.footerLink} <ArrowRightOutlined />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="investor-support-card investor-projects-support" bordered={false}>
        <div className="investor-support-inner">
          <div>
            <div className="investor-support-title">
              Need to dispute generation or ask about a site?
            </div>
            <div className="investor-support-sub">
              Use Support — investors do not contact end customers directly.
            </div>
          </div>
          <Button type="primary" className="investor-support-cta">
            Contact Wyre support
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default InvestorProjects;
