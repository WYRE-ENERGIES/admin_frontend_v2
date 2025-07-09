import { Button, Card, DatePicker, Image, Input, Select, Space, Table, Typography } from "antd";
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
import { getYear } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState()
  const [costChartData, setCostChartData] = useState({
    labels: [],
    datasets: []
  })
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'YYYY';
  const { RangePicker } = DatePicker;

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

      console.log('historicalAverage', historicalAverage)

      const costDataSource = {
        labels,
        datasets: [
          {
            label: "PHCN Cost",
            data: clientCost,
            backgroundColor: "#094D92",
            borderRadius: 6,
            barThickness: 30,
            maxBarThickness: 30,
          },
          {
            label: "Wyre Cost",
            data: wyreCost,
            backgroundColor: "#5C12A7",
            borderRadius: 6,
            barThickness: 30,
            maxBarThickness: 30,
          },
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
              loading={props.overviewPage.fetchTotalCostBarChartLoading}
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
                <Select
                  className="select-bar"
                  mode="multiple"
                  maxTagCount={1}
                  maxTagTextLength={10}
                  maxTagPlaceholder={omittedValues => `+${omittedValues.length} more`}
                  placeholder="Select branches"
                  // onChange={handleCompareBranch}
                  // value={selectedIds}
                  style={{ width:165, marginRight: 10 }}
                  // options={selectOptions}
                />
                {/* <Button
                  type="default"
                  onClick={() => setSelectedIds([])}
                  disabled={selectedIds.length === 0}
                  style={{ marginTop: 16 }}
                >
                  Reset Selection
                </Button> */}
                <Select
                  className="select-bar"
                  // prefix="Region"
                  placeholder="Search by Region"
                  // defaultValue="lucy"
                  style={{ marginRight: 10, width:165 }}
                  // onChange={handleRegionChange}
                  options={[
                    { value: 'jack', label: 'North' },
                    { value: 'lucy', label: 'South' },
                    { value: 'Yiminghe', label: 'East' },
                    { value: 'disabled', label: 'Disabled', disabled: true },
                  ]}
                />
                <DatePicker
                  defaultValue={selectedDate}
                  picker="year"
                  style={{}}
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
