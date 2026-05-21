/* eslint-disable no-restricted-globals */
import React, { useEffect, useRef, useState, useMemo } from "react";
// import { useCookies } from "react-cookie";
// removed legacy password storage


import {
  getDownloadAllDevices,
  getDownloadDeviceConsumption,
  getDownloadDeviceReadings,
  toggleNonPostingDevice,
} from "../../redux/actions/auth/auth.action";
import { connect } from "react-redux";
import { AlertFilled, FireFilled, SearchOutlined } from '@ant-design/icons';

import { Spin, Form, notification, Select, DatePicker, Table, Switch, Tag, Button, Space, TimePicker, Card, Row, Col, Typography, Modal, Descriptions } from "antd";
import en from 'antd/es/date-picker/locale/en_US';
import enUS from 'antd/es/locale/en_US';
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { CaretDownFilled } from "@ant-design/icons";
import { Input } from "antd";
import { downloadFile } from "../../helpers/generalHelper";
import moment from "moment";
import EnvData from "../../config/EnvData";
import Highlighter from "react-highlight-words";
import { APIService } from "../../config/Api/apiServices";
import "./DownloadPage.css";

const { convertArrayToCSV } = require("convert-array-to-csv");
const { Title, Text } = Typography;

dayjs.extend(buddhistEra);

function DownloadPage(props) {
  const [form] = Form.useForm();
  const [formTwo] = Form.useForm();
  const [formThree] = Form.useForm();
  const [formFour] = Form.useForm();
  // removed legacy password state
  const [deviceName, setDeviceName] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [branchName, setBranchName] = useState(false);
  const [deviceSwitch, setDeviceSwitch] = useState(false);
  const [deviceData, setDeviceData] = useState({});
  const [monitorDataState, setMonitorDataState] = useState([]);
  // const [cookies, setCookie] = useCookies(["myCookie"]);
  const [sortedDataState, setSortedDataState] = useState([]);
  const [operationTime, setOperationTime] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [branchPostingData, setBranchPostingData] = useState([]);
  const [branchPostingLoading, setBranchPostingLoading] = useState(false);
  const [branchDetailModalVisible, setBranchDetailModalVisible] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchPostingSearch, setBranchPostingSearch] = useState("");
  const [monitorSearch, setMonitorSearch] = useState("");
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [reportFilter, setReportFilter] = useState("all");
  const [expandedBranches, setExpandedBranches] = useState({});
  const [reportPage, setReportPage] = useState(1);
  const [reportPageSize, setReportPageSize] = useState(10);
  const [monitorPagination, setMonitorPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  });
  const [branchPostingPagination, setBranchPostingPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  const { RangePicker } = DatePicker;

  // Component level locale
  const buddhistLocale = {
    ...en,
    lang: {
      ...en.lang,
      fieldDateFormat: "YYYY-MM-DD",
      fieldDateTimeFormat: "YYYY-MM-DD HH:mm:ss",
      yearFormat: "YYYY",
      cellYearFormat: "YYYY",
    },
  };

  // convert-array-to-csv

  // ConfigProvider level locale
  const globalBuddhistLocale = {
    ...enUS,
    DatePicker: {
      ...enUS.DatePicker,
      lang: buddhistLocale.lang,
    },
  };

  const onChange = (_, inputedTime) => {
    setOperationTime(inputedTime)
  };

  const onDeviceSelection = (selected, _) => {
    setDeviceName(selected);
    setDeviceId(_.key);
  };
  const onBranchSelection = (selected, _) => {
    form.resetFields(["deviceId"]);
    setBranchName(selected);
  };

  const { Option } = Select;

  const branches =
    props.auth?.allDevicesfetched &&
    props.auth?.allDevicesfetched?.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.branch_name === value.branch_name)
    );

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleMonitorTableChange = (pagination) => {
    setMonitorPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const handleBranchPostingTableChange = (pagination) => {
    setBranchPostingPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const handleBranchRowClick = (record) => {
    setSelectedBranch(record);
    setBranchDetailModalVisible(true);
  };

  const handleCloseBranchModal = () => {
    setBranchDetailModalVisible(false);
    setSelectedBranch(null);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        className="dl-col-filter"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          className="dl-col-filter-input"
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            className="dl-col-filter-btn"
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            className="dl-col-filter-btn"
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        className={`dl-col-filter-icon ${filtered ? "is-active" : ""}`}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible)
      {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const tableData = props.auth.allDevicesfetched;
  useEffect(() => {
    if (props.auth.allDevicesfetched)
    {
      const sortedData = tableData.sort(
        (a, b) =>
          parseFloat(b.hours_since_last_post) -
          parseFloat(a.hours_since_last_post)
      );
      setSortedDataState(sortedData);
      setMonitorDataState(
        sortedData.filter((newtable) => newtable.non_post_attention)
      );
    }
  }, [props.auth.allDevicesfetched]);
  useEffect(() => {
    if (!props.auth.allDevicesfetched)
    {
      props.getDownloadAllDevices();
    }
  }, []);

  // Fetch branch posting REPORT (non-posting devices view)
  useEffect(() => {
    const fetchReport = async () => {
      setReportLoading(true);
      try
      {
        const response = await APIService.get('/api/v1/branch-posting-report/');
        const payload = response?.data || {};
        setReportData(payload);
      } catch (error)
      {
        notification.error({
          message: 'Failed to load branch posting report',
          description: error?.response?.data?.detail || error?.message || 'Please try again'
        });
        setReportData(null);
      } finally
      {
        setReportLoading(false);
      }
    };
    fetchReport();
  }, []);

  // Fetch branch posting data
  useEffect(() => {
    const fetchBranchPostingData = async () => {
      setBranchPostingLoading(true);
      try
      {
        const response = await APIService.get('/api/v1/branch-posting-status/');
        const data = Array.isArray(response?.data) ? response.data : [];
        // Sort by hours_since_last_post descending: longest-not-posted (incl. nulls) first
        const sortedData = data.sort((a, b) => {
          const aVal =
            a.hours_since_last_post === null ||
              a.hours_since_last_post === undefined
              ? Number.POSITIVE_INFINITY
              : parseFloat(a.hours_since_last_post);
          const bVal =
            b.hours_since_last_post === null ||
              b.hours_since_last_post === undefined
              ? Number.POSITIVE_INFINITY
              : parseFloat(b.hours_since_last_post);
          return bVal - aVal;
        });
        setBranchPostingData(sortedData);
      } catch (error)
      {
        notification.error({
          message: 'Failed to load branch posting data',
          description: error?.response?.data?.detail || error?.message || 'Please try again'
        });
        setBranchPostingData([]);
      } finally
      {
        setBranchPostingLoading(false);
      }
    };
    fetchBranchPostingData();
  }, []);

  const columnData = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Branch Name",
      dataIndex: "branch_name",
      key: "branch_name",
      ...getColumnSearchProps("branch_name"),
    },
    {
      title: "Client Name",
      dataIndex: "client_name",
      key: "client_name",
      ...getColumnSearchProps("client_name"),
    },
    {
      title: "Hours Since Last Post",
      dataIndex: "hours_since_last_post",
      key: "hours_since_last_post",
      render: (value) => (
        <>
          {value + " Hour(s) "} <br />{" "}
          <span>
            ({Math.floor(value / 24) + "Days,"} {Math.floor(value % 24) + "Hrs"}
            )
          </span>
        </>
      ),
    },
    {
      title: "Last Posted",
      dataIndex: "last_posted",
      key: "last_posted",
      render: (value) =>
        value === null
          ? value
          : new Date(value)
            .toString()
            .toString()
            .split(" ")
            .slice(0, 5)
            .join(" "),
    },
    // {
    //   title: "Non Post Attention",
    //   dataIndex: "non_post_attention",
    //   key: "non_post_attention",
    //   render: (value) => <>{value.toString()}</>
    // },
    {
      title: "Status",
      dataIndex: "hours_since_last_post",
      key: "hours_since_last_post",
      render: (value) =>
        value <= 36 ? (
          <Tag icon={<AlertFilled color="green" />} color="green"></Tag>
        ) : (
          <Tag icon={<FireFilled color="red" />} color="red"></Tag>
        ),
    },
    // deviceStatus,
    {
      title: "Add to Monitor",
      key: "control",
      width: "10%",
      dataIndex: "control",
      render: (_, record) => {
        return (
          <Switch
            checked={record.non_post_attention}
            defaultChecked
            onClick={(value) => {
              setDeviceData(record);

              setDeviceSwitch(value);
              const handleNonPostingTurggle = async () => {
                const request = await props.toggleNonPostingDevice(
                  record.device_id
                );

                if (request.fulfilled)
                {
                  props.getDownloadAllDevices();
                  return notification.info({
                    message: "Successful",
                    description: request.message,
                  });
                }
              };
              handleNonPostingTurggle();
            }}
          />
        );
      },
    },
  ];

  // Branch Posting Table Columns
  const branchPostingColumns = [
    {
      title: "Branch Name",
      dataIndex: "branch_name",
      key: "branch_name",
      ...getColumnSearchProps("branch_name"),
    },
    {
      title: "Latest Post Time",
      dataIndex: "latest_post_time",
      key: "latest_post_time",
      render: (value) =>
        value
          ? new Date(value)
            .toString()
            .split(" ")
            .slice(0, 5)
            .join(" ")
          : "-",
    },
    {
      title: "Hours Since Last Post",
      dataIndex: "hours_since_last_post",
      key: "hours_since_last_post",
      sorter: (a, b) => {
        const aVal =
          a.hours_since_last_post === null ||
            a.hours_since_last_post === undefined
            ? Number.POSITIVE_INFINITY
            : parseFloat(a.hours_since_last_post);
        const bVal =
          b.hours_since_last_post === null ||
            b.hours_since_last_post === undefined
            ? Number.POSITIVE_INFINITY
            : parseFloat(b.hours_since_last_post);
        return aVal - bVal;
      },
      defaultSortOrder: "descend",
      sortDirections: ["descend", "ascend"],
      render: (value) => {
        if (value === null || value === undefined || value === 999) return "Null";
        return (
          <>
            {value + " Hour(s) "} <br />{" "}
            <span>
              ({Math.floor(value / 24) + "Days,"} {Math.floor(value % 24) + "Hrs"}
              )
            </span>
          </>
        );
      },
    },
    {
      title: "Active Devices",
      dataIndex: "devices",
      key: "active_devices",
      render: (devices) => {
        if (!devices || !Array.isArray(devices)) return 0;
        return devices.filter((d) => d.is_active === true).length;
      },
    },
  ];

  // Device columns for branch detail modal
  const branchDeviceColumns = [
    {
      title: "Device Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Is Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (value) => (value ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
    },
    {
      title: "Device Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Last Posted",
      dataIndex: "last_posted",
      key: "last_posted",
      render: (value) =>
        value === null || value === undefined
          ? "Null"
          : new Date(value)
            .toString()
            .split(" ")
            .slice(0, 5)
            .join(" "),
    },
    {
      title: "Hours Since Last Post",
      dataIndex: "hours_since_last_post",
      key: "hours_since_last_post",
      render: (value) => {
        if (value === null || value === undefined || value === 999) return "Null";
        return (
          <>
            {value + " Hour(s) "} <br />{" "}
            <span>
              ({Math.floor(value / 24) + "Days,"} {Math.floor(value % 24) + "Hrs"}
              )
            </span>
          </>
        );
      },
    },
  ];

  const monitorColumn = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Branch Name",
      dataIndex: "branch_name",
      key: "branch_name",
      ...getColumnSearchProps("branch_name"),
    },
    {
      title: "Client Name",
      dataIndex: "client_name",
      key: "client_name",
      ...getColumnSearchProps("client_name"),
    },
    {
      title: "Hours Since Last Post",
      dataIndex: "hours_since_last_post",
      key: "hours_since_last_post",
      render: (value) => (
        <>
          {value + " Hour(s) "} <br />{" "}
          <span>
            ({Math.floor(value / 24) + "Days,"} {Math.floor(value % 24) + "Hrs"}
            )
          </span>
        </>
      ),
    },
    {
      title: "Last Posted",
      dataIndex: "last_posted",
      key: "last_posted",
      render: (value) =>
        value === null
          ? value
          : new Date(value).toString().split(" ").slice(0, 5).join(" "),
    },
    // {
    //   title: "Non Post Attention",
    //   dataIndex: "non_post_attention",
    //   key: "non_post_attention",
    //   render: (value) => <>{value.toString()}</>
    // },
    {
      title: "Status",
      dataIndex: "hours_since_last_post",
      key: "hours_since_last_post",
      render: (value) =>
        value <= 36 ? (
          <Tag icon={<AlertFilled color="green" />} color="green"></Tag>
        ) : (
          <Tag icon={<FireFilled color="red" />} color="red"></Tag>
        ),
    },
    {
      title: "Remove From Monitor",
      key: "control",
      width: "10%",
      dataIndex: "control",
      render: (_, record) => {
        return (
          <Switch
            checked={record.non_post_attention}
            // disabled
            onClick={(value) => {
              setDeviceData(record);
              setDeviceSwitch(value);
              const handleNonPostingTurggle = async () => {
                const request = await props.toggleNonPostingDevice(
                  record.device_id
                );

                if (request.fulfilled)
                {
                  props.getDownloadAllDevices();
                  return notification.info({
                    message: "Successful",
                    description: request.message,
                  });
                }
              };
              handleNonPostingTurggle();
            }}
          />
        );
      },
    },
  ];

  const devicesSelector = (
    <Select
      className="cost-tracker-select h-4-br"
      id="role-state"
      showSearch
      size="large"
      disabled={!branchName}
      suffixIcon={<CaretDownFilled />}
      onSelect={onDeviceSelection}
    >
      {branchName &&
        props.auth?.allDevicesfetched?.map(
          (device) =>
            device.branch_name === branchName && (
              <Option
                key={device.device_id}
                className="active-state-option"
                value={device.name}
              >
                {device.name}
              </Option>
            )
        )}
    </Select>
  );
  const devicesOperatingSelector = (
    <Select
      className="cost-tracker-select h-4-br"
      id="role-state"
      showSearch
      size="large"
      disabled={!branchName}
      suffixIcon={<CaretDownFilled />}
      onSelect={onDeviceSelection}
    >
      {branchName &&
        props.auth?.allDevicesfetched?.map(
          (device) =>
            device.branch_name === branchName && (
              <Option
                key={device.device_id}
                className="active-state-option"
                value={device.device_id}
              >
                {device.name}
              </Option>
            )
        )}
    </Select>
  );
  const branchSelector = (
    <Select
      className="cost-tracker-select h-4-br dl-branch-select"
      id="role-state"
      showSearch
      suffixIcon={<CaretDownFilled />}
      onSelect={onBranchSelection}
    >
      {props.auth?.allDevicesfetched &&
        branches?.map((device) => (
          <Option
            key={device.branch_name}
            className="active-state-option"
            value={device.branch_name}
          >
            {device.branch_name}
          </Option>
        ))}
    </Select>
  );

  const onPasswordFormSubmit = async () => {
    const request = await props.getDownloadAllDevices();

    if (request.fulfilled)
    {
      form.resetFields();
      return notification.info({
        message: "successful",
        description: request.message,
      });
    }
    return notification.error({
      message: "Not found",
      description: "No data for that selection",
    });
  };
  const onSelectFormSubmit = async (values) => {
    const { dateRange } = values;
    const request = await props.getDownloadDeviceReadings(
      deviceId,
      dateRange
    );

    if (request.fulfilled)
    {
      const abc = convertArrayToCSV(request.data);

      const downloadName = `${deviceName}.csv`;
      downloadFile(abc, downloadName);

      form.resetFields();
      return notification.info({
        message: "successful",
        description: request.message,
      });
    }
    return notification.error({
      message: "failed",
      description: request.message,
    });
  };
  // const onOperatingTimeSubmit = async (values) => {
  //   const { dateRange, timeRange } = values;

  //   const request = await props.getDownloadDeviceConsumption(
  //     pPassword,
  //     deviceId,
  //     dateRange,
  //     timeRange
  //   );

  //   if (request.fulfilled) {
  //     const abc = convertArrayToCSV(request.data);

  //     const downloadName = `${deviceName}.csv`;
  //     downloadFile(abc, downloadName);

  //     formFour.resetFields();
  //     return notification.info({
  //       message: "successful",
  //       description: request.message,
  //     });
  //   }
  //   return notification.error({
  //     message: "failed",
  //     description: request.message,
  //   });
  // };

  const onSelectAggregateFormSubmit = async (values) => {
    const { dateRange } = values;
    const startDate = dateRange[0].format("DD-MM-YYYY HH:mm");
    const endDate = dateRange[1].format("DD-MM-YYYY HH:mm");
    const downloadUrl = `/api/v1/get_aggregated_device_readings/${deviceId}/${startDate}/${endDate}/`;

    form.resetFields();

    notification.info({
      message: "successful",
      description: "successful",
    });
    return (window.location.href = `${EnvData.REACT_APP_API_URL}${downloadUrl}`);
  };

  const onOperatingTimeSubmit = async (values) => {
    const { deviceId, dateRange, timeRange } = values;
    const startDate = dateRange[0].format('DD-MM-YYYY HH:mm');
    const endDate = dateRange[1].format('DD-MM-YYYY HH:mm');
    const startHour = timeRange[0].format('HH');
    const endHour = timeRange[1].format('HH');
    const downloadUrl = `/api/v1/get_timed_device_readings/${deviceId}/${startDate}/${endDate}/${startHour}/${endHour}`;

    form.resetFields();

    notification.info({
      message: "successful",
      description: "successful",
    });
    return (window.location.href = `${EnvData.REACT_APP_API_URL}${downloadUrl}`);
  };

  // Monitoring overview percentages (based on Monitoring Table data)
  const calculatePostingPercentage = (devices, minutes) => {
    if (!devices || devices.length === 0) return 0;
    const devicesWithLastPost = devices.filter((device) => !!device.last_posted);
    if (devicesWithLastPost.length === 0) return 0;
    const cutoffTime = moment().subtract(minutes, 'minutes');
    const devicesWithinWindow = devicesWithLastPost.filter((device) => moment(device.last_posted).isAfter(cutoffTime));
    return Math.round((devicesWithinWindow.length / devicesWithLastPost.length) * 100);
  };

  // Branch posting percentage calculation
  const calculateBranchPostingPercentage = (branches, minutes) => {
    if (!branches || branches.length === 0) return 0;
    const branchesWithPost = branches.filter((branch) => branch.latest_post_time && branch.hours_since_last_post !== 999);
    if (branchesWithPost.length === 0) return 0;
    const cutoffTime = moment().subtract(minutes, 'minutes');
    const branchesWithinWindow = branchesWithPost.filter((branch) =>
      branch.latest_post_time && moment(branch.latest_post_time).isAfter(cutoffTime)
    );
    return Math.round((branchesWithinWindow.length / branchesWithPost.length) * 100);
  };

  // Use useMemo to recalculate percentages only when data changes
  const monitoringPct30Min = useMemo(() =>
    calculatePostingPercentage(monitorDataState, 30),
    [monitorDataState]
  );
  const monitoringPct60Min = useMemo(() =>
    calculatePostingPercentage(monitorDataState, 60),
    [monitorDataState]
  );
  const monitoringPct24Hr = useMemo(() =>
    calculatePostingPercentage(monitorDataState, 24 * 60),
    [monitorDataState]
  );
  const allDevicesPct30Min = useMemo(() =>
    calculatePostingPercentage(sortedDataState, 30),
    [sortedDataState]
  );
  const allDevicesPct60Min = useMemo(() =>
    calculatePostingPercentage(sortedDataState, 60),
    [sortedDataState]
  );
  const allDevicesPct24Hr = useMemo(() =>
    calculatePostingPercentage(sortedDataState, 24 * 60),
    [sortedDataState]
  );

  // Branch posting percentages
  const branchPostingPct30Min = useMemo(() =>
    calculateBranchPostingPercentage(branchPostingData, 30),
    [branchPostingData]
  );
  const branchPostingPct60Min = useMemo(() =>
    calculateBranchPostingPercentage(branchPostingData, 60),
    [branchPostingData]
  );
  const branchPostingPct24Hr = useMemo(() =>
    calculateBranchPostingPercentage(branchPostingData, 24 * 60),
    [branchPostingData]
  );

  // Filtered data based on search input
  const filteredBranchPostingData = useMemo(() => {
    if (!branchPostingSearch) return branchPostingData;
    const query = branchPostingSearch.toLowerCase();
    return branchPostingData.filter((item) =>
      (item.branch_name || "").toString().toLowerCase().includes(query)
    );
  }, [branchPostingData, branchPostingSearch]);

  const filteredMonitorData = useMemo(() => {
    if (!monitorSearch) return monitorDataState;
    const query = monitorSearch.toLowerCase();
    return monitorDataState.filter((item) =>
      (item.name || "").toString().toLowerCase().includes(query) ||
      (item.branch_name || "").toString().toLowerCase().includes(query) ||
      (item.client_name || "").toString().toLowerCase().includes(query)
    );
  }, [monitorDataState, monitorSearch]);

  // ----- Branch posting REPORT derivations -----
  const reportBranches = useMemo(() => {
    const branches = Array.isArray(reportData?.branches) ? reportData.branches : [];
    // Sort by worst device's hours_since_last_post descending; null treated as worst.
    return [...branches]
      .map((b) => {
        const devices = Array.isArray(b?.devices) ? b.devices : [];
        const worstDeviceHours = devices.reduce((acc, d) => {
          const h =
            d?.last_posted == null
              ? Number.POSITIVE_INFINITY
              : parseFloat(d?.hours_since_last_post);
          if (Number.isNaN(h)) return acc;
          return h > acc ? h : acc;
        }, -1);
        const staleCount = devices.filter((d) => d?.is_stale).length;
        const inactiveCount = devices.filter((d) => d?.is_inactive).length;
        const worstDevice = devices.reduce((acc, d) => {
          if (!acc) return d;
          const aH =
            acc?.last_posted == null
              ? Number.POSITIVE_INFINITY
              : parseFloat(acc?.hours_since_last_post || 0);
          const dH =
            d?.last_posted == null
              ? Number.POSITIVE_INFINITY
              : parseFloat(d?.hours_since_last_post || 0);
          return dH > aH ? d : acc;
        }, null);
        return { ...b, _worstDeviceHours: worstDeviceHours, _staleCount: staleCount, _inactiveCount: inactiveCount, _worstDevice: worstDevice };
      })
      .sort((a, b) => b._worstDeviceHours - a._worstDeviceHours);
  }, [reportData]);

  const filteredReportBranches = useMemo(() => {
    const query = reportSearch.trim().toLowerCase();
    return reportBranches.filter((b) => {
      if (reportFilter === 'stale' && !(b._staleCount > 0 && b._inactiveCount === 0))
      {
        // "Stale only" = branches with stale-but-not-inactive devices
        if (!b.has_stale_device || b._inactiveCount > 0) return false;
      }
      if (reportFilter === 'inactive' && b._inactiveCount === 0) return false;
      if (!query) return true;
      const hay = [
        b?.branch_name,
        b?.branch_id,
        ...(Array.isArray(b?.devices) ? b.devices.map((d) => d?.name) : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(query);
    });
  }, [reportBranches, reportSearch, reportFilter]);

  const reportTotal = filteredReportBranches.length;
  const reportTotalPages = Math.max(1, Math.ceil(reportTotal / reportPageSize));

  useEffect(() => {
    if (reportPage > reportTotalPages) setReportPage(reportTotalPages);
  }, [reportPage, reportTotalPages]);

  const pagedReportBranches = useMemo(() => {
    const start = (reportPage - 1) * reportPageSize;
    return filteredReportBranches.slice(start, start + reportPageSize);
  }, [filteredReportBranches, reportPage, reportPageSize]);

  const formatHours = (value) => {
    if (value === null || value === undefined || value === 999)
    {
      return { label: 'Never posted', kind: 'never' };
    }
    const v = Number(value);
    if (Number.isNaN(v)) return { label: '—', kind: 'never' };
    const days = Math.floor(v / 24);
    const hrs = Math.floor(v % 24);
    if (days > 0) return { label: `${v}h (${days}d ${hrs}h)`, kind: v > 24 ? 'stale' : 'ok' };
    return { label: `${v}h`, kind: v > 24 ? 'stale' : 'ok' };
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const toggleBranchExpand = (id) => {
    setExpandedBranches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllReportBranches = () => {
    const next = {};
    pagedReportBranches.forEach((b) => { next[b.branch_id] = true; });
    setExpandedBranches((prev) => ({ ...prev, ...next }));
  };

  const collapseAllReportBranches = () => setExpandedBranches({});

  const anyReportExpanded = useMemo(
    () => pagedReportBranches.some((b) => expandedBranches[b.branch_id]),
    [pagedReportBranches, expandedBranches]
  );

  const renderKpiCard = ({ key, label, value, unit, sub }) => (
    <div key={key} className="dl-kpi-card">
      <div className="dl-kpi-icon-wrap">
        <span className="dl-kpi-label">{label}</span>
      </div>
      <div className="dl-kpi-value-row">
        <span className="dl-kpi-value">{value}</span>
        {unit ? <span className="dl-kpi-unit">{unit}</span> : null}
      </div>
      {sub ? <span className="dl-kpi-sub">{sub}</span> : null}
    </div>
  );

  return (
    <div className="download-page-container dl-page-container">
      <Spin spinning={props.auth.allDevicesfetchLoading || props.auth.fetchDeviceReadingsLoading || branchPostingLoading || reportLoading}>
        <Title level={2} className="dl-page-title-centered">
          Download CSV File
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Download Device Readings" className="dl-form-card">
              <Form
                form={formTwo}
                layout="vertical"
                onFinish={onSelectFormSubmit}
              >
                <Form.Item
                  label="Branch"
                  name="branchId"
                  rules={[{ required: true, message: "Please select a branch!" }]}
                >
                  {branchSelector}
                </Form.Item>
                <Form.Item
                  label="Device"
                  name="deviceId"
                  rules={[{ required: true, message: "Please select a device!" }]}
                >
                  {devicesSelector}
                </Form.Item>
                <Form.Item
                  label="Date Range"
                  name="dateRange"
                  rules={[{ required: true, message: "Please select a date range!" }]}
                >
                  <RangePicker
                    className="dl-range-picker"
                    disabledDate={(current) => current.isAfter(moment())}
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Button className="dl-download-btn" htmlType="submit">
                    Download
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Download Aggregated Device Readings" className="dl-form-card">
              <Form
                form={formThree}
                layout="vertical"
                onFinish={onSelectAggregateFormSubmit}
              >
                <Form.Item
                  label="Branch"
                  name="branchId"
                  rules={[{ required: true, message: "Please select a branch!" }]}
                >
                  {branchSelector}
                </Form.Item>
                <Form.Item
                  label="Device"
                  name="deviceId"
                  rules={[{ required: true, message: "Please select a device!" }]}
                >
                  {devicesSelector}
                </Form.Item>
                <Form.Item
                  label="Date Range"
                  name="dateRange"
                  rules={[{ required: true, message: "Please select a date range!" }]}
                >
                  <RangePicker
                    className="dl-range-picker"
                    disabledDate={(current) => current.isAfter(moment())}
                    size="large"
                  />
                </Form.Item>
                <Form.Item>
                  <Button className="dl-download-btn" htmlType="submit">
                    Download
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24}>
            <Card title="Download Device Operating Time" className="dl-form-card">
              <Form
                form={formFour}
                layout="vertical"
                onFinish={onOperatingTimeSubmit}
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Branch"
                      name="branchId"
                      rules={[{ required: true, message: "Please select a branch!" }]}
                    >
                      {branchSelector}
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Device"
                      name="deviceId"
                      rules={[{ required: true, message: "Please select a device!" }]}
                    >
                      {devicesOperatingSelector}
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Date Range"
                      name="dateRange"
                      rules={[{ required: true, message: "Please select a date range!" }]}
                    >
                      <RangePicker
                        className="dl-range-picker"
                        disabledDate={(current) => current.isAfter(moment())}
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Time Range"
                      name="timeRange"
                      rules={[{ required: true, message: "Please select a time range!" }]}
                    >
                      <TimePicker.RangePicker
                        className="dl-range-picker"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button className="dl-download-btn" htmlType="submit">
                    Download
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* ============================================================
              Branch Posting Report — non-posting devices section
              ============================================================ */}
          <Col xs={24}>
            <div className="dl-section dl-section--report">
              <div className="dl-section-header">
                <div>
                  <Title level={3} className="dl-section-title">Branch Posting Report</Title>
                  <Text className="dl-section-subtitle">
                    Branches with devices not posting for more than {reportData?.stale_threshold_hours ?? 24} hours
                  </Text>
                </div>
              </div>

              <div className="dl-kpi-grid">
                {renderKpiCard({
                  key: 'branches_scanned',
                  label: 'Branches scanned',
                  value: reportData?.summary?.branches_scanned ?? '—',
                  sub: 'Active branches on platform',
                })}
                {renderKpiCard({
                  key: 'need_attention',
                  label: 'Need attention',
                  value: reportData?.summary?.branches_in_report ?? '—',
                  sub: 'Branches with ≥1 device > 24h silent',
                })}
                {renderKpiCard({
                  key: 'stale_devices',
                  label: 'Stale devices',
                  value: reportData?.summary?.stale_device_count ?? '—',
                  sub: 'Highlighted in red below',
                })}
                {renderKpiCard({
                  key: 'inactive_devices',
                  label: 'Inactive devices',
                  value: reportData?.summary?.inactive_device_count ?? '—',
                  sub: 'Shown with inactive label',
                })}
              </div>

              <div className="dl-toolbar">
                <Input
                  className="dl-toolbar-search"
                  placeholder="Search branch or device name"
                  prefix={<SearchOutlined />}
                  value={reportSearch}
                  onChange={(e) => {
                    setReportSearch(e.target.value);
                    setReportPage(1);
                  }}
                  allowClear
                />
                <div className="dl-filter-chips">
                  <button
                    type="button"
                    className={`dl-chip ${reportFilter === 'all' ? 'is-active' : ''}`}
                    onClick={() => { setReportFilter('all'); setReportPage(1); }}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`dl-chip ${reportFilter === 'stale' ? 'is-active' : ''}`}
                    onClick={() => { setReportFilter('stale'); setReportPage(1); }}
                  >
                    Stale only
                  </button>
                  <button
                    type="button"
                    className={`dl-chip ${reportFilter === 'inactive' ? 'is-active' : ''}`}
                    onClick={() => { setReportFilter('inactive'); setReportPage(1); }}
                  >
                    Inactive only
                  </button>
                  <button
                    type="button"
                    className="dl-chip"
                    onClick={anyReportExpanded ? collapseAllReportBranches : expandAllReportBranches}
                  >
                    {anyReportExpanded ? 'Collapse all' : 'Expand all on page'}
                  </button>
                </div>
              </div>

              <div className="dl-meta-row">
                <span><span className="dl-meta-dot dl-legend-stale" />Stale — not posted &gt; {reportData?.stale_threshold_hours ?? 24}h (or never)</span>
                <span><span className="dl-meta-dot dl-legend-inactive" />Inactive — device off platform</span>
                <span className="dl-meta-right">
                  Showing {reportTotal === 0 ? 0 : (reportPage - 1) * reportPageSize + 1}
                  –{Math.min(reportPage * reportPageSize, reportTotal)} of {reportTotal}
                  {reportTotal !== reportBranches.length ? ` (filtered from ${reportBranches.length})` : ''}
                </span>
              </div>

              <div className="dl-branch-list">
                {reportLoading ? (
                  <div className="dl-empty"><Spin /></div>
                ) : pagedReportBranches.length === 0 ? (
                  <div className="dl-empty">No branches match the current filters.</div>
                ) : (
                  pagedReportBranches.map((b) => {
                    const isOpen = !!expandedBranches[b.branch_id];
                    const worst = b._worstDevice;
                    const worstHours = worst?.last_posted == null
                      ? 'Never posted'
                      : formatHours(worst?.hours_since_last_post).label;
                    const isLongestSilence =
                      b._worstDeviceHours === Number.POSITIVE_INFINITY ||
                      b._worstDeviceHours >= 24 * 30; // ~30 days+
                    return (
                      <div
                        key={b.branch_id}
                        className={`dl-branch-card ${isOpen ? 'is-open' : ''}`}
                      >
                        <div
                          className="dl-branch-head"
                          onClick={() => toggleBranchExpand(b.branch_id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                            {
                              e.preventDefault();
                              toggleBranchExpand(b.branch_id);
                            }
                          }}
                        >
                          <span className="dl-branch-toggle">
                            <CaretDownFilled />
                          </span>
                          <div>
                            <div className="dl-branch-name">{b.branch_name || 'Unknown branch'}</div>
                            <div className="dl-branch-sub">
                              Branch #{b.branch_id} · worst device:{' '}
                              <span className="dl-branch-sub-strong">
                                {worst?.name ? `${worst.name} (${worstHours})` : worstHours}
                              </span>
                            </div>
                          </div>
                          <div className="dl-pill-group">
                            <span className="dl-pill dl-pill--id">ID {b.branch_id}</span>
                            {b._staleCount > 0 && (
                              <span className="dl-pill dl-pill--stale">
                                {b._staleCount} stale
                              </span>
                            )}
                            {b._inactiveCount > 0 && (
                              <span className="dl-pill dl-pill--inactive">
                                {b._inactiveCount} inactive
                              </span>
                            )}
                            {isLongestSilence && (
                              <span className="dl-pill dl-pill--longest">Longest silence</span>
                            )}
                          </div>
                        </div>

                        {isOpen && (
                          <div className="dl-branch-body">
                            {b?.latest_post_by_type && Object.keys(b.latest_post_by_type).length > 0 && (
                              <div className="dl-by-type">
                                <strong>Latest post by type</strong>
                                {Object.entries(b.latest_post_by_type).map(([type, dt]) => (
                                  <div key={type} className="dl-by-type-row">
                                    <strong>{type}:</strong>
                                    {formatDateTime(dt)}
                                  </div>
                                ))}
                              </div>
                            )}

                            <table className="dl-mini-table">
                              <thead>
                                <tr>
                                  <th>Device</th>
                                  <th>Status</th>
                                  <th>Type</th>
                                  <th>Last posted</th>
                                  <th>Hours since post</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(b.devices || []).map((d) => {
                                  const hp = formatHours(d?.hours_since_last_post);
                                  const hoursKind = d?.last_posted == null ? 'never' : hp.kind;
                                  return (
                                    <tr
                                      key={d?.device_id || `${b.branch_id}-${d?.name}`}
                                      className={`${d?.is_stale ? 'is-stale' : ''} ${d?.is_inactive ? 'is-inactive' : ''}`}
                                    >
                                      <td>{d?.name || '—'}</td>
                                      <td>
                                        {d?.is_inactive ? (
                                          <span className="dl-pill dl-pill--inactive">Inactive</span>
                                        ) : d?.is_stale ? (
                                          <span className="dl-pill dl-pill--stale">Stale</span>
                                        ) : (
                                          <span className="dl-pill dl-pill--ok">Active</span>
                                        )}
                                      </td>
                                      <td>{d?.type || '—'}</td>
                                      <td>{formatDateTime(d?.last_posted)}</td>
                                      <td>
                                        <span className={`dl-hours-pill dl-hours-pill--${hoursKind}`}>
                                          {d?.last_posted == null ? 'Never' : hp.label}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {reportTotal > 0 && (
                <div className="dl-pagination-bar">
                  <div className="dl-pagination-info">
                    Total <b>{reportTotal}</b>
                  </div>
                  <div className="dl-pagination-controls">
                    <button
                      type="button"
                      className="dl-page-btn"
                      onClick={() => setReportPage(1)}
                      disabled={reportPage === 1}
                    >
                      «
                    </button>
                    <button
                      type="button"
                      className="dl-page-btn"
                      onClick={() => setReportPage((p) => Math.max(1, p - 1))}
                      disabled={reportPage === 1}
                    >
                      ‹
                    </button>
                    <span className="dl-page-current">
                      Page <b>{reportPage}</b> of {reportTotalPages}
                    </span>
                    <button
                      type="button"
                      className="dl-page-btn"
                      onClick={() => setReportPage((p) => Math.min(reportTotalPages, p + 1))}
                      disabled={reportPage >= reportTotalPages}
                    >
                      ›
                    </button>
                    <button
                      type="button"
                      className="dl-page-btn"
                      onClick={() => setReportPage(reportTotalPages)}
                      disabled={reportPage >= reportTotalPages}
                    >
                      »
                    </button>
                    <Select
                      className="dl-page-size"
                      value={reportPageSize}
                      onChange={(value) => {
                        setReportPageSize(value);
                        setReportPage(1);
                      }}
                      options={[
                        { value: 5, label: '5 / page' },
                        { value: 10, label: '10 / page' },
                        { value: 20, label: '20 / page' },
                        { value: 50, label: '50 / page' },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          </Col>

          <Col xs={24}>
            <Title level={3} className="dl-section-title">
              Branch Posting
            </Title>
            <div className="dl-kpi-grid dl-kpi-grid--3 dl-kpi-grid--spaced">
              {renderKpiCard({
                key: 'br-30',
                label: 'Branches: Posted within last 30 minutes',
                value: `${branchPostingPct30Min}%`,
                sub: 'Share of branches with a post in the window',
              })}
              {renderKpiCard({
                key: 'br-60',
                label: 'Branches: Posted within last 60 minutes',
                value: `${branchPostingPct60Min}%`,
                sub: 'Share of branches with a post in the window',
              })}
              {renderKpiCard({
                key: 'br-24',
                label: 'Branches: Posted within last 24 hours',
                value: `${branchPostingPct24Hr}%`,
                sub: 'Share of branches with a post in the window',
              })}
            </div>
            <Card className="dl-table-card">
              <Input
                placeholder="Search by branch name"
                prefix={<SearchOutlined />}
                allowClear
                value={branchPostingSearch}
                onChange={(e) => {
                  setBranchPostingSearch(e.target.value);
                  setBranchPostingPagination((prev) => ({ ...prev, current: 1 }));
                }}
                  size="large"
                  className="dl-inner-search"
                />
                <Table
                  dataSource={filteredBranchPostingData}
                columns={branchPostingColumns}
                loading={branchPostingLoading}
                scroll={{ x: true }}
                pagination={branchPostingPagination}
                onChange={handleBranchPostingTableChange}
                rowKey="branch_id"
                onRow={(record) => ({
                  onClick: () => handleBranchRowClick(record),
                  style: { cursor: 'pointer' }
                })}
              />
            </Card>
          </Col>

          <Col xs={24}>
            <Title level={3} className="dl-section-title">
              Monitoring Table
            </Title>
            <div className="dl-kpi-grid dl-kpi-grid--3 dl-kpi-grid--spaced">
              {renderKpiCard({
                key: 'mon-30',
                label: 'Posted within last 30 minutes',
                value: `${monitoringPct30Min}%`,
                sub: 'Share of monitored devices with a post in the window',
              })}
              {renderKpiCard({
                key: 'mon-60',
                label: 'Posted within last 60 minutes',
                value: `${monitoringPct60Min}%`,
                sub: 'Share of monitored devices with a post in the window',
              })}
              {renderKpiCard({
                key: 'mon-24',
                label: 'Posted within last 24 hours',
                value: `${monitoringPct24Hr}%`,
                sub: 'Share of monitored devices with a post in the window',
              })}
            </div>
            <Card className="dl-table-card">
              <Input
                placeholder="Search by name, branch or client"
                prefix={<SearchOutlined />}
                allowClear
                value={monitorSearch}
                onChange={(e) => {
                  setMonitorSearch(e.target.value);
                  setMonitorPagination((prev) => ({ ...prev, current: 1 }));
                }}
                  size="large"
                  className="dl-inner-search"
                />
                <Table
                  dataSource={filteredMonitorData}
                columns={monitorColumn}
                scroll={{ x: true }}
                pagination={monitorPagination}
                onChange={handleMonitorTableChange}
              />
            </Card>
          </Col>
        </Row>

        <Modal
          title={`Branch Details: ${selectedBranch?.branch_name || ''}`}
          open={branchDetailModalVisible}
          onCancel={handleCloseBranchModal}
          footer={[
            <Button key="close" onClick={handleCloseBranchModal}>
              Close
            </Button>
          ]}
          width={900}
        >
          {selectedBranch && (
            <div>
              {selectedBranch.latest_post_by_type && (
                <div className="dl-modal-section">
                  <Title level={5} className="dl-modal-section-title">Latest Post By Type</Title>
                  <Descriptions bordered column={1}>
                    {Object.entries(selectedBranch.latest_post_by_type).map(([type, datetime]) => (
                      <Descriptions.Item key={type} label={type}>
                        {datetime ? new Date(datetime).toLocaleString() : '-'}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </div>
              )}

              {selectedBranch.devices && Array.isArray(selectedBranch.devices) && (
                <div>
                  <Title level={5} className="dl-modal-section-title">Devices List</Title>
                  <Table
                    dataSource={selectedBranch.devices}
                    columns={branchDeviceColumns}
                    rowKey={(record, index) => record.device_id || `device-${index}`}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50'],
                    }}
                    scroll={{ x: true }}
                    size="small"
                  />
                </div>
              )}
            </div>
          )}
        </Modal>

      </Spin>
    </div>
  );
}

const mapDispatchToProps = {
  getDownloadAllDevices,
  getDownloadDeviceReadings,
  getDownloadDeviceConsumption,
  toggleNonPostingDevice,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(DownloadPage);

// end of script
