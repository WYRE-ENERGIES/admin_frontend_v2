import { Card, DatePicker } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from "react";
import { getClientUtilityEnergyData } from "../../redux/actions/overview/overview.action";
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

function UtilityEnergyChart(props) {
  const { downloading = false } = props;
  const [selectedDate, setSelectedDate] = useState()
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  })
  
  dayjs.extend(customParseFormat);

  const showUtilityEnergyBarchart = () => {
    const clientId = props.auth.userData.client_id
    props.getClientUtilityEnergyData(clientId);
  }
  
  useEffect(() => {
    showUtilityEnergyBarchart()
  }, []);
  
  const utilityEnergyReducerStates = props.overviewPage.fetchedUtilityEnergyBarChart.utility_energy_overview

  useEffect(() => {
    if (utilityEnergyReducerStates) {
      const labels = utilityEnergyReducerStates.map((reducer) => reducer.month);
      const energy = utilityEnergyReducerStates.map((reducer) => reducer.utility_energy);

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "Utility Consumed Energy",
            data: energy,
            backgroundColor: "#43D540",
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
        text: 'Energy Consumed (kWh)',
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
    props.getClientUtilityEnergyData(clientId, getYear(useYear))
  }

  return (
    <div>
      <section className="total-energy-bar-chart">
        <Card className="chart-card" loading={props.overviewPage.fetchUtilityEnergyBarChartLoading}>
          <div className="chart-header">
            <h1 className="chart-header-title">Utility Energy</h1>
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
  getClientUtilityEnergyData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(UtilityEnergyChart);
