/* eslint-disable no-restricted-globals */
import React, { useState } from 'react';

import { Spin, Form, notification, Table, Card, Space, Image } from 'antd';
import { Input } from 'antd';
import { loginAUser } from '../../redux/actions/auth/auth.action';
import { connect } from 'react-redux';
import SocialCluster from '../smallComponents/SocialCluster.js';



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

  return (
    <div className="layer-1">
      <section className="init-space">
        <div className="heading">
          <h1 style={{ textAlign: "center" }}>
            Monthly Energy Report for Royal-garden December, 2024
          </h1>
          <p style={{ textAlign: "center" }}>powered by Wyre</p>
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
              <h1 style={{ fontSize: "32Px", textAlign: "center" }}>
                Total Energy Consumed:
              </h1>
            </div>
          </Card>
          <Card className="value">
            <div>
              <h1 style={{ fontSize: "32Px", textAlign: "center" }}>
                ~ 4,500 kWh
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
            <div>
              <h1 style={{ fontSize: "17Px" }}>Band Categorization</h1>
            </div>
          </Card>
          <Card className="data-entry">
            <div>
              <h1 style={{ fontSize: "17Px" }}>Data Entry Score</h1>
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