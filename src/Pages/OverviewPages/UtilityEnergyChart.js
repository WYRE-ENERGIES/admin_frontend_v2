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
      const labels = utilityEnergyReducerStates.map((reducer) => {
        return reducer.month;
      });
      const energy = utilityEnergyReducerStates.map((reducer) => {
        return reducer.utility_energy;
      });

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
    
    props.getClientUtilityEnergyData(clientId, getYear(useYear))
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
                overflow: "hidden"
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
              style={{ maxWidth: "78vw" }}
              options={options} data={costChartData} />
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
