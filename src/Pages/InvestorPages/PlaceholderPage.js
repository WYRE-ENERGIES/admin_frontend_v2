import { Card, Typography } from "antd";

const { Title, Text } = Typography;

function PlaceholderPage({ title }) {
  return (
    <div className="investor-page investor-placeholder-page">
      <div className="investor-header investor-placeholder-header">
        <div className="investor-header-left">
          <Title level={3} className="investor-page-title">
            {title}
          </Title>
        </div>
      </div>

      <Card className="investor-card" bordered={false}>
        <Text type="secondary" className="investor-placeholder-text">
          This section is coming soon.
        </Text>
      </Card>
    </div>
  );
}

export default PlaceholderPage;

