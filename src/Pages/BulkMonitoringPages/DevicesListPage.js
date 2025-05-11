import { Button, DatePicker, Dropdown, Form, Image, Input, Modal, Space, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { BsThreeDots } from 'react-icons/bs'
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { getDieselConsumptionData, getDieselData, getDieselProcurementData } from "../../redux/actions/diesel/diesel.action"; 
import { getDevicesListData } from "../../redux/actions/bulkMonitoring/overview/overview.action";

function DevicesListPage(props) {
  const [showprocurementsModal, setShowprocurementsModal] = useState(false)
  const [showConsumptionsModal, setShowConsumptionsModal] = useState(false)
  const [dieselDataTable, setDieselDataTable] = useState({})
  const [dieselProcureDataTable, setDieselProcureDataTable] = useState({})

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const showDevicesList = () => {
    const clientId = props.auth.userData.client_id
    props.getDevicesListData(clientId);
  }

  const onSelectDateDieselOverview = (date) => {
    const clientId = props.auth.userData.client_id
    const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    props.getDieselData(clientId, date1, date2)
  }

  useEffect(() => {
    showDevicesList()
  }, [])

  // const data = props.dieselPage.fetchedDiesel.results
  const data = props.bMonitoringOverviewPage?.fetchedDevicesList.results

  const column = [
    {
      title: "Location",
      dataIndex: "device_name",
      key: "device_name",
      ellipsis: true,
      render: (value) => (
        <>
          {value
            ? value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Total Energy (kWh)",
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
      title: "Previous Month Energy (kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.last_month.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Current Month Energy (kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.this_month.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Amount (Naira)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.amount.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
    {
      title: "Utility Bill Accuracy (kWh)",
      dataIndex: "consumption",
      key: "consumption",
      ellipsis: true,
      render: (values) => (
        <>
          {values
            ? values.this_month.value.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 0}
        </>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="AppHeader">
        <Typography.Title style={{ fontSize: "30Px", fontWeight: "bold" }}>
          List of Devices
        </Typography.Title>
      </div>
      <div className="##########">
        <section className="total-energy-bar-chart">
          <Table
            className="custom-row-hover"
            loading={props.bMonitoringOverviewPage?.fetchDevicesListLoading}
            dataSource={data}
            columns={column}
            onChange={onChange}
            pagination={false}
          />
        </section>
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getDevicesListData,
};

const mapStateToProps = (state) => ({
  bMonitoringOverviewPage: state.bMonitoringOverviewPage,
  auth: state.auth,
});

export default connect(mapStateToProps, mapDispatchToProps)(DevicesListPage);