import { Avatar, Button, Card, Tag, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import InvestorPageHeader from "../../components/investor/InvestorPageHeader";
import authHelper from "../../helpers/authHelper";

const { Title } = Typography;

function pick(obj, keys) {
  for (const key of keys) {
    const v = obj?.[key];
    if (v != null && v !== "") return v;
  }
  return null;
}

function initialsFromName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "IN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function tierTagColor(tier) {
  const t = String(tier || "").toLowerCase();
  if (t.includes("2") || t.includes("full")) return "success";
  if (t.includes("1")) return "processing";
  if (t.includes("pending")) return "gold";
  return "default";
}

function statusTagColor(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("verified") || s.includes("approved") || s.includes("passed")) return "success";
  if (s.includes("review") || s.includes("pending")) return "gold";
  if (s.includes("reject") || s.includes("fail")) return "error";
  return "default";
}

/** Reads the identity claims already present in the investor's decoded login token — no separate KYC/profile endpoint involved. */
function tokenProfile(decoded) {
  if (!decoded) return null;
  const firstName = pick(decoded, ["first_name", "firstName"]);
  const lastName = pick(decoded, ["last_name", "lastName"]);
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    pick(decoded, ["legal_name", "legalName", "name", "full_name", "fullName"]) ||
    pick(decoded, ["username"]);

  return {
    fullName: fullName || "Investor",
    email: pick(decoded, ["email", "user_email"]),
    phone: pick(decoded, ["phone", "phone_number", "phoneNumber", "msisdn"]),
    username: pick(decoded, ["username"]),
    investorRef: pick(decoded, ["investor_ref", "investorRef", "ref", "reference"]),
    kycTier: pick(decoded, ["kyc_tier", "kycTier", "tier"]),
    kycStatus: pick(decoded, ["kyc_status", "kycStatus", "verification_status"]),
  };
}

function DetailRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="investor-account-detail-row">
      <span className="investor-mini-label">{label}</span>
      <span className="investor-account-detail-value">{value}</span>
    </div>
  );
}

function InvestorAccountKyc() {
  const navigate = useNavigate();
  const location = useLocation();
  const supportPath = location.pathname.startsWith("/__investor_preview")
    ? "/__investor_preview/support"
    : "/support";

  const decoded = authHelper();
  const profile = tokenProfile(decoded);

  return (
    <div className="investor-page investor-account-page">
      <InvestorPageHeader title="Account & KYC" showDownloadReport={false} />

      <Card bordered={false} className="investor-card investor-account-summary-card">
        <div className="investor-account-summary-head">
          <Avatar size={64} className="investor-account-avatar">
            {initialsFromName(profile?.fullName)}
          </Avatar>
          <div className="investor-account-summary-headings">
            <Title level={4} style={{ margin: 0 }}>
              {profile?.fullName || "Investor"}
            </Title>
            <div className="investor-account-summary-tags">
              <Tag color="purple">Investor</Tag>
              {profile?.kycTier ? <Tag color={tierTagColor(profile.kycTier)}>{profile.kycTier}</Tag> : null}
              {profile?.kycStatus ? <Tag color={statusTagColor(profile.kycStatus)}>{profile.kycStatus}</Tag> : null}
            </div>
          </div>
        </div>

        <div className="investor-account-detail-grid">
          <DetailRow label="Email" value={profile?.email} />
          <DetailRow label="Phone" value={profile?.phone} />
          <DetailRow label="Username" value={profile?.username} />
          <DetailRow label="Investor reference" value={profile?.investorRef} />
        </div>
      </Card>

      <Card className="investor-support-card" bordered={false} style={{ marginTop: 16 }}>
        <div className="investor-support-inner">
          <div>
            <div className="investor-support-title">Need to update these details?</div>
            <div className="investor-support-sub">
              This is the account information tied to your current login. For changes to your
              profile, KYC documents, or payout details, reach out to Wyre support.
            </div>
          </div>
          <Button type="primary" className="investor-support-cta" onClick={() => navigate(supportPath)}>
            Contact support
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default InvestorAccountKyc;
