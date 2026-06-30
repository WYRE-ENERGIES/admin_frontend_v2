import { Button, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function InvestorPageHeader({
  title,
  subtitle,
  banner,
  showDownloadReport = true,
  onDownloadReport,
  downloadLoading = false,
}) {
  return (
    <>
      {banner}
      <div className="investor-header">
        <div className="investor-header-left">
          <Title level={3} className="investor-page-title">
            {title}
          </Title>
          {subtitle ? (
            <Text type="secondary" className="investor-page-subtitle">
              {subtitle}
            </Text>
          ) : null}
        </div>
        {showDownloadReport ? (
          <div className="investor-header-actions">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              className="investor-header-btn investor-header-btn--primary"
              loading={downloadLoading}
              onClick={onDownloadReport}
            >
              Download report
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default InvestorPageHeader;
