import { Button, Card, DatePicker, Image, Input, Space, Table, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function AdminOverview(props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [dateSearch, setDateSearch] = useState('')
  const [paginationData, setPaginationData] = useState({})
  const [energyChartData, setEnergyChartData] = useState({
    labels: [],
    datasets: []
  })
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  })

  const { Search } = Input;
  const handleDateSearch = (e) => setDateSearch(e.target.value)
  const onSearch = (value, _e, info) => console.log(info?.source, value);
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const clientId = searchParams.get("client_id") || props.auth.userData.client_id;
  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  const endDate = moment().endOf("month").format("DD-MM-YYYY HH:mm");

  const showTotalEnergyBarchart = () => {
    const clientId = props.auth.userData.client_id
    props.getTotalEnergyBarChartData(startDate, endDate, clientId)
  }
  const showEnergyCostBarchart = () => {
    const clientId = props.auth.userData.client_id
    props.getTotalCostBarChartData(clientId);
  }
  const showKeyMetricsTable = () => {
    const clientId = props.auth.userData.client_id
    props.getKeyMetricsData(clientId);
  }

  const hanleSelectDate = (date) => {
    const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    props.getTotalEnergyBarChartData(date1, date2, clientId)
    console.log("Date-string>>>>>", date1, date2);
  }

  useEffect(() => {
    const client_id = clientId
    props.getTotalEnergyTopCard(client_id, startDate, endDate);
  }, []);
  
  useEffect(() => {
    showEnergyCostBarchart()
    console.log('Reducers in Total-Cost-Data', props.overviewPage.fetchedTotalCostBarChart)
  }, []);

  useEffect(() => {
    showTotalEnergyBarchart()
  }, []);

  useEffect(() => {
    showKeyMetricsTable()
    console.log('Reducer for table data == ', props.overviewPage.fetchedKeyMetrics.results);
  }, [])

  const fetchNextPaginatedTotalEnergy = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(paginationData.current_page) || 0;
    const itemsPerPage = Number(paginationData.items_per_page) || 10;
    const totalPages = Number( paginationData.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&current_page=${currentPage+1}&items_per_page=${itemsPerPage}`;
      props.getTotalEnergyBarChartData(startDate, endDate, clientId, paginationQuery);
    }
  };

  const fetchPrevPaginatedTotalEnergy = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(paginationData.current_page) || 0;
    const itemsPerPage = Number(paginationData.items_per_page) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&current_page=${currentPage-1}&items_per_page=${itemsPerPage}`;
      props.getTotalEnergyBarChartData(startDate, endDate, clientId, paginationQuery);
    }
  };

  useEffect(() => {

    if (props.overviewPage.fetchedTotalEnergyBarChart) {
      console.log('this is props over view', props.overviewPage)
      const labels = props.overviewPage.fetchedTotalEnergyBarChart.chart?.map(chart => {
        return chart.name
      })
      const data1 = props.overviewPage.fetchedTotalEnergyBarChart?.chart.map(chart => {
        return chart.utility_energy
      })

      const data2 = props.overviewPage.fetchedTotalEnergyBarChart?.chart.map(chart => {
        return chart.generators_energy
      })
      setPaginationData(props.overviewPage.fetchedTotalEnergyBarChart.pagination)

      const energyDataSource = {
        labels,
        datasets: [
          {
            label: "Utility Energy",
            data: data1,
            backgroundColor: "#43D540",
          },
          {
            label: "Generator Energy",
            data: data2,
            backgroundColor: "#094D92",
          },
        ],
      };

      setEnergyChartData(energyDataSource)
    }

  }, [props.overviewPage]);
  
  const costReducerStates = props.overviewPage.fetchedTotalCostBarChart
  useEffect(() => {
    if (costReducerStates) {
      const labels = costReducerStates.map((reducer) => {
        return reducer.month;
      });
      const clientCost = costReducerStates.map((reducer) => {
        return reducer.client_cost;
      });
      const wyreCost = costReducerStates.map((reducer) => {
        return reducer.wyre_cost;
      });
      const costDiffernce = costReducerStates.map((reducer) => {
        return reducer.cost_difference;
      });

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "Client Cost",
            data: clientCost,
            backgroundColor: "#43D540",
            type: "line",
            borderColor: "#0000FF",
            borderWidth: 1,
            fill: false,
            // xAxisID: "axis-bar",
          },
          {
            label: "Wyre Cost",
            data: wyreCost,
            backgroundColor: "#F9CF40",
          },
        ],
      };
      setCostChartData(costDataSource);
      console.log("Date Value ===== ", dateSearch);
    }
  }, [costReducerStates]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      // title: {
      //   display: true,
      //   text: 'Total Energy',
      // },
    },

    scales: {
      x: {
        stacked: true,
        // barPercentage: 0.4,
        grid: {
          drawOnChartArea: false
        }
      },
      y: {
        stacked: true,
        grid: {
          drawOnChartArea: false
        }
      }
    },


  };

  const options2 = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      // title: {
      //   display: true,
      //   text: 'History',
      // },
    },

    scales: {
      // xAxis: [
      //   {
      //     type: "category",
      //     id: "axis-bar",
      //   },
      
      //   // {
      //   //   type: "time",
      //   //   id: "axis-time",
      //   //   display: true,
      //   // },
      // ],
      y: {
        grid: {
          drawOnChartArea: false
        }
      },
      x: {
        grid: {
          drawOnChartArea: false
        }
      }
    },
  };

  const data = props.overviewPage.fetchedKeyMetrics.results

  const keyMetricsPaginate = props.overviewPage.fetchedKeyMetrics
  const fetchNextPaginatedKeyMetric = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(keyMetricsPaginate.page) || 0;
    const itemsPerPage = Number(keyMetricsPaginate.count) || 10;
    const totalPages = Number( keyMetricsPaginate.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&page=${currentPage+1}`;
      props.getKeyMetricsData(clientId, paginationQuery);
    }
  };

  const fetchPrevPaginatedKeyMetric = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(keyMetricsPaginate.page) || 0;
    const itemsPerPage = Number(keyMetricsPaginate.count) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&page=${currentPage-1}`;
      props.getKeyMetricsData(clientId, paginationQuery);
    }
  };
  
  const columns = [
    {
      title: "Branch Name",
      dataIndex: "name",
      key: "name",
      filters: [
        {
          text: 'Ad',
          value: 'Ad',
        },
        {
          text: 'Polaris',
          value: 'Polaris',
        },
      ],
      onFilter: (value, record) => record.name.indexOf(value) === 0,
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ["descend"],
    },
    {
      title: "Baseline Energy (kWh)",
      dataIndex: "baseline_energy",
      key: "baseline_energy",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: "Blended Cost of Energy",
      dataIndex: "blended_cost_of_energy",
      key: "blended_cost_of_energy",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: "Usage Accuracy Diesel",
      dataIndex: "diesel_usage_accuracy",
      key: "diesel_usage_accuracy",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: "Usage Accuracy Utility",
      dataIndex: "utility_usage_accuracy",
      key: "utility_usage_accuracy",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: "Deviation Hours",
      dataIndex: "deviation_hours",
      key: "deviation_hours",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: "PAPR",
      dataIndex: "papr",
      key: "papr",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: "Fuel Efficiency",
      dataIndex: "fuel_efficiency",
      key: "fuel_efficiency",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: "Generator Efficiency",
      dataIndex: "generator_efficiency",
      key: "generator_efficiency",
      defaultSortOrder: "descend",
      sorter: (a, b) => a.age - b.age,
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="AppHeader">
        <Typography.Title>Admin Overview</Typography.Title>
        <Space>
          <div>
            <Button>
              <DownloadOutlined />
              Download Report
            </Button>
          </div>
          <div>
            <Button style={{ backgroundColor: "#5C12A7", color: "white" }}>
              <PlusOutlined />
              Add User
            </Button>
          </div>
        </Space>
      </div>
      <div className="##########">
        <section className="co2 & total-energy-card">
          <Space>
            <div className="top-card">
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
            <div className="top-card">
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
          <Card
            style={{
              // width: 1070,
              // height: 650,
              borderRadius: 22,
            }}
          >
            <Space>
              <h1
                style={{marginRight: '500px', marginLeft: '10px', fontSize: '17Px'}}
              >Total Energy</h1>
              <Search
                placeholder="Search by name"
                onSearch={onSearch}
                style={{
                  width: 170,
                }}
              />
              <RangePicker
                style={{width:210}}
                defaultValue={[
                  dayjs("01/01/2024", dateFormat),
                  dayjs("31/01/2024", dateFormat),
                ]}
                format={dateFormat}
                onChange={hanleSelectDate}
              />
            </Space>
            <Bar options={options} data={energyChartData} />
            {/* <Pagination
              totalPosts = {chartPages.lenght} 
              postsPerPage = {postsPerPage}
              setCurrentPage={setCurrentPage}
            /> */}

            {/* <ReactPaginate 
              previousLabel={'Previous'}
              nextLabel={'Next'}
              pageCount={pageCount}
              onPageChange={handlePageChange}
              containerClassName={"paginationBttns"}
              previousLinkClassName={"previousBttn"}
              nextLinkClassName={"nextBtnn"}
              disabledClassName="paginationDisable"
              activeClassName={"paginationActive"}
            /> */}
            {/* <button onClick={fetchNextPaginatedTotalEnergy} >Next</button>
            <button onClick={fetchPrevPaginatedTotalEnergy}>Previous</button> */}
            <div className="pagination">
              <div>
                <Button onClick={fetchPrevPaginatedTotalEnergy}>
                  Previous
                </Button>
              </div>
              <div>
                <Button onClick={fetchNextPaginatedTotalEnergy}>Next</Button>
              </div>
            </div>
          </Card>
        </section>
        <section className="total-energy-bar-chart">
          <Card
            style={{
              borderRadius: 22,
            }}
          >
            <Space>
              <h1
                style={{marginRight: '570px', fontSize: '17Px'}}
              >History</h1>
              <Search
                placeholder="Search by name"
                onSearch={onSearch}
                style={{
                  width: 170,
                }}
              />
              <RangePicker
                style={{width:210}}
                defaultValue={[
                  dayjs("01/01/2024", dateFormat),
                  dayjs("31/01/2024", dateFormat),
                ]}
                format={dateFormat}
              />
            </Space>
            <Bar options={options2} data={costChartData} />
          </Card>
        </section>
        <section className="total-energy-bar-chart">
            <Space>
              <h1
                style={{marginRight: '500px', marginLeft: '10px', fontSize: '17Px'}}
              >Key Metrics</h1>
              <Search
                placeholder="Search by name"
                onSearch={onSearch}
                style={{
                  width: 170,
                }}
              />
              <RangePicker
                style={{width:210}}
                defaultValue={[
                  dayjs("01/01/2024", dateFormat),
                  dayjs("31/01/2024", dateFormat),
                ]}
                format={dateFormat}
              />
            </Space>
            <Table
              loading={props.overviewPage.fetchKeyMetricsLoading}
              dataSource={data} 
              columns={columns} 
              onChange={onChange}
              pagination={false}
            />
            <div className="pagination">
              <div>
                <Button onClick={fetchPrevPaginatedKeyMetric}>
                  Previous
                </Button>
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
  getTotalCostBarChartData,
  getKeyMetricsData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminOverview);
