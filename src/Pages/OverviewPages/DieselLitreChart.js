import { Button, Card, DatePicker, Select } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from "react";
import { getClientDieselLitresData } from "../../redux/actions/overview/overview.action";
import { connect } from "react-redux";
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
import { getYear } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


function DieselLitreChart(props, showUtilityCostPage, setShowUtilityCostPage) {
  const [selectedDate, setSelectedDate] = useState()
  const [loading, setLoading] = useState('')
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
      const labels = utilityEnergyReducerStates.diesel_overview.map((reducer) => {
        return reducer.month;
      });
      const litreAverage = utilityEnergyReducerStates.average_diesel_litres
      const dieselCost_or_Litre = utilityEnergyReducerStates.diesel_overview.map((reducer) => {
        return reducer.diesel_litres;
      });

      const averageLitreLine = Array.from({ length: 12 }, (_, i) => litreAverage)

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "Current usage",
            data: dieselCost_or_Litre,
            backgroundColor: "#F9CF40",
            borderRadius: 6,
            barThickness: 40,
            maxBarThickness: 40,
          },
          {
            label: "Monthly average usage ",
            data: averageLitreLine,
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
      setLoading(props.overviewPage.fetchDieselLitresBarChartLoading)
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

  const onDateChange = (select) => {
    const clientId = props.auth.userData.client_id
    const useYear = (select);
    setSelectedDate(useYear) 
    props.getClientDieselLitresData(clientId, getYear(useYear))
  }


  
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
            loading={props.overviewPage.fetchDieselLitresBarChartLoading}
          >
            {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h1
                  style={{
                    fontSize: "17Px",
                  }}
                >
                  Diesel Liters
                </h1>
              </div>
              <div>
                <DatePicker
                    defaultValue={selectedDate}
                    picker="year"
                    style={{ width: 120.65, height: 44 }}
                    onChange={onDateChange}
                  />
              </div>             
            </div> */}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
              <div>
                <h1
                  style={{
                    fontSize: "17Px",
                  }}
                >
                  Diesel Liters
                  {/* {moveLegend} */}
                </h1>
              </div>
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
            <Bar options={options} data={costChartData} />
          </Card>
        </section>
      </div>
    </>
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
