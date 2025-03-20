/* eslint-disable no-restricted-globals */
import React, { useState } from 'react';

import { Image,Card, Table } from 'antd';

import { loginAUser } from '../../redux/actions/auth/auth.action';
import { connect } from 'react-redux';


import newReportData from '../../newreport.json'
import { utilityConsumptnColumn, solarHourConsumptnColumn, 
  bandCategorizationColumn, deviationUsageBreakdownColumn, 
  deviationUtitlityAndDieselColumn, fuelEfficiencyAccuracyComparisonColumn } from '../../helpers/reportTableColumns.js';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  ResponsiveContainer,
} from "recharts";
import { Doughnut, Bar as ChartBar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);



function InMail(props) {
  const [errorMessage, setErrorMessage] = useState(undefined);


  const energy_usage_breakdown= newReportData.energy_deviation.filter((en)=>['Operational Period', 'Non-Operational Period', 'Weekend Period'].includes(en.name))


  const solarHourConsumption = [
    {name: `Energy Consumed during solar hours (${newReportData.solar_hour.unit})`, 
      value: newReportData.solar_hour.value},
    {name: 'Solar percentage', 
      value: (newReportData.solar_hour.value/ newReportData.total_energy.value) * 100 }
  ]

  const doughnutData = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#FF5733', '#33B5FF', '#FFEB33'], 
        hoverOffset: 4, 
      },
    ],
  };

  const dataEntryData = {
    labels: ['Purple'],
    datasets: [
      {
        data: [100],  
        backgroundColor: ['purple'], 
        hoverOffset: 4,
      },
    ],
  };
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`; // Custom tooltip label format
          }
        }
      }
    }
  };

// Data with segmented bars
const data = [
  {
    name: "Operational",
    min: 4000, fill:"rgba(150, 64, 255, 1)",
    max: 2400, fill:"rgba(150, 64, 255, 1)",
    avg: 2400, fill:"rgba(150, 64, 255, 1)",
  },
  {
    name: "Non Operational",
    min: 3000, fill:"rgba(249, 207, 64, 1)",
    max: 1398, fill:"rgba(249, 207, 64, 1)",
    avg: 2210, fill:"rgba(249, 207, 64, 1)",
  },
  {
    name: "Weeekend Hours",
    min: 2000, fill:"rgba(52, 75, 253, 1)",
    max: 9800, fill:"rgba(52, 75, 253, 1)",
    avg: 2290, fill:"rgba(52, 75, 253, 1)",
  },
];

const SegmentedBarChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <ReTooltip />
      <ReLegend />
      <Bar dataKey="min" fill="rgba(150, 64, 255, 1)" />
      <Bar dataKey="max" fill="rgba(249, 207, 64, 1)" />
      <Bar dataKey="avg" fill="rgba(52, 75, 253, 1)" />
    </BarChart>
  </ResponsiveContainer>
);

const top7Data = [
  {
    name: "Operational",
    segment1: 4000, fill:"purple",
    segment2: 2400, fill:"blue",
    segment3: 2100, fill:"green",
    segment4: 3800, fill:"grey",
  },
];

const Top7 = [
  {
    data_type: "Diesel Usage Data",
    data_entered: "80",
    weight_age: "24",
    score_contribue: "15",
  },
  {
    data_type: "Diesel Consumption Data",
    data_entered: "30",
    weight_age: "24",
    score_contribue: "15",
  },
  {
    data_type: "Utility Payment Receipts",
    data_entered: "30",
    weight_age: "24",
    score_contribue: "15",
  },
  {
    data_type: "Energy Usage Data",
    data_entered: "30",
    weight_age: "24",
    score_contribue: "15",
  },
];

const dataSource = {
  labels: Top7.map(topData => topData.data_type),
  datasets: [
    {
      label: "Current usage",
      data:  Top7.map(topData => topData.data_entered),
      backgroundColor: ["rgba(249, 207, 64, 1)", "rgba(52, 213, 253, 1)", "rgba(150, 64, 255, 1)", "rgba(52, 75, 253, 1)"],
      borderRadius: 22,
      barThickness: 40,
      maxBarThickness: 40,
    },
    // {
    //   label: "Monthly average usage ",
    //   data: averageLitreLine,
    //   backgroundColor: "#EF0000",
    //   type: "line",
    //   borderColor: "#EF0000",
    //   borderWidth: 1,
    //   fill: false,
    //   // xAxisID: "axis-bar",
    // },
  ],
};

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
      text: 'Quantity(Liters)',
      fontWeight: 'bold',
      position: 'left'
    },
  },
  indexAxis: 'y',
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
      },
    }
  },
};

const TopSegmentedBarChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={top7Data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <ReTooltip />
      <ReLegend />
      <Bar dataKey="segment1"  />
      <Bar dataKey="segment2"  />
      <Bar dataKey="segment3"  />
      {/* <Bar dataKey="segment4"  /> */}
    </BarChart>
  </ResponsiveContainer>
);


const fuelEfficiencyAccuracyComparisonTableData =[
  {key: 'Recommended', value: 'Achieved', unit: 'kWh/litre'},
  { key: (newReportData.fuel_efficiency_accuracy_comparison.recommended.value).toString() + newReportData.fuel_efficiency_accuracy_comparison.recommended.unit, 
    value: newReportData.fuel_efficiency_accuracy_comparison.achieved.value + newReportData.fuel_efficiency_accuracy_comparison.achieved.unit },
]


  return (
    <div className="layer-1">
      <section className="init-space">
        <div className="heading">
          <div className='wyre-logo'>
            <Image width={100} src="/ReportIcons/Wyre-logo.png" />
          </div>
          <h1>
            InMail Monthly Energy Report for Royal-garden
            <p>December, 2024</p>
          </h1>
          <p>powered by Wyre</p>
        </div>
      </section>
      <section className="init-space">
        {/* <div className="top-card">
          <Card>
            <div>
              <h1 style={{ fontSize: "17Px" }}>Total Energy Consumed:</h1>
            </div>
          </Card>
          <Card>
            <div>
              <h1 style={{ fontSize: "17Px" }}>~ 4,500 kWh</h1>
            </div>
          </Card>
        </div> */}
        <div className="head-card">
          <Card className="title">
            <div>
              <h1 style={{ fontSize: "30Px", textAlign: "center" }}>
                Total Energy Consumed:
              </h1>
            </div>
          </Card>
          <Card className="value">
            <div>
              <h1 style={{ fontSize: "32Px", textAlign: "center" }}>
              <Image className="image" src="/ReportIcons/tilder.png" />
                 {newReportData.total_energy.value + " " + newReportData.total_energy.unit}
              </h1>
            </div>
          </Card>
        </div>
      </section>
      <section className="init-space">
        <Card>
          <div className="top-doughnut">
            <div className="icon-and-title">
              <Image className="image" src="/ReportIcons/Icon1.png" />
              <div className="icon-title">
                <h1 style={{ fontSize: "17Px" }}>Energy Consumed per Source</h1>
              </div>
            </div>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </Card>
      </section>
      {/* <section className="init-space">
        <Card>
          <div className="first-barchart">
            <div className="icon-and-title">
              <Image className="image" src="/ReportIcons/Icon1.png" />
              <div className="icon-title">
                <h1 style={{ fontSize: "17Px" }}>Top 7 Energy Contributors</h1>
              </div>
            </div>
            <h3 style={{marginTop:-10, marginLeft:10, fontWeight:'light', fontSize:50}}>4,964 kWh</h3>
          </div>
            <ChartBar options={options} data={dataSource} />
        </Card>
      </section> */}
      <section className="init-space">
        <div className="consumption-metrics">
          <h1 style={{ fontSize: "32px" }}>Consumption Metrics</h1>
          <div className="metric-container">
            <div
              style={{
                marginLeft: "30px",
                paddingTop: "15px",
                paddingBottom: "10px",
              }}
              className="icon-and-title"
            >
              <Image className="image" src="/ReportIcons/Icon2.png" />
              <div className="icon-title">
                <h1 style={{}}>Utility Consumption</h1>
              </div>
            </div>
            <Table 
              columns={utilityConsumptnColumn} 
              dataSource={newReportData.energy_consumed.devices.filter((d)=> d.type === 'Utility' )} 
              pagination={false}
            />
          </div>
          {/* <div className="metric-container">
            <div
              style={{
                marginLeft: "30px",
                paddingTop: "15px",
                paddingBottom: "10px",
              }}
              className="icon-and-title"
            >
              <Image className="image" src="/ReportIcons/Icon3.png" />
              <div className="icon-title">
                <h1 style={{}}>Diesel Consumption</h1>
              </div>
            </div>
            <Table 
              columns={utilityConsumptnColumn} 
              dataSource={newReportData.energy_consumed.devices.filter((d) => d.type === 'Generator' )} 
              pagination={false}
            />
          </div> */}
          {/* <div className="metric-container">
            <div
              style={{
                marginLeft: "30px",
                paddingTop: "15px",
                paddingBottom: "10px",
              }}
              className="icon-and-title"
            >
              <Image className="image" src="/ReportIcons/Icon4.png" />
              <div className="icon-title">
                <h1 style={{}}>Solar Hours Consumption</h1>
              </div>
            </div>
            <Table 
              columns={solarHourConsumptnColumn} 
              dataSource={solarHourConsumption} 
              pagination={false}
            />
          </div> */}
        </div>
      </section>
      <section className="init-space">
        <h1 style={{ fontSize: "17Px" }}>Operational Performance</h1>
        <Card className="operational-performance">
          <div className="icon-and-title">
            <Image className="image" src="/ReportIcons/Icon1.png" />
            <div className="icon-title">
              <h1>Power Demand</h1>
            </div>
          </div>
          <SegmentedBarChart />
        </Card>
        <div style={{ marginTop: "30px" }} className="metric-container">
          <div
            style={{
              marginLeft: "30px",
              paddingTop: "15px",
              paddingBottom: "10px",
            }}
            className="icon-and-title"
          >
            <Image className="image" src="/ReportIcons/Icon4.png" />
            <div className="icon-title">
              <h1>Energy Usage Breakdown</h1>
            </div>
          </div>
          <Table 
            dataSource={energy_usage_breakdown} 
            columns={deviationUsageBreakdownColumn} 
            pagination={false}
          />
        </div>
        <div className="metric-container">
          <div
            style={{
              marginLeft: "30px",
              paddingTop: "15px",
              paddingBottom: "10px",
            }}
            className="icon-and-title"
          >
            <Image className="image" src="/ReportIcons/Icon3.png" />
            <div className="icon-title">
              <h1 style={{}}>Deviation Utility and Diesel</h1>
            </div>
          </div>
          <Table 
            dataSource={newReportData.energy_deviation} 
            columns={deviationUtitlityAndDieselColumn} 
            pagination={false}
          />
        </div>
      </section>
      <section className="init-space">
        <h1 style={{ fontSize: "17Px" }}>Generator Size Efficiency Accuracy</h1>
        <div className="generator-efficiency">
          <Card className="current">
            <div>
              <p className='current-heading'>Current Month Efficiency</p>
              <p className='current-p'>{newReportData.generator_size_efficiency.current_month.value + newReportData.generator_size_efficiency.current_month.unit}
              <span className='current-span'>{newReportData.generator_size_efficiency.current_month.value - newReportData.generator_size_efficiency.best_month.value}{newReportData.generator_size_efficiency.best_month.unit}</span>
              </p>
            </div>
          </Card>
          <Card className="best-ever">
            <div>
              <p className='best-heading'>Best Ever Efficiency</p>
              <p className='best-p'>{newReportData.generator_size_efficiency.best_month.value + newReportData.generator_size_efficiency.best_month.unit}</p>
            </div>
          </Card>
        </div>
        <div className="metric-container">
          <h1 className='fuel-efficiency'>
            Fuel Efficiency Accuracy Comparison <span className='fuel-efficiency-span'>Accuracy: {newReportData.fuel_efficiency_accuracy_comparison.accuracy.value + newReportData.fuel_efficiency_accuracy_comparison.accuracy.unit}</span>
          </h1>
          <Table 
            dataSource={fuelEfficiencyAccuracyComparisonTableData} 
            columns={fuelEfficiencyAccuracyComparisonColumn} 
            pagination={false}
          />
        </div>
        {/* <div className="metric-container">
          <Image className="image" src="/ReportIcons/Icon2.png" />
          <div style={{marginLeft:'30px', paddingTop:'15px', paddingBottom:'10px'}} className="icon-and-title">
            <h1 style={{}}>Band Categorization</h1>
          </div>
          <Table />
        </div> */}
        <div style={{ marginTop: '30px' }} className="metric-container">
          <div
            style={{
              marginLeft: "30px",
              paddingTop: "15px",
              paddingBottom: "10px",
            }}
            className="icon-and-title"
          >
            <Image className="image" src="/ReportIcons/Icon2.png" />
            <div className="icon-title">
              <h1 style={{}}>Band Categorization</h1>
            </div>
          </div>
          <Table 
            columns={bandCategorizationColumn} 
            dataSource={newReportData.utility_band_categorization} 
            pagination={false}
          />
        </div>
        <div className="bottom-doughnut">
          <Card className="band-category">
            <h1 style={{ fontSize: "17Px" }}>Band Categorization</h1>
            <div className='doughnut-position'>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </Card>
          <Card className="data-entry">
              <h1 style={{ fontSize: "17Px" }}>Data Entry Score</h1>
            <div className='doughnut-position'>
              <Doughnut data={dataEntryData} options={doughnutOptions} />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

const mapDispatchToProps = {
  loginAUser
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(InMail);