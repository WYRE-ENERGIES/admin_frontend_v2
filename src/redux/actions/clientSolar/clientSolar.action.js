import { APIService } from '../../../config/Api/apiServices';
import {
  fetchGeneratingNowLoading,
  fetchGeneratingNowSuccess,
  fetchGeneratingNowFailure,
  fetchTodayLoading,
  fetchTodaySuccess,
  fetchTodayFailure,
  fetchThisMonthLoading,
  fetchThisMonthSuccess,
  fetchThisMonthFailure,
  fetchLifetimeLoading,
  fetchLifetimeSuccess,
  fetchLifetimeFailure,
  fetchCsStatusCountsLoading,
  fetchCsStatusCountsSuccess,
  fetchCsStatusCountsFailure,
  fetchCsBranchesLoading,
  fetchCsBranchesSuccess,
  fetchCsBranchesFailure,
  fetchCsBranchTrendLoading,
  fetchCsBranchTrendSuccess,
  fetchCsBranchTrendFailure,
  toggleCsFavouriteLoading,
  toggleCsFavouriteSuccess,
  toggleCsFavouriteFailure,
  fetchCsAlarmsLoading,
  fetchCsAlarmsSuccess,
  fetchCsAlarmsFailure,
  ackCsAlarmLoading,
  ackCsAlarmSuccess,
  ackCsAlarmFailure,
  csForceLoginLoading,
  csForceLoginSuccess,
  csForceLoginFailure,
} from './clientSolar.creator';

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

// ============================================================
// KPI: Realtime power
// API: { power_w, installed_capacity_kwp }
// Normalize: include both power_w and a derived power_kw for the UI.
// ============================================================
export const fetchClientGeneratingNow = () => async (dispatch) => {
  dispatch(fetchGeneratingNowLoading(true));
  try {
    const response = await APIService.get('/api/v1/client/solar/kpis/realtime-power/');
    const raw = response?.data ?? {};
    const powerW = Number(raw?.power_w ?? 0);
    const normalized = {
      ...raw,
      power_w: powerW,
      power_kw: powerW / 1000,
      installed_capacity_kwp: raw?.installed_capacity_kwp ?? null,
    };
    dispatch(fetchGeneratingNowSuccess(normalized));
    return { fulfilled: true, data: normalized };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load realtime power.');
    dispatch(fetchGeneratingNowFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchGeneratingNowLoading(false));
  }
};

// ============================================================
// KPI: Today
// API: { kwh, yesterday_kwh, delta_pct }
// Normalize: include both kwh and derived mwh.
// ============================================================
export const fetchClientToday = () => async (dispatch) => {
  dispatch(fetchTodayLoading(true));
  try {
    const response = await APIService.get('/api/v1/client/solar/kpis/daily/');
    const raw = response?.data ?? {};
    const kwh = Number(raw?.kwh ?? 0);
    const normalized = {
      ...raw,
      kwh,
      mwh: kwh / 1000,
      yesterday_kwh: raw?.yesterday_kwh ?? null,
      delta_pct: raw?.delta_pct ?? null,
    };
    dispatch(fetchTodaySuccess(normalized));
    return { fulfilled: true, data: normalized };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load today production.');
    dispatch(fetchTodayFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchTodayLoading(false));
  }
};

// ============================================================
// KPI: Monthly
// API: { mwh, month_to_date_kwh, month }
// ============================================================
export const fetchClientThisMonth = () => async (dispatch) => {
  dispatch(fetchThisMonthLoading(true));
  try {
    const response = await APIService.get('/api/v1/client/solar/kpis/monthly/');
    const data = response?.data ?? {};
    dispatch(fetchThisMonthSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load monthly production.');
    dispatch(fetchThisMonthFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchThisMonthLoading(false));
  }
};

// ============================================================
// KPI: Lifetime
// API: { mwh, kwh, plant_count, branch_count }
// ============================================================
export const fetchClientLifetime = () => async (dispatch) => {
  dispatch(fetchLifetimeLoading(true));
  try {
    const response = await APIService.get('/api/v1/client/solar/kpis/total/');
    const data = response?.data ?? {};
    dispatch(fetchLifetimeSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load lifetime production.');
    dispatch(fetchLifetimeFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchLifetimeLoading(false));
  }
};

// ============================================================
// Status counts
// API: { total, online, incomplete, offline, partial, alerts, no_alerts, watchlist }
// ============================================================
export const fetchClientStatusCounts = () => async (dispatch) => {
  dispatch(fetchCsStatusCountsLoading(true));
  try {
    const response = await APIService.get('/api/v1/client/solar/status-counts/');
    const data = response?.data ?? {};
    dispatch(fetchCsStatusCountsSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load status counts.');
    dispatch(fetchCsStatusCountsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchCsStatusCountsLoading(false));
  }
};

// ============================================================
// Branches list
// API supports: page, page_size, search (status filter not documented,
// so we keep that purely client-side and don't send it).
// ============================================================
const buildBranchesQuery = (params = {}) => {
  const query = {};
  if (params.page) query.page = params.page;
  if (params.page_size) query.page_size = params.page_size;
  if (params.search) query.search = params.search;
  if (params.watchlist) query.watchlist = true;
  return query;
};

export const fetchClientBranches = (params = {}) => async (dispatch) => {
  dispatch(fetchCsBranchesLoading(true));
  try {
    const query = buildBranchesQuery(params);
    const response = await APIService.get('/api/v1/client/solar/branches/', { params: query });
    const data = response?.data ?? {};

    const results = Array.isArray(data.results)
      ? data.results
      : Array.isArray(data)
      ? data
      : [];

    const payload = {
      results,
      count: data.count ?? results.length,
      page: data.page ?? params.page ?? 1,
      page_size: data.page_size ?? params.page_size ?? 50,
    };

    dispatch(fetchCsBranchesSuccess(payload));
    return { fulfilled: true, data: payload };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load branches.');
    dispatch(fetchCsBranchesFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchCsBranchesLoading(false));
  }
};

// ============================================================
// Branch trend (hourly points)
// API: GET /branches/:id/trend/  →  { branch_id, hours, points: [...] }
// ============================================================
export const fetchClientBranchTrend = (branchId) => async (dispatch) => {
  if (!branchId) return { fulfilled: false, message: 'Missing branchId.' };
  dispatch(fetchCsBranchTrendLoading(true));
  try {
    const response = await APIService.get(`/api/v1/client/solar/branches/${branchId}/trend/`);
    const data = response?.data ?? {};
    dispatch(fetchCsBranchTrendSuccess({ branchId, ...data }));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load branch trend.');
    dispatch(fetchCsBranchTrendFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchCsBranchTrendLoading(false));
  }
};

// ============================================================
// Toggle favourite
// API: POST /branches/:id/favourite/  → { status, is_favourited, watchlist_count }
// ============================================================
export const toggleClientFavourite = (branchId) => async (dispatch) => {
  if (!branchId) return { fulfilled: false, message: 'Missing branchId.' };
  dispatch(toggleCsFavouriteLoading(true));
  try {
    const response = await APIService.post(`/api/v1/client/solar/branches/${branchId}/favourite/`);
    const data = response?.data ?? {};
    dispatch(toggleCsFavouriteSuccess({ branchId, ...data }));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not toggle favourite.');
    dispatch(toggleCsFavouriteFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(toggleCsFavouriteLoading(false));
  }
};

// ============================================================
// Alarms list
// API: GET /alarms/  →  { count, page, page_size, total_pages, results: [...] }
// ============================================================
export const fetchClientAlarms = (params = {}) => async (dispatch) => {
  dispatch(fetchCsAlarmsLoading(true));
  try {
    const query = {};
    if (params.page) query.page = params.page;
    if (params.page_size) query.page_size = params.page_size;
    const response = await APIService.get('/api/v1/client/solar/alarms/', { params: query });
    const data = response?.data ?? {};
    const payload = {
      results: Array.isArray(data.results) ? data.results : [],
      count: data.count ?? 0,
      page: data.page ?? params.page ?? 1,
      page_size: data.page_size ?? params.page_size ?? 50,
      total_pages: data.total_pages ?? 1,
    };
    dispatch(fetchCsAlarmsSuccess(payload));
    return { fulfilled: true, data: payload };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load alarms.');
    dispatch(fetchCsAlarmsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchCsAlarmsLoading(false));
  }
};

// ============================================================
// Acknowledge alarm
// API: POST /alarms/:id/ack/  body: { note }
// ============================================================
export const acknowledgeClientAlarm = (alarmId, note = '') => async (dispatch) => {
  if (!alarmId) return { fulfilled: false, message: 'Missing alarmId.' };
  dispatch(ackCsAlarmLoading(true));
  try {
    const response = await APIService.post(
      `/api/v1/client/solar/alarms/${alarmId}/ack/`,
      { note },
    );
    const data = response?.data ?? {};
    dispatch(ackCsAlarmSuccess({ alarmId, ...data }));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not acknowledge alarm.');
    dispatch(ackCsAlarmFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(ackCsAlarmLoading(false));
  }
};

// ============================================================
// Solar branch force-login
// API: POST /api/v1/admin/solar-branch/:branchId/force-login/
// Response: { status, message, data: { token: { access, refresh }, username,
//   email, first_name, last_name, redirect_url, branch_id, ... } }
// We mirror the existing forceLoginBranchAction pattern: throw on failure so
// the caller can render the right notification.
// ============================================================
export const solarForceLogin = (branchId) => async (dispatch) => {
  if (!branchId) throw new Error('Missing branchId.');
  dispatch(csForceLoginLoading(true));
  try {
    const response = await APIService.post(
      `/api/v1/admin/solar-branch/${branchId}/force-login/`,
      {},
    );
    const data = response?.data?.data ?? {};
    dispatch(csForceLoginSuccess(data));
    return data;
  } catch (error) {
    dispatch(csForceLoginFailure(error));
    throw error;
  } finally {
    dispatch(csForceLoginLoading(false));
  }
};
