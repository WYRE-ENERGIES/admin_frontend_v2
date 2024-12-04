import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Spin,
  Modal,
  notification,
  Table,
  Space,
  Card,
  DatePicker,
  Breadcrumb,
  Tooltip,
} from "antd";

import { connect, useSelector } from "react-redux";

import moment from "moment";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import { getBranchDetailsData } from "../../redux/actions/branch/branch.action";
import DailyConsumptionChart from "./DailyConsumptionChart";
import IconComponent from "./IconComponent";

function BranchDetails(props) {
  const [searchParams] = useSearchParams();
  const headers = "";
  const [dateChange, setDateChange] = useState(false);
  const [selectedDate, setSelectedDate] = useState([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const startDate = moment().startOf("month").format("DD-MM-YYYY HH:mm");
  const endDate = moment().format("DD-MM-YYYY HH:mm");

  const dateFormat = "DD/MM/YYYY";
  const { RangePicker } = DatePicker;

  useEffect(() => {
    const branch_id = searchParams.get("ee");

    if (dateChange !== headers.selectedDate) {
      setDateChange(headers.selectedDate);
      props.getBranchDetailsData(branch_id, startDate, endDate);
    }
  }, [headers.selectedDate]);

  const data = props.branchPage.branchDetailsData;
  const avgDemands = data.demand_values?.devices_demands?.map(
    (demand) => demand.avg
  );
  const minDemands = data.demand_values?.devices_demands?.map(
    (demand) => demand.min
  );
  const maxDemands = data.demand_values?.devices_demands?.map(
    (demand) => demand.max
  );
  const demandsUnit = data.demand_values?.unit;
  const sumAvgDemands = avgDemands?.reduce((acc, val) => acc + val, 0);
  const sumMinDemands = minDemands?.reduce((acc, val) => acc + val, 0);
  const sumMaxDemands = maxDemands?.reduce((acc, val) => acc + val, 0);
  const carbonEmission = data.devices?.map((eachDevice) => {
    return eachDevice.dashboard.dashboard_carbon_emissions?.value;
  });
  const blendedCostOfEnergy =
    data &&
    data.devices.map((eachDevice) => eachDevice.dashboard.cost_of_energy.value);
  const CostUnit = data && data.devices[0].dashboard.cost_of_energy.unit;
  const kwh_Unit = data && data.demand_values.unit;
  const emissionUnit =
    data && data.devices[0].dashboard.dashboard_carbon_emissions.unit;
  const totalCarbonEmission = carbonEmission?.reduce(
    (acc, sum) => acc + sum,
    0
  );
  const totalBlendedCostOfEnergy =
    blendedCostOfEnergy &&
    blendedCostOfEnergy?.reduce((acc, sum) => acc + sum, 0);
  const onSelectDateTotalEnergy = (date) => {
    const date1 = dayjs(date[0]).startOf("date").format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).endOf("date").format("DD-MM-YYYY HH:mm");
    setSelectedDate([dayjs(date[0]), dayjs(date[1])]);
    const branch_id = searchParams.get("ee");
    props.getBranchDetailsData(branch_id, date1, date2);
  };

  return (
    <section id="page" style={{ margin: 30 }}>
      <div className="text-center">
        <h3 className="table-header__heading">
          {data && data.name} {"" + ""} Branch
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
      <div className="dashboard-row-1">
        <article className="dashboard__total-energy dashboard__banner--small">
          <div
            style={{
              textAlign: "right",
              paddingRight: 20,
              paddingTop: 20,
              marginLeft: "auto",
            }}
          >
            <Tooltip
              placement="top"
              style={{ textAlign: "right" }}
              // overlayStyle={{ whiteSpace: "pre-line" }} title={DASHBOARD_TOOLTIP_MESSAGES.TOTAL_ENERGY} >
              overlayStyle={{ whiteSpace: "pre-line" }}
              title="total_kwh"
            >
              <p>
                {/* <InformationIcon className="info-icon" style={{ color: "white" }} /> */}
              </p>
            </Tooltip>
          </div>
          <h2 className="total-energy__heading">Total Energy</h2>
          <p className="total-energy_value">
            <span>{data && data.demand_values.total_kwh}</span>
            <span>{demandsUnit}</span>
          </p>
        </article>
        <article className="dashboard__demand-banner dashboard__banner--small">
          <div className="dashboard__demand-banner--">
            <div className="small-banner-section">
              <h3 className="small-banner-section__heading">Min Demand</h3>
              <p className="small-banner-section__value">
                <span className="value">
                  {Number(sumMinDemands).toFixed(2)}
                </span>
                <span className="unit">{demandsUnit}</span>
              </p>
            </div>
            <div className="small-banner-section">
              <h3 className="small-banner-section__heading">Avg Demand</h3>
              <p className="small-banner-section__value">
                <span className="value">
                  {Number(sumAvgDemands).toFixed(2)}
                </span>
                <span className="unit">{demandsUnit}</span>
              </p>
            </div>
            <div className="small-banner-section">
              <h3 className="small-banner-section__heading">Max Demand</h3>
              <p className="small-banner-section__value">
                <span className="value">
                  {Number(sumMaxDemands).toFixed(2)}
                </span>
                <span className="unit">{demandsUnit}</span>
              </p>
            </div>
          </div>
        </article>
        <article className="dashboard__cost-emissions-banner dashboard__banner--small">
          <div className="small-banner-section">
            <h3 className="small-banner-section__heading">Carbon Emmission</h3>
            <p className="small-banner-section__value">
              <span className="value">{totalCarbonEmission}</span>
              <span className="unit">{emissionUnit}</span>
            </p>
          </div>
          <div className="small-banner-section">
            <h3 className="small-banner-section__heading">
              Blended Cost of Energy
            </h3>
            <p className="small-banner-section__value">
              <span className="value">{totalBlendedCostOfEnergy}</span>
              <span className="unit">{CostUnit}</span>
            </p>
          </div>
        </article>
      </div>
      <div className="dashboard-row-1b">
        {data &&
          data.devices
            .filter((device) => device.is_source)
            .map((eachDevice, index) => {
              return (
                eachDevice.is_source && (
                  <article
                    className="dashboard__total-energy-amount dashboard__banner--smallb"
                    key={index}
                  >
                    <div className="total-energy-price__heading">
                      <p className="total-energy-price__heading__text">
                        {eachDevice.name}
                      </p>
                    </div>
                    <hr className="total-energy-price__hr" />
                    <div className="total-amount-energy-price__body">
                      <div className="total-left-energy-price total-energy-price__common">
                        {/* Testing ordinary image Component here */}
                        {/* <img width='15px' src= '/Images/powergrid.png' /> */}
                        <IconComponent className='power-icon_size' deviceType={eachDevice.type} />
                      </div>
                      <div className="total-right-energy-price total-energy-price__common">
                        <p className="total-energy-price__kwh__text">{eachDevice.dashboard.total_kwh.value} {kwh_Unit}</p>
                        {/* <p className="total-energy-price__heading__text__hrs">{convertDecimalTimeToNormal(timeInUse) || 0}</p> */}
                      </div>
                    </div>
                    <div className="total-energy-price__footer total-energy-price__common">
                      {/* <p className="total-energy-price__footer__text">{" "}{numberFormatter(amount)? `₦ ${numberFormatter(amount)}`: "-"}</p> */}
                    </div>
                  </article>
                )
              );
            })}
      </div>
      <DailyConsumptionChart />
    </section>
  );
}

const mapDispatchToProps = {
  getBranchDetailsData,
};

const mapStateToProps = (state) => ({
  branchPage: state.branchPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(BranchDetails);
