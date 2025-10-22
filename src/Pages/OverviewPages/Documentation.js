import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Collapse, 
  Space, 
  Tag, 
  Divider, 
  Alert, 
  List, 
  Button,
  Row,
  Col,
  Timeline,
  Badge
} from 'antd';
import { Link } from 'react-router-dom';
import { 
  BookOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined,
  MailOutlined
} from '@ant-design/icons';
import {
  mainFeatures,
  pageDetails,
  commonTasks,
  troubleshooting,
  bestPractices
} from './DocumentationConstants';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const Documentation = () => {
  const [activeKey, setActiveKey] = useState(['1']);

  return (
    <div style={{ margin: '0 auto', padding: 24 }}>
      <Title level={2} style={{ marginBottom: 32 }}>Documentation</Title>
      <Paragraph style={{ fontSize: '16px' }}>
          Welcome to the Wyre Energy Management Operator Panel. 
        </Paragraph>

      <Alert
        message="Getting Started"
        description="This documentation is designed for OPERATORS who need to understand and effectively use the Wyre energy management system. You have access to all system features including anomaly management, system configuration, and support functions."
        type="info"
        showIcon
        style={{ marginBottom: '30px' }}
      />

      <Row>
        <Col xs={24} lg={24}>
          <Card title="Quick Start Guide" className="feature-card" style={{ height: '100%' }}>
            <List
              dataSource={mainFeatures}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={
                      <Link to={item.link} style={{ color: '#5c3592', fontWeight: 'bold' }}>
                        {item.title}
                      </Link>
                    }
                    description={
                      <div>
                        <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                          {item.description}
                        </Paragraph>
                        <div style={{ marginTop: '8px' }}>
                          {item.pages.map((page, index) => (
                            <Tag
                              key={index}
                              style={{
                                margin: '2px',
                                fontWeight: 600,
                                fontSize: 13,
                                borderRadius: 16,
                                background: [
                               "#8ec5fc", "#98f698", "#fee140"
                                ][index % 10],
                                color: '#222',
                                border: 'none',
                                boxShadow: '0 2px 8px rgba(140, 140, 140, 0.10)'
                              }}
                            >
                              <span style={{ 
                                textShadow: '0 1px 2px rgba(255,255,255,0.2)', 
                                letterSpacing: 0.2 
                              }}>
                                {page}
                              </span>
                            </Tag>
                          ))}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Detailed Page Documentation" style={{ marginTop: '30px' }}>
        <Collapse 
          activeKey={activeKey} 
          onChange={setActiveKey}
          size="large"
        >
          {pageDetails.map((page) => (
            <Panel 
              header={
                <Space>
                  {page.icon}
                  <Link to={page.link} style={{ color: '#5c3592', fontWeight: 'bold' }}>
                    {page.title}
                  </Link>
                  <Text type="secondary">- {page.description}</Text>
                </Space>
              } 
              key={page.key}
            >
              <Row gutter={[24, 24]} className="page-details">
                <Col xs={24} md={12}>
                  <Card size="small" title="Features" type="inner">
                    <List
                      size="small"
                      dataSource={page.features}
                      renderItem={(feature) => (
                        <List.Item>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                          {feature}
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" title="Usage" type="inner">
                    <Paragraph>{page.usage}</Paragraph>
                    <Divider />
                    <Text type="secondary">
                      <InfoCircleOutlined style={{ marginRight: '5px' }} />
                      Technical: {page.technical}
                    </Text>
                  </Card>
                </Col>
              </Row>
            </Panel>
          ))}
        </Collapse>
      </Card>

      <Row gutter={[24, 24]} style={{ marginTop: '30px' }}>
        <Col xs={24} lg={12}>
          <Card title="Common Tasks" style={{ height: '100%' }}>
            <Timeline>
              {commonTasks.map((task, index) => (
                <Timeline.Item
                  key={index}
                  dot={<FileTextOutlined style={{ color: '#1890ff' }} />}
                >
                  <div>
                    <Link to={task.link} style={{ color: '#5c3592', fontWeight: 'bold' }}>
                      <Text strong>{task.task}</Text>
                    </Link>
                    <List
                      size="small"
                      dataSource={task.steps}
                      renderItem={(step, stepIndex) => (
                        <List.Item style={{ padding: '4px 0' }}>
                          <Text>{stepIndex + 1}. {step}</Text>
                        </List.Item>
                      )}
                      style={{ marginTop: '8px' }}
                    />
                    <Alert
                      message={task.tips}
                      type="info"
                      size="small"
                      style={{ marginTop: '8px' }}
                      showIcon
                    />
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Troubleshooting" style={{ height: '100%' }}>
            <List
              className="troubleshooting-item"
              dataSource={troubleshooting}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={item.severity === 'High' ? 'error' : item.severity === 'Medium' ? 'warning' : 'default'} 
                        text=""
                      />
                    }
                    title={item.issue}
                    description={item.solution}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Best Practices" style={{ marginTop: '30px' }}>
        <List
          className="best-practices"
          dataSource={bestPractices}
          renderItem={(practice) => (
            <List.Item>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              {practice}
            </List.Item>
          )}
        />
      </Card>

      <Card title="Support & Contact" className="support-section" style={{ marginTop: '30px', textAlign: 'center' }}>
        <Space direction="vertical" size="large">
          <div>
            <Title level={4}>Need Help?</Title>
            <Paragraph>
              If you encounter any issues or have questions about using the operator panel, 
              please don't hesitate to contact our support team through the support page.
            </Paragraph>
          </div>
          <Space size="large">
            <Button type="primary" icon={<MailOutlined />} onClick={() => window.location.href = '/support'}>
              Go to Support Page
            </Button>
            <Button icon={<BookOutlined />} onClick={() => window.location.href = 'https://documenter.getpostman.com/view/33125691/2sB2x9iA2s#intro'}>
             API Documentation
            </Button>
          </Space>
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <Title level={5}>Quick Contact Information</Title>
            <Paragraph style={{ margin: '8px 0' }}>
              <strong>Email:</strong> info@wyreng.com
            </Paragraph>
            <Paragraph style={{ margin: '8px 0' }}>
              <strong>Phone:</strong> +234 806 270 1039
            </Paragraph>
            <Paragraph style={{ margin: '8px 0' }}>
              <strong>Address:</strong> 10A Merret Road, Yaba Lagos, Nigeria
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Documentation;
