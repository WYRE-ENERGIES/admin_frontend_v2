import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Table, Typography, Space, notification, Input, Pagination, Tag } from 'antd'
import { APIService } from '../../config/Api/apiServices'
import { ReloadOutlined } from '@ant-design/icons'

const { Title, Text } = Typography;

const LIST_ENDPOINT = '/api/v1/historical-readings/';

const defaultPageSize = 20;
const DEBOUNCE_MS = 400;

const emptyPagination = (pageSize = defaultPageSize) => ({
  current_page: 1,
  total_pages: 1,
  total_count: 0,
  page_size: pageSize,
  has_next: false,
  has_previous: false,
  uncorrected_count: 0,
  corrected_count: 0,
});

/**
 * Normalise the API payload into { uncorrected: [], corrected: [] }.
 * Current shape: data = { uncorrected: [...], corrected: [...] }.
 * Falls back to splitting a flat array by `ct_corrected` (legacy shape).
 */
const splitReadings = (payload) => {
  if (payload && !Array.isArray(payload) && typeof payload === 'object')
  {
    return {
      uncorrected: Array.isArray(payload.uncorrected) ? payload.uncorrected : [],
      corrected: Array.isArray(payload.corrected) ? payload.corrected : [],
    };
  }
  const rows = Array.isArray(payload) ? payload : [];
  return {
    uncorrected: rows.filter((r) => !r?.ct_corrected),
    corrected: rows.filter((r) => r?.ct_corrected),
  };
};

const HistoricalReadings = () => {
  const [loading, setLoading] = useState(false);
  const [uncorrected, setUncorrected] = useState([]);
  const [corrected, setCorrected] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [pagination, setPagination] = useState(emptyPagination());
  const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const loadHistoricalReadings = useCallback(async (currentPage = page, currentPageSize = pageSize, search = searchText) => {
    setLoading(true);
    try
    {
      const params = {
        page: currentPage,
        page_size: currentPageSize
      };

      if (search && search.trim())
      {
        params.search = search.trim();
      }

      const response = await APIService.get(LIST_ENDPOINT, { params });
      const body = response?.data;

      // Response: { status: true, data: { uncorrected: [], corrected: [] }, pagination: {...} }
      const payload = body?.data !== undefined ? body.data : (body?.results ?? body);
      const sections = splitReadings(payload);
      setUncorrected(sections.uncorrected);
      setCorrected(sections.corrected);

      const p = body?.pagination || {};
      const pageRowCount = sections.uncorrected.length + sections.corrected.length;
      setPagination({
        current_page: p.current_page || currentPage,
        total_pages: p.total_pages || 1,
        total_count: p.total_count ?? pageRowCount,
        page_size: p.page_size || currentPageSize,
        has_next: p.has_next || false,
        has_previous: p.has_previous || false,
        uncorrected_count: p.uncorrected_count ?? sections.uncorrected.length,
        corrected_count: p.corrected_count ?? sections.corrected.length,
      });
    } catch (error)
    {
      notification.error({
        message: 'Failed to load historical readings',
        description: error?.response?.data?.detail || error?.message || 'Please try again'
      });
      setUncorrected([]);
      setCorrected([]);
      setPagination(emptyPagination(currentPageSize));
    } finally
    {
      setLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    loadHistoricalReadings(1, defaultPageSize, '');
    setPage(1);
    setPageSize(defaultPageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const handle = setTimeout(() => {
      setPage(1);
      loadHistoricalReadings(1, pageSize, searchText);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // Pagination is shared across both sections (it applies to the combined set)
  const handlePageChange = (nextPage, nextSize) => {
    const sizeChanged = nextSize !== pageSize;
    const targetPage = sizeChanged ? 1 : nextPage;
    setPage(targetPage);
    setPageSize(nextSize);
    loadHistoricalReadings(targetPage, nextSize, searchText);
  };

  const onSearch = () => {
    setPage(1);
    loadHistoricalReadings(1, pageSize, searchText);
  };

  const handleRefresh = () => {
    loadHistoricalReadings(page, pageSize, searchText);
  };

  const columns = useMemo(() => [
    {
      title: 'Client Name',
      dataIndex: 'client_name',
      key: 'client_name',
      ellipsis: true,
      width: isMobile ? 120 : undefined,
    },
    {
      title: 'Branch Name',
      dataIndex: 'branch_name',
      key: 'branch_name',
      ellipsis: true,
      width: isMobile ? 120 : undefined,
    },
    {
      title: 'Device Name',
      dataIndex: 'device_name',
      key: 'device_name',
      ellipsis: true,
      width: isMobile ? 120 : undefined,
    },
    {
      title: 'Device ID',
      dataIndex: 'device_id',
      key: 'device_id',
      render: (v) => (v != null ? v : '-'),
      width: isMobile ? 80 : undefined,
    },
    {
      title: 'Energy Reading',
      dataIndex: 'energy_reading',
      key: 'energy_reading',
      render: (v) => v != null ? (typeof v === 'number' ? Number(v).toFixed(2) : v) : '-',
      width: isMobile ? 100 : undefined,
    },
    {
      title: 'Post Date',
      dataIndex: 'post_date',
      key: 'post_date',
      render: (v) => v || '-',
      width: isMobile ? 100 : undefined,
    },
    {
      title: 'Post Time',
      dataIndex: 'post_time',
      key: 'post_time',
      render: (v) => v || '-',
      width: isMobile ? 100 : undefined,
    },
    {
      title: 'CT Status',
      dataIndex: 'ct_corrected',
      key: 'ct_corrected',
      render: (v) => (v ? <Tag color="green">Corrected</Tag> : <Tag color="orange">Not corrected</Tag>),
      width: isMobile ? 110 : undefined,
    },
  ], [isMobile]);

  // Uncorrected rows fill the combined list first, so corrected rows only start
  // on the page after the last uncorrected row.
  const effectivePageSize = pagination.page_size || pageSize;
  const firstCorrectedPage = Math.floor((pagination.uncorrected_count || 0) / effectivePageSize) + 1;
  const goToPage = (target) => {
    setPage(target);
    loadHistoricalReadings(target, effectivePageSize, searchText);
  };
  const showJumpToCorrected =
    pagination.corrected_count > 0 && corrected.length === 0 && pagination.current_page < firstCorrectedPage;
  const showJumpToUncorrected =
    pagination.uncorrected_count > 0 && uncorrected.length === 0 && pagination.current_page > 1;

  const rowKey = (record) =>
    `${record.ct_corrected ? 'c' : 'u'}-${record.device_id ?? record.device_name}-${record.post_date}-${record.post_time}-${record.energy_reading}`;

  const renderSection = (title, rows, totalForFilter, color, emptyText, jump) => (
    <div style={{ marginBottom: 24 }}>
      <Space align="center" style={{ marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0 }}>{title}</Title>
        {/* Plain pill instead of antd Badge: Badge digits use a `current` class that
            clashes with the global `.current` rule in report.css */}
        <span style={{
          display: 'inline-block',
          minWidth: 24,
          padding: '0 10px',
          lineHeight: '22px',
          borderRadius: 11,
          background: color,
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          textAlign: 'center',
        }}>
          {Number(totalForFilter || 0).toLocaleString()}
        </span>
        <Text type="secondary">({rows.length} on this page)</Text>
        {jump && (
          <Button size="small" type="link" onClick={jump.onClick} disabled={loading}>
            {jump.label}
          </Button>
        )}
      </Space>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <Table
          rowKey={rowKey}
          loading={loading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: 'max-content' }}
          pagination={false}
          locale={{ emptyText }}
          size={isMobile ? 'small' : 'middle'}
        />
      </div>
    </div>
  );

  return (
    <div style={{
      margin: isMobile ? '15px' : '30px',
      padding: isMobile ? '10px' : '0'
    }}>
      <div style={{
        marginBottom: 20,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: 12
      }}>
        <Title level={4} style={{ margin: 0 }}>Historical Readings</Title>
        <Space
          direction={isMobile ? 'vertical' : 'horizontal'}
          style={{
            width: isMobile ? '100%' : 'auto',
            display: 'flex',
            flexWrap: 'wrap'
          }}
        >
          <Input.Search
            allowClear
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={onSearch}
            style={{
              width: isMobile ? '100%' : 320,
              minWidth: 200
            }}
          />
          <Button
            type="primary"
            onClick={handleRefresh}
            loading={loading}
            icon={<ReloadOutlined />}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {renderSection(
        'Not corrected',
        uncorrected,
        pagination.uncorrected_count,
        '#fa8c16',
        pagination.uncorrected_count > 0
          ? 'No uncorrected readings on this page'
          : 'No uncorrected readings',
        showJumpToUncorrected ? { label: 'Back to first uncorrected page', onClick: () => goToPage(1) } : null
      )}

      {renderSection(
        'Corrected',
        corrected,
        pagination.corrected_count,
        '#52c41a',
        pagination.corrected_count > 0
          ? 'No corrected readings on this page'
          : 'No corrected readings',
        showJumpToCorrected
          ? { label: `Jump to corrected readings (page ${firstCorrectedPage.toLocaleString()})`, onClick: () => goToPage(firstCorrectedPage) }
          : null
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Pagination
          current={pagination.current_page}
          pageSize={pagination.page_size}
          total={pagination.total_count}
          showSizeChanger
          showQuickJumper={!isMobile}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          pageSizeOptions={['10', '20', '50', '100']}
          responsive
          size={isMobile ? 'small' : 'default'}
          disabled={loading}
          onChange={handlePageChange}
        />
      </div>
    </div>
  )
}

export default HistoricalReadings
