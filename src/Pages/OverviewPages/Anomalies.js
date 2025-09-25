import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Button, Modal, Table, Tag, Typography, Space, notification, Popconfirm, Input, Divider } from 'antd'
import { APIService } from '../../config/Api/apiServices'
import { ExclamationCircleFilled, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title, Text } = Typography;

const LIST_ENDPOINT = '/api/v1/anomalies/readings/';
const CONTEXT_ENDPOINT = '/api/v1/anomalies/reading-context/';
const DELETE_ENDPOINT = '/api/v1/anomalies/readings/delete/';
const CLEAR_FLAGS_ENDPOINT = '/api/v1/anomalies/readings/clear-flags/';

const defaultPageSize = 20;
const DEBOUNCE_MS = 400;

const Anomalies = () => {
  const [loading, setLoading] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');

  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextWindow, setContextWindow] = useState(10);
  const [contextTarget, setContextTarget] = useState(null);
  const [contextRows, setContextRows] = useState([]);
  const [selectedContextRowKeys, setSelectedContextRowKeys] = useState([]);

  const loadAnomalies = useCallback(async (nextPage, nextPageSize, query) => {
    setLoading(true);
    try
    {
      const params = { page: nextPage, page_size: nextPageSize };
      if (query && query.trim())
      {
        params.search = query.trim();
      }
      const response = await APIService.get(LIST_ENDPOINT, { params });
      const data = response?.data;
      const payload = data?.data || data;

      // Expected shape: { status, data: { readings, total_count, page, page_size, total_pages } }
      if (payload?.readings && Array.isArray(payload.readings))
      {
        setAnomalies(payload.readings);
        setTotal(Number(payload.total_count || 0));
      } else if (Array.isArray(payload))
      {
        setAnomalies(payload);
        setTotal(payload.length || 0);
      } else if (Array.isArray(payload?.results))
      {
        setAnomalies(payload.results);
        setTotal(Number(payload.count || 0));
      } else if (Array.isArray(payload?.data))
      {
        setAnomalies(payload.data);
        setTotal(payload.data.length || 0);
      } else
      {
        setAnomalies([]);
        setTotal(0);
      }
    } catch (error)
    {
      notification.error({
        message: 'Failed to load anomalies',
        description: error?.response?.data?.detail || error?.message || 'Please try again'
      });
    } finally
    {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnomalies(1, defaultPageSize, '');
    setPage(1);
    setPageSize(defaultPageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced live search: triggers fetch 400ms after user stops typing
  const isFirstSearchRef = useRef(true);
  useEffect(() => {
    // Skip running on the very first mount since we already load once above
    if (isFirstSearchRef.current)
    {
      isFirstSearchRef.current = false;
      return;
    }
    const handle = setTimeout(() => {
      setPage(1);
      loadAnomalies(1, pageSize, (searchText || '').trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchText, pageSize, loadAnomalies]);

  const handleTableChange = (pagination) => {
    const nextPage = pagination.current;
    const nextSize = pagination.pageSize;
    setPage(nextPage);
    setPageSize(nextSize);
    loadAnomalies(nextPage, nextSize, searchText);
  };

  const onSearch = () => {
    setPage(1);
    loadAnomalies(1, pageSize, (searchText || '').trim());
  };

  const clearSearch = () => {
    setSearchText('');
    setPage(1);
    loadAnomalies(1, pageSize, '');
  };

  const openContextFor = useCallback(async (record) => {
    setContextModalOpen(true);
    setContextLoading(true);
    setContextTarget(record);
    setSelectedContextRowKeys([]);
    try
    {
      const response = await APIService.get(CONTEXT_ENDPOINT, {
        params: { reading_id: record.id, window: contextWindow }
      });
      const payload = response?.data?.data || response?.data;
      const previous = payload?.previous || [];
      const target = payload?.target ? [{ ...payload.target, __contextType: 'target' }] : [];
      const next = payload?.next || [];
      const normalize = (arr, type) => (arr || []).map((r) => ({ ...r, __contextType: type }));
      const rows = [
        ...normalize(previous, 'previous'),
        ...target,
        ...normalize(next, 'next'),
      ];
      setContextRows(rows);
    } catch (error)
    {
      notification.error({
        message: 'Failed to load reading context',
        description: error?.response?.data?.detail || error?.message || 'Please try again'
      });
      setContextRows([]);
    } finally
    {
      setContextLoading(false);
    }
  }, [contextWindow]);

  const reloadContext = useCallback(async () => {
    if (!contextTarget) return;
    setContextLoading(true);
    setSelectedContextRowKeys([]);
    try
    {
      const response = await APIService.get(CONTEXT_ENDPOINT, {
        params: { reading_id: contextTarget.id, window: contextWindow }
      });
      const payload = response?.data?.data || response?.data;
      const previous = payload?.previous || [];
      const target = payload?.target ? [{ ...payload.target, __contextType: 'target' }] : [];
      const next = payload?.next || [];
      const normalize = (arr, type) => (arr || []).map((r) => ({ ...r, __contextType: type }));
      const rows = [
        ...normalize(previous, 'previous'),
        ...target,
        ...normalize(next, 'next'),
      ];
      setContextRows(rows);
    } catch (error)
    {
      notification.error({
        message: 'Failed to refresh context',
        description: error?.response?.data?.detail || error?.message || 'Please try again'
      });
    } finally
    {
      setContextLoading(false);
    }
  }, [contextTarget, contextWindow]);

  const deleteByIds = useCallback(async (ids, onDone) => {
    if (!ids || ids.length === 0) return;
    try
    {
      const payload = { ids };
      await APIService.delete(DELETE_ENDPOINT, payload);
      notification.success({ message: 'Deleted successfully' });
      if (typeof onDone === 'function') onDone();
    } catch (error)
    {
      notification.error({
        message: 'Delete failed',
        description: error?.response?.data?.detail || error?.message || 'Please try again'
      });
    }
  }, []);

  const clearFlagsByIds = useCallback(async (ids, onDone) => {
    if (!ids || ids.length === 0) return;
    try
    {
      const payload = { ids };
      const response = await APIService.post(CLEAR_FLAGS_ENDPOINT, payload);
      const data = response?.data;
      const updated = data?.updated || 0;
      const found = data?.found || 0;

      notification.success({
        message: 'Flags cleared successfully',
        description: `Updated ${updated} out of ${found} readings`
      });
      if (typeof onDone === 'function') onDone();
    } catch (error)
    {
      notification.error({
        message: 'Clear flags failed',
        description: error?.response?.data?.detail || error?.message || 'Please try again'
      });
    }
  }, []);

  const handleBulkDeleteMain = useCallback(async () => {
    const ids = selectedRowKeys;
    await deleteByIds(ids, () => {
      setSelectedRowKeys([]);
      loadAnomalies(page, pageSize, searchText);
    });
  }, [deleteByIds, loadAnomalies, page, pageSize, searchText, selectedRowKeys]);

  const handleBulkClearFlagsMain = useCallback(async () => {
    const ids = selectedRowKeys;
    await clearFlagsByIds(ids, () => {
      setSelectedRowKeys([]);
      loadAnomalies(page, pageSize, searchText);
    });
  }, [clearFlagsByIds, loadAnomalies, page, pageSize, searchText, selectedRowKeys]);

  const handleRowDelete = useCallback(async (record) => {
    await deleteByIds([record.id], () => {
      if (contextTarget && contextTarget.id === record.id)
      {
        setContextModalOpen(false);
        setContextRows([]);
        setContextTarget(null);
      }
      loadAnomalies(page, pageSize, searchText);
    });
  }, [contextTarget, deleteByIds, loadAnomalies, page, pageSize, searchText]);

  const handleRowClearFlags = useCallback(async (record) => {
    await clearFlagsByIds([record.id], () => {
      if (contextTarget && contextTarget.id === record.id)
      {
        setContextModalOpen(false);
        setContextRows([]);
        setContextTarget(null);
      }
      loadAnomalies(page, pageSize, searchText);
    });
  }, [contextTarget, clearFlagsByIds, loadAnomalies, page, pageSize, searchText]);

  const handleBulkDeleteContext = useCallback(async () => {
    const ids = selectedContextRowKeys;
    await deleteByIds(ids, () => {
      setSelectedContextRowKeys([]);
      reloadContext();
      loadAnomalies(page, pageSize, searchText);
    });
  }, [deleteByIds, loadAnomalies, page, pageSize, reloadContext, searchText, selectedContextRowKeys]);

  const handleBulkClearFlagsContext = useCallback(async () => {
    const ids = selectedContextRowKeys;
    await clearFlagsByIds(ids, () => {
      setSelectedContextRowKeys([]);
      reloadContext();
      loadAnomalies(page, pageSize, searchText);
    });
  }, [clearFlagsByIds, loadAnomalies, page, pageSize, reloadContext, searchText, selectedContextRowKeys]);

  const columns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Device',
      dataIndex: 'device_name',
      key: 'device_name',
      ellipsis: true,
    },
    {
      title: 'Branch',
      dataIndex: 'branch_name',
      key: 'branch_name',
      ellipsis: true,
    },
    {
      title: 'Posted At',
      dataIndex: 'post_datetime',
      key: 'post_datetime',
      render: (v) => (v ? new Date(v).toLocaleString() : ''),
    },
    {
      title: 'kWh Import',
      dataIndex: 'kwh_import',
      key: 'kwh_import',
    },
    {
      title: 'Irregular',
      dataIndex: 'is_irregular',
      key: 'is_irregular',
      render: (v) => v ? <Tag color="default">No</Tag> : <Tag color="red">Yes</Tag>,
    },
    {
      title: 'Zero Updated',
      dataIndex: 'zero_updated',
      key: 'zero_updated',
       render: (v) => v ? <Tag color="blue">True</Tag> : <Tag>False</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Mark as valid?"
            description={
              <div>
                This will clear flags for reading <Text strong>#{record.id}</Text> and remove it from anomalies.
              </div>
            }
            okText="Mark Valid"
            okType="outline"
            icon={<CheckCircleOutlined style={{ color: 'green' }} />}
            onConfirm={() => handleRowClearFlags(record)}
          >
            <Button size="small" type="primary" title="Mark as valid">
              Valid</Button>
          </Popconfirm>
          <Popconfirm
            title="Delete reading?"
            description={
              <div>
                This will permanently delete reading <Text strong>#{record.id}</Text>.
              </div>
            }
            okText="Delete"
            okType="danger"
            icon={<ExclamationCircleFilled style={{ color: 'red' }} />}
            onConfirm={() => handleRowDelete(record)}
          >
            <Button size="small" danger title="Delete" >
              Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [handleRowDelete, handleRowClearFlags]);


  const contextColumns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 110,
    },
    {
      title: 'Context',
      dataIndex: '__contextType',
      key: '__contextType',
      render: (v) => v === 'target' ? <Tag color="gold">Target</Tag> : <Tag>{v}</Tag>,
    },
    {
      title: 'Posted At',
      dataIndex: 'post_datetime',
      key: 'post_datetime',
      render: (v) => (v ? new Date(v).toLocaleString() : ''),
    },
    {
      title: 'kWh Import',
      dataIndex: 'kwh_import',
      key: 'kwh_import',
    },
    {
      title: 'Irregular',
      dataIndex: 'is_irregular',
      key: 'is_irregular',
      render: (v) => v ? <Tag color="red">Yes</Tag> : <Tag>No</Tag>,
    },
    {
      title: 'Reason',
      dataIndex: 'irregular_reason',
      key: 'irregular_reason',
      render: (v) => v || '-',
    },
  ], []);

  return (
    <div style={{ margin: '30px' }}>
      <div className="row" style={{ marginBottom: 20, alignItems: 'center' }}>
        <div className="col-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Title level={4} style={{ margin: 0 }}>Anomalies</Title>
          <Space>
            <Input.Search
              allowClear
              placeholder="Search by device, branch, reason..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={onSearch}
              style={{ width: 320 }}
            />
            <Button onClick={clearSearch}>Reset</Button>
            <Popconfirm
              title="Mark selected as valid?"
              description={
                <div>
                  This will clear flags for <Text strong>{selectedRowKeys.length}</Text> selected reading(s) and remove them from anomalies.
                </div>
              }
              okText="Mark Valid"
              okType="primary"
              icon={<CheckCircleOutlined style={{ color: 'green' }} />}
              onConfirm={handleBulkClearFlagsMain}
              disabled={!selectedRowKeys.length}
            >
              <Button type="primary" disabled={!selectedRowKeys.length} icon={<CheckCircleOutlined />}>
                Mark as valid
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Delete selected readings?"
              description={
                <div>
                  This will permanently delete <Text strong>{selectedRowKeys.length}</Text> selected reading(s).
                </div>
              }
              okText="Delete"
              okType="danger"
              icon={<ExclamationCircleFilled style={{ color: 'red' }} />}
              onConfirm={handleBulkDeleteMain}
              disabled={!selectedRowKeys.length}
            >
              <Button danger disabled={!selectedRowKeys.length} icon={<DeleteOutlined />}>
                Delete selected
              </Button>
            </Popconfirm>
            <Button type="primary" onClick={() => loadAnomalies(page, pageSize, searchText)} loading={loading}>Refresh</Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={anomalies}
        columns={columns}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
        onChange={handleTableChange}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        onRow={(record) => ({ 
          onClick: (e) => {
            // Only open modal if clicking on the row itself, not on action buttons
            if (e.target.closest('.ant-btn') || e.target.closest('.ant-popconfirm')) {
              return;
            }
            openContextFor(record);
          }
        })}
      />

      <Modal
        title={
          <Space>
            <Text>Reading context</Text>
            {contextTarget && (
              <Text type="secondary">(Target ID: {contextTarget.id}, Device: {contextTarget.device_name})</Text>
            )}
          </Space>
        }
        open={contextModalOpen}
        onCancel={() => setContextModalOpen(false)}
        footer={null}
        width={1000}
      >
        <Space style={{ marginBottom: 12 }}>
          <Text>Window size:</Text>
          <Input
            type="number"
            value={contextWindow}
            min={1}
            style={{ width: 100 }}
            onChange={(e) => setContextWindow(Number(e.target.value) || 1)}
          />
          <Button onClick={reloadContext} loading={contextLoading}>Reload</Button>
          <Divider type="vertical" />
          <Popconfirm
            title="Mark selected as valid?"
            description={
              <div>
                This will clear flags for <Text strong>{selectedContextRowKeys.length}</Text> selected reading(s) and remove them from anomalies.
              </div>
            }
            okText="Mark Valid"
            okType="primary"
            icon={<CheckCircleOutlined style={{ color: 'green' }} />}
            onConfirm={handleBulkClearFlagsContext}
            disabled={!selectedContextRowKeys.length}
          >
            <Button type="primary" disabled={!selectedContextRowKeys.length} icon={<CheckCircleOutlined />}>
              Mark as valid
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Delete selected in context?"
            description={
              <div>
                This will permanently delete <Text strong>{selectedContextRowKeys.length}</Text> selected reading(s) from the context.
              </div>
            }
            okText="Delete"
            okType="danger"
            icon={<ExclamationCircleFilled style={{ color: 'red' }} />}
            onConfirm={handleBulkDeleteContext}
            disabled={!selectedContextRowKeys.length}
          >
            <Button danger disabled={!selectedContextRowKeys.length} icon={<DeleteOutlined />}>
              Delete selected
            </Button>
          </Popconfirm>
        </Space>

        <Table
          rowKey="id"
          loading={contextLoading}
          dataSource={contextRows}
          columns={contextColumns}
          size="small"
          pagination={false}
          rowClassName={(record) => record.__contextType === 'target' ? 'table-row-target' : ''}
          rowSelection={{
            selectedRowKeys: selectedContextRowKeys,
            onChange: setSelectedContextRowKeys,
          }}
        />
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">Tip: Click a row in the main table to open its context.</Text>
        </div>
      </Modal>
    </div>
  )
}

export default Anomalies
