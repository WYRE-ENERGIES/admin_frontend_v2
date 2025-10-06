import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Collapse, 
  Space, 
  Tag, 
  Divider, 
  Alert, 
  Steps, 
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
  WarningOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  SettingOutlined,
  HolderOutlined,
  BarChartOutlined,
  HomeOutlined,
  MailOutlined,
  LoginOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const Documentation = () => {
  const [activeKey, setActiveKey] = useState(['1']);

  const quickStartSteps = [
    {
      title: 'Navigate',
      description: 'Use the sidebar to access different sections',
      icon: <HomeOutlined />
    },
    {
      title: 'Monitor',
      description: 'View energy data, anomalies, and system status',
      icon: <BarChartOutlined />
    },
    {
      title: 'Manage',
      description: 'Handle system configurations and support requests',
      icon: <SettingOutlined />
    }
  ];

  const mainFeatures = [
    {
      title: 'Data Export & Reports',
      description: 'Download CSV reports and export energy data for analysis',
      icon: <DownloadOutlined style={{ color: '#13c2c2' }} />,
      pages: ['Download CSV', 'Report Generation'],
      link: '/'
    },
    {
      title: 'Anomaly Detection & Management',
      description: 'Identify, review, and manage irregular energy readings and system anomalies',
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
      pages: ['Anomalies Page', 'Context View', 'Bulk Actions'],
      link: '/anomalies'
    },
    {
      title: 'System Configuration',
      description: 'Configure system constants, thresholds, and operational parameters',
      icon: <HolderOutlined style={{ color: '#722ed1' }} />,
      pages: ['System Constants', 'Threshold Settings'],
      link: '/system-constants'
    },
    {
      title: 'User Settings',
      description: 'Manage your account settings and application preferences',
      icon: <SettingOutlined style={{ color: '#52c41a' }} />,
      pages: ['Profile Settings', 'Preferences'],
      link: '/settings'
    },
    {
      title: 'Support & Help',
      description: 'Get help, submit support requests, and access FAQs',
      icon: <MailOutlined style={{ color: '#1890ff' }} />,
      pages: ['Support Requests', 'FAQs', 'Contact Information'],
      link: '/support'
    }
  ];

  const pageDetails = [
    {
      key: 'download-csv',
      title: 'Download CSV',
      icon: <DownloadOutlined />,
      description: 'Export energy data and reports in CSV format',
      features: [
        'Export energy consumption data across all locations',
        'Generate comprehensive monthly/quarterly reports',
        'Download anomaly reports and irregular readings',
        'Export system performance metrics',
        'Custom date range selection for data export'
      ],
      usage: 'Use this page to download data for external analysis, reporting, or backup purposes. Perfect for creating reports for stakeholders or conducting detailed data analysis.',
      technical: 'Connects to the backend API to fetch and format data for CSV export. Supports large datasets with pagination and filtering.',
      link: '/'
    },
    {
      key: 'anomalies',
      title: 'Anomalies Detection & Management',
      icon: <WarningOutlined />,
      description: 'Monitor and manage irregular energy readings across the system',
      features: [
        'View all detected anomalies with detailed information',
        'Advanced search and filter capabilities',
        'Mark anomalies as valid/invalid with context review',
        'Delete false positive readings permanently',
        'View reading context and historical data',
        'Bulk operations for multiple anomalies',
        'Real-time anomaly detection status'
      ],
      usage: 'Critical for maintaining data quality and identifying system issues. Review anomalies regularly to ensure accurate energy monitoring.',
      technical: 'Uses machine learning algorithms to detect irregular patterns in energy consumption data. Provides context windows for better decision making.',
      link: '/anomalies'
    },
    {
      key: 'system-constants',
      title: 'System Constants & Configuration',
      icon: <HolderOutlined />,
      description: 'Configure system-wide parameters and operational constants',
      features: [
        'Set energy consumption thresholds',
        'Configure anomaly detection parameters',
        'Manage system-wide alert settings',
        'Update operational constants and limits',
        'Configure data retention policies',
        'Set performance monitoring parameters'
      ],
      usage: 'Used to fine-tune system behavior, alert thresholds, and operational parameters. Changes affect the entire system.',
      technical: 'Stores configuration data that affects anomaly detection algorithms, alert systems, and overall system behavior.',
      link: '/system-constants'
    },
    {
      key: 'settings',
      title: 'User Settings & Preferences',
      icon: <SettingOutlined />,
      description: 'Manage your account settings and application preferences',
      features: [
        'User profile management and updates',
        'Application preferences and themes',
        'Notification settings and alerts',
        'Password and security settings',
        'Display preferences and layout options'
      ],
      usage: 'Personalize your operator experience and manage account settings. Configure how you want to receive notifications and alerts.',
      technical: 'Handles user-specific settings and application configuration. Changes are saved per user account.',
      link: '/settings'
    },
    {
      key: 'support',
      title: 'Support & Help Center',
      icon: <MailOutlined />,
      description: 'Get help, submit support requests, and access comprehensive FAQs',
      features: [
        'Submit support requests with attachments',
        'Access comprehensive FAQ database',
        'Direct contact information for urgent issues',
        'Track support request status',
        'Upload files and screenshots for troubleshooting',
        'Get help with system operations and procedures'
      ],
      usage: 'Use this page when you need help with system operations, encounter issues, or have questions about procedures.',
      technical: 'Integrates with support ticket system and FAQ database. Supports file uploads for better issue resolution.',
      link: '/support'
    }
  ];

  const commonTasks = [
    {
      task: 'Export Energy Data',
      steps: [
        'Navigate to the Download CSV page (home page)',
        'Select the type of data to export',
        'Choose date range and location filters',
        'Click download to generate CSV file',
        'Save the file for analysis or reporting'
      ],
      tips: 'Large date ranges may take longer to process. Consider breaking into smaller chunks for better performance. Use specific date ranges for more targeted reports.',
      link: '/'
    },
    {
      task: 'Review and Manage Anomalies',
      steps: [
        'Go to Anomalies page from sidebar',
        'Review the list of detected anomalies',
        'Use search to find specific anomalies by device, branch, or reason',
        'Click on a row to view reading context and history',
        'Mark as valid or delete false positives based on context',
        'Use bulk operations for multiple anomalies'
      ],
      tips: 'Always review the context before marking anomalies as valid to ensure data accuracy. Use the context window to understand patterns.',
      link: '/anomalies'
    },
    {
      task: 'Configure System Parameters',
      steps: [
        'Navigate to System Constants page',
        'Review current system thresholds and parameters',
        'Update energy consumption thresholds as needed',
        'Configure anomaly detection parameters',
        'Save changes and monitor system behavior'
      ],
      tips: 'Changes to system constants affect the entire system. Test changes in a controlled environment first.',
      link: '/system-constants'
    },
    {
      task: 'Submit Support Request',
      steps: [
        'Go to Support page from sidebar',
        'Fill in the subject line with a clear description',
        'Provide detailed message about the issue or question',
        'Attach relevant files or screenshots if needed',
        'Submit the request and wait for response'
      ],
      tips: 'Be specific about the issue and include relevant details. Check FAQs first as your question might already be answered.',
      link: '/support'
    },
    {
      task: 'Update User Settings',
      steps: [
        'Navigate to Settings page',
        'Update your profile information',
        'Configure notification preferences',
        'Change password if needed',
        'Save changes to apply updates'
      ],
      tips: 'Keep your contact information up to date to receive important system notifications and alerts.',
      link: '/settings'
    }
  ];

  const troubleshooting = [
    {
      issue: 'CSV export not working or taking too long',
      solution: 'Check your internet connection and try reducing the date range. Large datasets can take time to process. If the issue persists, contact support.',
      severity: 'Medium'
    },
    {
      issue: 'Anomalies not updating or appearing',
      solution: 'Click the refresh button on the anomalies page. Data is updated in real-time but may have a slight delay. Check if anomaly detection is enabled in system constants.',
      severity: 'Low'
    },
    {
      issue: 'Cannot access system constants or settings',
      solution: 'Verify you have OPERATORS privileges. Some system configurations require elevated permissions. Contact your system administrator if needed.',
      severity: 'High'
    },
    {
      issue: 'Support request not submitting',
      solution: 'Check your internet connection and ensure all required fields are filled. Try refreshing the page and submitting again. Contact support via email if the issue persists.',
      severity: 'Medium'
    },
    {
      issue: 'Data appears incorrect or inconsistent',
      solution: 'Verify the date range and filters applied. Check system constants for threshold settings. Contact the data team if discrepancies persist after verification.',
      severity: 'High'
    },
    {
      issue: 'System performance is slow',
      solution: 'Check your internet connection speed. Large data exports and anomaly processing can be resource-intensive. Consider breaking operations into smaller chunks.',
      severity: 'Low'
    }
  ];

  const bestPractices = [
    'Always verify date ranges and filters before analyzing or exporting data',
    'Review anomalies in context before marking them as valid to ensure data accuracy',
    'Export data regularly for backup and reporting purposes',
    'Monitor system constants and thresholds for optimal performance',
    'Use search and filter functions to find specific data quickly',
    'Keep your user profile and contact information up to date',
    'Submit detailed support requests with relevant information and attachments',
    'Test system configuration changes in a controlled environment first',
    'Regularly check the support page for updates and new FAQs',
    'Contact support immediately for critical system issues or data discrepancies'
  ];

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
        {/* <Col xs={24} lg={12}>
          <Card title="Quick Start Guide" style={{ height: '100%' }}>
            <Steps
              direction="vertical"
              size="small"
              items={quickStartSteps}
            />
          </Card>
        </Col> */}
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
                               "#8ec5fc", "#38f9d7", "#fee140"
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
