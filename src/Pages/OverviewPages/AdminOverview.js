import { Button, Card, DatePicker, Image, Input, Space, Table, Tag, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined, ContainerOutlined, ExpandAltOutlined, FundOutlined, DeleteOutlined, EllipsisOutlined, ProjectOutlined, FundProjectionScreenOutlined, BarsOutlined, ThunderboltOutlined  } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getKeyMetricsData, getTotalCostBarChartData, getTotalEnergyBarChartData, getTotalEnergyTopCard } from "../../redux/actions/overview/overview.action";
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
import Pagination from "../../components/Pagination";
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";
import UtilityCostChart from "./UtilityCostChart";
import TotalEnergyChart from "./TotalEnergyChart";
import UtilityEnergyChart from "./UtilityEnergyChart";
import DieselCostChart from "./DieselCostChart";
import DieselLitreChart from "./DieselLitreChart";
import ChartGroupButtons from "./ChartGroupButtons";
import { BsFillBucketFill, BsProjectorFill, BsThunderboltFill } from "react-icons/bs";
import { PiProjectorScreen } from "react-icons/pi";
import { CiMoneyBill } from "react-icons/ci";
import { BiMoney } from "react-icons/bi";

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
  const [dateSearch, setDateSearch] = useState('')
  const [showTotalEnergyPage, setShowTotalEnergyPage] = useState(true)
  const [showUtilityCostPage, setShowUtilityCostPage] = useState(false)
  const [showUtilityEnergyPage, setShowUtilityEnergyPage] = useState(false)
  const [showDieselCostPage, setShowDieselCostPage] = useState(false)
  const [showDieselLitrePage, setShowDieselLitrePage] = useState(false)
  const [isSelectChart, setIsSelectChart] = useState(0)
  const [paginationData, setPaginationData] = useState({})

  const { Search } = Input;
  const handleDateSearch = (e) => setDateSearch(e.target.value)
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const clientId = searchParams.get("client_id") || props.auth.userData.client_id;
  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  const endDate = moment().endOf("month").format("DD-MM-YYYY HH:mm");

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

  const onSearchKeyMetrics = (e) => {
    props.getKeyMetricsData(clientId, startDate, endDate, 1, e.target.value)
    console.log("onSearch clicked->>>>>>>>>>>", e.target.value );
  }
  
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

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="AppHeader">
        <Typography.Title style={{ fontSize: "30px", fontWeight: "bold" }}>
          Admin Overview
        </Typography.Title>
        <Space>
          <div>
            <Button
              style={{
                width: "227.5px",
                height: "42.32px",
                fontWeight: "bold",
                fontSize: "15px",
                borderRadius: "11px",
              }}
            >
              <DownloadOutlined />
              Download Report
            </Button>
          </div>
          <div>
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
          </div>
        </Space>
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
                  <header style={{ fontWeight: "bold" }}>
                    {props.overviewPage?.fetchedTotalEnergyTopCard.total_energy?.toFixed(
                      2
                    )}{" "}
                    kWh
                  </header>
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
                  <header style={{ fontWeight: "bold" }}>
                    {props.overviewPage?.fetchedTotalEnergyTopCard.co2_emmission?.toFixed(
                      2
                    )}{" "}
                    tons
                  </header>
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
            className=""
            style={{
              // backgroundColor: "#F2F2F8",
              width: "100%",
            }}
          >
            <ChartGroupButtons buttons={buttons} isSelectChart={isSelectChart} setIsSelectChart={setIsSelectChart} />
          </div>
        </section>
        <RendeChartsComponents index={isSelectChart} />
        <section className="total-energy-bar-chart">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h1
                style={{
                  fontSize: "17Px",
                }}
              >
                Key Metrics
              </h1>
            </div>
            <div>
              <Search
                placeholder="Search by name"
                onChange={onSearchKeyMetrics}
                style={{
                  width: 285.57,
                  marginRight: 15,
                  // height: 43
                }}
              />
              <RangePicker
                style={{
                  width: 224.81,
                  // height: 43
                }}
                defaultValue={[
                  dayjs("01/04/2024", dateFormat),
                  dayjs("30/04/2024", dateFormat),
                ]}
                format={dateFormat}
                onChange={onSelectDateKeyMetrics}
              />
            </div>
          </div>
          <Table
            className="custom-row-hover"
            onRow={(record, index) => ({
              style: {
                color: record === checkData ? "#5C12A7" : "",
                backgroundColor: record === checkData ? "#F2F2F8" : "",
              },
            })}
            loading={props.overviewPage.fetchKeyMetricsLoading}
            dataSource={data}
            // columns={columns}
            onChange={onChange}
            pagination={false}
          >
            <Column 
              title="Branch Name" 
              dataIndex="name" 
              key="name" 
              width= "200px"
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
            <Column title="Baseline Energy (kWh)" dataIndex="baseline_energy" key="baseline_energy" />
            <Column title="Blended Cost of Energy" dataIndex="blended_cost_of_energy" key="blended_cost_of_energy" />
            <Column title="Usage Accuracy Diesel" dataIndex="diesel_usage_accuracy" key="diesel_usage_accuracy" />
            <Column title="Usage Accuracy Utility" dataIndex="utility_usage_accuracy" key="utility_usage_accuracy" />
            <Column title="Deviation Hours" dataIndex="deviation_hours" key="deviation_hours" />
            <Column title="PAPR" dataIndex="papr" key="papr" />
            <Column title="Fuel Efficiency" dataIndex="fuel_efficiency" key="fuel_efficiency" />
            <ColumnGroup title="Generator Efficiency">
            <Column
              // title="Gen1"
              dataIndex="generator_size_efficiency_1"
              key="generator_size_efficiency_1"
            />
            <Column
              // title="Gen2"
              dataIndex="generator_size_efficiency_2"
              key="generator_size_efficiency_2"
            />
            <Column
              // title="Gen3"
              dataIndex="generator_size_efficiency_3"
              key="generator_size_efficiency_3"
            />
          </ColumnGroup>
          </Table>
          <div className="pagination">
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
