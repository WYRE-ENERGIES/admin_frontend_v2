import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import {
  Typography,
  Input,
  Button,
  Checkbox,
  Tooltip,
  Select,
  Spin,
  notification,
} from 'antd';
import {
  SearchOutlined,
  StarFilled,
  StarOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  CaretUpFilled,
  CaretDownFilled,
} from '@ant-design/icons';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import {
  fetchRealtimePower,
  fetchDailyProduction,
  fetchMonthlyProduction,
  fetchTotalProduction,
  fetchStatusCounts,
  fetchSolarPlants,
  toggleFavourite as toggleFavouriteAction,
  fetchSolarClients,
  forceLoginSolarBranch,
} from '../../redux/actions/solarMgt/solarMgt.action';
import EnvData from '../../config/EnvData';
import './SolarMgt.css';

const { Title, Text } = Typography;

const CAPACITY_PRESETS = [
  { label: '0 - 5kWp', min: 0, max: 5 },
  { label: '5 - 9kWp', min: 5, max: 9 },
  { label: '9 - 16kWp', min: 9, max: 16 },
  { label: '16 - 30kWp', min: 16, max: 30 },
  { label: '30 - 100kWp', min: 30, max: 100 },
  { label: '100 - 500kWp', min: 100, max: 500 },
  { label: 'Above 500kWp', min: 500, max: null },
];

const TAG_OPTIONS = [
  'VIP', 'Premium', 'Health', 'Commercial', 'Retail',
  'Industrial', 'Critical', 'Govt.', 'Education',
];

const STATUS_FILTERS = [
  { key: 'total', label: 'Total', color: '#5C12A7', countKey: 'total' },
  { key: 'online', label: 'Online', color: '#22c55e', countKey: 'online' },
  { key: 'incomplete', label: 'Incomplete', color: '#3b82f6', countKey: 'incomplete' },
  { key: 'offline', label: 'Offline', color: '#ef4444', countKey: 'offline' },
  { key: 'partially_offline', label: 'Partially Offline', color: '#f59e0b', countKey: 'partial' },
  { key: 'no_alerts', label: 'No Alerts', color: '#22c55e', countKey: 'no_alerts' },
  { key: 'alerts', label: 'Alerts', color: '#ef4444', countKey: 'alerts' },
];

const STATUS_DOT_COLORS = {
  online: '#22c55e',
  offline: '#ef4444',
  incomplete: '#3b82f6',
  partially_offline: '#f59e0b',
  partial: '#f59e0b',
  never: '#3b82f6',
};

const getStatusDotColor = (statusKey) => STATUS_DOT_COLORS[statusKey] || '#9ca3af';

const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  const num = Number(value);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatCompact = (value, decimals = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const normalizeTrend = (trend) => {
  if (!Array.isArray(trend) || trend.length === 0) return null;
  return trend.map((y, i) => ({ x: i, y: Number(y) || 0 }));
};

const SOLAR_DASHBOARD_REDIRECT = '/solar-overview';

const getPlantBranchId = (plant) =>
  plant?.branch_id ?? plant?.branch ?? plant?.id ?? null;

const SolarMgt = ({
  solarMgt,
  fetchRealtimePower: fetchRealtimePowerAction,
  fetchDailyProduction: fetchDailyProductionAction,
  fetchMonthlyProduction: fetchMonthlyProductionAction,
  fetchTotalProduction: fetchTotalProductionAction,
  fetchStatusCounts: fetchStatusCountsAction,
  fetchSolarPlants: fetchSolarPlantsAction,
  toggleFavourite: toggleFavouriteThunk,
  fetchSolarClients: fetchSolarClientsAction,
  forceLoginSolarBranch: forceLoginSolarBranchThunk,
}) => {
  const {
    realtimePower,
    realtimePowerLoading,
    dailyProduction,
    dailyProductionLoading,
    monthlyProduction,
    monthlyProductionLoading,
    totalProduction,
    totalProductionLoading,
    statusCounts,
    statusCountsLoading,
    plants,
    plantsCount,
    plantsLoading,
    plantsError,
    toggleFavouriteLoadingId,
    clients,
    clientsLoading,
  } = solarMgt;

  const [searchText, setSearchText] = useState('');
  const [activeStatus, setActiveStatus] = useState('total');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [capacityMin, setCapacityMin] = useState('');
  const [capacityMax, setCapacityMax] = useState('');
  const [appliedCapacity, setAppliedCapacity] = useState({ min: '', max: '' });
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [appliedTags, setAppliedTags] = useState([]);
  const [selectedClient, setSelectedClient] = useState('all');
  const [appliedClient, setAppliedClient] = useState('all');
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [sortAsc, setSortAsc] = useState(true);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [dashboardLoginBranchId, setDashboardLoginBranchId] = useState(null);

  // Initial KPI / status counts / clients fetch
  useEffect(() => {
    fetchRealtimePowerAction();
    fetchDailyProductionAction();
    fetchMonthlyProductionAction();
    fetchTotalProductionAction();
    fetchStatusCountsAction();
    fetchSolarClientsAction();
  }, [
    fetchRealtimePowerAction,
    fetchDailyProductionAction,
    fetchMonthlyProductionAction,
    fetchTotalProductionAction,
    fetchStatusCountsAction,
    fetchSolarClientsAction,
  ]);

  // Plants fetch reacts to filters/pagination
  useEffect(() => {
    fetchSolarPlantsAction({
      page: currentPage,
      page_size: pageSize,
      search: searchText.trim(),
      status: activeStatus,
      client: appliedClient,
      min_capacity: appliedCapacity.min,
      max_capacity: appliedCapacity.max,
      tags: appliedTags,
      watchlist: watchlistOnly,
    });
  }, [
    fetchSolarPlantsAction,
    currentPage,
    pageSize,
    searchText,
    activeStatus,
    appliedClient,
    appliedCapacity,
    appliedTags,
    watchlistOnly,
  ]);

  useEffect(() => {
    if (plantsError)
    {
      notification.warning({
        message: 'Could not load plants',
        description: plantsError,
      });
    }
  }, [plantsError]);

  const togglePreset = (preset) => {
    const isSelected = selectedPresets.includes(preset.label);
    if (isSelected)
    {
      setSelectedPresets(selectedPresets.filter((p) => p !== preset.label));
      setCapacityMin('');
      setCapacityMax('');
    } else
    {
      setSelectedPresets([preset.label]);
      setCapacityMin(String(preset.min));
      setCapacityMax(preset.max != null ? String(preset.max) : '');
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleApply = () => {
    setAppliedCapacity({ min: capacityMin, max: capacityMax });
    setAppliedTags(selectedTags);
    setAppliedClient(selectedClient);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setCapacityMin('');
    setCapacityMax('');
    setSelectedPresets([]);
    setSelectedTags([]);
    setSelectedClient('all');
    setAppliedCapacity({ min: '', max: '' });
    setAppliedTags([]);
    setAppliedClient('all');
    setWatchlistOnly(false);
    setCurrentPage(1);
  };

  const handleToggleFavourite = async (plantId) => {
    if (!plantId) return;
    const result = await toggleFavouriteThunk(plantId);
    if (!result?.fulfilled)
    {
      notification.error({
        message: 'Failed to update favourite',
        description: result?.message || 'Please try again.',
      });
    } else
    {
      // Refresh status counts so the watchlist badge stays in sync
      fetchStatusCountsAction();
    }
  };

  const handleOpenSolarDashboard = async (plant) => {
    const branchId = getPlantBranchId(plant);
    if (!branchId)
    {
      notification.warning({
        message: 'Cannot open dashboard',
        description: 'This plant is not linked to a branch.',
      });
      return;
    }

    setDashboardLoginBranchId(branchId);
    try
    {
      const data = await forceLoginSolarBranchThunk(branchId);
      const dashboardBase = (data.redirect_url || EnvData.REACT_APP_DASHBOARD_URL).replace(/\/$/, '');
      const params = new URLSearchParams({
        access: data.token.access,
        refresh: data.token.refresh,
        username: data.username ?? '',
        email: data.email ?? '',
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        redirect: SOLAR_DASHBOARD_REDIRECT,
      });
      window.open(
        `${dashboardBase}/force-login?${params.toString()}`,
        '_blank'
      );
    } catch (err)
    {
      const errData = err?.response?.data;
      if (errData?.detail === 'You do not have permission for this branch')
      {
        notification.error({
          message: 'Access Denied',
          description: 'You do not have permission to access this branch solar dashboard. Please contact your administrator for access rights.',
          duration: 5,
        });
      } else if (errData?.detail)
      {
        notification.error({
          message: 'Solar Dashboard Access Failed',
          description: errData.detail,
          duration: 5,
        });
      } else if (errData?.message)
      {
        notification.error({
          message: 'Solar Dashboard Login Failed',
          description: errData.message,
          duration: 5,
        });
      } else
      {
        notification.error({
          message: 'Solar Dashboard Login Failed',
          description: err?.message || 'Unable to open the solar dashboard. Please try again later.',
          duration: 5,
        });
      }
    } finally
    {
      setDashboardLoginBranchId(null);
    }
  };

  const handleRefresh = () => {
    fetchRealtimePowerAction();
    fetchDailyProductionAction();
    fetchMonthlyProductionAction();
    fetchTotalProductionAction();
    fetchStatusCountsAction();
    fetchSolarPlantsAction({
      page: currentPage,
      page_size: pageSize,
      search: searchText.trim(),
      status: activeStatus,
      client: appliedClient,
      min_capacity: appliedCapacity.min,
      max_capacity: appliedCapacity.max,
      tags: appliedTags,
      watchlist: watchlistOnly,
    });
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allSelected = useMemo(() => {
    if (!plants.length) return false;
    return plants.every((p) => selectedRows[p.id]);
  }, [selectedRows, plants]);

  const someSelected = useMemo(() => {
    return plants.some((p) => selectedRows[p.id]);
  }, [selectedRows, plants]);

  const handleSelectAll = (e) => {
    if (e.target.checked)
    {
      const all = {};
      plants.forEach((p) => {
        all[p.id] = true;
      });
      setSelectedRows(all);
    } else
    {
      setSelectedRows({});
    }
  };

  const localFavCount = useMemo(
    () => plants.filter((p) => p.is_favourited).length,
    [plants]
  );

  const watchlistCount = statusCounts?.watchlist ?? localFavCount;

  const anySelected = Object.values(selectedRows).some(Boolean);

  // Build the table rows from the plants response with client-side filter
  // fallback (in case the backend ignores some query params), then sort by name.
  const tableRows = useMemo(() => {
    const text = (searchText || '').trim().toLowerCase();
    const minCap = appliedCapacity.min !== '' ? Number(appliedCapacity.min) : null;
    const maxCap = appliedCapacity.max !== '' ? Number(appliedCapacity.max) : null;
    const tagsLower = appliedTags.map((t) => String(t).toLowerCase());

    const rows = plants.filter((p) => {
      if (watchlistOnly && !p?.is_favourited) return false;

      if (text)
      {
        const haystack = `${p?.name || ''} ${p?.address || ''} ${p?.client || ''} ${p?.station_id || ''}`.toLowerCase();
        if (!haystack.includes(text)) return false;
      }

      if (activeStatus !== 'total')
      {
        const com = p?.status?.com;
        const alerts = p?.status?.alerts;
        if (activeStatus === 'online' && com !== 'online') return false;
        if (activeStatus === 'offline' && com !== 'offline') return false;
        if (activeStatus === 'incomplete' && com !== 'incomplete') return false;
        if (activeStatus === 'partially_offline' && com !== 'partial' && com !== 'partially_offline') return false;
        if (activeStatus === 'alerts' && (!alerts || alerts === 'ok')) return false;
        if (activeStatus === 'no_alerts' && alerts && alerts !== 'ok') return false;
      }

      if (appliedClient && appliedClient !== 'all')
      {
        const plantClient = p?.client;
        const plantClientId = p?.client_id;
        if (
          String(plantClient) !== String(appliedClient) &&
          String(plantClientId) !== String(appliedClient)
        )
        {
          return false;
        }
      }

      const capacityKwp = Number(p?.capacity?.installed_pv_kwp);
      if (minCap != null && !Number.isNaN(capacityKwp) && capacityKwp < minCap) return false;
      if (maxCap != null && !Number.isNaN(capacityKwp) && capacityKwp > maxCap) return false;

      if (tagsLower.length > 0)
      {
        const plantTags = Array.isArray(p?.tags) ? p.tags.map((t) => String(t).toLowerCase()) : [];
        const hasAny = tagsLower.some((t) => plantTags.includes(t));
        if (!hasAny) return false;
      }

      return true;
    });

    rows.sort((a, b) => {
      const cmp = (a?.name || '').localeCompare(b?.name || '');
      return sortAsc ? cmp : -cmp;
    });
    return rows;
  }, [
    plants,
    sortAsc,
    searchText,
    activeStatus,
    appliedClient,
    appliedCapacity,
    appliedTags,
    watchlistOnly,
  ]);

  const totalCount = watchlistOnly
    ? tableRows.length
    : (statusCounts?.total ?? plantsCount ?? tableRows.length);

  const cards = useMemo(() => {
    const installedCapacity = realtimePower?.installed_capacity_kwp;
    const powerW = realtimePower?.power_w;
    const dailyKwh = dailyProduction?.kwh;
    const deltaPct = dailyProduction?.delta_pct;
    const monthlyMwh = monthlyProduction?.mwh;
    const monthLabel = monthlyProduction?.month;
    const totalMwh = totalProduction?.mwh;
    const plantCount = totalProduction?.plant_count;

    const formatMonth = (m) => {
      if (!m) return '';
      const [year, month] = String(m).split('-');
      if (!year || !month) return m;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const idx = Number(month) - 1;
      const name = monthNames[idx] || month;
      return `${name} ${year}`;
    };

    return [
      {
        key: 'realtime',
        label: 'Real-time generating power',
        value: powerW != null ? formatNumber(powerW, 0) : '—',
        unit: 'W',
        sub: installedCapacity != null
          ? `Installed capacity: ${formatNumber(installedCapacity, 2)} kWp`
          : 'Installed capacity: —',
        bg: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        decorationColor: 'rgba(255,255,255,0.08)',
        loading: realtimePowerLoading,
      },
      {
        key: 'daily',
        label: 'Daily Production',
        value: dailyKwh != null ? formatNumber(dailyKwh, dailyKwh >= 100 ? 1 : 2) : '—',
        unit: 'kWh',
        sub: deltaPct != null
          ? `vs yesterday: ${deltaPct > 0 ? '+' : ''}${formatNumber(deltaPct, 1)}%`
          : 'vs yesterday: —',
        bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        decorationColor: 'rgba(255,255,255,0.08)',
        loading: dailyProductionLoading,
      },
      {
        key: 'monthly',
        label: 'Monthly Production',
        value: monthlyMwh != null ? formatNumber(monthlyMwh, 2) : '—',
        unit: 'MWh',
        sub: monthLabel
          ? `${formatMonth(monthLabel)} month-to-date`
          : 'Month-to-date',
        bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        decorationColor: 'rgba(255,255,255,0.08)',
        loading: monthlyProductionLoading,
      },
      {
        key: 'total',
        label: 'Total Production',
        value: totalMwh != null ? formatNumber(totalMwh, 2) : '—',
        unit: 'MWh',
        sub: plantCount != null
          ? `Lifetime across ${plantCount} plant${plantCount === 1 ? '' : 's'}`
          : 'Lifetime',
        bg: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
        decorationColor: 'rgba(255,255,255,0.12)',
        loading: totalProductionLoading,
      },
    ];
  }, [
    realtimePower,
    realtimePowerLoading,
    dailyProduction,
    dailyProductionLoading,
    monthlyProduction,
    monthlyProductionLoading,
    totalProduction,
    totalProductionLoading,
  ]);

  return (
    <div className="solar-mgt-page">
      <div className="solar-mgt-header">
        <Title level={2} className="solar-mgt-title">Solar Management</Title>
        <Text className="solar-mgt-subtitle">
          Live snapshot across all Wyre-managed plants
        </Text>
      </div>

      <div className="solar-mgt-cards">
        {cards.map((card) => (
          <div
            key={card.key}
            className="solar-kpi-card"
            style={{ background: card.bg }}
          >
            <div className="solar-kpi-decoration solar-kpi-decoration--xl" style={{ background: card.decorationColor }} />
            <div className="solar-kpi-decoration solar-kpi-decoration--lg" style={{ background: card.decorationColor }} />
            <div className="solar-kpi-decoration solar-kpi-decoration--sm" style={{ background: card.decorationColor }} />
            <div className="solar-kpi-icon-wrap">
              <div className="solar-kpi-icon">
                <SunIcon />
              </div>
              <Text className="solar-kpi-label">{card.label}</Text>
            </div>
            <div className="solar-kpi-value-row">
              {card.loading ? (
                <Spin size="small" style={{ color: '#fff' }} />
              ) : (
                <>
                  <span className="solar-kpi-value">{card.value}</span>
                  <span className="solar-kpi-unit">{card.unit}</span>
                </>
              )}
            </div>
            <Text className="solar-kpi-sub">{card.sub}</Text>
          </div>
        ))}
      </div>

      <div className="solar-watchlist-bar">
        <button
          type="button"
          className={`solar-watchlist-label ${watchlistOnly ? 'is-active' : ''}`}
          onClick={() => {
            setWatchlistOnly((prev) => !prev);
            setCurrentPage(1);
          }}
          aria-pressed={watchlistOnly}
          title={watchlistOnly ? 'Show all plants' : 'Show only favourited plants'}
        >
          <StarFilled style={{ color: '#f59e0b' }} />
          <span>My Watchlist({watchlistCount})</span>
        </button>
        <Input
          className="solar-watchlist-search"
          placeholder={watchlistOnly ? 'Search watchlist by name, address, client' : 'Search all plants by name, address, client'}
          suffix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          allowClear
        />
      </div>

      <div className="solar-filters-card">
        <div className="solar-status-tabs">
          {STATUS_FILTERS.map((status) => {
            const count = statusCounts?.[status.countKey] ?? 0;
            const isActive = activeStatus === status.key;
            return (
              <button
                key={status.key}
                type="button"
                className={`solar-status-tab ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveStatus(status.key);
                  setCurrentPage(1);
                }}
              >
                {status.key !== 'total' && (
                  <span
                    className="solar-status-dot"
                    style={{ background: status.color }}
                  />
                )}
                <span className="solar-status-label">{status.label}</span>
                <span className="solar-status-count">
                  ({statusCountsLoading ? '…' : count})
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className="solar-filter-toggle"
            onClick={() => setFiltersExpanded((prev) => !prev)}
          >
            {filtersExpanded ? (
              <>
                Collapse <CaretUpFilled style={{ fontSize: 10 }} />
              </>
            ) : (
              <>
                Filter <CaretDownFilled style={{ fontSize: 10 }} />
              </>
            )}
          </button>

          <button
            type="button"
            className="solar-refresh-btn"
            aria-label="Refresh"
            onClick={handleRefresh}
          >
            <ReloadOutlined spin={plantsLoading} />
          </button>
        </div>

        {filtersExpanded && (
          <div className="solar-filters-body">
            <div className="solar-filter-row">
              <label className="solar-filter-label">Capacity (kWp):</label>
              <div className="solar-filter-row-content">
                <div className="solar-capacity-inputs">
                  <Input
                    placeholder="Minimum kWp"
                    value={capacityMin}
                    onChange={(e) => {
                      setCapacityMin(e.target.value);
                      setSelectedPresets([]);
                    }}
                    type="number"
                    className="solar-capacity-input"
                  />
                  <span className="solar-capacity-sep">—</span>
                  <Input
                    placeholder="Maximum kWp"
                    value={capacityMax}
                    onChange={(e) => {
                      setCapacityMax(e.target.value);
                      setSelectedPresets([]);
                    }}
                    type="number"
                    className="solar-capacity-input"
                  />
                </div>
                <div className="solar-capacity-presets">
                  {CAPACITY_PRESETS.map((preset) => {
                    const selected = selectedPresets.includes(preset.label);
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        className={`solar-chip ${selected ? 'is-selected' : ''}`}
                        onClick={() => togglePreset(preset)}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="solar-filter-divider" />

            <div className="solar-filter-row">
              <label className="solar-filter-label">Client:</label>
              <div className="solar-filter-row-content">
                <Select
                  className="solar-client-select"
                  value={selectedClient}
                  onChange={setSelectedClient}
                  loading={clientsLoading}
                  options={[
                    { value: 'all', label: 'All clients' },
                    ...clients.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
                <Text className="solar-filter-hint">
                  Only clients with at least one solar plant are listed.
                </Text>
              </div>
            </div>

            <div className="solar-filter-divider" />

            <div className="solar-filter-row">
              <label className="solar-filter-label">Tag:</label>
              <div className="solar-filter-row-content">
                <div className="solar-tag-presets">
                  {TAG_OPTIONS.map((tag) => {
                    const selected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`solar-chip ${selected ? 'is-selected' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="solar-filter-actions">
              <button type="button" className="solar-reset-btn" onClick={handleReset}>
                Reset
              </button>
              <Button type="primary" className="solar-apply-btn" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        )}

        <div className="solar-table-scroll">
          <div className="solar-table">
          <div className="solar-table-head">
            <div className="solar-th solar-th-checkbox">
              <Checkbox
                indeterminate={someSelected && !allSelected}
                checked={allSelected}
                onChange={handleSelectAll}
                disabled={!plants.length}
              />
            </div>
            <div
              className="solar-th solar-th-name"
              onClick={() => setSortAsc((prev) => !prev)}
            >
              Name {sortAsc ? <CaretUpFilled style={{ fontSize: 10 }} /> : <CaretDownFilled style={{ fontSize: 10 }} />}
            </div>
            <div className="solar-th solar-th-status">
              <div>Status</div>
              <div className="solar-th-sub">(Last Posted)</div>
            </div>
            <div className="solar-th solar-th-alerts">Alerts</div>
            <div className="solar-th solar-th-capacity">Capacity (kWp)</div>
            <div className="solar-th solar-th-production">Production (kW)</div>
            <div className="solar-th solar-th-trend">Trend</div>
            <div className="solar-th solar-th-daily">Daily Production (kWh)</div>
            <div className="solar-th solar-th-tag">Tag</div>
            <div className="solar-th solar-th-fav">Favourite</div>
          </div>

          <div className="solar-table-body">
            {plantsLoading ? (
              <div className="solar-empty-state">
                <Spin />
              </div>
            ) : tableRows.length === 0 ? (
              <div className="solar-empty-state">
                <Text type="secondary">No plants match the current filters.</Text>
              </div>
            ) : (
              tableRows.map((plant) => {
                const statusCom = plant?.status?.com || 'unknown';
                const lastPostedLabel = plant?.status?.last_posted_label || '—';
                const lastPostedAt = plant?.status?.last_posted_at;
                const alertsState = plant?.status?.alerts || 'unknown';
                const capacityKwp = plant?.capacity?.installed_pv_kwp;
                const powerKw = plant?.now?.power_kw;
                const dailyKwh = plant?.production?.daily_kwh;
                const trendData = normalizeTrend(plant?.trend);
                const tagsArr = Array.isArray(plant?.tags) ? plant.tags : [];
                const isSelected = !!selectedRows[plant.id];
                const isFavLoading = String(toggleFavouriteLoadingId) === String(plant.id);
                const branchId = getPlantBranchId(plant);
                const isDashboardLoginLoading =
                  branchId != null && String(dashboardLoginBranchId) === String(branchId);
                const isNever = !lastPostedAt && (lastPostedLabel === 'Never' || lastPostedLabel === '—');
                const statusKey = isNever ? 'never' : statusCom;
                const dotColor = getStatusDotColor(statusKey);
                const alertsDotColor = alertsState === 'ok'
                  ? '#22c55e'
                  : alertsState === 'warn'
                    ? '#f59e0b'
                    : alertsState === 'crit' || alertsState === 'critical'
                      ? '#ef4444'
                      : '#9ca3af';

                return (
                  <div key={plant.id} className={`solar-tr ${isSelected ? 'is-selected' : ''}`}>
                    <div className="solar-td solar-td-checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleSelectRow(plant.id)}
                      />
                    </div>
                    <div className="solar-td solar-td-name">
                      <div className="solar-plant-name">
                        <button
                          type="button"
                          className="solar-plant-name-link"
                          onClick={() => handleOpenSolarDashboard(plant)}
                          disabled={isDashboardLoginLoading}
                          title={`Open ${plant.name || 'plant'} solar dashboard`}
                        >
                          {isDashboardLoginLoading ? (
                            <Spin size="small" />
                          ) : (
                            <>
                              <span className="solar-plant-name-text">{plant.name || '—'}</span>
                              <ArrowUpOutlined className="solar-plant-arrow" />
                            </>
                          )}
                        </button>
                      </div>
                      {plant.address && (
                        <div className="solar-plant-address">
                          <LocationPin /> {plant.address}
                        </div>
                      )}
                    </div>
                    <div className="solar-td solar-td-status">
                      <span
                        className="solar-status-dot solar-status-dot--lg"
                        style={{ background: dotColor }}
                      />
                      <span
                        className="solar-status-time"
                        style={statusKey === 'never' ? { color: dotColor } : undefined}
                      >
                        {lastPostedLabel}
                      </span>
                    </div>
                    <div className="solar-td solar-td-alerts">
                      <span
                        className="solar-status-dot solar-status-dot--lg"
                        style={{ background: alertsDotColor }}
                      />
                    </div>
                    <div className="solar-td solar-td-capacity">
                      {formatCompact(capacityKwp, 1)}
                    </div>
                    <div className="solar-td solar-td-production">
                      {formatCompact(powerKw, 2)}
                    </div>
                    <div className="solar-td solar-td-trend">
                      {trendData ? (
                        <div className="solar-trend-wrap">
                          <ResponsiveContainer width="100%" height={36}>
                            <LineChart data={trendData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                              <YAxis hide domain={[0, 'dataMax + 0.5']} />
                              <Line
                                type="monotone"
                                dataKey="y"
                                stroke="#7c3aed"
                                strokeWidth={1.5}
                                dot={false}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <span className="solar-trend-flat">—</span>
                      )}
                    </div>
                    <div className="solar-td solar-td-daily">
                      {formatCompact(dailyKwh, 1)}
                    </div>
                    <div className="solar-td solar-td-tag">
                      {tagsArr.length > 0 && (
                        <span className="solar-tag-pill">{tagsArr[0]}</span>
                      )}
                      <button type="button" className="solar-tag-edit">Edit</button>
                    </div>
                    <div className="solar-td solar-td-fav">
                      <button
                        type="button"
                        className="solar-fav-btn"
                        onClick={() => handleToggleFavourite(plant.id)}
                        aria-label="Toggle favourite"
                        disabled={isFavLoading}
                      >
                        {isFavLoading ? (
                          <Spin size="small" />
                        ) : plant.is_favourited ? (
                          <StarFilled style={{ color: '#f59e0b' }} />
                        ) : (
                          <StarOutlined style={{ color: '#9ca3af' }} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </div>
        </div>

        <div className="solar-table-footer">
          <div className="solar-footer-left">
            <Tooltip title={anySelected ? '' : 'Select at least one plant'}>
              <Button
                className="solar-footer-btn"
                disabled={!anySelected}
              >
                Authorize
              </Button>
            </Tooltip>
            <Tooltip title={anySelected ? '' : 'Select at least one plant'}>
              <Button
                className="solar-footer-btn"
                disabled={!anySelected}
              >
                Add Tag
              </Button>
            </Tooltip>
          </div>
          <div className="solar-footer-right">
            <span className="solar-footer-total">Total <b>{totalCount}</b></span>
            <div className="solar-pagination">
              <button
                type="button"
                className="solar-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <CaretDownFilled style={{ transform: 'rotate(90deg)', fontSize: 10 }} />
              </button>
              <button type="button" className="solar-page-num is-active">{currentPage}</button>
              <button
                type="button"
                className="solar-page-btn"
                disabled={currentPage * pageSize >= (plantsCount || totalCount)}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <CaretDownFilled style={{ transform: 'rotate(-90deg)', fontSize: 10 }} />
              </button>
            </div>
            <Select
              className="solar-page-size"
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
              options={[
                { value: 10, label: '10/page' },
                { value: 20, label: '20/page' },
                { value: 50, label: '50/page' },
                { value: 100, label: '100/page' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4" fill="#fff" />
    <g stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" />
      <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" />
    </g>
  </svg>
);

const LocationPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: -1, marginRight: 3 }}>
    <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Z" stroke="#9ca3af" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="12" cy="9" r="2.5" stroke="#9ca3af" strokeWidth="1.6" />
  </svg>
);

const mapStateToProps = (state) => ({
  solarMgt: state.solarMgt,
});

const mapDispatchToProps = {
  fetchRealtimePower,
  fetchDailyProduction,
  fetchMonthlyProduction,
  fetchTotalProduction,
  fetchStatusCounts,
  fetchSolarPlants,
  toggleFavourite: toggleFavouriteAction,
  fetchSolarClients,
  forceLoginSolarBranch,
};

export default connect(mapStateToProps, mapDispatchToProps)(SolarMgt);
