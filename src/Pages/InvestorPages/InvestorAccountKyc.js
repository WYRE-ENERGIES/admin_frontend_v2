import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import { fetchInvestorAccountKyc } from "../../redux/actions/investor/investor.action";

const { Text, Title } = Typography;

function docStatusTag(status) {
  const t = String(status || "").toLowerCase();
  if (t.includes("approved") || t.includes("passed"))
    return <Tag color="success">{status}</Tag>;
  if (t.includes("not submitted")) return <Tag color="warning">{status}</Tag>;
  return <Tag>{status}</Tag>;
}

function InvestorAccountKyc() {
  const dispatch = useDispatch();
  const { accountKyc: data, accountKycLoading } = useSelector((s) => s.investorPage);
  const [range, setRange] = useState([dayjs().month(0).date(1), dayjs().month(3).endOf("month")]);

  useEffect(() => {
    dispatch(fetchInvestorAccountKyc());
  }, [dispatch]);

  const profile = data?.profile || {};
  const payout = data?.payout || {};
  const meta = data?.meta || {};
  const documents = data?.documents || [];
  const declarations = data?.declarations || {};

  const docCols = [
    { title: "Document", dataIndex: "name", key: "name" },
    { title: "Submitted", dataIndex: "submitted", key: "submitted" },
    { title: "Status", dataIndex: "status", key: "status", render: (v) => docStatusTag(v) },
  ];

  return (
    <div className="investor-page investor-account-page">
      <InvestorPageHeader
        title="Account & KYC"
        subtitle="Profile, payout details, and investor verification."
        range={range}
        onRangeChange={setRange}
      />

      <Alert
        type="success"
        showIcon
        className="investor-alert investor-kyc-verified-banner"
        message="KYC verified — You can fund projects and receive payouts subject to limits in your agreement."
      />

      <div className="investor-account-meta-row">
        <Card bordered={false} className="investor-account-chip">
          <div className="investor-mini-label">Verification tier</div>
          <Tag color="success" className="investor-tier-tag">
            {meta.tier || "—"}
          </Tag>
        </Card>
        <Card bordered={false} className="investor-account-chip">
          <div className="investor-mini-label">Investor ID</div>
          <div className="investor-account-chip-value">{meta.investorId}</div>
        </Card>
        <Card bordered={false} className="investor-account-chip">
          <div className="investor-mini-label">Payout method</div>
          <div className="investor-account-chip-value">{meta.payoutMethod}</div>
        </Card>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Profile & contact"
            extra={
              <Button type="link" size="small">
                Edit
              </Button>
            }
            bordered={false}
            className="investor-card"
            loading={accountKycLoading}
          >
            <div className="investor-form-readonly">
              <label>Legal name</label>
              <Input readOnly value={profile.legalName} />
              <label>Email</label>
              <Input readOnly value={profile.email} />
              <label>Phone</label>
              <Input readOnly value={profile.phone} />
              <label>Country of residence</label>
              <Input readOnly value={profile.country} />
              <label>Preferred language</label>
              <Input readOnly value={profile.language} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Payout & banking"
            extra={
              <Button type="link" size="small">
                Update
              </Button>
            }
            bordered={false}
            className="investor-card"
          >
            <div className="investor-form-readonly">
              <label>Account name</label>
              <Input readOnly value={payout.accountName} />
              <label>Bank</label>
              <Input readOnly value={payout.bankMasked} />
              <label>Account number</label>
              <Input readOnly value={payout.accountMasked} />
              <label>NUBAN verified</label>
              <div>
                {payout.nubanVerified ? <Tag color="success">Verified</Tag> : <Tag>Pending</Tag>}
              </div>
              <label>Tax ID (TIN)</label>
              <Input readOnly value={payout.tin} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 4 }}>
        <Col xs={24} lg={14}>
          <Card title="KYC documents" bordered={false} className="investor-card">
            <div className="table-responsive-wrapper investor-table-wrap">
              <Table
                className="investor-table"
                columns={docCols}
                dataSource={documents}
                pagination={false}
                size="small"
                rowKey="key"
                locale={{ emptyText: "No documents on file" }}
              />
            </div>
            <div className="investor-upload-block">
              <Title level={5} className="investor-upload-heading">
                Replace a document
              </Title>
              <Text type="secondary" className="investor-upload-hint">
                Upload a new file when you need to replace an existing document.
              </Text>
              <Button type="primary" disabled style={{ marginTop: 12 }}>
                Choose file
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Compliance declarations" bordered={false} className="investor-card">
            <p className="investor-decl-row">
              <span className="investor-decl-label">PEP</span>
              {declarations.pep}
            </p>
            <p className="investor-decl-row">
              <span className="investor-decl-label">Source of funds</span>
              {declarations.sof}
            </p>
            <p className="investor-decl-row">
              <span className="investor-decl-label">Sanctions</span>
              {declarations.sanctions}
            </p>
            <Button type="default" block style={{ marginTop: 8 }}>
              Update declarations
            </Button>
          </Card>

          <Card
            title="Verification timeline"
            bordered={false}
            className="investor-card"
            style={{ marginTop: 16 }}
          >
            <Timeline
              items={[
                { color: "green", children: "Application submitted" },
                { color: "green", children: "Documents under review" },
                { color: "green", children: "KYC approved · Tier 2" },
                { color: "gray", children: "Annual refresh scheduled" },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card className="investor-support-card" bordered={false} style={{ marginTop: 8 }}>
        <div className="investor-support-inner">
          <div>
            <div className="investor-support-title">
              Questions about verification or payout details?
            </div>
            <div className="investor-support-sub">
              Use Support — do not send identity documents by unsecured email.
            </div>
          </div>
          <Button type="primary" className="investor-support-cta">
            Contact Wyre compliance
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default InvestorAccountKyc;
