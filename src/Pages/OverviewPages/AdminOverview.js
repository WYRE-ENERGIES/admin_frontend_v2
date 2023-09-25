import { Button, Card, Image, Space, Typography } from "antd";
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
// import { Bar } from 'react-chartjs';

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
  const clientId = searchParams.get("client_id") || props.auth.userData.client_id;
  const [energyChartData, setEnergyChartData] = useState({
    labels: [],
    datasets: []
  })

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
    console.log("chart details>>>>>", props.overviewPage?.fetchedTotalEnergyBarChart);

    // getRevenue().then(res => {
    //   const labels = res.carts.map(cart => {
    //     return `User-${cart.userId}`
    //   })
    //   const data = res.carts.map(cart => {
    //     return cart.discountedTotal
    //   })

    //   const dataSource = {
    //     labels,
    //     datasets: [
    //       {
    //         label: "Revenue",
    //         data: data,
    //         backgroundColor: "rgba(255, 99, 132, 0.5)",
    //       },  
    //     ],
    //   };

    //   setRevenueData(dataSource)
    // })

    const labels = props.overviewPage?.fetchedTotalEnergyBarChart.map(chart => {
      // return chart.utility_energy
      return chart.generators_energy
    })
    const data = props.overviewPage?.fetchedTotalEnergyBarChart.map(chart => {
      // return chart.generators_energy
      return chart.utility_energy
    })

    const dataSource = {
      labels,
      datasets: [
        {
          label: "Total Energy BarChart",
          data: data,
          backgroundColor: "#43D540",
        },  
      ],
    };

    setEnergyChartData(dataSource)
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Total Energy',
      },
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
                    )} kWh
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
                    )} tons
                  </header>
                  <header>Co2 Emission</header>
                </div>
              </Space>
            </div>
          </Space>
        </section>

        <section className="total-energy-bar-chart">
          <Card style={{ width: 1000, height: 500 }}>
            <Bar options={options} data={energyChartData} />
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
