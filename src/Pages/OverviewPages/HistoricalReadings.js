import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Table, Typography, Space, notification, Input } from 'antd'
import { APIService } from '../../config/Api/apiServices'
import { ReloadOutlined } from '@ant-design/icons'

const { Title } = Typography;

const LIST_ENDPOINT = '/api/v1/historical-readings/';

const defaultPageSize = 20;
const DEBOUNCE_MS = 400;

const HistoricalReadings = () => {
  const [loading, setLoading] = useState(false);
  const [readings, setReadings] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    page_size: defaultPageSize,
    has_next: false,
    has_previous: false
  });
  const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const loadHistoricalReadings = useCallback(async (currentPage = page, currentPageSize = pageSize, search = searchText) => {
    setLoading(true);
    try {
      const params = { 
        page: currentPage, 
        page_size: currentPageSize 
      };
      
      // Add search parameter if provided
      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await APIService.get(LIST_ENDPOINT, { params });
      const data = response?.data;
      
      // Handle response structure: { status: true, data: [], pagination: {...} }
      if (data?.status && data?.data) {
        const readingsData = Array.isArray(data.data) ? data.data : [];
        const paginationData = data.pagination || {};
        
        setReadings(readingsData);
        setPagination({
          current_page: paginationData.current_page || 1,
          total_pages: paginationData.total_pages || 1,
          total_count: paginationData.total_count || 0,
          page_size: paginationData.page_size || currentPageSize,
          has_next: paginationData.has_next || false,
          has_previous: paginationData.has_previous || false
        });
      } else {
        // Fallback for different response structures
        const readingsData = Array.isArray(data?.data) ? data.data : 
                           Array.isArray(data?.results) ? data.results :
                           Array.isArray(data) ? data : [];
        
        setReadings(readingsData);
        setPagination({
          current_page: 1,
          total_pages: 1,
          total_count: readingsData.length,
          page_size: currentPageSize,
          has_next: false,
          has_previous: false
        });
      }
    } catch (error) {
      notification.error({
        message: 'Failed to load historical readings',
        description: error?.response?.data?.detail || error?.message || 'Please try again'
      });
      setReadings([]);
    } finally {
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

  const handleTableChange = (paginationConfig) => {
    const nextPage = paginationConfig.current;
    const nextSize = paginationConfig.pageSize;
    setPage(nextPage);
    setPageSize(nextSize);
    loadHistoricalReadings(nextPage, nextSize, searchText);
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
      responsive: ['sm'],
    },
    {
      title: 'Branch Name',
      dataIndex: 'branch_name',
      key: 'branch_name',
      ellipsis: true,
      responsive: ['sm'],
    },
    {
      title: 'Device Name',
      dataIndex: 'device_name',
      key: 'device_name',
      ellipsis: true,
      responsive: ['sm'],
    },
    {
      title: 'Reading',
      dataIndex: 'reading',
      key: 'reading',
      render: (v) => v != null ? (typeof v === 'number' ? Number(v).toFixed(2) : v) : '-',
      responsive: ['sm'],
    },
    {
      title: 'Post Time',
      dataIndex: 'post_datetime',
      key: 'post_datetime',
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
      responsive: ['md'],
    },
  ], []);

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

      <Table
        rowKey="id"
        loading={loading}
        dataSource={readings}
        columns={columns}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: pagination.current_page,
          pageSize: pagination.page_size,
          total: pagination.total_count,
          showSizeChanger: true,
          showQuickJumper: !isMobile,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          pageSizeOptions: ['10', '20', '50', '100'],
          responsive: true,
        }}
        onChange={handleTableChange}
        size={isMobile ? 'small' : 'middle'}
      />
    </div>
  )
}

export default HistoricalReadings
