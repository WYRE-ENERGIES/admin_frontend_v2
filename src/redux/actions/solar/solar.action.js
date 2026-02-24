import { APIService } from '../../../config/Api/apiServices';
import {
  fetchSolarStationsFailure,
  fetchSolarStationsLoading,
  fetchSolarStationsSuccess,
  fetchSolarBranchesFailure,
  fetchSolarBranchesLoading,
  fetchSolarBranchesSuccess,
  searchSolarStationFailure,
  searchSolarStationLoading,
  searchSolarStationNotFound,
  searchSolarStationSuccess,
  clearSolarStationSearch as clearSolarStationSearchAction,
  saveSolarStationFailure,
  saveSolarStationLoading,
  saveSolarStationSuccess,
  toggleSolarStationStatusFailure,
  toggleSolarStationStatusLoading,
  toggleSolarStationStatusSuccess,
  fetchSolarStationDetailsFailure,
  fetchSolarStationDetailsLoading,
  fetchSolarStationDetailsRefreshing,
  fetchSolarStationDetailsSuccess,
  updateSolarDeviceFailure,
  updateSolarDeviceLoading,
  updateSolarDeviceSuccess,
} from './solar.creator';

const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const mapStationsResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response.stations)) return response.stations;
  if (Array.isArray(response.data?.stations)) return response.data.stations;
  return [];
};

export const fetchSolarStations = () => async (dispatch) => {
  dispatch(fetchSolarStationsLoading(true));
  try {
    const resp = await APIService.get('/api/v1/solar/stations/all/');
    const data = resp?.data ?? {};
    const stations = mapStationsResponse(data);
    dispatch(fetchSolarStationsSuccess(stations));
    return { fulfilled: true, data: stations };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load stations.');
    dispatch(fetchSolarStationsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchSolarStationsLoading(false));
  }
};

export const fetchSolarBranches = () => async (dispatch) => {
  dispatch(fetchSolarBranchesLoading(true));
  try {
    const resp = await APIService.get('/cadmin/branches/');
    const branches = Array.isArray(resp?.data)
      ? resp.data.map(({ id, name }) => ({ id, name }))
      : [];
    dispatch(fetchSolarBranchesSuccess(branches));
    return { fulfilled: true, data: branches };
  } catch (error) {
    const message = extractErrorMessage(error, 'Could not load branches.');
    dispatch(fetchSolarBranchesFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(fetchSolarBranchesLoading(false));
  }
};

const buildStationFromSearch = (data, fallback = {}) => {
  const stationInfo = data?.station_info || {};
  return {
    product_name: data?.product_name ?? fallback.product_name ?? '',
    station_id: data?.station_id ?? fallback.station_id ?? '',
    branch_id: data?.branch_id ?? fallback.branch_id ?? null,
    name: stationInfo.name || '',
    installed_capacity: stationInfo.installed_capacity || stationInfo.installed_capacity_kwp || 0,
    installed_capacity_kwp: stationInfo.installed_capacity_kwp || stationInfo.installed_capacity || 0,
    installed_battery_capacity: stationInfo.installed_battery_capacity ?? fallback.installed_battery_capacity ?? 0,
    latitude: stationInfo.latitude ?? null,
    longitude: stationInfo.longitude ?? null,
    address: stationInfo.address || '',
    region: stationInfo.region || '',
    currency: stationInfo.currency || '',
    create_time: stationInfo.create_time || null,
    branch_name: data?.branch_name || fallback.branch_name || '',
  };
};

export const searchSolarStation =
  ({ station_id: stationId, product_name: productName }) =>
  async (dispatch) => {
    dispatch(searchSolarStationLoading(true));
    try {
      const response = await APIService.get(`/api/v1/solar/stations/${productName}/${stationId}/`);
      const data = response?.data || {};

      if (data?.error) {
        const message = data.error || 'Station lookup failed.';
        dispatch(searchSolarStationFailure(message));
        return { fulfilled: false, message };
      }

      const station = buildStationFromSearch(data);
      const devices = Array.isArray(data.devices) ? data.devices : [];

      dispatch(
        searchSolarStationSuccess({
          station,
          devices,
        })
      );
      return { fulfilled: true, data: { station, devices, isNew: false } };
    } catch (error) {
      if (error?.response?.status === 404) {
        const station = buildStationFromSearch({}, { station_id: stationId, product_name: productName });
        dispatch(
          searchSolarStationNotFound({
            station,
          })
        );
        return { fulfilled: true, data: { station, devices: [], isNew: true } };
      }

      const message = extractErrorMessage(error, 'Failed to search for station.');
      dispatch(searchSolarStationFailure(message));
      return { fulfilled: false, message, error };
    } finally {
      dispatch(searchSolarStationLoading(false));
    }
  };

export const clearSolarStationSearch = () => (dispatch) => {
  dispatch(clearSolarStationSearchAction());
};

export const saveSolarStation = (payload) => async (dispatch) => {
  dispatch(saveSolarStationLoading(true));
  try {
    const response = await APIService.post(`/api/v1/solar/branch/${payload.branch_id}/`, payload);
    dispatch(saveSolarStationSuccess(response?.data || null));
    return { fulfilled: true, data: response?.data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to save station details.');
    dispatch(saveSolarStationFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(saveSolarStationLoading(false));
  }
};

export const toggleSolarStationStatus = (station) => async (dispatch) => {
  const branchIdentifier = station?.branch ?? station?.branch_id;
  const stationId = station?.id;

  if (!branchIdentifier) {
    const message = 'Branch identifier is required to toggle station status.';
    dispatch(toggleSolarStationStatusFailure(message));
    return { fulfilled: false, message };
  }

  const loadingKey = stationId ?? branchIdentifier;
  dispatch(toggleSolarStationStatusLoading(loadingKey));

  try {
    const response = await APIService.post(`/api/v1/solar/stations/${branchIdentifier}/toggle-status/`);
    const data = response?.data || {};

    if (!data.station) {
      const message = 'Invalid response received while toggling status.';
      dispatch(toggleSolarStationStatusFailure(message));
      return { fulfilled: false, message };
    }

    const updatedStation = {
      ...data.station,
      is_active: data.current_status ?? data.station?.is_active,
    };

    dispatch(toggleSolarStationStatusSuccess(updatedStation));
    return {
      fulfilled: true,
      data: updatedStation,
      message: data.message || `Station ${updatedStation.is_active ? 'activated' : 'deactivated'} successfully.`,
    };
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to toggle station status.');
    dispatch(toggleSolarStationStatusFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(toggleSolarStationStatusLoading(null));
  }
};

export const fetchSolarStationDetails = (branchId, { silent = false } = {}) => async (dispatch) => {
  if (silent) {
    dispatch(fetchSolarStationDetailsRefreshing(true));
  } else {
    dispatch(fetchSolarStationDetailsLoading(true));
  }

  try {
    const response = await APIService.get(`/api/v1/solar/devices/${branchId}/`);
    const data = response?.data || {};
    const devices = Array.isArray(data.devices) ? data.devices : [];

    dispatch(
      fetchSolarStationDetailsSuccess({
        details: data,
        devices,
      })
    );

    return { fulfilled: true, data };
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to load station details.');
    dispatch(fetchSolarStationDetailsFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    if (silent) {
      dispatch(fetchSolarStationDetailsRefreshing(false));
    } else {
      dispatch(fetchSolarStationDetailsLoading(false));
    }
  }
};

export const updateSolarDevice = (deviceId, payload) => async (dispatch) => {
  dispatch(updateSolarDeviceLoading(true));
  try {
    await APIService.patch(`/api/v1/solar/devices/${deviceId}/update/`, payload);

    dispatch(
      updateSolarDeviceSuccess({
        id: deviceId,
        updates: payload,
      })
    );

    return { fulfilled: true };
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to update device.');
    dispatch(updateSolarDeviceFailure(message));
    return { fulfilled: false, message, error };
  } finally {
    dispatch(updateSolarDeviceLoading(false));
  }
};

