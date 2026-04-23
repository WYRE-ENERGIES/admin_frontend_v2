export const MOCK_ACCESS_CONTROL = {
  users: [
    {
      id: "u1",
      name: "Wyre Super Admin",
      email: "superadmin@wyreng.com",
      role_text: "SUPERADMIN",
      status: "active",
      mfa: "enabled",
      last_login: "2026-04-20 10:14",
    },
    {
      id: "u2",
      name: "Ops Admin",
      email: "ops@wyreng.com",
      role_text: "OPERATOR",
      status: "active",
      mfa: "disabled",
      last_login: "2026-04-19 08:02",
    },
    {
      id: "u3",
      name: "Support Agent",
      email: "support@wyreng.com",
      role_text: "SUPPORT",
      status: "suspended",
      mfa: "enabled",
      last_login: "—",
    },
  ],
  investors: [
    {
      id: "i1",
      name: "Investor (Sample)",
      email: "investor@example.com",
      role_text: "INVESTOR",
      status: "active",
      last_login: "2026-04-21 09:12",
    },
  ],
  roles: [
    {
      key: "SUPERADMIN",
      name: "SUPERADMIN",
      description: "Full platform access, including access control.",
      permissions: ["*"],
    },
    {
      key: "OPERATOR",
      name: "OPERATOR",
      description: "Operations: onboarding, installations, system constants.",
      permissions: ["solar:read", "solar:write", "installations:read", "installations:write"],
    },
    {
      key: "SUPPORT",
      name: "SUPPORT",
      description: "Support & ticketing (no financial controls).",
      permissions: ["support:read", "support:write", "investors:read_basic"],
    },
    {
      key: "INVESTOR",
      name: "INVESTOR",
      description: "Investor portal access only.",
      permissions: ["investor_portal:read"],
    },
  ],
  audit: [
    {
      id: "a1",
      at: "2026-04-21 09:18",
      actor: "superadmin@wyreng.com",
      action: "UPDATED_ROLE",
      subject: "ops@wyreng.com",
      detail: "Role set to OPERATOR",
    },
    {
      id: "a2",
      at: "2026-04-20 16:40",
      actor: "superadmin@wyreng.com",
      action: "SUSPENDED_USER",
      subject: "support@wyreng.com",
      detail: "Status changed to suspended",
    },
  ],
};

