import { Button, DatePicker, Typography } from "antd";
import { DownloadOutlined, FileTextOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

function InvestorPageHeader({
  title,
  subtitle,
  banner,
  range,
  onRangeChange,
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
        <div className="investor-header-actions">
          <RangePicker
            value={range}
            onChange={(next) => {
              if (!next) return;
              onRangeChange(next);
            }}
            allowClear={false}
            className="investor-range"
            getPopupContainer={() => document.body}
            popupClassName="investor-shell-picker-dropdown"
          />
          <Button
            icon={<FileTextOutlined />}
            className="investor-btn-light investor-header-btn"
          >
            Export statement
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            className="investor-header-btn investor-header-btn--primary"
          >
            Download report
          </Button>
        </div>
      </div>
    </>
  );
}

export default InvestorPageHeader;
