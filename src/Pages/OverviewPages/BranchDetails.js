import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Modal, notification, Table, Space, Card, DatePicker, Breadcrumb } from 'antd';


import { connect, useSelector } from 'react-redux';

import moment from 'moment';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { getBranchDetailsData } from '../../redux/actions/branch/branch.action';
import DailyConsumptionChart from './DailyConsumptionChart';



function BranchDetails(props) {
    const [searchParams] = useSearchParams();
    const headers = '';
    const [dateChange, setDateChange] = useState(false);
    const [selectedDate,setSelectedDate] = useState([dayjs().startOf('month'),
      dayjs(),])
    const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
    const endDate = moment().format("DD-MM-YYYY HH:mm");
    
    const dateFormat = 'DD/MM/YYYY';
    const { RangePicker } = DatePicker;

    useEffect(() => {
        const branch_id = searchParams.get("ee")

        if (dateChange !== headers.selectedDate) {
            setDateChange(headers.selectedDate);
            props.getBranchDetailsData(branch_id, startDate, endDate);
        }
    }, [headers.selectedDate]);
    
    const data = props.branchPage.branchDetailsData;
    const avgDemands = data.demand_values?.devices_demands?.map((demand) => demand.avg)
    const minDemands = data.demand_values?.devices_demands?.map((demand) => demand.min)
    const maxDemands = data.demand_values?.devices_demands?.map((demand) => demand.max)
    const demandsUnit = data.demand_values?.unit
    const sumAvgDemands = avgDemands?.reduce((acc, val) => acc + val, 0)
    const sumMinDemands = minDemands?.reduce((acc, val) => acc + val, 0)
    const sumMaxDemands = maxDemands?.reduce((acc, val) => acc + val, 0)
    const carbonEmission = data.devices?.map((eachDevice) => {
      return eachDevice.dashboard.dashboard_carbon_emissions?.value
    })
    const blendedCostOfEnergy = data && data.devices.map(eachDevice =>eachDevice.dashboard.cost_of_energy.value)
    const CostUnit = data && data.devices[0].dashboard.cost_of_energy.unit
    const kwh_Unit = data && data.demand_values.unit
    const emissionUnit = data && data.devices[0].dashboard.dashboard_carbon_emissions.unit
    const totalCarbonEmission = carbonEmission?.reduce((acc, sum) => acc + sum, 0)
    const totalBlendedCostOfEnergy = blendedCostOfEnergy &&  blendedCostOfEnergy?.reduce((acc, sum) => acc + sum, 0)
    const onSelectDateTotalEnergy = (date) => {
      const date1 = dayjs(date[0]).startOf("date").format("DD-MM-YYYY HH:mm");
      const date2 = dayjs(date[1]).endOf("date").format("DD-MM-YYYY HH:mm");
      setSelectedDate([dayjs(date[0]), dayjs(date[1])])
      const branch_id = searchParams.get("ee")
      props.getBranchDetailsData(branch_id, date1, date2);
    }

    return (
      <>
        <article className="total-energy-bar-chart">
          <div className="branch_page">
            <div className="text-center">
              <h3 className="table-header__heading">
                {data && data.name} {"" + ""} Branch Details
              </h3>
              <Space className="sub_head">
                <div className="breadcrumb-and-print-buttons">
                  <Breadcrumb
                    items={[
                      {
                        title: <a href="/">Home</a>,
                      },
                      {
                        title: "View Branch",
                      },
                    ]}
                  />
                </div>
                <RangePicker
                  style={{
                    width: 222,
                  }}
                  defaultValue={selectedDate}
                  format={dateFormat}
                  onChange={onSelectDateTotalEnergy}
                />
              </Space>
            </div>
            <div style={{ width: "100%" }}>
              <Space className="demand_values">
                <Card className="demand_card">
                  <h3>Total energy</h3>
                  <p>{data && data.demand_values.total_kwh} {demandsUnit}</p>
                </Card>
                <Card className="demand_card">
                  <Space className="header_card">
                    <h3>
                      Min Demand{" "}
                      <span className="power_demand_value">
                        {Number(sumMinDemands).toFixed(2)} {demandsUnit}
                      </span>
                    </h3>
                    <h3>
                      Avg Demand{" "}
                      <span className="power_demand_value">
                        {Number(sumAvgDemands).toFixed(2)} {demandsUnit}
                      </span>
                    </h3>
                    <h3>
                      Max Demand{" "}
                      <span className="power_demand_value">
                        {Number(sumMaxDemands).toFixed(2)} {demandsUnit}
                      </span>
                    </h3>
                  </Space>
                  {/* <p>{data && data.demand_values.max_demand}</p> */}
                </Card>
                <Card className="demand_card">
                  <h3>Carbon Emmission</h3>
                  <p>{totalCarbonEmission} {emissionUnit}</p>
                </Card>
                <Card className="demand_card">
                  <h3>Blended Cost of Energy</h3>
                  <p>{totalBlendedCostOfEnergy} {CostUnit}</p>
                </Card>
              </Space>
            </div>
            <div style={{ width: "100%" }}>
              <Space className="device_Consumption">
                {data &&
                  data.devices
                    .filter((device) => device.is_source)
                    .map((eachDevice, index) => {
                      return (
                        eachDevice.is_source && (
                          <Card className="device_card_size" key={index}>
                            <h4>{eachDevice.name}</h4>
                            <p>{eachDevice.dashboard.total_kwh.value} {kwh_Unit}</p>
                          </Card>
                        )
                      );
                    })}
                {/* <Card className="device_card_size">
                </Card>
                <Card className="device_card_size">
                  <h1>Generator</h1>
                </Card> */}
              </Space>
            </div>
          </div>
          <DailyConsumptionChart />
        </article>
      </>
    );
}

const mapDispatchToProps = {
    getBranchDetailsData,
}

const mapStateToProps = (state) => ({
    branchPage: state.branchPage,
    auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(BranchDetails)