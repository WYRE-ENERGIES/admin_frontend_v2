import React, { useMemo, useState } from 'react';
import {
  Typography,
  Input,
  Button,
  Checkbox,
  Tooltip,
  Select,
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
  { key: 'total', label: 'Total', color: '#5C12A7' },
  { key: 'online', label: 'Online', color: '#22c55e' },
  { key: 'incomplete', label: 'Incomplete', color: '#3b82f6' },
  { key: 'offline', label: 'Offline', color: '#ef4444' },
  { key: 'partially_offline', label: 'Partially Offline', color: '#f59e0b' },
  { key: 'no_alerts', label: 'No Alerts', color: '#22c55e' },
  { key: 'alerts', label: 'Alerts', color: '#ef4444' },
];

const generateTrend = (seed, points = 12) => {
  const data = [];
  let value = (seed % 5) + 1;
  for (let i = 0; i < points; i++) {
    const wave = Math.sin((i / points) * Math.PI * 2 + seed) * 1.5;
    const peak = Math.exp(-Math.pow((i - points / 2) / 2.2, 2)) * 4;
    value = Math.max(0, peak + wave * 0.4 + (seed % 3) * 0.2);
    data.push({ x: i, y: Number(value.toFixed(2)) });
  }
  return data;
};

const PLANTS = [
  {
    id: 1,
    name: 'Ikeja City Mall Annex',
    address: 'Obafemi Awolowo Way, Ikeja, Lagos',
    statusKey: 'online',
    lastPostedLabel: '1m ago',
    lastPostedDotColor: '#22c55e',
    alerts: 'ok',
    capacity: 175.0,
    production: 3.20,
    dailyProduction: 112.0,
    tag: 'Retail',
    capacityBand: '100-500',
    favourite: false,
  },
  {
    id: 2,
    name: 'Epe Fish Harbour Cold Store',
    address: 'Epe Marina Road, Lagos',
    statusKey: 'online',
    lastPostedLabel: '2m ago',
    lastPostedDotColor: '#22c55e',
    alerts: 'ok',
    capacity: 44.4,
    production: 0.11,
    dailyProduction: 3.0,
    tag: null,
    capacityBand: '30-100',
    favourite: false,
  },
  {
    id: 3,
    name: 'Badagry Border Customs Yard',
    address: 'Seme Border Road, Badagry, Lagos',
    statusKey: 'offline',
    lastPostedLabel: '3h ago',
    lastPostedDotColor: '#ef4444',
    alerts: 'ok',
    capacity: 26.0,
    production: 0,
    dailyProduction: 0,
    tag: null,
    capacityBand: '16-30',
    favourite: false,
    flatTrend: true,
  },
  {
    id: 4,
    name: 'Sokoto Central Market Roof',
    address: 'Kano Road, Sokoto',
    statusKey: 'online',
    lastPostedLabel: 'Just now',
    lastPostedDotColor: '#22c55e',
    alerts: 'ok',
    capacity: 67.2,
    production: 0.44,
    dailyProduction: 18.9,
    tag: 'Retail',
    capacityBand: '30-100',
    favourite: false,
  },
  {
    id: 5,
    name: 'Benin Sapele Road Industrial',
    address: 'Sapele Road, Benin City, Edo',
    statusKey: 'online',
    lastPostedLabel: '7m ago',
    lastPostedDotColor: '#22c55e',
    alerts: 'ok',
    capacity: 91.0,
    production: 0.67,
    dailyProduction: 22.3,
    tag: null,
    capacityBand: '30-100',
    favourite: false,
  },
  {
    id: 6,
    name: 'Abeokuta',
    address: 'Dr. Leke Badmus Street, Obasanjo Hilltop, Abeokuta',
    statusKey: 'never',
    lastPostedLabel: 'Never',
    lastPostedDotColor: '#3b82f6',
    alerts: 'ok',
    capacity: 19.5,
    production: null,
    dailyProduction: null,
    tag: null,
    capacityBand: '16-30',
    favourite: false,
    noTrend: true,
  },
];

const CARD_DATA = [
  {
    key: 'realtime',
    icon: '/Images/wyre-power-icon.png',
    label: 'Real-time generating power',
    value: '91',
    unit: 'W',
    sub: 'Installed capacity: 423.44 kWp',
    bg: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    decorationColor: 'rgba(255,255,255,0.08)',
  },
  {
    key: 'daily',
    icon: '/Images/wyre-power-icon.png',
    label: 'Daily Production',
    value: '0',
    unit: 'kWh',
    sub: 'vs yesterday: —',
    bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    decorationColor: 'rgba(255,255,255,0.08)',
  },
  {
    key: 'monthly',
    icon: '/Images/wyre-power-icon.png',
    label: 'Monthly Production',
    value: '7.73',
    unit: 'MWh',
    sub: 'May 2026 month-to-date',
    bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    decorationColor: 'rgba(255,255,255,0.08)',
  },
  {
    key: 'total',
    icon: '/Images/wyre-power-icon.png',
    label: 'Total Production',
    value: '156.35',
    unit: 'MWh',
    sub: 'Lifetime across 34 plants',
    bg: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
    decorationColor: 'rgba(255,255,255,0.12)',
  },
];

const STATUS_COUNTS = {
  total: 34,
  online: 19,
  incomplete: 3,
  offline: 5,
  partially_offline: 3,
  no_alerts: 28,
  alerts: 5,
};

const SolarMgt = () => {
  const [searchText, setSearchText] = useState('');
  const [activeStatus, setActiveStatus] = useState('total');
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [capacityMin, setCapacityMin] = useState('');
  const [capacityMax, setCapacityMax] = useState('');
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedClient, setSelectedClient] = useState('all');
  const [favourites, setFavourites] = useState({});
  const [selectedRows, setSelectedRows] = useState({});
  const [sortAsc, setSortAsc] = useState(true);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const totalCount = STATUS_COUNTS.total;

  const togglePreset = (label) => {
    setSelectedPresets((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetFilters = () => {
    setCapacityMin('');
    setCapacityMax('');
    setSelectedPresets([]);
    setSelectedTags([]);
    setSelectedClient('all');
  };

  const toggleFavourite = (id) => {
    setFavourites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allSelected = useMemo(() => {
    if (!PLANTS.length) return false;
    return PLANTS.every((p) => selectedRows[p.id]);
  }, [selectedRows]);

  const someSelected = useMemo(() => {
    return PLANTS.some((p) => selectedRows[p.id]);
  }, [selectedRows]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const all = {};
      PLANTS.forEach((p) => { all[p.id] = true; });
      setSelectedRows(all);
    } else {
      setSelectedRows({});
    }
  };

  const filteredPlants = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    let rows = PLANTS.filter((p) => {
      if (text) {
        const matches =
          p.name.toLowerCase().includes(text) ||
          p.address.toLowerCase().includes(text);
        if (!matches) return false;
      }
      if (activeStatus !== 'total') {
        if (activeStatus === 'online' && p.statusKey !== 'online') return false;
        if (activeStatus === 'offline' && p.statusKey !== 'offline') return false;
        if (activeStatus === 'incomplete' && p.statusKey !== 'incomplete') return false;
        if (activeStatus === 'partially_offline' && p.statusKey !== 'partially_offline') return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });

    return rows;
  }, [searchText, activeStatus, sortAsc]);

  const watchlistCount = Object.values(favourites).filter(Boolean).length || 1;

  const anySelected = Object.values(selectedRows).some(Boolean);

  return (
    <div className="solar-mgt-page">
      <div className="solar-mgt-header">
        <Title level={2} className="solar-mgt-title">Solar Mgt</Title>
        <Text className="solar-mgt-subtitle">
          Live snapshot across all Wyre-managed plants
        </Text>
      </div>

      <div className="solar-mgt-cards">
        {CARD_DATA.map((card) => (
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
              <span className="solar-kpi-value">{card.value}</span>
              <span className="solar-kpi-unit">{card.unit}</span>
            </div>
            <Text className="solar-kpi-sub">{card.sub}</Text>
          </div>
        ))}
      </div>

      <div className="solar-watchlist-bar">
        <div className="solar-watchlist-label">
          <StarFilled style={{ color: '#f59e0b' }} />
          <span>My Watchlist({watchlistCount})</span>
        </div>
        <Input
          className="solar-watchlist-search"
          placeholder="Please enter plant name"
          suffix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <div className="solar-filters-card">
        <div className="solar-status-tabs">
          {STATUS_FILTERS.map((status) => {
            const count = STATUS_COUNTS[status.key];
            const isActive = activeStatus === status.key;
            return (
              <button
                key={status.key}
                type="button"
                className={`solar-status-tab ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveStatus(status.key)}
              >
                {status.key !== 'total' && (
                  <span
                    className="solar-status-dot"
                    style={{ background: status.color }}
                  />
                )}
                <span className="solar-status-label">{status.label}</span>
                <span className="solar-status-count">({count})</span>
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
          >
            <ReloadOutlined />
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
                    onChange={(e) => setCapacityMin(e.target.value)}
                    type="number"
                    className="solar-capacity-input"
                  />
                  <span className="solar-capacity-sep">—</span>
                  <Input
                    placeholder="Maximum kWp"
                    value={capacityMax}
                    onChange={(e) => setCapacityMax(e.target.value)}
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
                        onClick={() => togglePreset(preset.label)}
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
                  options={[
                    { value: 'all', label: 'All clients' },
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
              <button type="button" className="solar-reset-btn" onClick={resetFilters}>
                Reset
              </button>
              <Button type="primary" className="solar-apply-btn">
                Apply
              </Button>
            </div>
          </div>
        )}

        <div className="solar-table">
          <div className="solar-table-head">
            <div className="solar-th solar-th-checkbox">
              <Checkbox
                indeterminate={someSelected && !allSelected}
                checked={allSelected}
                onChange={handleSelectAll}
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
            {filteredPlants.map((plant) => {
              const trendData = plant.noTrend
                ? null
                : plant.flatTrend
                  ? Array(12).fill(0).map((_, i) => ({ x: i, y: 0 }))
                  : generateTrend(plant.id);
              const isSelected = !!selectedRows[plant.id];
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
                      <span className="solar-plant-name-text">{plant.name}</span>
                      <ArrowUpOutlined className="solar-plant-arrow" />
                    </div>
                    <div className="solar-plant-address">
                      <LocationPin /> {plant.address}
                    </div>
                  </div>
                  <div className="solar-td solar-td-status">
                    <span
                      className="solar-status-dot solar-status-dot--lg"
                      style={{ background: plant.lastPostedDotColor }}
                    />
                    <span
                      className="solar-status-time"
                      style={plant.statusKey === 'never' ? { color: plant.lastPostedDotColor } : undefined}
                    >
                      {plant.lastPostedLabel}
                    </span>
                  </div>
                  <div className="solar-td solar-td-alerts">
                    <span
                      className="solar-status-dot solar-status-dot--lg"
                      style={{ background: '#22c55e' }}
                    />
                  </div>
                  <div className="solar-td solar-td-capacity">
                    {plant.capacity.toFixed(1)}
                  </div>
                  <div className="solar-td solar-td-production">
                    {plant.production === null ? '—' : (
                      plant.production === 0 ? 0 : plant.production.toFixed(2)
                    )}
                  </div>
                  <div className="solar-td solar-td-trend">
                    {trendData ? (
                      <div className="solar-trend-wrap">
                        {plant.flatTrend ? (
                          <span className="solar-trend-flat">—</span>
                        ) : (
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
                        )}
                      </div>
                    ) : (
                      <span className="solar-trend-flat">—</span>
                    )}
                  </div>
                  <div className="solar-td solar-td-daily">
                    {plant.dailyProduction === null ? '—' : plant.dailyProduction.toFixed(1)}
                  </div>
                  <div className="solar-td solar-td-tag">
                    {plant.tag && (
                      <span className="solar-tag-pill">{plant.tag}</span>
                    )}
                    <button type="button" className="solar-tag-edit">Edit</button>
                  </div>
                  <div className="solar-td solar-td-fav">
                    <button
                      type="button"
                      className="solar-fav-btn"
                      onClick={() => toggleFavourite(plant.id)}
                      aria-label="Toggle favourite"
                    >
                      {favourites[plant.id] ? (
                        <StarFilled style={{ color: '#f59e0b' }} />
                      ) : (
                        <StarOutlined style={{ color: '#9ca3af' }} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
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
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <CaretDownFilled style={{ transform: 'rotate(-90deg)', fontSize: 10 }} />
              </button>
            </div>
            <Select
              className="solar-page-size"
              value={pageSize}
              onChange={setPageSize}
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
    <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Z" stroke="#9ca3af" strokeWidth="1.6" strokeLinejoin="round"/>
    <circle cx="12" cy="9" r="2.5" stroke="#9ca3af" strokeWidth="1.6"/>
  </svg>
);

export default SolarMgt;
