import { Card, DatePicker } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from "react";
import { getClientDieselCostData } from "../../redux/actions/overview/overview.action";
import { connect } from "react-redux";
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
import { getYear } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DieselCostChart(props) {
  const { downloading = false } = props;
  const [selectedDate, setSelectedDate] = useState()
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  })

  dayjs.extend(customParseFormat);

  const showDieselCostBarchart = () => {
    const clientId = props.auth.userData.client_id
    props.getClientDieselCostData(clientId);
  }
  
  useEffect(() => {
    showDieselCostBarchart()
  }, []);
  
  const utilityEnergyReducerStates = props.overviewPage.fetchedDieselCostBarChart
  useEffect(() => {
    if (utilityEnergyReducerStates) {
      const labels = utilityEnergyReducerStates.cost_overview.map((reducer) => reducer.month);
      const averageCost = utilityEnergyReducerStates.historical_avg
      const clientCost = utilityEnergyReducerStates.cost_overview.map((reducer) => reducer.client_cost);
      const wyreCost = utilityEnergyReducerStates.cost_overview.map((reducer) => reducer.wyre_cost);
      const averagecostLine = Array.from({ length: 12 }, () => averageCost)

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "Historical Average",
            data: averagecostLine,
            backgroundColor: "#EF0000",
            type: "line",
            borderColor: "#EF0000",
            fill: false,
          },
          {
            label: "Wyre Calculated Cost",
            data: wyreCost,
            backgroundColor: "#5C12A7",
            borderRadius: 6,
            maxBarThickness: 60,
          },
          {
            label: "Recorded Cost",
            data: clientCost,
            backgroundColor: "#F9CF40",
            borderRadius: 6,
            maxBarThickness: 60,
          },
        ],
      };
      setCostChartData(costDataSource);
    }
  }, [utilityEnergyReducerStates]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        display: true,
        labels: { usePointStyle: true },
      },
      title: {
        display: true,
        text: 'Amount (Naira)',
        fontWeight: 'bold',
        position: 'left'
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Period (Month)",
          fontWeight: "bold",
          position: "left",
        },
        ticks: { font: { weight: 'bold' } },
        stacked: false,
        grid: { drawOnChartArea: false },
      },
      y: {
        stacked: false,
        grid: { drawOnChartArea: true },
      },
    },
  };

  const onDateChange = (select) => {
    const clientId = props.auth.userData.client_id
    const useYear = (select);
    setSelectedDate(useYear)
    props.getClientDieselCostData(clientId, getYear(useYear))
  }

  return (
    <div>
      <section className="total-energy-bar-chart">
        <Card className="chart-card" loading={props.overviewPage.fetchDieselCostBarChartLoading}>
          <div className="chart-header">
            <h1 className="chart-header-title">Diesel Cost</h1>
            <div className="chart-filters">
              <DatePicker
                className="chart-filter-date"
                defaultValue={selectedDate}
                picker="year"
                onChange={onDateChange}
                placeholder="Select year"
              />
            </div>
          </div>
          <div className="chart-scroll-container">
            <div className="chart-min-width-wrapper">
              <Bar
                style={{ maxWidth: downloading ? "78vw" : "" }}
                options={options}
                data={costChartData}
              />
            </div>
          </div>
        </Card>
      </section>
    </div>
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
