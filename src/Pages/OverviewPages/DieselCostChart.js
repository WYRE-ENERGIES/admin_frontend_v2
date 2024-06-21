import { Button, Card, DatePicker, Image, Input, Space, Table, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getClientDieselCostData } from "../../redux/actions/overview/overview.action";
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


function DieselCostChart(props, showUtilityCostPage, setShowUtilityCostPage) {
  const [dateSearch, setDateSearch] = useState('')
  const [selectedDate, setSelectedDate] = useState()
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  })
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'YYYY';
  const { RangePicker } = DatePicker;
  const yearPicker = new Date().getFullYear();

  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  const endDate = moment().endOf("month").format("DD-MM-YYYY HH:mm");

  const showDieselCostBarchart = () => {
    const clientId = props.auth.userData.client_id
    const year = new Date().getFullYear();
    props.getClientDieselCostData(clientId, year);
  }
  
  useEffect(() => {
    showDieselCostBarchart()
  }, []);
  
  const utilityEnergyReducerStates = props.overviewPage.fetchedDieselCostBarChart
  const reducerStates = props.overviewPage
  console.log('Reducer states->>>>>>>>>>>>', reducerStates);
  console.log('Diesel-Cost>>>>>>>>>>>>', utilityEnergyReducerStates);
  useEffect(() => {
    if (utilityEnergyReducerStates) {
      const labels = utilityEnergyReducerStates.cost_overview.map((reducer) => {
        return reducer.month;
      });
      const averageCost = utilityEnergyReducerStates.average_diesel_purchase
      console.log('AVERAGE Cost = ', averageCost);
      const dieselCost = utilityEnergyReducerStates.cost_overview.map((reducer) => {
        return reducer.diesel_cost;
      });

      const averagecostLine = Array.from({ length: 12 }, (_, i) => averageCost)

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "Diesel Purchase Currently",
            data: dieselCost,
            fontWeight: "bold",
            backgroundColor: "#5C12A7",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
          },
          {
            label: "Average diesel purchase last year",
            data: averagecostLine,
            fontWeight: "bold",
            backgroundColor: "#EF0000",
            type: "line",
            borderColor: "#EF0000",
            // borderWidth: 1,
            fill: false,
            // xAxisID: "axis-bar",
          },
        ],
      };
      setCostChartData(costDataSource);
      console.log("Date Value ===== ", dateSearch);
    }
  }, [utilityEnergyReducerStates]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        // align: 'start',
        display: true,
        labels: {
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Amount(Naira)',
        fontWeight: 'bold',
        position: 'left'
      },
    },

    scales: {
      x: {
        title: {
          display: true,
          text: "Period(Month)",
          fontWeight: "bold",
          position: "left",
        },
        ticks: {
          font: {
            weight: 'bold',
          }
        },
        stacked: false,
        grid: {
          drawOnChartArea: false
        }
      },
      y: {
        stacked: false,
        grid: {
          drawOnChartArea: true
        }
      }
    },


  };

  const onDateChange = (date) => {
    const clientId = props.auth.userData.client_id
    const year = new Date(date).getFullYear();
    setSelectedDate(year)
    props.getClientDieselCostData(clientId, year)
  }

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
              loading={props.overviewPage.fetchDieselCostBarChartLoading}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h1
                    style={{
                      fontSize: "17Px",
                    }}
                  >
                    Diesel Cost
                  </h1>
                </div>
                <div>
                  <DatePicker
                    // defaultValue={selectedDate}
                    defaultValue={
                      dayjs("2024", dateFormat)
                    }
                    // format={dateFormat}
                    picker="year"
                    style={{ width: 107.65, height: 44 }}
                    onChange={onDateChange}
                  />
                </div>
              </div>
              <Bar options={options} data={costChartData} />
            </Card>
          </section>
        
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getClientDieselCostData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(DieselCostChart);
