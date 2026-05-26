import { APIService } from '../../../config/Api/apiServices';
import {
  fetchRealtimePowerLoading,
  fetchRealtimePowerSuccess,
  fetchRealtimePowerFailure,
  fetchDailyProductionLoading,
  fetchDailyProductionSuccess,
  fetchDailyProductionFailure,
  fetchMonthlyProductionLoading,
  fetchMonthlyProductionSuccess,
  fetchMonthlyProductionFailure,
  fetchTotalProductionLoading,
  fetchTotalProductionSuccess,
  fetchTotalProductionFailure,
  fetchStatusCountsLoading,
  fetchStatusCountsSuccess,
  fetchStatusCountsFailure,
  fetchSolarPlantsLoading,
  fetchSolarPlantsSuccess,
  fetchSolarPlantsFailure,
  toggleFavouriteLoading,
  toggleFavouriteSuccess,
  toggleFavouriteFailure,
  fetchAlarmsLoading,
  fetchAlarmsSuccess,
  fetchAlarmsFailure,
  ackAlarmLoading,
  ackAlarmSuccess,
  ackAlarmFailure,
  fetchSolarClientsLoading,
  fetchSolarClientsSuccess,
  fetchSolarClientsFailure,
} from './solarMgt.creator';

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export const fetchRealtimePower = () => async (dispatch) => {
  dispatch(fetchRealtimePowerLoading(true));
  try {
    const response = await APIService.get('/api/v1/admin/solar/kpis/realtime-power/');
    const data = response?.data ?? {};
    dispatch(fetchRealtimePowerSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load realtime power.');
    dispatch(fetchRealtimePowerFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchRealtimePowerLoading(false));
  }
};

export const fetchDailyProduction = () => async (dispatch) => {
  dispatch(fetchDailyProductionLoading(true));
  try {
    const response = await APIService.get('/api/v1/admin/solar/kpis/daily/');
    const data = response?.data ?? {};
    dispatch(fetchDailyProductionSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load daily production.');
    dispatch(fetchDailyProductionFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchDailyProductionLoading(false));
  }
};

export const fetchMonthlyProduction = () => async (dispatch) => {
  dispatch(fetchMonthlyProductionLoading(true));
  try {
    const response = await APIService.get('/api/v1/admin/solar/kpis/monthly/');
    const data = response?.data ?? {};
    dispatch(fetchMonthlyProductionSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load monthly production.');
    dispatch(fetchMonthlyProductionFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchMonthlyProductionLoading(false));
  }
};

export const fetchTotalProduction = () => async (dispatch) => {
  dispatch(fetchTotalProductionLoading(true));
  try {
    const response = await APIService.get('/api/v1/admin/solar/kpis/total/');
    const data = response?.data ?? {};
    dispatch(fetchTotalProductionSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load total production.');
    dispatch(fetchTotalProductionFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchTotalProductionLoading(false));
  }
};

export const fetchStatusCounts = () => async (dispatch) => {
  dispatch(fetchStatusCountsLoading(true));
  try {
    const response = await APIService.get('/api/v1/admin/solar/status-counts/');
    const data = response?.data ?? {};
    dispatch(fetchStatusCountsSuccess(data));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load status counts.');
    dispatch(fetchStatusCountsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchStatusCountsLoading(false));
  }
};

const buildPlantsQuery = (params = {}) => {
  const query = {};
  if (params.page) query.page = params.page;
  if (params.page_size) query.page_size = params.page_size;
  if (params.search) query.search = params.search;
  if (params.status && params.status !== 'total') {
    query.status = params.status;
    query.com = params.status;
  }
  if (params.client && params.client !== 'all') {
    query.client = params.client;
    query.client_id = params.client;
  }
  if (params.min_capacity != null && params.min_capacity !== '') {
    query.min_capacity = params.min_capacity;
    query.min_pv_kwp = params.min_capacity;
  }
  if (params.max_capacity != null && params.max_capacity !== '') {
    query.max_capacity = params.max_capacity;
    query.max_pv_kwp = params.max_capacity;
  }
  if (Array.isArray(params.tags) && params.tags.length) {
    query.tags = params.tags.join(',');
    query.tag_in = params.tags.join(',');
  }
  if (params.watchlist) {
    query.watchlist = true;
    query.is_favourited = true;
  }
  return query;
};

export const fetchSolarPlants = (params = {}) => async (dispatch) => {
  dispatch(fetchSolarPlantsLoading(true));
  try {
    const query = buildPlantsQuery(params);
    const response = await APIService.get('/api/v1/admin/solar/plants/', { params: query });
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

    dispatch(fetchSolarPlantsSuccess(payload));
    return { fulfilled: true, data: payload };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load plants.');
    dispatch(fetchSolarPlantsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchSolarPlantsLoading(false));
  }
};

export const toggleFavourite = (plantId) => async (dispatch) => {
  if (!plantId) {
    return { fulfilled: false, message: 'Plant id is required.' };
  }
  dispatch(toggleFavouriteLoading(plantId));
  try {
    const response = await APIService.post(`/api/v1/admin/solar/plants/${plantId}/favourite/`);
    const data = response?.data ?? {};
    dispatch(
      toggleFavouriteSuccess({
        plantId,
        is_favourited: data.is_favourited,
        watchlist_count: data.watchlist_count,
      })
    );
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to toggle favourite.');
    dispatch(toggleFavouriteFailure({ plantId, message }));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(toggleFavouriteLoading(null));
  }
};

export const fetchAlarms = (params = {}) => async (dispatch) => {
  dispatch(fetchAlarmsLoading(true));
  try {
    const response = await APIService.get('/api/v1/admin/solar/alarms/', { params });
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
    dispatch(fetchAlarmsSuccess(payload));
    return { fulfilled: true, data: payload };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load alarms.');
    dispatch(fetchAlarmsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchAlarmsLoading(false));
  }
};

export const acknowledgeAlarm = (alarmId, note = '') => async (dispatch) => {
  if (!alarmId) {
    return { fulfilled: false, message: 'Alarm id is required.' };
  }
  dispatch(ackAlarmLoading(alarmId));
  try {
    const response = await APIService.post(
      `/api/v1/admin/solar/alarms/${alarmId}/ack/`,
      { note }
    );
    const data = response?.data ?? {};
    dispatch(ackAlarmSuccess({ alarmId, data }));
    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to acknowledge alarm.');
    dispatch(ackAlarmFailure({ alarmId, message }));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(ackAlarmLoading(null));
  }
};

export const forceLoginSolarBranch = (branchId) => async () => {
  if (!branchId) {
    throw new Error('Branch id is required.');
  }
  const response = await APIService.post(
    `/api/v1/admin/solar-branch/${branchId}/force-login/`,
    {}
  );
  const data = response?.data?.data;
  if (!data?.token?.access || !data?.token?.refresh) {
    throw new Error('Invalid force login response.');
  }
  return data;
};

export const fetchSolarClients = () => async (dispatch) => {
  dispatch(fetchSolarClientsLoading(true));
  try {
    const response = await APIService.get('/api/v1/admin/solar/clients/');
    const data = response?.data;

    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.clients)
      ? data.clients
      : [];

    const clients = list.map((item, idx) => {
      if (item == null) return null;
      if (typeof item === 'string') {
        return { id: item, name: item };
      }
      return {
        id: item.id ?? item.client_id ?? item.name ?? item.client ?? idx,
        name: item.name ?? item.client ?? item.client_name ?? String(item.id ?? idx),
      };
    }).filter(Boolean);

    dispatch(fetchSolarClientsSuccess(clients));
    return { fulfilled: true, data: clients };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load solar clients.');
    dispatch(fetchSolarClientsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchSolarClientsLoading(false));
  }
};
