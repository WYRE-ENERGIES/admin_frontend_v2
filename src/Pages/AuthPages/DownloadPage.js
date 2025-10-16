/* eslint-disable no-restricted-globals */
import React, { useEffect, useRef, useState } from "react";
// import { useCookies } from "react-cookie";
import { decode as base64_decode, encode as base64_encode } from 'base-64';


import {
  getDownloadAllDevices,
  getDownloadDeviceConsumption,
  getDownloadDeviceReadings,
  toggleNonPostingDevice,
} from "../../redux/actions/auth/auth.action";
import { connect } from "react-redux";
import { AlertFilled, FireFilled, SearchOutlined } from '@ant-design/icons';

import { Spin, Form, notification, Select, DatePicker, Table, Switch, Tag, Button, Space, TimePicker, Card, Row, Col, Typography } from "antd";
import en from 'antd/es/date-picker/locale/en_US';
import enUS from 'antd/es/locale/en_US';
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { CaretDownFilled } from "@ant-design/icons";
import { Input } from "antd";
import { downloadFile, compareDateInfo } from "../../helpers/generalHelper";
import moment from "moment";
import { Link } from "react-router-dom";
import EnvData from "../../config/EnvData";
import { render } from "react-dom";
import Highlighter from "react-highlight-words";
import Password from "antd/lib/input/Password";

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
  const [pPassword, setPPassword] = useState("12345678");
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
  const [monitorPagination, setMonitorPagination] = useState({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
});
const [allDevicesPagination, setAllDevicesPagination] = useState({
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

const handleAllDevicesTableChange = (pagination) => {
  setAllDevicesPagination((prev) => ({
    ...prev,
    current: pagination.current,
    pageSize: pagination.pageSize,
  }));
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
    if(!props.auth.allDevicesfetched){
      const password = base64_decode(sessionStorage.getItem('pp'));
      setPPassword(password);
      props.getDownloadAllDevices(password);
    }
    
  }, [sessionStorage.getItem('pp') || compareDateInfo(sessionStorage.getItem('ppt'), 30)])

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
                  props.getDownloadAllDevices(pPassword);
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
                  props.getDownloadAllDevices(pPassword);
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

  const onPasswordFormSubmit = async (values) => {
    const { password } = values;
    
    const request = await props.getDownloadAllDevices(password);

    // save password in session storage

    var b = base64_encode(password);
    sessionStorage.setItem('pp', b)
    sessionStorage.setItem('ppt', new Date());

    if (request.fulfilled) {
      setPPassword(password);
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
      pPassword,
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
    const downloadUrl = `/api/v1/get_aggregated_device_readings/${pPassword}/${deviceId}/${
      moment(dateRange[0]).format("DD-MM-YYYY HH:mm") +
      "/" +
      moment(dateRange[1]).format("DD-MM-YYYY HH:mm")
    }/`;

    form.resetFields();

    notification.info({
      message: "successful",
      description: "successful",
    });
    return (window.location.href = `${EnvData.REACT_APP_API_URL}${downloadUrl}`);
  };
  
  const onOperatingTimeSubmit = async (values) => {
    const { deviceId, dateRange, timeRange } = values;
    const downloadUrl = `/api/v1/get_timed_device_readings/${pPassword}/${deviceId}/${moment(dateRange[0]).format('DD-MM-YYYY HH:mm') + '/' + moment(dateRange[1]).format('DD-MM-YYYY HH:mm')}/${moment(timeRange[0]).format('HH') + '/' + moment(timeRange[1]).format('HH')}`;

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

  const monitoringPct30Min = calculatePostingPercentage(monitorDataState, 30);
  const monitoringPct60Min = calculatePostingPercentage(monitorDataState, 60);
  const monitoringPct24Hr = calculatePostingPercentage(monitorDataState, 24 * 60);

  return (
    <div className="download-page-container" style={{ padding: "24px" }}>
      <Spin spinning={props.auth.allDevicesfetchLoading || props.auth.fetchDeviceReadingsLoading}>
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
              <Card title="Monitoring Table" style={cardStyle}>
                <Table
                  dataSource={monitorDataState}
                  columns={monitorColumn}
                  scroll={{ x: true }}
                pagination={monitorPagination}
                onChange={handleMonitorTableChange}
                />
              </Card>
            </Col>

            <Col xs={24}>
              <Card title="All Devices Table" style={cardStyle}>
                <Table
                  dataSource={sortedDataState}
                  columns={columnData}
                scroll={{ x: true }}
                pagination={allDevicesPagination}
                onChange={handleAllDevicesTableChange}
                />
              </Card>
            </Col>
          </Row>

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
