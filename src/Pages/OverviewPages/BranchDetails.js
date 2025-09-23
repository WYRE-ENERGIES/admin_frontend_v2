import React, { useEffect, useState } from "react";
import {
  Space,
  DatePicker,
  Breadcrumb,
  Tooltip,
} from "antd";

import { connect } from "react-redux";

import moment from "moment";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import { getBranchDetailsData } from "../../redux/actions/branch/branch.action";
import DailyConsumptionChart from "./DailyConsumptionChart";
import IconComponent from "./IconComponent";
import { convertDecimalTimeToMinutes, numberFormatter } from "../../helpers/genericHelpers";

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
  const maxDemands = data.demand_values?.max_demand
  const minDemands = data.demand_values?.min_demand
  const avgDemands = data.demand_values?.avg_demand
  
  const demandsUnit = data.demand_values?.unit;
  const carbonEmission = data.devices?.map((eachDevice) => {
    return eachDevice.dashboard.dashboard_carbon_emissions?.value;
  });
  const blendedCostOfEnergy =
    data &&
    data.devices.map((eachDevice) => eachDevice.dashboard.cost_of_energy.value);
  const solarHour = data && data.devices.filter((device) => device.is_source).map((eachDevice, index) => {
      return eachDevice.dashboard.solar_hours.value
  })
  const totalSolarHour = solarHour && solarHour.reduce((cur, sum) => cur + sum, 0)
  
  const CostUnit = data && data.devices[0].dashboard.cost_of_energy.unit;
  const kwh_Unit = data && data.demand_values.unit;
  const emissionUnit = data && data.devices[0].dashboard.dashboard_carbon_emissions.unit;
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
            <span>{numberFormatter(data && data.demand_values.total_kwh)}</span>
            <span> kWh</span>
          </p>
          {props.auth.userData.client_type !== 'RESELLER' &&
                <p className="total-energy_value solar-energy_value">
                    <span>Solar Hours: {totalSolarHour && numberFormatter(totalSolarHour)} </span>
                    <span>{totalSolarHour && 'kWh'}{'('}{((totalSolarHour / data?.demand_values?.total_kwh) * 100)?.toFixed(2)}{'%)'}</span>
                </p>
            }
        </article>
        <article className="dashboard__demand-banner dashboard__banner--small">
          <div className="dashboard__demand-banner--">
          <div className="small-banner-section">
              <h3 className="small-banner-section__heading">Max. Demand</h3>
              <p className="small-banner-section__value">
                <span className="value">
                  {numberFormatter(maxDemands) || 0}
                </span>
                <span className="unit">kVA</span>
              </p>
            </div>
            <div className="small-banner-section">
              <h3 className="small-banner-section__heading">Min. Demand</h3>
              <p className="small-banner-section__value">
                <span className="value">
                  {numberFormatter(minDemands) || 0}
                </span>
                <span className="unit">kVA</span>
              </p>
            </div>
            <div className="small-banner-section">
              <h3 className="small-banner-section__heading">Avg. Demand</h3>
              <p className="small-banner-section__value">
                <span className="value">
                  {numberFormatter(avgDemands) || 0}
                </span>
                <span className="unit">kVA</span>
              </p>
            </div>
          </div>
        </article>
        <article className="dashboard__cost-emissions-banner dashboard__banner--small">
          <div className="small-banner-section">
            <h3 className="small-banner-section__heading">Carbon Emissions</h3>
            <p className="small-banner-section__value">
              <span className="value">{Number(totalCarbonEmission).toFixed(2)}</span>
              <span className="unit">{emissionUnit}</span>
            </p>
          </div>
          <div className="small-banner-section">
            <h3 className="small-banner-section__heading">
              Blended Cost of Energy
            </h3>
            <p className="small-banner-section__value">
              <span className="value">{Number(totalBlendedCostOfEnergy).toFixed(2)}</span>
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
                        <p className="total-energy-price__kwh__text">{numberFormatter(eachDevice.dashboard.total_kwh.value) || 0} kWh</p>
                        <p className="total-energy-price__heading__text__hrs">{convertDecimalTimeToMinutes(eachDevice.usage_hours) || 0}</p>
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
