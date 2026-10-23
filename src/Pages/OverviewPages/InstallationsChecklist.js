import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Table,
  Typography,
  Tag,
  Input,
  Modal,
  Spin,
  notification,
  Button,
  Space,
  Row,
  Col,
  Card,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  fetchApprovedInstallations,
  fetchInstallationDetails,
  clearInstallationDetails,
} from '../../redux/actions/installChecklist/installChecklist.action';

const { Title, Text } = Typography;

const DetailField = ({ label, children, span = 1 }) => (
  <Col xs={24} sm={span === 2 ? 24 : 12}>
    <div className="ic-detail-field">
      <Text type="secondary" className="ic-detail-label">
        {label}
      </Text>
      <div>{children}</div>
    </div>
  </Col>
);

const CheckTag = ({ value }) =>
  value ? (
    <Tag icon={<CheckCircleOutlined />} color="success">Pass</Tag>
  ) : (
    <Tag icon={<CloseCircleOutlined />} color="error">Fail</Tag>
  );

function InstallationsChecklist({
  installChecklist: {
    approvedInstallations,
    approvedInstallationsLoading,
    approvedInstallationsError,
    installationDetails,
    installationDetailsLoading,
    installationDetailsError,
  },
  fetchApprovedInstallations: fetchListAction,
  fetchInstallationDetails: fetchDetailsAction,
  clearInstallationDetails: clearDetailsAction,
}) {
  const [searchText, setSearchText] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchListAction();
  }, [fetchListAction]);

  useEffect(() => {
    if (approvedInstallationsError) {
      notification.error({
        message: 'Error',
        description: approvedInstallationsError,
      });
    }
  }, [approvedInstallationsError]);

  useEffect(() => {
    if (installationDetailsError) {
      notification.error({
        message: 'Error',
        description: installationDetailsError,
      });
    }
  }, [installationDetailsError]);

  const handleViewDetails = (record) => {
    setDetailModalOpen(true);
    fetchDetailsAction(record.id);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    clearDetailsAction();
  };

  const filteredData = approvedInstallations.filter((item) => {
    const term = searchText.toLowerCase();
    return (
      item.branch_name?.toLowerCase().includes(term) ||
      item.device_name?.toLowerCase().includes(term) ||
      item.device_id?.toLowerCase().includes(term) ||
      item.approved_by_name?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Branch',
      dataIndex: 'branch_name',
      key: 'branch_name',
      sorter: (a, b) => (a.branch_name || '').localeCompare(b.branch_name || ''),
    },
    {
      title: 'Device',
      dataIndex: 'device_name',
      key: 'device_name',
    },
    {
      title: 'Device ID',
      dataIndex: 'device_id',
      key: 'device_id',
      responsive: ['md'],
    },
    {
      title: 'Approved By',
      dataIndex: 'approved_by_name',
      key: 'approved_by_name',
      responsive: ['lg'],
    },
    {
      title: 'Approved At',
      dataIndex: 'approved_at',
      key: 'approved_at',
      render: (val) => (val ? dayjs(val).format('MMM D, YYYY h:mm A') : '—'),
      sorter: (a, b) => new Date(a.approved_at) - new Date(b.approved_at),
      defaultSortOrder: 'descend',
      responsive: ['md'],
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      responsive: ['xl'],
      render: (val) => val || '—',
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: () => (
        <EyeOutlined className="ic-row-eye-icon" />
      ),
    },
  ];

  const d = installationDetails;

  return (
    <div className="ic-page">
      <div className="ic-header">
        <Title level={3} className="ic-title">
          Approved Installations
        </Title>
        <Space wrap>
          <Input
            className="ic-search-input"
            placeholder="Search branch, device, approver..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchListAction()}
            loading={approvedInstallationsLoading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      <Table
        className="installations-table"
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={approvedInstallationsLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} installations`,
        }}
        scroll={{ x: 700 }}
        size="middle"
        onRow={(record) => ({
          onClick: () => handleViewDetails(record),
          className: 'ic-clickable-row',
        })}
      />

      <Modal
        title={<span className="ic-modal-title">Installation Details</span>}
        open={detailModalOpen}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="close" onClick={handleCloseDetail}>
            Close
          </Button>,
        ]}
        width={900}
        className="ic-detail-modal"
        destroyOnClose
      >
        {installationDetailsLoading ? (
          <div className="ic-modal-spinner">
            <Spin size="large" />
          </div>
        ) : d ? (
          <>
            <Card size="small" className="ic-info-card">
              <Row gutter={[24, 8]}>
                <DetailField label="ID">{d.id}</DetailField>
                <DetailField label="Branch">{d.branch_name}</DetailField>
                <DetailField label="Device">{d.device_name}</DetailField>
                <DetailField label="Device Identifier">{d.device_identifier}</DetailField>
                <DetailField label="Approved By">{d.approved_by_name}</DetailField>
                <DetailField label="Approved At">
                  {d.approved_at ? dayjs(d.approved_at).format('MMM D, YYYY h:mm A') : '—'}
                </DetailField>
              </Row>
            </Card>

            <div className="ic-status-tags">
              {d.is_approved ? (
                <Tag color="success" className="ic-status-tag">Approved</Tag>
              ) : (
                <Tag color="warning" className="ic-status-tag">Pending</Tag>
              )}
              {d.all_checks_passed ? (
                <Tag color="success" className="ic-status-tag ic-status-tag--secondary">All Checks Passed</Tag>
              ) : (
                <Tag color="error" className="ic-status-tag ic-status-tag--secondary">Some Checks Failed</Tag>
              )}
            </div>

            <Divider orientation="left" plain className="ic-section-divider">
              Health Checks
            </Divider>

            <Row gutter={[24, 12]}>
              <DetailField label="Minimum Posts"><CheckTag value={d.has_minimum_posts} /></DetailField>
              <DetailField label="Post Frequency"><CheckTag value={d.post_frequency_ok} /></DetailField>
              <DetailField label="Voltage"><CheckTag value={d.voltage_ok} /></DetailField>
              <DetailField label="Power Reading"><CheckTag value={d.power_reading_ok} /></DetailField>
              <DetailField label="Expected Power"><CheckTag value={d.expected_power_ok} /></DetailField>
              <DetailField label="Datalogs"><CheckTag value={d.datalogs_ok} /></DetailField>
              <DetailField label="Readings"><CheckTag value={d.readings_ok} /></DetailField>
            </Row>

            <Divider orientation="left" plain className="ic-section-divider">
              Power & Notes
            </Divider>

            <Row gutter={[24, 8]}>
              <DetailField label="Target Power">{d.target_power ?? '—'}</DetailField>
              <DetailField label="Read Value">{d.read_value ?? '—'}</DetailField>
              <DetailField label="Notes" span={2}>{d.notes || '—'}</DetailField>
            </Row>

            <Divider className="ic-timestamps-divider" />

            <Row gutter={[24, 8]}>
              <DetailField label="Created At">
                {d.created_at ? dayjs(d.created_at).format('MMM D, YYYY h:mm A') : '—'}
              </DetailField>
              <DetailField label="Updated At">
                {d.updated_at ? dayjs(d.updated_at).format('MMM D, YYYY h:mm A') : '—'}
              </DetailField>
            </Row>
          </>
        ) : (
          <p>No details available.</p>
        )}
      </Modal>
    </div>
  );
}

const mapStateToProps = (state) => ({
  installChecklist: state.installChecklist,
});

export default connect(mapStateToProps, {
  fetchApprovedInstallations,
  fetchInstallationDetails,
  clearInstallationDetails,
})(InstallationsChecklist);
