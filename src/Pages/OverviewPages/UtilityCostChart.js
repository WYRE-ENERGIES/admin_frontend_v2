import { Card, DatePicker } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from "react";
import { getClientUtilityCostData } from "../../redux/actions/overview/overview.action";
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


function UtilityCostChart(props) {
  const { downloading = false } = props;
  const [selectedDate, setSelectedDate] = useState()
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  })
  
  dayjs.extend(customParseFormat);

  const showUtilityCostBarchart = () => {
    const clientId = props.auth.userData.client_id;
    props.getClientUtilityCostData(clientId);
  }

  const onDateChange = (select) => {
    const clientId = props.auth.userData.client_id
    const useYear = (select);
    setSelectedDate(useYear)
    
    props.getClientUtilityCostData(clientId, getYear(useYear))
  }
  
  useEffect(() => {
    showUtilityCostBarchart()
  }, []);
  
  const costReducerStates = props.overviewPage.fetchedTotalCostBarChart
  
  useEffect(() => {
    if (costReducerStates) {
      const labels = costReducerStates.cost_overview.map((reducer) => {
        return reducer.month;
      });
      const clientCost = costReducerStates.cost_overview.map((reducer) => {
        return reducer.phcn_cost;
      });
      const wyreCost = costReducerStates.cost_overview.map((reducer) => {
        return reducer.wyre_cost;
      });
      const historicalAverage = Array.from({ length: 12 }, (_, i) => costReducerStates.historic_average)

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "historical Average",
            data: historicalAverage,
            backgroundColor: "#EF0000",
            type: "line",
            borderColor: "#EF0000",
            borderWidth: 1,
            fill: false,
            // xAxisID: "axis-bar",
          },
          {
            label: "Recorded Cost",
            data: clientCost,
            backgroundColor: "#43D540",
            borderRadius: 6,
            barThickness: 30,
            maxBarThickness: 30,
          },
          {
            label: "Wyre Calculated Cost",
            data: wyreCost,
            backgroundColor: "#5C12A7",
            borderRadius: 6,
            barThickness: 30,
            maxBarThickness: 30,
          },
        ],
      };
      setCostChartData(costDataSource);
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
        text: "Amount (Naira)",
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
          text: "Period (Month)",
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
                overflow: "hidden",
                borderRadius: 22,
              }}
              loading={props.overviewPage.fetchUtilityCostBarChartLoading}
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
                {/* <div>
                  <DatePicker
                    defaultValue={selectedDate}
                    picker="year"
                    style={{ width: 120.65, height: 44 }}
                    onChange={onDateChange}
                  />
                </div> */}
                <div className="">
                {/* <Button
                  type="default"
                  onClick={() => setSelectedIds([])}
                  disabled={selectedIds.length === 0}
                  style={{ marginTop: 16 }}
                >
                  Reset Selection
                </Button> */}
                <DatePicker
                  defaultValue={selectedDate}
                  picker="year"
                  style={{}}
                  onChange={onDateChange}
                />
              </div>
              </div>
              <Bar 
              style={{ maxWidth: downloading ? "78vw" : "" }} 
              options={options2} 
              data={costChartData} 
            />
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
