/* eslint-disable no-restricted-globals */
import React, { useState } from 'react';

import { Spin, Form, notification, Table, Card, Space, Image } from 'antd';
import { Input } from 'antd';
import { loginAUser } from '../../redux/actions/auth/auth.action';
import { connect } from 'react-redux';
import SocialCluster from '../smallComponents/SocialCluster.js';

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



function Report(props) {
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [form] = Form.useForm();

  const utilityConsumptnColumn = [
    {
      title: "Energy(kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Time of use",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Expected Bill",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Last Bill Accuracy(%)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
  ]
  const dieselConsumptnColumn = [
    {
      title: "Energy(kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Time of use",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Expected Bill",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Last Bill Accuracy(%)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
  ]
  const solarHourConsumptnColumn = [
    {
      title: "Energy consumed during solar hours (kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Time of use",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
  ]
  const bandCategorizationColumn = [
    {
      title: "Band",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Total Hours(achieved)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Expected Hours",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Deviation (+or_)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Percentage Compliance",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.all_time.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
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
    segment1: 4000, fill:"purple",
    segment2: 2400, fill:"purple",
    segment3: 2400, fill:"purple",
  },
  {
    name: "Non Operational",
    segment1: 3000, fill:"yellow",
    segment2: 1398, fill:"yellow",
    segment3: 2210, fill:"yellow",
  },
  {
    name: "Weeekend Hours",
    segment1: 2000, fill:"blue",
    segment2: 9800, fill:"blue",
    segment3: 2290, fill:"blue",
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
      <Bar dataKey="segment1" fill="#8884d8" />
      <Bar dataKey="segment2" fill="#82ca9d" />
      <Bar dataKey="segment3" fill="#ffc658" />
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

  return (
    <div className="layer-1">
      <section className="init-space">
        <div className="heading">
          <div className='wyre-logo'>
            <Image width={100} src="/ReportIcons/Wyre-logo.png" />
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
              <Image className="image" src="/ReportIcons/tilder.png" /> 4,500 kWh
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
      <section className="init-space">
        <Card>
          <div className="first-barchart">
            <div className="icon-and-title">
              <Image className="image" src="/ReportIcons/Icon1.png" />
              <div className="icon-title">
                <h1 style={{ fontSize: "17Px" }}>Top 7 Energy Contributors</h1>
              </div>
            </div>
          </div>
            {/* <TopSegmentedBarChart /> */}
            <ChartBar options={options} data={dataSource} />
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
              <Image className="image" src="/ReportIcons/Icon2.png" />
              <div className="icon-title">
                <h1 style={{}}>Utility Consumption</h1>
              </div>
            </div>
            <Table columns={utilityConsumptnColumn} />
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
                <h1 style={{}}>Diesel Consumption</h1>
              </div>
            </div>
            <Table columns={dieselConsumptnColumn} />
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
              <Image className="image" src="/ReportIcons/Icon4.png" />
              <div className="icon-title">
                <h1 style={{}}>Solar Hours Consumption</h1>
              </div>
            </div>
            <Table columns={solarHourConsumptnColumn} />
          </div>
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
          <Table />
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
          <Table />
        </div>
      </section>
      <section className="init-space">
        <h1 style={{ fontSize: "17Px" }}>Generator Size Efficiency Accuracy</h1>
        <div className="generator-efficiency">
          <Card className="current">
            <div>
              <p className='current-heading'>Current Month Efficiency</p>
              <p className='current-p'>
                85.3% <span className='current-span'>-3.5%</span>
              </p>
            </div>
          </Card>
          <Card className="best-ever">
            <div>
              <p className='best-heading'>Best Ever Efficiency</p>
              <p className='best-p'>93.7%</p>
            </div>
          </Card>
        </div>
        <div className="metric-container">
          <h1 className='fuel-efficiency'>
            Fuel Efficiency Accuracy Comparison <span className='fuel-efficiency-span'>Accuracy: 91.4%</span>
          </h1>
          <Table />
        </div>
        {/* <div className="metric-container">
          <Image className="image" src="/ReportIcons/Icon2.png" />
          <div style={{marginLeft:'30px', paddingTop:'15px', paddingBottom:'10px'}} className="icon-and-title">
            <h1 style={{}}>Band Categorization</h1>
          </div>
          <Table />
        </div> */}
        <div style={{marginTop:'30px'}} className="metric-container">
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
            <Table columns={bandCategorizationColumn} />
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

export default connect(mapStateToProps, mapDispatchToProps)(Report);