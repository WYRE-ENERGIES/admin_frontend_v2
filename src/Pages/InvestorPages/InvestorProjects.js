import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import { mapProjectDetail } from "../../helpers/investorProjectsMappers";
import { buildProjectsReportRows } from "../../helpers/investorReportExport";
import { runInvestorReportDownload } from "../../helpers/investorReportDownload";
import {
  fetchInvestorProjectDetail,
  fetchInvestorProjects,
  submitInvestorProjectContactWyre,
} from "../../redux/actions/investor/investor.action";

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
  const s = String(status || "").toLowerCase().replace(/_/g, " ").trim();
  if (!s) return "—";
  if (s === "on track") return "On track";
  if (s === "active") return "Active";
  if (s === "underperforming") return "Underperforming";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function statusTag(status) {
  const s = String(status || "").toLowerCase().replace(/_/g, " ");
  if (s === "on track" || s === "active") {
    return <Tag color="green">{displayStatus(status)}</Tag>;
  }
  if (s === "overdue") return <Tag color="red">Overdue</Tag>;
  if (s === "underperforming") {
    return <Tag color="gold">{displayStatus(status)}</Tag>;
  }
  if (s.includes("review")) return <Tag color="gold">{displayStatus(status)}</Tag>;
  return <Tag color="gold">{displayStatus(status)}</Tag>;
}

const REPAYMENT_OPTIONS = [
  { value: "no_preference", label: "No preference" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "Yearly", label: "Yearly" },
  { value: "In full", label: "In full" },
];

function InvestorProjects() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const supportPath = location.pathname.startsWith("/__investor_preview")
    ? "/__investor_preview/support"
    : "/support";
  const paymentsPath = location.pathname.startsWith("/__investor_preview")
    ? "/__investor_preview/payments"
    : "/payments";
  const {
    projects: bundle,
    projectsLoading,
    projectsPartialErrors,
  } = useSelector((s) => s.investorPage);
  const [projectTab, setProjectTab] = useState("Financed");
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [projectDetail, setProjectDetail] = useState(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [selectedOpenProject, setSelectedOpenProject] = useState(null);
  const [form] = Form.useForm();

  const refreshProjects = useCallback(() => {
    dispatch(fetchInvestorProjects());
  }, [dispatch]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const summary = bundle?.summary;
  const list = bundle?.projects || [];
  const openList = bundle?.openProjects || [];
  const tickets = bundle?.investmentTickets || [];

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
        value: summary?.portfolioGenerationYtdDisplay ?? "—",
        sub: "Year to date",
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

  const openProjectDetail = async (project) => {
    const projectId = project.projectId ?? project.id;
    if (!projectId) return;
    setDetailModalOpen(true);
    setDetailLoading(true);
    setProjectDetail(null);
    const res = await dispatch(fetchInvestorProjectDetail(projectId));
    setDetailLoading(false);
    if (!res.fulfilled) {
      message.error(res.message || "Could not load project detail");
      setDetailModalOpen(false);
      return;
    }
    setProjectDetail(mapProjectDetail(res.data));
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
      const projectId = proj.projectId ?? proj.id;
      const payload = {
        amount_intended: Number(values.amount_intended),
        message: values.message || "",
      };
      if (values.repayment_preference && values.repayment_preference !== "no_preference") {
        payload.repayment_preference = values.repayment_preference;
      }
      setContactSubmitting(true);
      const res = await dispatch(submitInvestorProjectContactWyre(projectId, payload));
      setContactSubmitting(false);
      if (!res.fulfilled) {
        message.error(res.message || "Could not submit investment interest");
        return;
      }
      message.success(res.message || "Wyre has received your investment interest.");
      setInvestModalOpen(false);
      setSelectedOpenProject(null);
    } catch {
      setContactSubmitting(false);
    }
  };

  const sectionTitle =
    projectTab === "Financed"
      ? "Financed projects"
      : "Open projects (available to invest)";

  const handleDownloadReport = async () => {
    const { title, filename, rows } = buildProjectsReportRows(bundle);
    await runInvestorReportDownload({
      title,
      filename,
      rows,
      emptyMessage: "No project data available to export yet.",
    });
  };

  return (
    <div className="investor-page investor-projects-page">
      {projectsPartialErrors?.length ? (
        <Alert
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          message="Some project data could not be loaded"
          description="Showing the sections that are available. Refresh the page or try again later."
        />
      ) : null}

      <InvestorPageHeader
        title="Projects"
        subtitle="Financed sites, open pools, and investment tickets from your Wyre portfolio."
        onDownloadReport={handleDownloadReport}
      />

      <Spin spinning={projectsLoading} wrapperClassName="investor-projects-spin">
        <div className="investor-projects-body">
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
          {!projectsLoading && list.length === 0 ? (
            <Text type="secondary">No financed projects yet.</Text>
          ) : null}
          {list.map((p) => (
            <Card key={p.id} className="investor-project-tile" bordered={false}>
              <div className="investor-project-tile-head">
                <div className="investor-project-tile-name">{p.name}</div>
                {statusTag(p.status)}
              </div>
              <Text type="secondary" className="investor-project-tile-meta">
                {p.branchLabel}
                {p.contractStart ? (
                  <>
                    <br />
                    {p.contractStart}
                  </>
                ) : null}
              </Text>
              <div className="investor-project-tile-grid">
                <div>
                  <span className="investor-mini-label">Your share (%)</span>
                  <span className="investor-mini-value">
                    {typeof p.sharePct === "number" ? `${p.sharePct}%` : p.sharePct}
                  </span>
                </div>
                <div>
                  <span className="investor-mini-label">System size (kWp)</span>
                  <span className="investor-mini-value">{p.systemKwp}</span>
                </div>
                <div>
                  <span className="investor-mini-label">Project cost (₦)</span>
                  <span className="investor-mini-value">{ngnCompact(p.projectCostNgn)}</span>
                </div>
                <div>
                  <span className="investor-mini-label">Invested (₦)</span>
                  <span className="investor-mini-value">{ngnCompact(p.investedNgn)}</span>
                </div>
                <div>
                  <span className="investor-mini-label">MTD generation (MWh)</span>
                  <span className="investor-mini-value">{p.mtdMwh}</span>
                </div>
                <div>
                  <span className="investor-mini-label">Repayment</span>
                  <span className="investor-mini-value">{p.repaymentDisplay}</span>
                </div>
              </div>
              <div className="investor-project-tile-foot">
                <span className="investor-project-tile-savings">{p.footerLeft}</span>
                <Button
                  type="link"
                  size="small"
                  className="investor-project-tile-link"
                  onClick={() =>
                    navigate(
                      `${paymentsPath}?investment_id=${encodeURIComponent(String(p.investmentId ?? p.id))}`
                    )
                  }
                >
                  {p.footerLink} <ArrowRightOutlined />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="investor-project-grid">
          {!projectsLoading && openList.length === 0 ? (
            <Text type="secondary">No open projects available right now.</Text>
          ) : null}
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

              <div className="investor-open-project-actions">
                <div className="investor-open-project-foot">
                  <Button type="link" size="small" onClick={() => openProjectDetail(p)}>
                    View cost breakdown
                  </Button>
                </div>

                <div className="investor-open-cta">
                  <Button
                    type="primary"
                    className="investor-open-contact-btn"
                    disabled={!(Number(p.remainingNgn) > 0) || p.isAvailable === false}
                    onClick={() => openInvestModal(p)}
                  >
                    Contact Wyre to invest
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

          <div className="investor-projects-bottom">
          <Card className="investor-tickets-card" bordered={false}>
        <div className="investor-tickets-head">
          <Title level={5} className="investor-tickets-title" style={{ margin: 0 }}>
            My investment tickets
          </Title>
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
                  <Text className="investor-ticket-title">
                    {t.subject || t.projectName || "Investment request"}
                  </Text>
                  <div className="investor-ticket-meta">
                    <Text type="secondary">
                      {t.priority ? `${t.priority} · ` : ""}
                      {formatTicketTime(t.createdAt)}
                    </Text>
                  </div>
                  {t.amountIntendedNgn != null ? (
                    <div className="investor-ticket-meta">
                      <Text type="secondary">Amount intended: {ngn(t.amountIntendedNgn)}</Text>
                    </div>
                  ) : null}
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
          <Button
            type="primary"
            className="investor-support-cta"
            onClick={() => navigate(supportPath)}
          >
            Contact Wyre support
          </Button>
        </div>
          </Card>
          </div>
        </div>
      </Spin>

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
          <Button
            key="ok"
            type="primary"
            loading={contactSubmitting}
            onClick={submitInvestmentTicket}
          >
            Create investment ticket
          </Button>,
        ]}
        destroyOnClose
        width={520}
      >
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
                max={
                  selectedOpenProject?.remainingNgn
                    ? Number(selectedOpenProject.remainingNgn)
                    : undefined
                }
                style={{ width: "100%" }}
                placeholder="e.g. 5000000"
                controls={false}
                formatter={(v) => (v != null ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "")}
                parser={(v) => v.replace(/,/g, "")}
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
            </div>
          </div>

          <Form.Item name="message" label="Message to Wyre">
            <TextArea rows={4} placeholder="Any context, questions, or constraints? (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={null}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setProjectDetail(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
          projectDetail?.remainingNgn > 0 ? (
            <Button
              key="invest"
              type="primary"
              onClick={() => {
                setDetailModalOpen(false);
                openInvestModal(projectDetail);
              }}
            >
              Contact Wyre to invest
            </Button>
          ) : null,
        ]}
        width={640}
        className="investor-modal investor-project-detail-modal"
        destroyOnClose
      >
        <Spin spinning={detailLoading}>
          {projectDetail ? (
            <div className="investor-project-detail">
              <div className="investor-project-detail-head">
                <div>
                  <Title level={4} className="investor-project-detail-title">
                    {projectDetail.name}
                  </Title>
                  <Text type="secondary" className="investor-project-detail-location">
                    {[projectDetail.locationLabel, projectDetail.city]
                      .filter(Boolean)
                      .join(" · ") || projectDetail.branchLabel || "Location not specified"}
                  </Text>
                </div>
                <Tag color="green" className="investor-open-pill">
                  {projectDetail.status || "Available"}
                </Tag>
              </div>

              <div className="investor-project-detail-progress">
                <div className="investor-project-detail-progress-meta">
                  <Text type="secondary">
                    {ngnCompact(projectDetail.raisedNgn ?? projectDetail.investorTargetNgn - (projectDetail.remainingNgn ?? 0))} raised
                    {" · "}
                    {ngnCompact(projectDetail.remainingNgn)} remaining
                  </Text>
                  <Text strong>{projectDetail.raisedPct ?? 0}% funded</Text>
                </div>
                <Progress
                  percent={projectDetail.raisedPct ?? 0}
                  showInfo={false}
                  strokeColor="#5BB56F"
                />
              </div>

              <div className="investor-open-metrics investor-project-detail-metrics">
                <div className="investor-open-metric">
                  <span className="investor-open-metric-label">System size</span>
                  <span className="investor-open-metric-value">{projectDetail.systemKwp} kWp</span>
                </div>
                <div className="investor-open-metric">
                  <span className="investor-open-metric-label">Total project cost</span>
                  <span className="investor-open-metric-value">{ngnCompact(projectDetail.totalCostNgn)}</span>
                </div>
                <div className="investor-open-metric">
                  <span className="investor-open-metric-label">Client contribution</span>
                  <span className="investor-open-metric-value">{ngnCompact(projectDetail.clientContributionNgn)}</span>
                </div>
                <div className="investor-open-metric">
                  <span className="investor-open-metric-label">Investor target</span>
                  <span className="investor-open-metric-value">{ngn(projectDetail.investorTargetNgn)}</span>
                </div>
                <div className="investor-open-metric investor-open-metric--highlight">
                  <span className="investor-open-metric-label">Remaining pool</span>
                  <span className="investor-open-metric-value">{ngn(projectDetail.remainingNgn)}</span>
                </div>
                {projectDetail.projectType ? (
                  <div className="investor-open-metric">
                    <span className="investor-open-metric-label">Project type</span>
                    <span className="investor-open-metric-value">
                      {String(projectDetail.projectType).replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="investor-project-detail-breakdown">
                <Title level={5} className="investor-project-detail-breakdown-title">
                  Cost breakdown
                </Title>
                {projectDetail.breakdownItems?.length ? (
                  <>
                    <div className="investor-project-detail-breakdown-list">
                      {projectDetail.breakdownItems.map((row) => (
                        <div key={row.key} className="investor-project-detail-breakdown-row">
                          <div className="investor-project-detail-breakdown-main">
                            <span className="investor-project-detail-breakdown-label">{row.label}</span>
                            {row.category ? (
                              <Tag className="investor-project-detail-breakdown-tag">{row.category}</Tag>
                            ) : null}
                          </div>
                          <span className="investor-project-detail-breakdown-amount">{row.amountDisplay}</span>
                        </div>
                      ))}
                    </div>
                    {projectDetail.totalBreakdown != null ? (
                      <div className="investor-project-detail-breakdown-total">
                        <span>Total breakdown</span>
                        <span>{ngn(projectDetail.totalBreakdown)}</span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <Text type="secondary" className="investor-project-detail-breakdown-empty">
                    No cost breakdown published for this project yet.
                  </Text>
                )}
              </div>
            </div>
          ) : (
            !detailLoading && <Text type="secondary">No detail available.</Text>
          )}
        </Spin>
      </Modal>
    </div>
  );
}

export default InvestorProjects;
