/* eslint-disable no-restricted-globals */
import React, { useState } from 'react';

import { Image,Card, Table } from 'antd';


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
// import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const logoSrc = '/ReportIcons/Wyre-logo.png';
const tilderSrc = '/ReportIcons/tilder.png';
const icon1Src = '/ReportIcons/Icon1.png';
const icon2Src = '/ReportIcons/Icon2.png';
const icon3Src = '/ReportIcons/Icon3.png';
const icon4Src = '/ReportIcons/Icon4.png';


function Report(props) {
  const [errorMessage, setErrorMessage] = useState(undefined);


  const energy_usage_breakdown= newReportData.energy_deviation.filter((en)=>['Operational Period', 'Non-Operational Period', 'Weekend Period'].includes(en.name))


  const solarHourConsumption = [
    {name: `Energy Consumed during solar hours (${newReportData.solar_hour.unit})`, 
      value: newReportData.solar_hour.value},
    {name: 'Solar percentage', 
      value: (newReportData.solar_hour.value/ newReportData.total_energy.value) * 100 }
  ]

  const energyDoughnutData = {
    labels: ['Utility : 5036 kWh (55.2%)', 'Generator 1 : 5036 (55.2%)', 'Generator 2 : 5036 kWh (55.2%)', 'Inverter : 5036 kWh (55.2%)'],
    datasets: [
      {
        data: [300, 50, 100, 150],
        backgroundColor: ['rgba(52, 75, 253, 1)', 'rgba(249, 207, 64, 1)', 'rgba(52, 213, 253, 1)', 'rgba(150, 64, 255, 1)'], 
        hoverOffset: 4, 
      },
    ],
  };

  const bandDoughnutData = {
    labels: ['purple', 'Yellow'],
    datasets: [
      {
        data: [50, 100],
        backgroundColor: ['rgba(150, 64, 255, 1)', 'rgba(249, 207, 64, 1)'], 
        hoverOffset: 4, 
      },
    ],
  };

  const dataEntryData = {
    labels: ['Purple'],
    datasets: [
      {
        data: [100],  
        backgroundColor: ['rgba(150, 64, 255, 1)'], 
        borderRadius: 22,
        hoverOffset: 4,
      },
    ],
  };
  
  const doughnutOptions = {
    responsive: true,
    legend: {
      display: true,
      labels: {
        boxWidth: 13,
        fontSize: 16,
        fontColor: 'black',
        padding: 10,
      },
      position: 'right',
    },
    plugins: {
      labels: {
        boxWidth: 20,
        padding: 10,
      },
      position:'right',
      outlabels: {
        display: false,
      },
      datalabels: {
        formatter: (value, context) => {
          let sum = 0;
          let dataArr = context.energyDoughnutData.datasets;
          dataArr.forEach((data) => {
            sum += data;
          });
          let percentage = ((value * 100) / sum).toFixed() + '%';
          return percentage;
        },
        color: 'white',
        font: {
          size: 16,
          weight: '700',
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`; // Custom tooltip label format
          }
        }
      }
    }
  };

  const EnergyDoughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right', // Move the legend to the right
        labels: {
          boxWidth: 20, // You can adjust the box width for the legend items
          padding: 20,  // You can add padding for better spacing
          // marginLeft:100,
          // fontSize:22
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`, // Customize tooltips
        },
      },
    },
  };


// Data with segmented bars
const powerDemandData = [
  {
    name: "Operational",
    max: 2400, fill:"rgba(150, 64, 255, 1)", borderRadius: 22,
    avg: 2400, fill:"rgba(150, 64, 255, 1)", borderRadius: 22,
    min: 4000, fill:"rgba(150, 64, 255, 1)", borderRadius: 22,
  },
  {
    name: "Non Operational",
    max: 1398, fill:"rgba(249, 207, 64, 1)",
    avg: 2210, fill:"rgba(249, 207, 64, 1)",
    min: 3000, fill:"rgba(249, 207, 64, 1)",
  },
  {
    name: "Weeekend Hours",
    max: 9800, fill:"rgba(52, 75, 253, 1)",
    avg: 2290, fill:"rgba(52, 75, 253, 1)",
    min: 2000, fill:"rgba(52, 75, 253, 1)",
  },
];

const SegmentedBarChart = () => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={powerDemandData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <ReTooltip />
      <ReLegend />
      <Bar dataKey="max" fill="rgba(249, 207, 64, 1)" />
      <Bar dataKey="avg" fill="rgba(52, 75, 253, 1)" />
      <Bar dataKey="min" fill="rgba(150, 64, 255, 1)" />
    </BarChart>
  </ResponsiveContainer>
);

const Top7Data = [
  {
    data_type: "Generator 1",
    data_entered: "35",
    weight_age: "24",
    score_contribue: "15",
  },
  {
    data_type: "Generator 2",
    data_entered: "30",
    weight_age: "24",
    score_contribue: "15",
  },
  {
    data_type: "Inverter",
    data_entered: "30",
    weight_age: "24",
    score_contribue: "15",
  },
  {
    data_type: "Utility",
    data_entered: "30",
    weight_age: "24",
    score_contribue: "15",
  },
];

// const top7DataSource = {
//   labels: Top7Data.map(topData => topData.data_type),
//   datasets: [
//     {
//       label: "Utility : 5036 kWh (55.2%), Generator 1 : 5036 kWh (55.2%), Generator 2 : 5036 kWh (55.2%), Inverter : 5036 kWh (55.2%)",
//       data:  Top7Data.map(topData => topData.data_entered),
//       backgroundColor: ["rgba(249, 207, 64, 1)", "rgba(52, 213, 253, 1)", "rgba(150, 64, 255, 1)", "rgba(52, 75, 253, 1)"],
//       borderRadius: 22,
//       barThickness: 40,
//       maxBarThickness: 40,
//     },
//   ],
// };

const top7DataSource = {
  labels: Top7Data[0].data_type,
  datasets: [
    {
      label: "Utility : 5036 kWh (55.2%)",
      data:  Top7Data[0].data_entered,
      backgroundColor: "rgba(249, 207, 64, 1)",
      borderRadius: 22,
      barThickness: 40,
      maxBarThickness: 40,
    },
    {
      label: " Generator 1 : 5036 kWh (55.2%)",
      data:  Top7Data[1].data_entered,
      backgroundColor: "rgba(52, 213, 253, 1)",
      borderRadius: 22,
      barThickness: 40,
      maxBarThickness: 40,
    },
    {
      label: "Generator 2 : 5036 kWh (55.2%)",
      data:  Top7Data[2].data_entered,
      backgroundColor: "rgba(150, 64, 255, 1)",
      borderRadius: 22,
      barThickness: 40,
      maxBarThickness: 40,
    },
    {
      label: "Inverter : 5036 kWh (55.2%)",
      data:  Top7Data[3].data_entered,
      backgroundColor: "rgba(52, 75, 253, 1)",
      borderRadius: 22,
      barThickness: 40,
      maxBarThickness: 40,
    }
  ],
};

const top7Options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      // align: 'start',
      display: true,
      labels: {
        usePointStyle: true,
      },
    },
    title: {
      display: true,
      // text: 'Quantity(Liters)',
      fontWeight: 'bold',
      position: 'left'
    },
  },
  indexAxis: 'y',
  scales: {
    x: {
      title: {
        display: true,
        // text: "Period(Month)",
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


const fuelEfficiencyAccuracyComparisonTableData =[
  {key: 'Recommended', value: 'Achieved', unit: 'kWh/litre'},
  { key: (newReportData.fuel_efficiency_accuracy_comparison.recommended.value).toString() + newReportData.fuel_efficiency_accuracy_comparison.recommended.unit, 
    value: newReportData.fuel_efficiency_accuracy_comparison.achieved.value + newReportData.fuel_efficiency_accuracy_comparison.achieved.unit },
]


  return (
    <div className="layer-1">
      <section className="init-space">
        <div className="heading">
          <div className="wyre-logo">
            <Image width={100} src={logoSrc} />
          </div>
          <h1>
            Monthly Energy Report for Royal-garden
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
                <Image className="image" src="/ReportIcons/tilder.png" />~{" "}
                {newReportData.total_energy.value +
                  " " +
                  newReportData.total_energy.unit}
              </h1>
            </div>
          </Card>
        </div>
      </section>
      <section className="init-space">
        <Card style={{height:700}}>
          <div className="top-doughnut">
            <div className="icon-and-title">
              <Image className="image" src={icon1Src} />
              <div className="icon-title">
                <h1 style={{ fontSize: "17Px" }}>Energy Consumed per Source</h1>
              </div>
            </div>
            <div className="flex-doughnut">
              <Doughnut 
                data={energyDoughnutData} 
                options={EnergyDoughnutOptions} 
                // plugins={[ChartDataLabels]} 
              />
              {/* <div className="doughnut-labels">
                <ul>
                  <li className='fisrt-list'> Utility : 5036 kWh (55.2%)</li>
                  <li className='second-list'> Generator 1 : 5036 (55.2%) </li>
                  <li className='third-list'> Generator 2 : 5036 kWh (55.2%)</li>
                  <li className='fourth-list'> Inverter : 5036 kWh (55.2%)</li>
                </ul>
              </div> */}
            </div>
          </div>
        </Card>
      </section>
      <section className="init-space">
        <Card>
          <div className="first-barchart">
            <div className="icon-and-title">
              <Image className="image" src={icon1Src} />
              <div className="icon-title">
                <h1 style={{ fontSize: "17Px" }}>Top 7 Energy Contributors</h1>
              </div>
            </div>
            <h3
              style={{
                marginTop: -10,
                marginLeft: 10,
                fontWeight: "light",
                fontSize: 50,
              }}
            >
              4,964 kWh
            </h3>
          </div>
          {/* <TopSegmentedBarChart /> */}
          <ChartBar options={top7Options} data={top7DataSource} />
          <ul className='list_in_7'>
            <li className='fisrt-list'> Utility : 5036 kWh (55.2%)</li>
            <li className='second-list'> Generator 1 : 5036 kWh (55.2%)</li>
            <li className='third-list'> Generator 2 : 5036 kWh (55.2%)</li>
            <li className='fourth-list'> Inverter : 5036 kWh (55.2%) </li>
          </ul>
          {/* <div className="pDemand-labels">
            <h4>
              <span className="utility-color"></span> Utility : 5036 kWh (55.2%)
            </h4>
            <h4>
              <span className="generator1-color"></span> Generator 1 : 5036 kWh
              (55.2%)
            </h4>
            <h4>
              <span className="generator2-color"></span> Generator 2 : 5036 kWh
              (55.2%)
            </h4>
            <h4>
              <span className="inverter-color"></span> Inverter : 5036 kWh
              (55.2%)
            </h4>
          </div> */}
        </Card>
      </section>
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
              <Image className="image" src={icon2Src} />
              <div className="icon-title">
                <h1 style={{}}>Utility Consumption</h1>
              </div>
            </div>
            <Table
              pagination={false}
              columns={utilityConsumptnColumn}
              dataSource={newReportData.energy_consumed.devices.filter(
                (d) => d.type === "Utility"
              )}
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
              <Image className="image" src={icon3Src} />
              <div className="icon-title">
                <h1 style={{}}>Diesel Consumption</h1>
              </div>
            </div>
            <Table
              pagination={false}
              columns={utilityConsumptnColumn}
              dataSource={newReportData.energy_consumed.devices.filter(
                (d) => d.type === "Generator"
              )}
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
              <Image className="image" src={icon4Src} />
              <div className="icon-title">
                <h1 style={{}}>Solar Hours Consumption</h1>
              </div>
            </div>
            <Table
              pagination={false}
              columns={solarHourConsumptnColumn}
              dataSource={solarHourConsumption}
            />
          </div>
        </div>
      </section>
      <section className="init-space">
        <h1 style={{ fontSize: "17Px" }}>Operational Performance</h1>
        <Card className="operational-performance">
          <div className="icon-and-title">
            <Image className="image" src={icon1Src} />
            <div className="icon-title">
              <h1>Power Demand</h1>
            </div>
          </div>
          <SegmentedBarChart />
          <div style={{display:'flex', justifyContent:'center'}}>
          <ul className='max-demand-lists' style={{fontSize:20, fontFamily: 'montserrat'}}>
            <li className='fisrt-list'>Max demand (580 kWh)</li>
            <li className='fisrt-list'>Max demand (140 kWh)</li>
            <li className='fisrt-list'>Max demand (140 kWh)</li>
          </ul>
          <ul className='Avg-demand-lists' style={{fontSize:20, fontFamily: 'montserrat'}}>
            <li className='second-list'>Avg demand (580 kWh)</li>
            <li className='second-list'>Avg demand (140 kWh)</li>
            <li className='second-list'>Avg demand (140 kWh)</li>
          </ul>
          <ul className='min-demand-lists' style={{fontSize:20, fontFamily: 'montserrat'}}>
            <li className='third-list'>Min demand (580 kWh)</li>
            <li className='third-list'>Min demand (140 kWh)</li>
            <li className='third-list'>Min demand (140 kWh)</li>
          </ul>
          </div>
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
            <Image className="image" src={icon4Src} />
            <div className="icon-title">
              <h1>Energy Usage Breakdown</h1>
            </div>
          </div>
          <Table
            pagination={false}
            dataSource={energy_usage_breakdown}
            columns={deviationUsageBreakdownColumn}
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
            <Image className="image" src={icon3Src} />
            <div className="icon-title">
              <h1 style={{}}>Deviation Utility and Diesel</h1>
            </div>
          </div>
          <Table
            pagination={false}
            dataSource={newReportData.energy_deviation}
            columns={deviationUtitlityAndDieselColumn}
          />
        </div>
      </section>
      <section className="init-space">
        <h1 style={{ fontSize: "17Px" }}>Generator Size Efficiency Accuracy</h1>
        <div className="generator-efficiency">
          <Card className="current">
            <div>
              <p className="current-heading">Current Month Efficiency</p>
              <p className="current-p">
                {newReportData.generator_size_efficiency.current_month.value +
                  newReportData.generator_size_efficiency.current_month.unit}
                <span className="current-span">
                  {newReportData.generator_size_efficiency.current_month.value -
                    newReportData.generator_size_efficiency.best_month.value}
                  {newReportData.generator_size_efficiency.best_month.unit}
                </span>
              </p>
            </div>
          </Card>
          <Card className="best-ever">
            <div>
              <p className="best-heading">Best Ever Efficiency</p>
              <p className="best-p">
                {newReportData.generator_size_efficiency.best_month.value +
                  newReportData.generator_size_efficiency.best_month.unit}
              </p>
            </div>
          </Card>
        </div>
        <div className="metric-container">
          <h1 className="fuel-efficiency">
            Fuel Efficiency Accuracy Comparison{" "}
            <span className="fuel-efficiency-span">
              Accuracy:{" "}
              {newReportData.fuel_efficiency_accuracy_comparison.accuracy
                .value +
                newReportData.fuel_efficiency_accuracy_comparison.accuracy.unit}
            </span>
          </h1>
          <Table
            pagination={false}
            dataSource={fuelEfficiencyAccuracyComparisonTableData}
            columns={fuelEfficiencyAccuracyComparisonColumn}
          />
        </div>
        {/* <div className="metric-container">
          <Image className="image" src="/ReportIcons/Icon2.png" />
          <div style={{marginLeft:'30px', paddingTop:'15px', paddingBottom:'10px'}} className="icon-and-title">
            <h1 style={{}}>Band Categorization</h1>
          </div>
          <Table />
        </div> */}
        <div style={{ marginTop: "30px" }} className="metric-container">
          <div
            style={{
              marginLeft: "30px",
              paddingTop: "15px",
              paddingBottom: "10px",
            }}
            className="icon-and-title"
          >
            <Image className="image" src={icon2Src} />
            <div className="icon-title">
              <h1 style={{}}>Band Categorization</h1>
            </div>
          </div>
          <Table
            pagination={false}
            columns={bandCategorizationColumn}
            dataSource={newReportData.utility_band_categorization}
          />
        </div>
        <div className="bottom-doughnut">
          <Card className="band-category">
            <h1 style={{ fontSize: "17Px" }}>Band Categorization</h1>
            <div className="doughnut-position">
              <Doughnut data={bandDoughnutData} options={doughnutOptions} />
              <ul className='band-lists' style={{fontWeight:'bold', fontSize:20}}>
                <li className='fisrt-list'>Total Month hours (580 hours)</li>
                <li className='second-list'>Total Utility available hours (140 hours)</li>
              </ul>
            </div>
          </Card>
          <Card className="data-entry">
            <h1 style={{ fontSize: "17Px" }}>Data Entry Score</h1>
            <div className="doughnut-position">
              <Doughnut data={dataEntryData} options={doughnutOptions} />
              <p style={{textAlign:'center', fontWeight:'bold', fontSize:20}}>Progress bar based on completeness of system inputs</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}


export default Report;