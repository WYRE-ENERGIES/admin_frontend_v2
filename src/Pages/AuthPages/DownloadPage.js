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

const { convertArrayToCSV } = require("convert-array-to-csv");
const { Title } = Typography;

dayjs.extend(buddhistEra);

const buttonStyle = {
  backgroundColor: "#5c3592",
  color: "white",
  height: "40px",
  borderRadius: "7px",
  width: "100%",
  fontWeight: "bold",
  border: "none",
  "&:hover": {
    opacity: 0.9,
    backgroundColor: "#5C12A7",
  }
};

const cardStyle = {
  marginBottom: "24px",
  borderRadius: "8px",
};

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
        style={{
          padding: 8,
        }}
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
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
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
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
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
    if (props.auth.allDevicesfetched) {
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
    if (!props.auth.allDevicesfetched) {
      props.getDownloadAllDevices();
    }
  }, []);

  // Fetch branch posting data
  useEffect(() => {
    const fetchBranchPostingData = async () => {
      setBranchPostingLoading(true);
      try {
        const response = await APIService.get('/api/v1/branch-posting-status/');
        const data = Array.isArray(response?.data) ? response.data : [];
        // Sort by hours_since_last_post ascending (most recent posts first)
        const sortedData = data.sort(
          (a, b) => parseFloat(a.hours_since_last_post ?? 999) - parseFloat(b.hours_since_last_post ?? 999)
        );
        setBranchPostingData(sortedData);
      } catch (error) {
        notification.error({
          message: 'Failed to load branch posting data',
          description: error?.response?.data?.detail || error?.message || 'Please try again'
        });
        setBranchPostingData([]);
      } finally {
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

                if (request.fulfilled) {
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
      sorter: (a, b) =>
        parseFloat(a.hours_since_last_post ?? 999) -
        parseFloat(b.hours_since_last_post ?? 999),
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend"],
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

                if (request.fulfilled) {
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
      className="cost-tracker-select h-4-br"
      id="role-state"
      showSearch
      style={{ height: "40px", outline: "none" }}
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

    if (request.fulfilled) {
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

    if (request.fulfilled) {
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

  return (
    <div className="download-page-container" style={{ padding: "24px" }}>
      <Spin spinning={props.auth.allDevicesfetchLoading || props.auth.fetchDeviceReadingsLoading || branchPostingLoading}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
          Download CSV File
        </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Download Device Readings" style={cardStyle}>
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
                      style={{ width: "100%" }}
                      disabledDate={(current) => current.isAfter(moment())}
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button style={buttonStyle} htmlType="submit">
                      Download
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Download Aggregated Device Readings" style={cardStyle}>
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
                      style={{ width: "100%" }}
                      disabledDate={(current) => current.isAfter(moment())}
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button style={buttonStyle} htmlType="submit">
                      Download
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24}>
              <Card title="Download Device Operating Time" style={cardStyle}>
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
                          style={{ width: "100%" }}
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
                          style={{ width: "100%" }}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item>
                    <Button style={buttonStyle} htmlType="submit">
                      Download
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
          </Col>
          
                    <Col xs={24}>
          <h1 style={{fontSize: 24, color: "#333" }}>
            Branch Posting
          </h1>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card style={cardStyle}>
                    <Title level={5} style={{ marginBottom: 12, marginTop: 8 }}>Branches: Posted within last 30 minutes</Title>
                         <div style={{ fontSize: 28, fontWeight: 700, color: "#5C12A7" }}>{branchPostingPct30Min}%</div>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card style={cardStyle}>
                    <Title level={5} style={{ marginBottom: 12, marginTop: 8 }}>Branches: Posted within last 60 minutes</Title>
                         <div style={{ fontSize: 28, fontWeight: 700, color: "#5C12A7" }}>{branchPostingPct60Min}%</div>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card style={cardStyle}>
                    <Title level={5} style={{ marginBottom: 12, marginTop: 8 }}>Branches: Posted within last 24 hours</Title>
                         <div style={{ fontSize: 28, fontWeight: 700, color: "#5C12A7" }}>{branchPostingPct24Hr}%</div>
                  </Card>
                </Col>
              </Row>
              <Card style={cardStyle}>
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
                  style={{ marginBottom: 16, maxWidth: 360 }}
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
          <h1 style={{fontSize: 24, color: "#333" }}>
            Monitoring Table
          </h1>
              <Row gutter={[24, 24]} >
                <Col xs={24} md={8}>
                  <Card style={cardStyle}>
                    <Title level={5} style={{ marginBottom: 12, marginTop: 8 }}>Posted within last 30 minutes</Title>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#5C12A7" }}>{monitoringPct30Min}%</div>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card style={cardStyle}>
                    <Title level={5} style={{ marginBottom: 12, marginTop: 8 }}>Posted within last 60 minutes</Title>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#5C12A7" }}>{monitoringPct60Min}%</div>
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card style={cardStyle}>
                    <Title level={5} style={{ marginBottom: 12, marginTop: 8 }}>Posted within last 24 hours</Title>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#5C12A7" }}>{monitoringPct24Hr}%</div>
                  </Card>
                </Col>
              </Row>
              <Card style={cardStyle}>
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
                  style={{ marginBottom: 16, maxWidth: 360 }}
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
                <div style={{ marginBottom: 24 }}>
                  <Title level={5} style={{ marginBottom: 12 }}>Latest Post By Type</Title>
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
                  <Title level={5} style={{ marginBottom: 12 }}>Devices List</Title>
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
