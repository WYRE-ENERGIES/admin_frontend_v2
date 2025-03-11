import { Button, Card, DatePicker, Image, Input, Modal, Space, Spin, Table, Tag, Typography } from "antd";
import { MoneyCollectOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { connect, useSelector } from "react-redux";
import moment from "moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chart.js/auto'
import { Bar } from "react-chartjs-2";
import { getAllTimeEnergyConsumptionData, getAmountData, getDevicesListData, getLastmonthEnergyConsumptionData, getThisMonthEnergyConsumptionData } from "../../redux/actions/bulkMonitoring/overview/overview.action";
import { BiMoney, BiMoneyWithdraw } from "react-icons/bi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminPage(props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [holdSearchData, setHoldSearchData] = useState('')
  const [dateSearch, setDateSearch] = useState('')
  const [isSelectChart, setIsSelectChart] = useState(0)
  const [paginationData, setPaginationData] = useState({})

  const { Search } = Input;
  const handleDateSearch = (e) => setDateSearch(e.target.value)
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const clientId = searchParams.get("client_id") || props.auth.userData.client_id;
  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  // const endDate = moment().endOf("month").format("DD-MM-YYYY HH:mm");
  const endDate = moment().format("DD-MM-YYYY HH:mm");

  const onSelectTableDate = (date) => {
    const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    props.getDevicesListData(clientId, date1, date2)
  }

  const bulkOverviews = props.bMonitoringOverviewPage

  useEffect(() => {
    const client_id = clientId
    props.getAllTimeEnergyConsumptionData(client_id);
    props.getLastmonthEnergyConsumptionData(client_id);
    props.getThisMonthEnergyConsumptionData(client_id);
    props.getAmountData(client_id);
    props.getDevicesListData(client_id); 
  }, []);

  const onSearchByName = () => {
    props.getDevicesListData(clientId, 1, holdSearchData)
  }

  const suffix = (
    <SearchOutlined
      onClick={onSearchByName}
      style={{
        fontSize: 16,
        color: "white",
      }}
    />
  );

  const data = bulkOverviews?.fetchedDevicesList.results
  const checkData = props.overviewPage?.fetchedKeyMetrics?.results?.[0]
  const column = [
    {
      title: "Location",
      dataIndex: "device_name",
      key: "device_name",
      ellipsis: true,
      render: (value) => (
        <>
          {value
            ? value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Total Energy (kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Previous Month Energy (kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.last_month.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Current Month Energy (kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.this_month.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Amount (Naira)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.amount.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Utility Bill Accuracy (kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.this_month.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
  ];
  
  const handleRowClick = (record) => {
    // navigate('/detail', { state: { data: record } });
    console.log('This Row is Clicked', record);
    return (
      <a
        rel="noopener noreferrer"
        href={`/branch-detail/${record.id}/`}
      >
        View Branch
      </a>
    );
    
  };


  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="AppHeader">
        <Typography.Title className="Admin-heading">
          Admin Overview
        </Typography.Title>
        <Space className="calender-and-button">
          <RangePicker className="monitoring-calender"
            defaultValue={[dayjs().startOf("month"), dayjs()]}
            format={dateFormat}
            onChange={""}
          />
          <div>
            <Button className="download-button">
              <DownloadOutlined />
              Download Report
            </Button>
          </div>
        </Space>
      </div>
      {/* <Space > */}

      {/* </Space> */}
      <div className="##########">
        <section className="top-cards-container">
          {/* <div className="cards-layer"> */}
          {/* <div className="layer-1"> */}
            <div className="top-card">
              <div className="top-card-icon">
                <Image className="icon"
                  src="/Images/energy-consumption.png"
                />
              </div>
              <div className="top-card-content">
                <Spin
                  spinning={bulkOverviews?.fetchAllTimeEnergyConsumptionLoading}
                >
                  <header className="heading-value">
                    {bulkOverviews?.fetchedAllTimeEnergyConsumption?.total_consumption?.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    ) ?? 0}{" "}
                    <span className="heading-unit">kWh</span>
                  </header>
                </Spin>
                <header className="heading-title">Total Energy</header>
              </div>
            </div>
            <div className="top-card">
              <div className="top-card-icon">
                <Image className="icon"
                  src="/Images/energy-consumption.png"
                />
              </div>
              <div className="top-card-content">
                <Spin
                  spinning={
                    bulkOverviews?.fetchLastMonthEnergyConsumptionLoading
                  }
                >
                  <header className="heading-value">
                    {bulkOverviews?.fetchedLastMonthEnergyConsumption?.last_month_consumption?.value?.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    ) ?? 0}{" "}
                    <span className="heading-unit">kWh</span>
                  </header>
                </Spin>
                <header className="heading-title">Previous Month Energy</header>
              </div>
            </div>
            <div className="top-card">
              <div className="top-card-icon">
                <Image className="icon"
                  src="/Images/energy-consumption.png"
                />
              </div>
              <div className="top-card-content">
                <Spin
                  spinning={
                    bulkOverviews?.fetchThisMonthEnergyConsumptionLoading
                  }
                >
                  <header className="heading-value">
                    {bulkOverviews?.fetchedThisMonthEnergyConsumption?.this_month_consumption?.value?.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}{" "}
                    <span className="heading-unit">kWh</span>
                  </header>
                </Spin>
                <header className="heading-title">Current Month Energy</header>
              </div>
            </div>
          {/* </div> */}
          {/* <div className="layer-2"> */}
            <div className="top-card">
              <div className="top-card-icon">
                <Image style={{height:30, width:30}} className="amount-icon"
                  src="/Images/naira-icon.png"
                />
              </div>
              <div className="top-card-content">
                <Spin spinning={bulkOverviews?.fetchAmountLoading}>
                  <header className="heading-value">
                    {bulkOverviews?.fetchedAmount?.amount_due?.value?.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}{" "}
                    <span className="heading-unit">Naira</span>
                  </header>
                </Spin>
                <header className="heading-title">Amount</header>
              </div>
            </div>
            <div className="top-card">
              <div className="top-card-icon">
                <Image className="icon"
                  src="/Images/co2-emmission.png"
                />
              </div>
              <div className="top-card-content">
                <Spin spinning={bulkOverviews?.fetchAmountLoading}>
                  <header className="heading-value">
                    {bulkOverviews?.fetchedAmount?.amount_due?.value?.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}{" "}
                    <span className="heading-unit">tons</span>
                  </header>
                </Spin>
                <header className="heading-title">Current Month C02</header>
              </div>
            </div>
            <div className="top-card">
              <div className="top-card-icon">
                <Image className="icon"
                  src="/Images/co2-emmission.png"
                />
              </div>
              <div className="top-card-content">
                <Spin spinning={bulkOverviews?.fetchAmountLoading}>
                  <header className="heading-value">
                    {bulkOverviews?.fetchedAmount?.amount_due?.value?.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}{" "}
                    <span className="heading-unit">tons</span>
                  </header>
                </Spin>
                <header className="heading-title">Aggregated C02</header>
              </div>
            </div>
          {/* </div> */}
          {/* </div> */}
        </section>
        <section className="total-energy-bar-chart">
          <div
            style={{
              // width:1039,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "17Px",
                }}
              >
                Devices List
              </h1>
            </div>
            {/* <div>
              <Search
                placeholder="Search by name"
                enterButton={suffix}
                onChange={(e) => {
                  setHoldSearchData(e.target.value);
                }}
                allowClear
                style={{
                  width: 285.57,
                  marginRight: 15,
                }}
              />
              <RangePicker
                style={{
                  width: 224.81,
                }}
                defaultValue={[
                  dayjs().startOf("month"),
                  dayjs(),
                ]}
                format={dateFormat}
                onChange={onSelectDateKeyMetrics}
              />
            </div> */}
          </div>
          <div style={{ overflowX: "auto" }}>
            <Table
              className="custom-row-hover"
              // onRow={(record, index) => ({
              //   style: {
              //     color: record === checkData ? "#5C12A7" : "",
              //     backgroundColor: record === checkData ? "#F2F2F8" : "",
              //   },
              //   onClick: (event) => {
              //     window.location.href = `${window.location.href}branch?ee=${record.id}`;
              //   },
              //   // onMouseEnter: () => console.log('Mouse entered row:', record),
              // })}
              rowKey={(record) => record.id}
              // scroll={{ x: 'max-content' }}
              loading={bulkOverviews.fetchDevicesListLoading}
              dataSource={data}
              columns={column}
              onChange={onChange}
              pagination={false}
            ></Table>
          </div>
        </section>
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getAllTimeEnergyConsumptionData,
  getLastmonthEnergyConsumptionData,
  getThisMonthEnergyConsumptionData,
  getAmountData,
  getDevicesListData
};

const mapStateToProps = (state) => ({
  bMonitoringOverviewPage: state.bMonitoringOverviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminPage);
