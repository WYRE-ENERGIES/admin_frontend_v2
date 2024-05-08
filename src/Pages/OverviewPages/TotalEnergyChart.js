import { Button, Card, DatePicker, Image, Input, Space, Table, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getKeyMetricsData, getTotalEnergyBarChartData, getTotalEnergyTopCard } from "../../redux/actions/overview/overview.action";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function TotalEnergyChart(props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [paginationData, setPaginationData] = useState({})
  const [initialCalenderValue, setinitialCalenderValue] = useState({})
  const [energyChartData, setEnergyChartData] = useState({
    labels: [],
    datasets: []
  })

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const clientId = searchParams.get("client_id") || props.auth.userData.client_id;
  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  const endDate = moment().endOf("day").format("DD-MM-YYYY HH:mm");

  const showTotalEnergyBarchart = () => {
    const clientId = props.auth.userData.client_id
    props.getTotalEnergyBarChartData(clientId, startDate, endDate)
  }

  const onSelectDateTotalEnergy = (date) => {
    // const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    // const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    const date1 = date[0].format("DD-MM-YYYY HH:mm");
    const date2 = date[1].format("DD-MM-YYYY HH:mm");
    props.getTotalEnergyBarChartData(clientId, date1, date2)
  }
  // setinitialCalenderValue(onSelectDateTotalEnergy)

  useEffect(() => {
    showTotalEnergyBarchart()
  }, []);

  const fetchNextPaginatedTotalEnergy = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(paginationData.page) || 0;
    const itemsPerPage = Number(paginationData.items_per_page) || 10;
    const totalPages = Number( paginationData.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      // const paginationQuery = `&current_page=${currentPage+1}&items_per_page=${itemsPerPage}`;
      const paginationQuery = `&page=${currentPage+1}`
      props.getTotalEnergyBarChartData(clientId, startDate, endDate, paginationQuery);
    }
  };

  const fetchPrevPaginatedTotalEnergy = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(paginationData.page) || 0;
    const itemsPerPage = Number(paginationData.items_per_page) || 10;
    if (currentPage && currentPage > 1) {
      // const paginationQuery = `&current_page=${currentPage-1}&items_per_page=${itemsPerPage}`;
      const paginationQuery = `&page=${currentPage-1}`
      props.getTotalEnergyBarChartData(clientId, startDate, endDate, paginationQuery);
    }
  };

  useEffect(() => {

    if (props.overviewPage.fetchedTotalEnergyBarChart) {
      const labels = props.overviewPage.fetchedTotalEnergyBarChart.results?.map(chart => {
        return chart.name
        })
      const breakLabels = labels.map(label => label.split(' '))
      console.log('Broken-Labels>>>>>>>>>>>', breakLabels);
      const data1 = props.overviewPage.fetchedTotalEnergyBarChart?.results.map(chart => {
        return chart.utility_energy
      })

      const data2 = props.overviewPage.fetchedTotalEnergyBarChart?.results.map(chart => {
        return chart.generators_energy
      })
      setPaginationData(props.overviewPage.fetchedTotalEnergyBarChart)

      const energyDataSource = {
        labels: breakLabels,
        datasets: [
          {
            label: "Utility",
            data: data1,
            backgroundColor: "#094D92",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
          },
          {
            label: "Generator",
            data: data2,
            backgroundColor: "#43D540",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
          },
        ],
      };

      setEnergyChartData(energyDataSource)
    }

  }, [props.overviewPage]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        // align: 'start',
        display: true,
        labels: {
          usePointStyle: true,
          // boxWidth: 6,
        },
      },
      title: {
        display: true,
        text: 'kWh',
        fontWeight: 'bold',
        position: 'left'
      },
    },

    scales: {
      x: {
        ticks: {
          font: {
            weight: 'bold',
          }
        },
        stacked: true,
        grid: {
          drawOnChartArea: false,
        },
      },
      y: {
        stacked: true,
        grid: {
          drawOnChartArea: true,
        },
      },
    },
  };

  const moveLegend = [
    {
      name: 'Position: top',
      handler(chart) {
        chart.options.plugins.legend.position = 'top';
        chart.update();
      }
    },
  ]
  
  const onSearchTotalEnergy = (e) => {
    props.getTotalEnergyBarChartData(clientId, startDate, endDate, 1, e.target.value)
  }

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="##########">
        {/* {showTotalEnergyPage ? (
        ) : (
          <UtilityCostChart showUtilityCostPage={showUtilityCostPage} />
        )} */}
        <section className="total-energy-bar-chart">
          <Card
            style={{
              // width: 1070,
              // height: 650,
              borderRadius: 22,
            }}
            loading={props.overviewPage.fetchTotalEnergyBarChartLoading}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h1
                  style={{
                    fontSize: "17Px",
                  }}
                >
                  Total Energy
                  {/* {moveLegend} */}
                </h1>
              </div>
              <div>
                <Search
                  placeholder="Search by name"
                  onChange={onSearchTotalEnergy}
                  style={{
                    width: 222,
                    marginRight: 10,
                    // height: 43
                  }}
                />
                <RangePicker
                  style={{
                    width: 222,
                    // height: 43
                  }}
                  defaultValue={[
                    // dayjs("01/05/2024", dateFormat),
                    // dayjs("31/05/2024", dateFormat),
                    dayjs().startOf('month'),
                    dayjs(),
                    // moment().startOf("month"),
                    // moment().endOf("month"),
                  ]}
                  format={dateFormat}
                  onChange={onSelectDateTotalEnergy}
                />
              </div>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(TotalEnergyChart);
