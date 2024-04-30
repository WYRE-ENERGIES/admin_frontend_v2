import { Button, Card, DatePicker, Image, Input, Space, Table, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getClientUtilityEnergyData, getTotalCostBarChartData } from "../../redux/actions/overview/overview.action";
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


function UtilityEnergyChart(props, showUtilityCostPage, setShowUtilityCostPage) {
  const [dateSearch, setDateSearch] = useState('')
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  })
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'YYYY';
  const { RangePicker } = DatePicker;

  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  const endDate = moment().endOf("month").format("DD-MM-YYYY HH:mm");

  const showEnergyCostBarchart = () => {
    const clientId = props.auth.userData.client_id
    const year = new Date().getFullYear();
    props.getClientUtilityEnergyData(clientId, year);
  }
  
  useEffect(() => {
    showEnergyCostBarchart()
  }, []);
  
  const utilityEnergyReducerStates = props.overviewPage.fetchedUtilityEnergyBarChart.utility_energy_overview
  const reducerStates = props.overviewPage
  console.log('Reducer states->>>>>>>>>>>>', reducerStates);
  console.log('Utility-Energy>>>>>>>>>>>>', utilityEnergyReducerStates);
  useEffect(() => {
    if (utilityEnergyReducerStates) {
      const labels = utilityEnergyReducerStates.map((reducer) => {
        return reducer.month;
      });
      const clientCost = utilityEnergyReducerStates.map((reducer) => {
        return reducer.client_cost;
      });
      const energy = utilityEnergyReducerStates.map((reducer) => {
        return reducer.utility_energy;
      });

      // const averagecostLine = Array.from({ length: 12 }, (_, i) => averageCost)

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "PHCN Consumed Energy",
            data: energy,
            backgroundColor: "#43D540",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
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
        text: 'Energy Consumed(kWh)',
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
    props.getClientUtilityEnergyData(clientId, year)
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
              loading={props.overviewPage.fetchUtilityEnergyBarChartLoading}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <h1
                    style={{
                      fontSize: "17Px",
                    }}
                  >
                    Utility Energy
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
              <Bar options={options} data={costChartData} />
            </Card>
          </section>
        
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getClientUtilityEnergyData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(UtilityEnergyChart);
