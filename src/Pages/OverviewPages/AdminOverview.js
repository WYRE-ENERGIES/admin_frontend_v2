import { Button, Card, DatePicker, Image, Input, Space, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getTotalEnergyBarChartData, getTotalEnergyTopCard } from "../../redux/actions/overview/overview.action";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [paginationData, setPaginationData] = useState({})
  const [energyChartData, setEnergyChartData] = useState({
    labels: [],
    datasets: []
  })

  const { Search } = Input;
  const onSearch = (value, _e, info) => console.log(info?.source, value);
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'YYYY/MM/DD';
  const { RangePicker } = DatePicker;

  const clientId = searchParams.get("client_id") || props.auth.userData.client_id;
  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  const endDate = moment().endOf("month").format("DD-MM-YYYY HH:mm");

  const showTotalEnergyBarchart = () => {
    const clientId = props.auth.userData.client_id
    props.getTotalEnergyBarChartData(startDate, endDate, clientId)
  }

  useEffect(() => {
    const client_id = clientId
    props.getTotalEnergyTopCard(client_id, startDate, endDate);
  }, []);

  useEffect(() => {
    showTotalEnergyBarchart()

  }, []);

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

      const dataSource = {
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

      setEnergyChartData(dataSource)
    }

  }, [props.overviewPage]);

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
        stacked: true
      },
      y: {
        stacked: true
      }
    },


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
                style={{marginRight: '570px', fontSize: '17Px'}}
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
                  dayjs("2023/10/01", dateFormat),
                  dayjs("2023/10/13", dateFormat),
                ]}
                format={dateFormat}
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
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getTotalEnergyTopCard,
  getTotalEnergyBarChartData
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminOverview);
