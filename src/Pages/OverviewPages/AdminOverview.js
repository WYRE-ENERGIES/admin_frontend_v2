import { Button, DatePicker, Image, Input, Space, Spin, Table, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, ExpandAltOutlined, FundOutlined, DeleteOutlined, ThunderboltOutlined  } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getKeyMetricsData, getTotalEnergyBarChartData, getTotalEnergyTopCard } from "../../redux/actions/overview/overview.action";
import { useSearchParams } from "react-router-dom";
import { connect } from "react-redux";
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
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";
import UtilityCostChart from "./UtilityCostChart";
import TotalEnergyChart from "./TotalEnergyChart";
import UtilityEnergyChart from "./UtilityEnergyChart";
import DieselCostChart from "./DieselCostChart";
import DieselLitreChart from "./DieselLitreChart";
import ChartGroupButtons from "./ChartGroupButtons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const buttons = [
  {
    label: "Total Energy",
    // key: "/",
    icon: <ThunderboltOutlined />,
  },
  {
    label: "Utility Cost",
    // key: "/",
    icon: <FundOutlined />,
  },
  {
    label: "Utility Energy",
    // key: "/",
    icon: <ExpandAltOutlined />,
  },
  {
    label: "Diesel Cost",
    // key: "/",
    icon: <FundOutlined />,
  },
  {
    label: "Diesel Liters",
    // key: "/",
    icon: <DeleteOutlined />,
  },
]

const RendeChartsComponents = ({index}) => {
  switch (index) {
    case 0: return <TotalEnergyChart />
     break;
    case 1: return <UtilityCostChart /> 
     break;
    case 2: return <UtilityEnergyChart /> 
     break;
    case 3: return <DieselCostChart /> 
     break;
    case 4: return <DieselLitreChart /> 
     break;
    default:
      break;
  }
}

function AdminOverview(props) {
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

  const showKeyMetricsTable = () => {
    const clientId = props.auth.userData.client_id
    props.getKeyMetricsData(clientId, startDate, endDate);
  }

  const onSelectDateKeyMetrics = (date) => {
    const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    props.getKeyMetricsData(clientId, date1, date2)
  }

  useEffect(() => {
    const client_id = clientId
    props.getTotalEnergyTopCard(client_id, startDate, endDate);
  }, []);

  useEffect(() => {
    showKeyMetricsTable()
  }, [])

  const onSearchKeyMetrics = () => {
    props.getKeyMetricsData(clientId, startDate, endDate, 1, holdSearchData)
  }

  const suffix = (
    <SearchOutlined
      onClick={onSearchKeyMetrics}
      style={{
        fontSize: 16,
        color: "white",
      }}
    />
  );

  const data = props.overviewPage.fetchedKeyMetrics.results
  const checkData = props.overviewPage?.fetchedKeyMetrics?.results?.[0]

  const keyMetricsPaginate = props.overviewPage.fetchedKeyMetrics
  const fetchNextPaginatedKeyMetric = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(keyMetricsPaginate.page) || 0;
    const itemsPerPage = Number(keyMetricsPaginate.count) || 10;
    const totalPages = Number( keyMetricsPaginate.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&page=${currentPage+1}`;
      props.getKeyMetricsData(clientId, startDate, endDate, paginationQuery);
    }
  };

  const fetchPrevPaginatedKeyMetric = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(keyMetricsPaginate.page) || 0;
    const itemsPerPage = Number(keyMetricsPaginate.count) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&page=${currentPage-1}`;
      props.getKeyMetricsData(clientId, startDate, endDate, paginationQuery);
    }
  };
  
  const columns = [
    {
      title: "Branch Name",
      dataIndex: "name",
      width: "200px",
      render: (text) => {
        return (
          <span
            style={{
              fontWeight: 'bold',
            }}
          >
            {text}
          </span>
        )
      },
      key: "name",
      sorter: (a, b) => a.name.length - b.name.length,
      // sortDirections: ["descend"],
    },
    {
      title: "Baseline Energy (kWh)",
      dataIndex: "baseline_energy",
      key: "baseline_energy",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.baseline_energy - b.baseline_energy,
    },
    {
      title: "Blended Cost of Energy",
      dataIndex: "blended_cost_of_energy",
      key: "blended_cost_of_energy",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.blended_cost_of_energy - b.blended_cost_of_energy,
    },
    {
      title: "Usage Accuracy Diesel",
      dataIndex: "diesel_usage_accuracy",
      key: "diesel_usage_accuracy",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.diesel_usage_accuracy - b.diesel_usage_accuracy,
    },
    {
      title: "Usage Accuracy Utility",
      dataIndex: "utility_usage_accuracy",
      key: "utility_usage_accuracy",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.utility_usage_accuracy - b.utility_usage_accuracy,
    },
    {
      title: "Deviation Hours",
      dataIndex: "deviation_hours",
      key: "deviation_hours",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.deviation_hours - b.deviation_hours,
    },
    {
      title: "PAPR",
      dataIndex: "papr",
      key: "papr",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.papr - b.papr,
    },
    {
      title: "Fuel Efficiency",
      dataIndex: "fuel_efficiency",
      key: "fuel_efficiency",
      // defaultSortOrder: "descend",
      sorter: (a, b) => a.fuel_efficiency - b.fuel_efficiency,
    },
    {
      title: "Generator Efficiency",
      dataIndex: "generator_size_efficiency_1",
      key: "generator_size_efficiency_1",
      // defaultSortOrder: "descend",
      // sorter: (a, b) => a.generator_size_efficiency_1 - b.generator_size_efficiency_1,
    },
    {
      title: "Generator Efficiency",
      dataIndex: "generator_size_efficiency_2",
      key: "generator_size_efficiency_2",
      // defaultSortOrder: "descend",
      // sorter: (a, b) => a.generator_size_efficiency_2 - b.generator_size_efficiency_2,
    },
    {
      title: "Generator Efficiency",
      dataIndex: "generator_size_efficiency_3",
      key: "generator_size_efficiency_3",
      // defaultSortOrder: "descend",
      // sorter: (a, b) => a.generator_size_efficiency_3 - b.generator_size_efficiency_3,
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
      <div className="AppHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 className="mobile-title">
          Admin Overview
        </h4>
          <div>
            <Button
              className="mobile-button"
            >
              <DownloadOutlined />
              Download Report
            </Button>
          </div>
          {/* <div>
            <Button
              style={{
                backgroundColor: "#5C12A7",
                color: "white",
                width: "167.78px",
                height: "42.32px",
                fontSize: "15px",
                borderRadius: "11px",
                fontWeight: "bold",
              }}
            >
              <PlusOutlined />
              Add User
            </Button>
          </div> */}
      </div>
      <div className="##########">
        <section className="co2 & total-energy-card">
          <Space>
            <div className="top-card-1">
              <Space>
                <div className="card-content">
                  <Image
                    style={{ marginLeft: "0px" }}
                    src="/Images/energy-consumption.png"
                  />
                </div>
                <div className="card-content">
                  <Spin
                    spinning={
                      props.overviewPage?.fetchTotalEnergyTopCardLoading
                    }
                  >
                    <header style={{ fontWeight: "bold" }}>
                      {props.overviewPage?.fetchedTotalEnergyTopCard.total_energy?.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      kWh
                    </header>
                  </Spin>
                  <header>Total Energy</header>
                </div>
              </Space>
            </div>
            <div className="top-card-2">
              <Space>
                <div className="card-content">
                  <Image
                    style={{ marginLeft: "0px" }}
                    src="/Images/co2-emmission.png"
                  />
                </div>
                <div className="card-content">
                  <Spin
                    spinning={
                      props.overviewPage?.fetchTotalEnergyTopCardLoading
                    }
                  >
                    <header style={{ fontWeight: "bold" }}>
                      {props.overviewPage?.fetchedTotalEnergyTopCard.co2_emmission?.toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      tons
                    </header>
                  </Spin>
                  <header>Co2 Emission</header>
                </div>
              </Space>
            </div>
          </Space>
        </section>
        <section className="total-energy-bar-chart">
          <Typography.Title style={{ fontSize: "20px" }}>
            Chart Metrics
          </Typography.Title>
          <div
            className="chart_buttons_container"
            style={{
              // backgroundColor: "#F2F2F8",
              width: "100%",
            }}
          >
            <ChartGroupButtons
              buttons={buttons}
              isSelectChart={isSelectChart}
              setIsSelectChart={setIsSelectChart}
            />
          </div>
        </section>
        <RendeChartsComponents index={isSelectChart} />
        <section className="total-energy-bar-chart">
          <div
            style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}
          >
            <div>
              <h1
                style={{
                  fontSize: "17Px",
                }}
              >
                Key Metrics
              </h1>
            </div>
            <div className="search-bar-date-picker">
              <Search
                placeholder="Search by name"
                enterButton={suffix}
                className="search-bar"
                onChange={(e) => {
                  setHoldSearchData(e.target.value);
                }}
                allowClear
                style={{
                  marginRight: 15,
                  // height: 43.5
                }}
              />
              <RangePicker
                className="picker-date"
                style={{
                  // height: 43.5
                }}
                defaultValue={[
                  // dayjs("01/04/2024", dateFormat),
                  // dayjs("30/04/2024", dateFormat),
                  dayjs().startOf("month"),
                  dayjs(),
                ]}
                format={dateFormat}
                onChange={onSelectDateKeyMetrics}
              />
            </div>
          </div>
          <div style={{overflowX: 'auto'}}>
            <Table
              className="custom-row-hover"
              onRow={(record, index) => ({
                style: {
                  color: record === checkData ? "#5C12A7" : "",
                  backgroundColor: record === checkData ? "#F2F2F8" : "",
                },
                // onClick: () => handleRowClick(record)
                onClick: (event) => {
                  window.location.href = `${window.location.href}branch?ee=${record.id}`;
                },
                // onMouseEnter: () => console.log('Mouse entered row:', record),
              })}
              // rowKey="id"
              rowKey={(record) => record.id}
              // scroll={{ x: 'max-content' }}
              loading={props.overviewPage.fetchKeyMetricsLoading}
              dataSource={data}
              onChange={onChange}
              pagination={false}
            >
              <Column
                title="Branch Name"
                dataIndex="name"
                key="name"
                width="120px"
                ellipsis={true}
                // render= {
                //   (text) => {
                //     return (
                //       <span
                //         style={{
                //           fontWeight: 'bold',
                //         }}
                //       >
                //         {text}
                //       </span>
                //     )
                //   },
                // }
              />
              <Column
                width={90}
                title="Baseline Energy (kWh)"
                dataIndex="baseline_energy_used"
                key="baseline_energy_used"
                ellipsis={true}
                render={(value) => (
                  <>
                    {value
                      ? value.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                      : 0}
                  </>
                )}
              />
              <Column
                width={90}
                title="Blended Cost of Energy"
                dataIndex="blended_cost_of_energy"
                key="blended_cost_of_energy"
                ellipsis={true}
                render={(value) => (
                  <>
                    {value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </>
                )}
              />
              <Column
                width={90}
                title="Usage Accuracy Diesel"
                dataIndex="diesel_usage_accuracy"
                key="diesel_usage_accuracy"
                ellipsis={true}
                render={(value) => (
                  <>
                    {value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </>
                )}
              />
              <Column
                width={90}
                title="Usage Accuracy Utility"
                dataIndex="utility_usage_accuracy"
                key="utility_usage_accuracy"
                ellipsis={true}
                render={(value) => (
                  <>
                    {value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </>
                )}
              />
              <Column
                width={100}
                title="Deviation Hours"
                dataIndex="deviation_hours"
                key="deviation_hours"
                ellipsis={true}
              />
              <Column
                width={70}
                title="PAPR"
                dataIndex="papr"
                key="papr"
                ellipsis={true}
              />
              <Column
                width={100}
                title="Fuel Efficiency"
                dataIndex="fuel_efficiency"
                key="fuel_efficiency"
                ellipsis={true}
                render={(value) => (
                  <>
                    {value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </>
                )}
              />
              <ColumnGroup
                width="100px"
                ellipsis={true}
                title="Generator Efficiency"
              >
                <Column
                  width={70}
                  // title="Gen1"
                  dataIndex="generator_size_efficiency_1"
                  key="generator_size_efficiency_1"
                  ellipsis={true}
                />
                <Column
                  width={70}
                  // title="Gen2"
                  dataIndex="generator_size_efficiency_2"
                  key="generator_size_efficiency_2"
                  ellipsis={true}
                />
                <Column
                  width={70}
                  // title="Gen3"
                  dataIndex="generator_size_efficiency_3"
                  key="generator_size_efficiency_3"
                  ellipsis={true}
                />
              </ColumnGroup>
            </Table>
          </div>
          <div className="keymetric_pagination">
            <div>
              <Button onClick={fetchPrevPaginatedKeyMetric}>Previous</Button>
            </div>
            <div>
              <Button onClick={fetchNextPaginatedKeyMetric}>Next</Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getTotalEnergyTopCard,
  getTotalEnergyBarChartData,
  getKeyMetricsData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminOverview);
