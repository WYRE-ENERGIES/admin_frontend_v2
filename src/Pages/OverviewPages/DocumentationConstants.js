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

export const quickStartSteps = [
  {
    title: 'Navigate',
    description: 'Use the sidebar to access different sections',
    icon: <HomeOutlined />
  },
  {
    title: 'Monitor',
    description: 'View energy data, historical readings, and system status',
    icon: <BarChartOutlined />
  },
  {
    title: 'Manage',
    description: 'Handle system configurations and support requests',
    icon: <SettingOutlined />
  }
];

export const mainFeatures = [
  {
    title: 'Data Export & Reports',
    description: 'Download CSV reports and export energy data for analysis',
    icon: <DownloadOutlined style={{ color: '#13c2c2' }} />,
    pages: ['Download CSV', 'Report Generation'],
    link: '/'
  },
  {
      title: 'Historical Readings Detection & Management',
    description: 'Identify, review, and manage irregular energy readings and system historical readings',
    icon: <WarningOutlined style={{ color: '#faad14' }} />,
    pages: ['Historical Readings Page', 'Context View', 'Bulk Actions'],
    link: '/historical-readings'  
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

export const pageDetails = [
  {
    key: 'download-csv',
    title: 'Download CSV',
    icon: <DownloadOutlined />,
    description: 'Export energy data and reports in CSV format',
    features: [
      'Export energy consumption data across all locations',  
      'Generate comprehensive monthly/quarterly reports',
      'Download historical reading reports and irregular readings',
      'Export system performance metrics',
      'Custom date range selection for data export'
    ],
    usage: 'Use this page to download data for external analysis, reporting, or backup purposes. Perfect for creating reports for stakeholders or conducting detailed data analysis.',
    technical: 'Connects to the backend API to fetch and format data for CSV export. Supports large datasets with pagination and filtering.',
    link: '/'
  },
  {
    key: 'historical-readings', 
    title: 'Historical Readings Detection & Management',
    icon: <WarningOutlined />,
    description: 'Monitor and manage irregular energy readings across the system',
    features: [
      'View all detected historical readings with detailed information',
      'Advanced search and filter capabilities',
      'Mark historical readings as valid/invalid with context review',
      'Delete false positive readings permanently',
      'View reading context and historical data',
      'Bulk operations for multiple historical readings',
          'Real-time historical reading detection status'
    ],
    usage: 'Critical for maintaining data quality and identifying system issues. Review historical readings regularly to ensure accurate energy monitoring.',
    technical: 'Uses machine learning algorithms to detect irregular patterns in energy consumption data. Provides context windows for better decision making.',
    link: '/historical-readings'
  },
  {
    key: 'system-constants',
    title: 'System Constants & Configuration',
    icon: <HolderOutlined />,
    description: 'Configure system-wide parameters and operational constants',
    features: [
      'Set energy consumption thresholds',
      'Configure historical reading detection parameters',
      'Manage system-wide alert settings',
      'Update operational constants and limits',
      'Configure data retention policies',
      'Set performance monitoring parameters'
    ],
    usage: 'Used to fine-tune system behavior, alert thresholds, and operational parameters. Changes affect the entire system.',
    technical: 'Stores configuration data that affects historical reading detection algorithms, alert systems, and overall system behavior.',
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

export const commonTasks = [
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
    task: 'Review and Manage Historical Readings',
    steps: [
      'Go to Historical Readings page from sidebar',
      'Review the list of historical readings',
      'Use search to find specific readings by device, branch, or reason',
      'Click on a row to view reading context and history',
      'Mark as valid or delete false positives based on context',
      'Use bulk operations for multiple readings'
    ],
    tips: 'Always review the context before marking readings as valid to ensure data accuracy. Use the context window to understand patterns.',
    link: '/historical-readings'
  },
  {
    task: 'Configure System Parameters',
    steps: [
      'Navigate to System Constants page',
      'Review current system thresholds and parameters',
      'Update energy consumption thresholds as needed',
        'Configure historical reading detection parameters',
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

export const troubleshooting = [
  {
    issue: 'CSV export not working or taking too long',
    solution: 'Check your internet connection and try reducing the date range. Large datasets can take time to process. If the issue persists, contact support.',
    severity: 'Medium'
  },
  {
    issue: 'Historical Readings not updating or appearing',
    solution: 'Click the refresh button on the historical readings page. Data is updated in real-time but may have a slight delay. Check if historical reading detection is enabled in system constants. Check if historical reading detection is enabled in system constants.',
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
    solution: 'Check your internet connection speed. Large data exports and historical reading processing can be resource-intensive. Consider breaking operations into smaller chunks.',
    severity: 'Low'
  }
];

export const bestPractices = [
  'Always verify date ranges and filters before analyzing or exporting data',
    'Review historical readings in context before marking them as valid to ensure data accuracy',
  'Export data regularly for backup and reporting purposes',
  'Monitor system constants and thresholds for optimal performance',
  'Use search and filter functions to find specific data quickly',
  'Keep your user profile and contact information up to date',
  'Submit detailed support requests with relevant information and attachments',
  'Test system configuration changes in a controlled environment first',
  'Regularly check the support page for updates and new FAQs',
  'Contact support immediately for critical system issues or data discrepancies'
];
