import { Button, Card, DatePicker, Image, Input, Space, Table, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getClientUtilityCostData } from "../../redux/actions/overview/overview.action";
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
import Search from "antd/es/input/Search";
import TotalEnergyChart from "./TotalEnergyChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function UtilityCostChart(props, showUtilityCostPage, setShowUtilityCostPage) {
  const [dateSearch, setDateSearch] = useState('')
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  })
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'YYYY';
  const { RangePicker } = DatePicker;

  const showEnergyCostBarchart = () => {
    const clientId = props.auth.userData.client_id
    props.getClientUtilityCostData(clientId);
  }

  const onDateChange = (date) => {
    const clientId = props.auth.userData.client_id
    const year = new Date(date).getFullYear();
    props.getClientUtilityCostData(clientId, year)
  }
  
  useEffect(() => {
    showEnergyCostBarchart()
  }, []);
  
  const costReducerStates = props.overviewPage.fetchedTotalCostBarChart
  console.log("Cosst-Reducers=========", costReducerStates);
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
      const historicalAverage = costReducerStates.map((reducer) => {
        return reducer.historic_average;
      });

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "PHCN Cost",
            data: clientCost,
            backgroundColor: "#094D92",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
          },
          {
            label: "Wyre Cost",
            data: wyreCost,
            backgroundColor: "#F9CF40",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
          },
          {
            label: "Historic Average",
            data: historicalAverage,
            backgroundColor: "#EF0000",
            type: "line",
            borderColor: "#EF0000",
            borderWidth: 1,
            fill: false,
            // xAxisID: "axis-bar",
          },
        ],
      };
      setCostChartData(costDataSource);
      console.log("Date Value ===== ", dateSearch);
    }
  }, [costReducerStates]);

  const options2 = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        display: true,
        labels: {
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Amount(Naira)",
        fontWeight: "bold",
        position: "left",
      },
    },

    scales: {
      x: {
        ticks: {
          font: {
            weight: "bold",
          },
        },
        title: {
          display: true,
          text: "Period(Month)",
          fontWeight: "bold",
          position: "left",
        },
        stacked: false,
        grid: {
          drawOnChartArea: false,
        },
      },
      y: {
        stacked: false,
        grid: {
          drawOnChartArea: true,
        },
      },
    },
  };

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="##########">
        {/* {showUtilityCostPage ? (
        ) : (
          setShowUtilityCostPage(false)
      )} */}
          <section className="total-energy-bar-chart">
            <Card
              style={{
                borderRadius: 22,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h1
                    style={{
                      fontSize: "17Px",
                    }}
                  >
                    Utility Cost
                  </h1>
                </div>
                <div>
                  <DatePicker
                    defaultValue={
                      dayjs("2024", dateFormat)
                    }
                    format={dateFormat}
                    picker="year"
                    style={{ width: 107.65, height: 44 }}
                    onChange={onDateChange}
                  />
                </div>
              </div>
              <Bar options={options2} data={costChartData} />
            </Card>
          </section>
        
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getClientUtilityCostData
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(UtilityCostChart);
