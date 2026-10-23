import { Card, DatePicker } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from "react";
import { getClientDieselLitresData } from "../../redux/actions/overview/overview.action";
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

function DieselLitreChart(props) {
  const { downloading = false } = props;
  const [selectedDate, setSelectedDate] = useState()
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  })
  
  dayjs.extend(customParseFormat);

  const showDieselLitresBarchart = () => {
    const clientId = props.auth.userData.client_id
    props.getClientDieselLitresData(clientId);
  }
  
  useEffect(() => {
    showDieselLitresBarchart()
  }, []);
  
  const utilityEnergyReducerStates = props.overviewPage.fetchedDieselLitresBarChart
  useEffect(() => {
    if (utilityEnergyReducerStates) {
      const labels = utilityEnergyReducerStates.diesel_overview.map((reducer) => reducer.month);
      const litreAverage = utilityEnergyReducerStates.average_diesel_litres
      const dieselCost_or_Litre = utilityEnergyReducerStates.diesel_overview.map((reducer) => reducer.diesel_litres);
      const averageLitreLine = Array.from({ length: 12 }, () => litreAverage)

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "Current usage",
            data: dieselCost_or_Litre,
            backgroundColor: "#F9CF40",
            borderRadius: 6,
            maxBarThickness: 60,
          },
          {
            label: "Monthly average usage",
            data: averageLitreLine,
            backgroundColor: "#EF0000",
            type: "line",
            borderColor: "#EF0000",
            borderWidth: 1,
            fill: false,
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
        text: 'Quantity (Liters)',
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
    props.getClientDieselLitresData(clientId, getYear(useYear))
  }

  return (
    <div>
      <section className="total-energy-bar-chart">
        <Card className="chart-card" loading={props.overviewPage.fetchDieselLitresBarChartLoading}>
          <div className="chart-header">
            <h1 className="chart-header-title">Diesel Liters</h1>
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
  getClientDieselLitresData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(DieselLitreChart);
