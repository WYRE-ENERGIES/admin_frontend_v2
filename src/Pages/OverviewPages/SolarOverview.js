import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import {
  Typography,
  Input,
  Button,
  Select,
  Spin,
  Drawer,
  Modal,
  Tooltip,
  notification,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CaretUpFilled,
  CaretDownFilled,
  ThunderboltFilled,
  StarFilled,
  StarOutlined,
  BellOutlined,
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  RightOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  XAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import {
  fetchClientGeneratingNow,
  fetchClientToday,
  fetchClientThisMonth,
  fetchClientLifetime,
  fetchClientStatusCounts,
  fetchClientBranches,
  fetchClientBranchTrend,
  toggleClientFavourite,
  fetchClientAlarms,
  acknowledgeClientAlarm,
  solarForceLogin,
} from '../../redux/actions/clientSolar/clientSolar.action';
import EnvData from '../../config/EnvData';
import './SolarOverview.css';

const { Title, Text } = Typography;

// Status filter tabs. The API returns counts by com state:
//   online   → "Active"
//   partial  → "Underperforming" (we also include `incomplete` here, since
//              both indicate a degraded reporting / output condition)
//   offline  → "Inactive"
//   alerts / no_alerts → alert-level buckets
const STATUS_FILTERS = [
  { key: 'total', label: 'Total', color: '#5C12A7' },
  { key: 'active', label: 'Active', color: '#22c55e' },
  { key: 'underperforming', label: 'Underperforming', color: '#f59e0b' },
  { key: 'inactive', label: 'Inactive', color: '#ef4444' },
  { key: 'no_alerts', label: 'No alerts', color: '#22c55e' },
  { key: 'alerts', label: 'Alerts', color: '#ef4444' },
];

// Map a STATUS_FILTERS key to the count fields in the status-counts response.
const getStatusFilterCount = (filterKey, counts = {}) => {
  if (!counts) return 0;
  switch (filterKey)
  {
    case 'total':
      return counts.total ?? 0;
    case 'active':
      return counts.online ?? 0;
    case 'underperforming':
      return (counts.partial ?? 0) + (counts.incomplete ?? 0);
    case 'inactive':
      return counts.offline ?? 0;
    case 'no_alerts':
      return counts.no_alerts ?? 0;
    case 'alerts':
      return counts.alerts ?? 0;
    default:
      return 0;
  }
};

const STATUS_DOT_COLORS = {
  online: '#22c55e',
  active: '#22c55e',
  partial: '#f59e0b',
  incomplete: '#f59e0b',
  underperforming: '#f59e0b',
  offline: '#ef4444',
  inactive: '#ef4444',
};

const STATUS_LABELS = {
  online: 'Active',
  active: 'Active',
  partial: 'Underperforming',
  incomplete: 'Underperforming',
  underperforming: 'Underperforming',
  offline: 'Inactive',
  inactive: 'Inactive',
};

const getStatusColor = (key) => STATUS_DOT_COLORS[key] || '#9ca3af';
const getStatusLabel = (key) => STATUS_LABELS[key] || (key ? String(key).replace(/_/g, ' ') : 'Unknown');

const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatCompact = (value, decimals = 2) => {
  const formatted = formatNumber(value, decimals);
  return formatted == null ? '—' : formatted;
};

const normalizeTrend = (trend) => {
  if (!Array.isArray(trend) || trend.length === 0) return null;
  return trend.map((y, i) => ({ x: i, y: Number(y) || 0 }));
};

const formatMonth = (m) => {
  if (!m) return '';
  const [year, month] = String(m).split('-');
  if (!year || !month) return m;
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const idx = Number(month) - 1;
  return `${names[idx] || month} ${year}`;
};

const downloadCsv = (filename, rows) => {
  if (!Array.isArray(rows) || rows.length === 0)
  {
    notification.info({ message: 'Nothing to export', description: 'No branches in the current view.' });
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const v = row[h] == null ? '' : String(row[h]).replace(/"/g, '""');
        return /[",\n]/.test(v) ? `"${v}"` : v;
      }).join(',')
    ),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const SolarOverview = ({
  clientSolar,
  fetchClientGeneratingNow: fetchGeneratingNowAction,
  fetchClientToday: fetchTodayAction,
  fetchClientThisMonth: fetchThisMonthAction,
  fetchClientLifetime: fetchLifetimeAction,
  fetchClientStatusCounts: fetchStatusCountsAction,
  fetchClientBranches: fetchBranchesAction,
  fetchClientBranchTrend: fetchBranchTrendAction,
  toggleClientFavourite: toggleFavouriteAction,
  fetchClientAlarms: fetchAlarmsAction,
  acknowledgeClientAlarm: ackAlarmAction,
  solarForceLogin: solarForceLoginAction,
}) => {
  const {
    generatingNow, generatingNowLoading,
    today, todayLoading,
    thisMonth, thisMonthLoading,
    lifetime, lifetimeLoading,
    statusCounts, statusCountsLoading,
    branches, branchesCount, branchesLoading, branchesError,
    trendByBranch, trendLoading,
    alarms, alarmsCount, alarmsLoading,
    ackAlarmLoading,
  } = clientSolar;

  const [viewMode, setViewMode] = useState('list');
  const [searchText, setSearchText] = useState('');
  const [activeStatus, setActiveStatus] = useState('total');
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientName, setClientName] = useState('');
  const [alarmsOpen, setAlarmsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [ackTarget, setAckTarget] = useState(null);
  const [ackNote, setAckNote] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [forceLoginId, setForceLoginId] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setClientName(u.client || '');
  }, []);

  useEffect(() => {
    fetchGeneratingNowAction();
    fetchTodayAction();
    fetchThisMonthAction();
    fetchLifetimeAction();
    fetchStatusCountsAction();
  }, [
    fetchGeneratingNowAction,
    fetchTodayAction,
    fetchThisMonthAction,
    fetchLifetimeAction,
    fetchStatusCountsAction,
  ]);

  useEffect(() => {
    fetchBranchesAction({
      page: currentPage,
      page_size: pageSize,
      search: searchText.trim(),
    });
  }, [fetchBranchesAction, currentPage, pageSize, searchText]);

  useEffect(() => {
    if (branchesError)
    {
      notification.warning({
        message: 'Could not load branches',
        description: branchesError,
      });
    }
  }, [branchesError]);

  const handleRefresh = () => {
    fetchGeneratingNowAction();
    fetchTodayAction();
    fetchThisMonthAction();
    fetchLifetimeAction();
    fetchStatusCountsAction();
    fetchBranchesAction({
      page: currentPage,
      page_size: pageSize,
      search: searchText.trim(),
    });
  };

  // Prefer the explicit branch_count from the lifetime KPI, then status-counts.total,
  // then the branches page count, then the visible array length.
  const totalBranches =
    lifetime?.branch_count ??
    statusCounts?.total ??
    branchesCount ??
    branches.length;

  // Client-side filter. The branches list endpoint does not document a status
  // query param, so we apply the status/search filtering locally.
  const filteredBranches = useMemo(() => {
    const text = (searchText || '').trim().toLowerCase();
    const rows = branches.filter((b) => {
      if (watchlistOnly && !b?.is_favourited) return false;
      if (text)
      {
        const haystack = `${b?.name || ''} ${b?.address || ''} ${b?.city || ''} ${b?.station_id || ''}`.toLowerCase();
        if (!haystack.includes(text)) return false;
      }
      if (activeStatus !== 'total')
      {
        const com = b?.status?.com;
        const alerts = b?.status?.alerts;
        if (activeStatus === 'active' && com !== 'online' && com !== 'active') return false;
        if (activeStatus === 'underperforming' && com !== 'partial' && com !== 'incomplete' && com !== 'underperforming') return false;
        if (activeStatus === 'inactive' && com !== 'offline' && com !== 'inactive') return false;
        if (activeStatus === 'alerts' && (!alerts || alerts === 'ok')) return false;
        if (activeStatus === 'no_alerts' && alerts && alerts !== 'ok') return false;
      }
      return true;
    });
    rows.sort((a, b) => {
      const cmp = (a?.name || '').localeCompare(b?.name || '');
      return sortAsc ? cmp : -cmp;
    });
    return rows;
  }, [branches, searchText, activeStatus, sortAsc, watchlistOnly]);

  const watchlistCount = statusCounts?.watchlist ?? branches.filter((b) => b?.is_favourited).length;
  const totalAlarms = alarmsCount ?? alarms.length;

  const handleExportCsv = () => {
    const rows = filteredBranches.map((b) => ({
      branch: b?.name || '',
      address: b?.address || b?.city || '',
      status: getStatusLabel(b?.status?.com),
      last_posted: b?.status?.last_posted_label || '',
      alerts: b?.status?.alerts || '',
      favourite: b?.is_favourited ? 'yes' : 'no',
      capacity_kwp: b?.capacity?.installed_pv_kwp ?? '',
      now_kw: b?.now?.power_kw ?? '',
      today_kwh: b?.production?.daily_kwh ?? '',
    }));
    const filename = `solar-overview-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(filename, rows);
  };

  const handleToggleFavourite = async (branch) => {
    if (!branch?.id) return;
    setTogglingId(branch.id);
    const res = await toggleFavouriteAction(branch.id);
    setTogglingId(null);
    if (res?.fulfilled)
    {
      // Refresh status counts so the watchlist badge updates server-side
      fetchStatusCountsAction();
      notification.success({
        message: res.data?.is_favourited ? 'Added to watchlist' : 'Removed from watchlist',
        description: branch?.name,
        placement: 'bottomRight',
        duration: 2,
      });
    } else
    {
      notification.error({
        message: 'Could not update watchlist',
        description: res?.message,
      });
    }
  };

  const handleOpenBranch = (branch) => {
    if (!branch?.id) return;
    setSelectedBranch(branch);
    fetchBranchTrendAction(branch.id);
  };

  const handleCloseBranch = () => {
    setSelectedBranch(null);
  };

  // Click branch name → POST /admin/solar-branch/:id/force-login/ and open the
  // solar dashboard in a new tab using the returned JWT tokens.
  // Mirrors the existing ViewLocations.handleBranchLogin pattern.
  const handleBranchForceLogin = async (branch) => {
    if (!branch?.id) return;
    setForceLoginId(branch.id);
    try
    {
      const data = await solarForceLoginAction(branch.id);
      const dashboardBase = (data?.redirect_url || EnvData.REACT_APP_DASHBOARD_URL).replace(/\/$/, '');
      const params = new URLSearchParams({
        access: data?.token?.access || '',
        refresh: data?.token?.refresh || '',
        redirect: '/solar-overview',
      });
      window.open(`${dashboardBase}/force-login?${params.toString()}`, '_blank');
    } catch (err)
    {
      const detail = err?.response?.data?.detail;
      const message = err?.response?.data?.message;
      if (detail === 'You do not have permission for this branch')
      {
        notification.error({
          message: 'Access Denied',
          description:
            'You do not have permission to access this branch dashboard. Please contact your administrator for access rights.',
          duration: 5,
        });
      } else if (detail)
      {
        notification.error({
          message: 'Branch Access Failed',
          description: detail,
          duration: 5,
        });
      } else if (message)
      {
        notification.error({
          message: 'Solar Force Login Failed',
          description: message,
          duration: 5,
        });
      } else
      {
        notification.error({
          message: 'Solar Force Login Failed',
          description:
            err?.message ||
            'Unable to log in to the solar branch dashboard. Please try again later.',
          duration: 5,
        });
      }
    } finally
    {
      setForceLoginId(null);
    }
  };

  const handleOpenAlarms = () => {
    setAlarmsOpen(true);
    fetchAlarmsAction({ page_size: 100 });
  };

  const handleAckOpen = (alarm) => {
    setAckTarget(alarm);
    setAckNote('');
  };

  const handleAckSubmit = async () => {
    if (!ackTarget?.id) return;
    const res = await ackAlarmAction(ackTarget.id, ackNote.trim());
    if (res?.fulfilled)
    {
      notification.success({
        message: 'Alarm acknowledged',
        placement: 'bottomRight',
        duration: 2,
      });
      setAckTarget(null);
      setAckNote('');
      // Refresh alarms and status counts so badges update
      fetchAlarmsAction({ page_size: 100 });
      fetchStatusCountsAction();
    } else
    {
      notification.error({
        message: 'Could not acknowledge alarm',
        description: res?.message,
      });
    }
  };

  const cards = useMemo(() => {
    // Realtime: API returns power_w; the action normalizer also gives us power_kw.
    const powerKw =
      generatingNow?.power_kw ??
      (generatingNow?.power_w != null ? Number(generatingNow.power_w) / 1000 : null);
    const installedKwp = generatingNow?.installed_capacity_kwp;

    // Today: API returns kwh; normalizer also gives mwh. Show MWh if >= 1 MWh,
    // otherwise show kWh so very small values still read sensibly.
    const todayKwh = today?.kwh;
    const todayMwh = today?.mwh ?? (todayKwh != null ? Number(todayKwh) / 1000 : null);
    const useTodayMwh = todayMwh != null && todayMwh >= 1;
    const todayValue = useTodayMwh
      ? formatNumber(todayMwh, 2)
      : todayKwh != null
        ? formatNumber(todayKwh, todayKwh >= 100 ? 0 : 1)
        : '—';
    const todayUnit = useTodayMwh ? 'MWh' : 'kWh';
    const deltaPct = today?.delta_pct;

    // Monthly: { mwh, month_to_date_kwh, month }
    const monthMwh = thisMonth?.mwh;
    const monthLabel = thisMonth?.month;

    // Lifetime: { mwh, kwh, plant_count, branch_count }
    const lifetimeMwh = lifetime?.mwh;
    const lifetimeBranches = lifetime?.branch_count;

    return [
      {
        key: 'now',
        label: 'Generating now',
        icon: <ThunderboltFilled />,
        value: powerKw != null ? formatNumber(powerKw, powerKw >= 100 ? 0 : 2) : '—',
        unit: 'kW',
        sub:
          installedKwp != null
            ? `Installed: ${formatNumber(installedKwp, 1)} kWp`
            : 'Installed: —',
        bg: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
        loading: generatingNowLoading,
      },
      {
        key: 'today',
        label: 'Today',
        icon: <SunIcon />,
        value: todayValue,
        unit: todayUnit,
        sub:
          deltaPct != null
            ? `vs yesterday: ${deltaPct > 0 ? '+' : ''}${formatNumber(deltaPct, deltaPct % 1 === 0 ? 0 : 1)}%`
            : 'vs yesterday: —',
        bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        loading: todayLoading,
      },
      {
        key: 'month',
        label: 'This month',
        icon: <BarsIcon />,
        value: monthMwh != null ? formatNumber(monthMwh, 1) : '—',
        unit: 'MWh',
        sub: monthLabel ? `${formatMonth(monthLabel)} month-to-date` : 'Month-to-date',
        bg: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        loading: thisMonthLoading,
      },
      {
        key: 'lifetime',
        label: 'Lifetime',
        icon: <StackIcon />,
        value: lifetimeMwh != null ? formatNumber(lifetimeMwh, lifetimeMwh >= 100 ? 0 : 1) : '—',
        unit: 'MWh',
        sub:
          lifetimeBranches != null
            ? `Across ${lifetimeBranches} solar branch${lifetimeBranches === 1 ? '' : 'es'}`
            : 'All your solar branches',
        bg: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
        loading: lifetimeLoading,
      },
    ];
  }, [
    generatingNow,
    generatingNowLoading,
    today,
    todayLoading,
    thisMonth,
    thisMonthLoading,
    lifetime,
    lifetimeLoading,
  ]);

  const pageStart = (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalBranches);

  return (
    <div className="cso-page">
      <div className="cso-header">
        <div className="cso-header-left">
          <Title level={2} className="cso-title">Solar overview</Title>
          <Text className="cso-subtitle">
            Live snapshot across <b>{totalBranches} solar branch{totalBranches === 1 ? '' : 'es'}</b>
            {clientName ? <> · <b>{clientName}</b></> : null}
          </Text>
        </div>
        <div className="cso-header-actions">
          <Button
            className="cso-btn-secondary"
            icon={<DownloadOutlined />}
            onClick={handleExportCsv}
            disabled={!filteredBranches.length}
          >
            Export CSV
          </Button>
          <Button
            type="primary"
            className="cso-btn-primary"
            icon={<ReloadOutlined spin={branchesLoading} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="cso-cards">
        {cards.map((card) => (
          <div
            key={card.key}
            className="cso-kpi-card"
            style={{ background: card.bg }}
          >
            <div className="cso-kpi-decoration cso-kpi-decoration--xl" />
            <div className="cso-kpi-decoration cso-kpi-decoration--lg" />
            <div className="cso-kpi-decoration cso-kpi-decoration--sm" />
            <div className="cso-kpi-icon-row">
              <span className="cso-kpi-icon">{card.icon}</span>
              <Text className="cso-kpi-label">{card.label}</Text>
            </div>
            <div className="cso-kpi-value-row">
              {card.loading ? (
                <Spin size="small" />
              ) : (
                <>
                  <span className="cso-kpi-value">{card.value}</span>
                  <span className="cso-kpi-unit">{card.unit}</span>
                </>
              )}
            </div>
            <Text className="cso-kpi-sub">{card.sub}</Text>
          </div>
        ))}
      </div>

      <div className="cso-toolbar">
        <div className="cso-view-toggle" role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            className={`cso-view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'cards'}
            className={`cso-view-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </button>
        </div>
        <Input
          className="cso-search"
          placeholder={watchlistOnly
            ? 'Search watchlist by name or city...'
            : 'Search branch name or city...'}
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          allowClear
        />
        <button
          type="button"
          className={`cso-watchlist-toggle ${watchlistOnly ? 'is-active' : ''}`}
          onClick={() => {
            setWatchlistOnly((prev) => !prev);
            setCurrentPage(1);
          }}
          aria-pressed={watchlistOnly}
        >
          {watchlistOnly ? <StarFilled /> : <StarOutlined />}
          <span>My Watchlist</span>
          <span className="cso-watchlist-count">({watchlistCount})</span>
        </button>
        <button
          type="button"
          className={`cso-alarms-toggle ${totalAlarms > 0 ? 'has-alarms' : ''}`}
          onClick={handleOpenAlarms}
          aria-label="Open alarms"
        >
          <BellOutlined />
          <span>Alarms</span>
          <span className="cso-alarms-count">({totalAlarms})</span>
        </button>
      </div>

      <div className="cso-table-card">
        <div className="cso-status-tabs">
          {STATUS_FILTERS.map((status) => {
            const count = getStatusFilterCount(status.key, statusCounts);
            const isActive = activeStatus === status.key;
            return (
              <button
                key={status.key}
                type="button"
                className={`cso-status-tab ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveStatus(status.key);
                  setCurrentPage(1);
                }}
              >
                {status.key !== 'total' && (
                  <span className="cso-dot" style={{ background: status.color }} />
                )}
                <span className="cso-status-label">{status.label}</span>
                <span className="cso-status-count">
                  ({statusCountsLoading ? '…' : count})
                </span>
              </button>
            );
          })}
          <button
            type="button"
            className="cso-refresh-btn"
            onClick={handleRefresh}
            aria-label="Refresh"
          >
            <ReloadOutlined spin={branchesLoading} />
          </button>
        </div>

        <div className="cso-legend">
          <span className="cso-legend-item">Active — posting within 1h</span>
          <span className="cso-legend-item">Underperforming — low daytime output</span>
          <span className="cso-legend-item">Inactive — no recent data</span>
        </div>

        {viewMode === 'list' ? (
          <ListView
            branches={filteredBranches}
            loading={branchesLoading}
            sortAsc={sortAsc}
            onToggleSort={() => setSortAsc((prev) => !prev)}
            onToggleFavourite={handleToggleFavourite}
            onView={handleOpenBranch}
            onBranchClick={handleBranchForceLogin}
            togglingId={togglingId}
            forceLoginId={forceLoginId}
          />
        ) : (
          <CardsView
            branches={filteredBranches}
            loading={branchesLoading}
            onToggleFavourite={handleToggleFavourite}
            onView={handleOpenBranch}
            onBranchClick={handleBranchForceLogin}
            togglingId={togglingId}
            forceLoginId={forceLoginId}
          />
        )}

        <div className="cso-table-footer">
          <Text className="cso-page-summary">
            {branchesLoading ? (
              'Loading branches…'
            ) : filteredBranches.length === 0 ? (
              'No branches to show'
            ) : (
              <>Showing <b>{pageStart}–{Math.min(pageEnd, pageStart + filteredBranches.length - 1)}</b> of <b>{totalBranches}</b> branches</>
            )}
          </Text>
          <div className="cso-pagination">
            <button
              type="button"
              className="cso-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <CaretDownFilled style={{ transform: 'rotate(90deg)', fontSize: 10 }} />
            </button>
            <button type="button" className="cso-page-num is-active">{currentPage}</button>
            <button
              type="button"
              className="cso-page-btn"
              disabled={currentPage * pageSize >= totalBranches}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <CaretDownFilled style={{ transform: 'rotate(-90deg)', fontSize: 10 }} />
            </button>
            <Select
              className="cso-page-size"
              value={pageSize}
              onChange={(v) => { setPageSize(v); setCurrentPage(1); }}
              options={[
                { value: 10, label: '10 / page' },
                { value: 20, label: '20 / page' },
                { value: 50, label: '50 / page' },
                { value: 100, label: '100 / page' },
              ]}
            />
          </div>
        </div>
      </div>

      <BranchDetailDrawer
        branch={selectedBranch}
        onClose={handleCloseBranch}
        trend={selectedBranch ? trendByBranch?.[selectedBranch.id] : null}
        trendLoading={trendLoading}
        onToggleFavourite={handleToggleFavourite}
        onBranchClick={handleBranchForceLogin}
        togglingId={togglingId}
        forceLoginId={forceLoginId}
      />

      <AlarmsDrawer
        open={alarmsOpen}
        onClose={() => setAlarmsOpen(false)}
        alarms={alarms}
        loading={alarmsLoading}
        onAck={handleAckOpen}
        onRefresh={() => fetchAlarmsAction({ page_size: 100 })}
      />

      <Modal
        open={!!ackTarget}
        title="Acknowledge alarm"
        onCancel={() => { setAckTarget(null); setAckNote(''); }}
        onOk={handleAckSubmit}
        okText="Acknowledge"
        confirmLoading={ackAlarmLoading}
        okButtonProps={{ className: 'cso-btn-primary' }}
      >
        {ackTarget && (
          <div className="cso-ack-body">
            <div className="cso-ack-target">
              <div className="cso-ack-label">{ackTarget?.title || ackTarget?.alarm_type || 'Alarm'}</div>
              <div className="cso-ack-meta">
                {ackTarget?.branch_name || ackTarget?.station?.name || ''} ·{' '}
                {ackTarget?.severity || 'info'} · {ackTarget?.raised_at || ackTarget?.created_at || ''}
              </div>
            </div>
            <Input.TextArea
              rows={3}
              placeholder="Add a note (optional). e.g. Engineer dispatched, ETA 2hrs"
              value={ackNote}
              onChange={(e) => setAckNote(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

const ListView = ({
  branches,
  loading,
  sortAsc,
  onToggleSort,
  onToggleFavourite,
  onView,
  onBranchClick,
  togglingId,
  forceLoginId,
}) => (
  <div className="cso-list">
    <div className="cso-list-head">
      <div className="cso-th cso-th-fav" />
      <div className="cso-th cso-th-branch" onClick={onToggleSort}>
        Branch {sortAsc ? <CaretUpFilled style={{ fontSize: 10 }} /> : <CaretDownFilled style={{ fontSize: 10 }} />}
      </div>
      <div className="cso-th">Status</div>
      <div className="cso-th">Alerts</div>
      <div className="cso-th">Capacity (kWp)</div>
      <div className="cso-th">Now (kW)</div>
      <div className="cso-th">Trend</div>
      <div className="cso-th">Today (kWh)</div>
      <div className="cso-th cso-th-action" />
    </div>
    <div className="cso-list-body">
      {loading ? (
        <div className="cso-empty-state"><Spin /></div>
      ) : branches.length === 0 ? (
        <div className="cso-empty-state"><Text type="secondary">No branches match the current filters.</Text></div>
      ) : (
        branches.map((b) => {
          const com = b?.status?.com;
          const dot = getStatusColor(com);
          const trend = normalizeTrend(b?.trend);
          const alertsState = b?.status?.alerts;
          const alertColor = alertsState === 'ok'
            ? '#22c55e'
            : alertsState === 'warn'
              ? '#f59e0b'
              : alertsState === 'crit' || alertsState === 'critical'
                ? '#ef4444'
                : '#9ca3af';
          const isToggling = togglingId === b?.id;
          const isLoggingIn = forceLoginId === b?.id;
          return (
            <div key={b.id} className="cso-tr">
              <div className="cso-td cso-td-fav">
                <Tooltip title={b?.is_favourited ? 'Remove from watchlist' : 'Add to watchlist'}>
                  <button
                    type="button"
                    className={`cso-fav-btn ${b?.is_favourited ? 'is-active' : ''}`}
                    onClick={() => onToggleFavourite?.(b)}
                    disabled={isToggling}
                    aria-pressed={!!b?.is_favourited}
                    aria-label="Toggle favourite"
                  >
                    {b?.is_favourited ? <StarFilled /> : <StarOutlined />}
                  </button>
                </Tooltip>
              </div>
              <div className="cso-td cso-td-branch">
                <Tooltip title="Open solar dashboard in a new tab">
                  <button
                    type="button"
                    className="cso-branch-name cso-branch-name-link"
                    onClick={() => onBranchClick?.(b)}
                    disabled={isLoggingIn}
                  >
                    {b?.name || '—'}
                    {isLoggingIn && (
                      <Spin size="small" style={{ marginLeft: 8 }} />
                    )}
                  </button>
                </Tooltip>
                {(b?.address || b?.city) && (
                  <div className="cso-branch-loc">
                    <LocationPin /> {b?.address || b?.city}
                  </div>
                )}
              </div>
              <div className="cso-td cso-td-status">
                <span className="cso-dot" style={{ background: dot }} />
                <span className="cso-status-time">{b?.status?.last_posted_label || '—'}</span>
              </div>
              <div className="cso-td cso-td-alerts">
                <span className="cso-dot" style={{ background: alertColor }} />
              </div>
              <div className="cso-td cso-td-capacity">{formatCompact(b?.capacity?.installed_pv_kwp, 1)}</div>
              <div className="cso-td cso-td-now">{formatCompact(b?.now?.power_kw, 2)}</div>
              <div className="cso-td cso-td-trend">
                {trend ? (
                  <ResponsiveContainer width="100%" height={36}>
                    <LineChart data={trend} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                      <YAxis hide domain={[0, 'dataMax + 0.5']} />
                      <Line type="monotone" dataKey="y" stroke="#7c3aed" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="cso-trend-flat">—</span>
                )}
              </div>
              <div className="cso-td cso-td-today">{formatCompact(b?.production?.daily_kwh, 0)}</div>
              <div className="cso-td cso-td-action">
                <Button className="cso-view-action" onClick={() => onView?.(b)}>
                  View
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);

const CardsView = ({
  branches,
  loading,
  onToggleFavourite,
  onView,
  onBranchClick,
  togglingId,
  forceLoginId,
}) => {
  if (loading)
  {
    return <div className="cso-empty-state"><Spin /></div>;
  }
  if (branches.length === 0)
  {
    return <div className="cso-empty-state"><Text type="secondary">No branches match the current filters.</Text></div>;
  }
  return (
    <div className="cso-grid">
      {branches.map((b) => {
        const com = b?.status?.com;
        const dot = getStatusColor(com);
        const statusText = getStatusLabel(com);
        const capacityKwp = b?.capacity?.installed_pv_kwp;
        const dailyKwh = b?.production?.daily_kwh;
        const powerKw = b?.now?.power_kw;
        const isToggling = togglingId === b?.id;
        const isLoggingIn = forceLoginId === b?.id;
        return (
          <div
            key={b.id}
            className="cso-grid-card"
            role="button"
            tabIndex={0}
            onClick={() => onView?.(b)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ')
              {
                e.preventDefault();
                onView?.(b);
              }
            }}
          >
            <div className="cso-grid-card-head">
              <Tooltip title="Open solar dashboard in a new tab">
                <button
                  type="button"
                  className="cso-grid-card-name cso-grid-card-name-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBranchClick?.(b);
                  }}
                  disabled={isLoggingIn}
                >
                  {b?.name || '—'}
                  {isLoggingIn && (
                    <Spin size="small" style={{ marginLeft: 6 }} />
                  )}
                </button>
              </Tooltip>
              <button
                type="button"
                className={`cso-fav-btn cso-fav-btn--card ${b?.is_favourited ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavourite?.(b);
                }}
                disabled={isToggling}
                aria-pressed={!!b?.is_favourited}
                aria-label="Toggle favourite"
              >
                {b?.is_favourited ? <StarFilled /> : <StarOutlined />}
              </button>
            </div>
            <div className="cso-grid-card-power-row">
              <div className="cso-grid-card-power">{formatCompact(powerKw, 1)} kW</div>
            </div>
            {(b?.address || b?.city) && (
              <div className="cso-grid-card-loc">
                <LocationPin /> {b?.address || b?.city}
              </div>
            )}
            <div className="cso-grid-card-status">
              <span className="cso-dot" style={{ background: dot }} />
              <span className="cso-grid-card-status-text">
                {statusText} · {b?.status?.last_posted_label || '—'}
              </span>
            </div>
            <div className="cso-grid-card-footer">
              {formatCompact(capacityKwp, 1)} kWp · Today {formatCompact(dailyKwh, 0)} kWh
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// Branch detail drawer — shows the 24h trend + key stats for a single branch
// ============================================================
const BranchDetailDrawer = ({
  branch,
  onClose,
  trend,
  trendLoading,
  onToggleFavourite,
  onBranchClick,
  togglingId,
  forceLoginId,
}) => {
  // Prefer the cached server-side trend (24 hourly points); fall back to the
  // sparkline trend that ships with each branch row.
  const points = trend?.points;
  const data = useMemo(() => {
    if (Array.isArray(points) && points.length)
    {
      return points.map((y, i) => ({ hour: `${i}:00`, y: Number(y) || 0 }));
    }
    if (Array.isArray(branch?.trend) && branch.trend.length)
    {
      return branch.trend.map((y, i) => ({ hour: `${i}:00`, y: Number(y) || 0 }));
    }
    return [];
  }, [points, branch]);

  if (!branch)
  {
    return (
      <Drawer
        open={false}
        onClose={onClose}
        width={Math.min(720, typeof window !== 'undefined' ? window.innerWidth - 40 : 720)}
      />
    );
  }

  const com = branch?.status?.com;
  const statusText = getStatusLabel(com);
  const statusColor = getStatusColor(com);
  const isToggling = togglingId === branch?.id;
  const isLoggingIn = forceLoginId === branch?.id;
  const alertsState = branch?.status?.alerts;
  const alertText = !alertsState || alertsState === 'ok'
    ? 'No alerts'
    : alertsState === 'warn'
      ? 'Warning'
      : 'Critical';
  const alertColor = !alertsState || alertsState === 'ok'
    ? '#22c55e'
    : alertsState === 'warn'
      ? '#f59e0b'
      : '#ef4444';

  return (
    <Drawer
      open={!!branch}
      onClose={onClose}
      title={null}
      width={Math.min(720, typeof window !== 'undefined' ? window.innerWidth - 40 : 720)}
      bodyStyle={{ padding: 0, background: '#f7f7fb' }}
      headerStyle={{ display: 'none' }}
      closable={false}
    >
      <div className="cso-bd">
        <div className="cso-bd-head">
          <div>
            <div className="cso-bd-eyebrow">Branch</div>
            <div className="cso-bd-title">{branch?.name || '—'}</div>
            {(branch?.address || branch?.city) && (
              <div className="cso-bd-loc">
                <EnvironmentOutlined /> {branch?.address || branch?.city}
              </div>
            )}
          </div>
          <div className="cso-bd-actions">
            <Tooltip title={branch?.is_favourited ? 'Remove from watchlist' : 'Add to watchlist'}>
              <button
                type="button"
                className={`cso-fav-btn cso-fav-btn--lg ${branch?.is_favourited ? 'is-active' : ''}`}
                onClick={() => onToggleFavourite?.(branch)}
                disabled={isToggling}
                aria-pressed={!!branch?.is_favourited}
              >
                {branch?.is_favourited ? <StarFilled /> : <StarOutlined />}
              </button>
            </Tooltip>
            <Button
              type="primary"
              className="cso-btn-primary"
              loading={isLoggingIn}
              onClick={() => onBranchClick?.(branch)}
            >
              Open dashboard
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="cso-bd-stats">
          <div className="cso-bd-stat">
            <div className="cso-bd-stat-label">Now</div>
            <div className="cso-bd-stat-value">
              {formatCompact(branch?.now?.power_kw, 2)} <span>kW</span>
            </div>
          </div>
          <div className="cso-bd-stat">
            <div className="cso-bd-stat-label">Today</div>
            <div className="cso-bd-stat-value">
              {formatCompact(branch?.production?.daily_kwh, 1)} <span>kWh</span>
            </div>
          </div>
          <div className="cso-bd-stat">
            <div className="cso-bd-stat-label">PV Capacity</div>
            <div className="cso-bd-stat-value">
              {formatCompact(branch?.capacity?.installed_pv_kwp, 1)} <span>kWp</span>
            </div>
          </div>
          <div className="cso-bd-stat">
            <div className="cso-bd-stat-label">Battery</div>
            <div className="cso-bd-stat-value">
              {formatCompact(branch?.capacity?.installed_battery_kwh, 0)} <span>kWh</span>
            </div>
          </div>
        </div>

        <div className="cso-bd-meta">
          <div className="cso-bd-meta-item">
            <span className="cso-dot" style={{ background: statusColor }} />
            <span><b>{statusText}</b> · {branch?.status?.last_posted_label || '—'}</span>
          </div>
          <div className="cso-bd-meta-item">
            <span className="cso-dot" style={{ background: alertColor }} />
            <span>{alertText}</span>
          </div>
          {branch?.station_id && (
            <div className="cso-bd-meta-item cso-bd-meta-mute">Station #{branch.station_id}</div>
          )}
        </div>

        <div className="cso-bd-chart-card">
          <div className="cso-bd-chart-head">
            <div className="cso-bd-chart-title">
              Last {trend?.hours || data.length} hours
            </div>
            <div className="cso-bd-chart-sub">Production (kWh per hour)</div>
          </div>
          <div className="cso-bd-chart">
            {trendLoading ? (
              <div className="cso-empty-state"><Spin /></div>
            ) : data.length === 0 ? (
              <div className="cso-empty-state"><Text type="secondary">No trend data available.</Text></div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 6, left: 0 }}>
                  <defs>
                    <linearGradient id="csoTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    interval={Math.max(0, Math.floor(data.length / 8) - 1)}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    width={40}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${formatNumber(v, 2)} kWh`, 'Production']}
                    labelFormatter={(l) => `Hour ${l}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="y"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#csoTrend)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

// ============================================================
// Alarms drawer — list + acknowledge
// ============================================================
const SEVERITY_META = {
  critical: { color: '#ef4444', icon: <CloseCircleFilled />, label: 'Critical' },
  crit: { color: '#ef4444', icon: <CloseCircleFilled />, label: 'Critical' },
  warning: { color: '#f59e0b', icon: <WarningFilled />, label: 'Warning' },
  warn: { color: '#f59e0b', icon: <WarningFilled />, label: 'Warning' },
  info: { color: '#3b82f6', icon: <BellOutlined />, label: 'Info' },
};

const getSeverityMeta = (sev) =>
  SEVERITY_META[String(sev || '').toLowerCase()] || {
    color: '#9ca3af',
    icon: <BellOutlined />,
    label: sev || 'Alarm',
  };

const AlarmsDrawer = ({ open, onClose, alarms, loading, onAck, onRefresh }) => {
  const active = useMemo(() => (alarms || []).filter((a) => !a?.is_acknowledged), [alarms]);
  const acknowledged = useMemo(() => (alarms || []).filter((a) => a?.is_acknowledged), [alarms]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={null}
      width={Math.min(560, typeof window !== 'undefined' ? window.innerWidth - 40 : 560)}
      bodyStyle={{ padding: 0, background: '#f7f7fb' }}
      headerStyle={{ display: 'none' }}
      closable={false}
    >
      <div className="cso-alarms">
        <div className="cso-alarms-head">
          <div>
            <div className="cso-bd-eyebrow">Alarms</div>
            <div className="cso-bd-title">
              {active.length} active{acknowledged.length ? ` · ${acknowledged.length} acknowledged` : ''}
            </div>
          </div>
          <div className="cso-bd-actions">
            <Button icon={<ReloadOutlined spin={loading} />} onClick={onRefresh}>Refresh</Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="cso-alarms-body">
          {loading ? (
            <div className="cso-empty-state"><Spin /></div>
          ) : (alarms?.length ?? 0) === 0 ? (
            <div className="cso-alarms-empty">
              <CheckCircleFilled style={{ color: '#22c55e', fontSize: 28, marginBottom: 6 }} />
              <div>All clear — no alarms right now.</div>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <>
                  <div className="cso-alarms-group">Active</div>
                  {active.map((a) => (
                    <AlarmItem key={a.id} alarm={a} onAck={onAck} />
                  ))}
                </>
              )}
              {acknowledged.length > 0 && (
                <>
                  <div className="cso-alarms-group">Acknowledged</div>
                  {acknowledged.map((a) => (
                    <AlarmItem key={a.id} alarm={a} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
};

const AlarmItem = ({ alarm, onAck }) => {
  const sev = getSeverityMeta(alarm?.severity);
  return (
    <div className={`cso-alarm-item ${alarm?.is_acknowledged ? 'is-acked' : ''}`}>
      <div className="cso-alarm-icon" style={{ background: `${sev.color}1a`, color: sev.color }}>
        {sev.icon}
      </div>
      <div className="cso-alarm-main">
        <div className="cso-alarm-title">
          {alarm?.title || alarm?.alarm_type || alarm?.message || 'Alarm'}
        </div>
        <div className="cso-alarm-meta">
          <span className="cso-alarm-sev" style={{ color: sev.color }}>{sev.label}</span>
          {(alarm?.branch_name || alarm?.station?.name) && (
            <>
              <span className="cso-alarm-sep">·</span>
              <span>{alarm?.branch_name || alarm?.station?.name}</span>
            </>
          )}
          {(alarm?.raised_at || alarm?.created_at) && (
            <>
              <span className="cso-alarm-sep">·</span>
              <span>{alarm?.raised_at || alarm?.created_at}</span>
            </>
          )}
        </div>
        {alarm?.description && (
          <div className="cso-alarm-desc">{alarm.description}</div>
        )}
        {alarm?.is_acknowledged && (
          <div className="cso-alarm-acked">
            <CheckCircleFilled style={{ color: '#22c55e', marginRight: 4 }} />
            Acknowledged{alarm?.acked_at ? ` · ${alarm.acked_at}` : ''}
            {alarm?.ack_note ? ` — “${alarm.ack_note}”` : ''}
          </div>
        )}
      </div>
      {!alarm?.is_acknowledged && (
        <Button
          size="small"
          className="cso-alarm-ack-btn"
          onClick={() => onAck?.(alarm)}
        >
          Acknowledge <RightOutlined style={{ fontSize: 10 }} />
        </Button>
      )}
    </div>
  );
};

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" />
      <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" />
      <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" />
    </g>
  </svg>
);

const BarsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="13" width="3.5" height="7" rx="0.5" fill="currentColor" />
    <rect x="10.25" y="9" width="3.5" height="11" rx="0.5" fill="currentColor" />
    <rect x="16.5" y="5" width="3.5" height="15" rx="0.5" fill="currentColor" />
  </svg>
);

const StackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M12 3 4 7l8 4 8-4-8-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />
    <path d="m4 12 8 4 8-4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />
    <path d="m4 17 8 4 8-4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" fill="none" />
  </svg>
);

const LocationPin = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: -1, marginRight: 3 }}>
    <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Z" stroke="#9ca3af" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="12" cy="9" r="2.5" stroke="#9ca3af" strokeWidth="1.6" />
  </svg>
);

const mapStateToProps = (state) => ({
  clientSolar: state.clientSolar,
});

const mapDispatchToProps = {
  fetchClientGeneratingNow,
  fetchClientToday,
  fetchClientThisMonth,
  fetchClientLifetime,
  fetchClientStatusCounts,
  fetchClientBranches,
  fetchClientBranchTrend,
  toggleClientFavourite,
  fetchClientAlarms,
  acknowledgeClientAlarm,
  solarForceLogin,
};

export default connect(mapStateToProps, mapDispatchToProps)(SolarOverview);
