import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import { fetchInvestorProjects } from "../../redux/actions/investor/investor.action";

const { Text, Title } = Typography;
const { TextArea } = Input;

const ngn = (n) =>
  `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const ngnCompact = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  if (num >= 1e9) return `₦${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `₦${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `₦${(num / 1e3).toFixed(0)}k`;
  return ngn(num);
};

const formatTicketTime = (iso) => {
  if (!iso) return "—";
  const d = dayjs(iso);
  if (!d.isValid()) return "—";
  return d.format("MMM D, YYYY · h:mm A");
};

const statusPillColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("resolved")) return "green";
  if (s.includes("review")) return "gold";
  if (s.includes("pending")) return "orange";
  return "blue";
};

function displayStatus(status) {
  const s = String(status || "").toLowerCase().replace(/_/g, " ");
  if (s === "on track") return "On track";
  return status || "—";
}

function statusTag(status) {
  const s = String(status || "").toLowerCase().replace(/_/g, " ");
  if (s === "on track") return <Tag color="green">On track</Tag>;
  if (s === "overdue") return <Tag color="red">Overdue</Tag>;
  return <Tag color="gold">{displayStatus(status)}</Tag>;
}

const REPAYMENT_OPTIONS = [
  { value: "no_preference", label: "No preference" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "bullet", label: "Bullet" },
];

function InvestorProjects() {
  const dispatch = useDispatch();
  const { projects: bundle } = useSelector((s) => s.investorPage);
  const [range, setRange] = useState([
    dayjs().month(0).date(1),
    dayjs().month(3).endOf("month"),
  ]);
  const [projectTab, setProjectTab] = useState("Financed");
  const [tickets, setTickets] = useState([]);
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [selectedOpenProject, setSelectedOpenProject] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchInvestorProjects());
  }, [dispatch]);

  useEffect(() => {
    const incoming = bundle?.investmentTickets;
    if (Array.isArray(incoming) && incoming.length > 0) {
      setTickets(incoming);
    }
  }, [bundle?.investmentTickets]);

  const summary = bundle?.summary;
  const list = bundle?.projects || [];
  const openList = bundle?.openProjects || [];

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
        value:
          summary?.portfolioAcKwp != null
            ? `${summary.portfolioAcKwp} kWp`
            : "—",
        sub: "Nameplate (your tranches)",
      },
      {
        key: "c",
        label: "Portfolio generation · YTD",
        value:
          summary?.portfolioGenerationYtdKwh != null
            ? `${Math.round(summary.portfolioGenerationYtdKwh / 1000)}k kWh`
            : "—",
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

  const openInvestModal = (project) => {
    setSelectedOpenProject(project);
    form.resetFields();
    form.setFieldsValue({
      project: project?.name,
      repayment_preference: "no_preference",
    });
    setInvestModalOpen(true);
  };

  const submitInvestmentTicket = async () => {
    try {
      const values = await form.validateFields();
      const proj = selectedOpenProject;
      if (!proj) return;
      if (!(Number(proj.remainingNgn) > 0)) {
        message.warning("This pool has no remaining allocation.");
        return;
      }
      const amount = Number(values.amount_intended);
      const ticket = {
        id: `t_${Date.now()}`,
        projectName: proj.name,
        amountIntendedNgn: amount,
        repaymentPreference: values.repayment_preference,
        message: values.message || "",
        createdAt: new Date().toISOString(),
        status: "Open",
      };
      setTickets((prev) => [ticket, ...prev]);
      message.success("Investment ticket created (mock — will map to SupportTicket when wired).");
      setInvestModalOpen(false);
      setSelectedOpenProject(null);
    } catch {
      /* validation */
    }
  };

  const sectionTitle =
    projectTab === "Financed"
      ? "Financed projects"
      : "Open projects (available to invest)";

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

      <Text type="secondary" className="investor-projects-instruction">
        Browse financed sites below, or switch to{" "}
        <Text strong>Open projects</Text> and click{" "}
        <Text strong>Contact Wyre to invest</Text> to open a ticket with our
        team.
      </Text>

      <div className="investor-metrics investor-metrics--four">
        {kpis.map((k) => (
          <Card
            key={k.key}
            bordered={false}
            className={`investor-metric-card${
              k.primary ? " investor-metric-card--primary" : ""
            }`}
          >
            <div className="investor-metric-label">{k.label}</div>
            <div className="investor-metric-value">{k.value}</div>
            <div className="investor-metric-sub">{k.sub}</div>
          </Card>
        ))}
      </div>

      <div className="investor-section-head investor-projects-section-head">
        <Title level={4} className="investor-section-title" style={{ margin: 0 }}>
          {sectionTitle}
        </Title>
        <Segmented
          options={["Financed", "Open projects"]}
          value={projectTab}
          onChange={setProjectTab}
          size="small"
          className="investor-segmented"
        />
      </div>

      {projectTab === "Financed" ? (
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
                  <span className="investor-mini-value">
                    {ngn(p.outstandingNgn)}
                  </span>
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
      ) : (
        <div className="investor-project-grid">
          {openList.map((p) => (
            <Card
              key={p.id}
              className="investor-project-tile investor-open-project-tile"
              bordered={false}
            >
              <div className="investor-project-tile-head">
                <div className="investor-project-tile-name">{p.name}</div>
                <Tag color="green" className="investor-open-pill">
                  {p.status || "Available"}
                </Tag>
              </div>
              <Text type="secondary" className="investor-project-tile-meta">
                {`Project pool (investors): ${ngnCompact(p.investorTargetNgn)} · Remaining: ${ngnCompact(p.remainingNgn)}`}
                {p.summaryLine ? ` · ${p.summaryLine.replace(/^Remaining:\s*/i, "")}` : ""}
              </Text>
              <div className="investor-open-metrics">
                <div className="investor-open-metric">
                  <span className="investor-open-metric-label">System size</span>
                  <span className="investor-open-metric-value">{p.systemKwp} kWp</span>
                </div>
                <div className="investor-open-metric">
                  <span className="investor-open-metric-label">Total project cost</span>
                  <span className="investor-open-metric-value">{ngnCompact(p.totalCostNgn)}</span>
                </div>
                <div className="investor-open-metric">
                  <span className="investor-open-metric-label">Client contribution</span>
                  <span className="investor-open-metric-value">{ngnCompact(p.clientContributionNgn)}</span>
                </div>
                <div className="investor-open-metric">
                  <span className="investor-open-metric-label">Investor target</span>
                  <span className="investor-open-metric-value">{ngnCompact(p.investorTargetNgn)}</span>
                </div>
              </div>

              <div className="investor-open-cta">
                <Button
                  type="primary"
                  className="investor-open-contact-btn"
                  disabled={!(Number(p.remainingNgn) > 0)}
                  onClick={() => openInvestModal(p)}
                >
                  Contact Wyre to invest
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="investor-tickets-card" bordered={false}>
        <div className="investor-tickets-head">
          <Title level={5} className="investor-tickets-title" style={{ margin: 0 }}>
            My investment tickets
          </Title>
          <Tag className="investor-tickets-tag">
            SupportTicket · tagged [INVESTMENT]
          </Tag>
        </div>
        {tickets.length === 0 ? (
          <Text type="secondary" className="investor-tickets-empty">
            No tickets yet. Use &apos;Open projects&apos; and click &apos;Contact
            Wyre to invest&apos;.
          </Text>
        ) : (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {tickets.map((t) => (
              <div key={t.id} className="investor-ticket-row">
                <div>
                  <Text strong className="investor-ticket-title">
                    [INVESTMENT] {t.projectName}
                  </Text>
                  <div className="investor-ticket-meta">
                    <Text type="secondary">
                      Ticket {String(t.id).replace(/^t_/, "TCK-")} · {formatTicketTime(t.createdAt)}
                    </Text>
                  </div>
                  <div className="investor-ticket-meta">
                    <Text type="secondary">Amount intended: {ngn(t.amountIntendedNgn)}</Text>
                  </div>
                  {t.message ? (
                    <Text type="secondary" className="investor-ticket-msg">
                      {t.message}
                    </Text>
                  ) : null}
                </div>
                <Tag color={statusPillColor(t.status)} className="investor-ticket-pill">
                  {t.status}
                </Tag>
              </div>
            ))}
          </Space>
        )}
      </Card>

      <Card
        className="investor-support-card investor-support-card--peach investor-projects-support"
        bordered={false}
      >
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

      <Modal
        title="Contact Wyre to invest"
        open={investModalOpen}
        onCancel={() => {
          setInvestModalOpen(false);
          setSelectedOpenProject(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setInvestModalOpen(false);
              setSelectedOpenProject(null);
            }}
          >
            Cancel
          </Button>,
          <Button key="ok" type="primary" onClick={submitInvestmentTicket}>
            Create investment ticket
          </Button>,
        ]}
        destroyOnClose
        width={520}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Create an Investment support ticket for Wyre"
        />
        <Form form={form} layout="vertical">
          <div className="investor-modal-grid">
            <Form.Item name="project" label="Project" className="investor-modal-item">
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="amount_intended"
              label="Amount intended (₦)"
              className="investor-modal-item"
              rules={[{ required: true, message: "Enter an amount" }]}
            >
              <InputNumber
                min={1}
                disabled
                style={{ width: "100%" }}
                placeholder="e.g. 5000000"
                controls={false}
              />
            </Form.Item>

            <Form.Item
              name="repayment_preference"
              label="Repayment preference"
              className="investor-modal-item"
              rules={[{ required: true }]}
            >
              <Select options={REPAYMENT_OPTIONS} />
            </Form.Item>

            <div className="investor-modal-item">
              <div className="ant-form-item-label">
                <label>Remaining pool</label>
              </div>
              <div className="investor-modal-remaining-pill">
                {selectedOpenProject
                  ? `${ngn(selectedOpenProject.remainingNgn)} remaining (of ${ngn(
                      selectedOpenProject.investorTargetNgn
                    )})`
                  : "—"}
              </div>
              <Text type="secondary" className="investor-modal-remaining-note">
                Availability rule: remaining &gt; 0.
              </Text>
            </div>
          </div>

          <Form.Item name="message" label="Message to Wyre">
            <TextArea rows={4} placeholder="Any context, questions, or constraints? (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default InvestorProjects;
