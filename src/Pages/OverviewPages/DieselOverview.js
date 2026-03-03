import { Button, DatePicker, Input, Modal, Space, Table, Typography, Spin } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { BsThreeDots } from 'react-icons/bs'
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getDieselConsumptionData, getDieselData, getDieselProcurementData } from "../../redux/actions/diesel/diesel.action"; 
import { getDieselCardData } from '../../redux/actions/overview/overview.action';
import { numberFormatter } from '../../helpers/genericHelpers';

function DieselOverview(props) {
  const [showprocurementsModal, setShowprocurementsModal] = useState(false)
  const [showConsumptionsModal, setShowConsumptionsModal] = useState(false)
  const [dieselDataTable, setDieselDataTable] = useState({})
  const [selectedDate,setSelectedDate] = useState([dayjs().startOf('month'),
      dayjs(),])

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const monthFormat = 'MM/YYYY';
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const showDieselList = (date) => {
    const clientId = props.auth.userData.client_id
    const month = dayjs(date).month() + 1;
    const year = dayjs(date).year();
    props.getDieselData(clientId);
  }

  const onSelectDateDieselOverview = (date) => {
    const clientId = props.auth.userData.client_id
    const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    props.getDieselData(clientId, date1, date2)
  }

  useEffect(() => {
    showDieselList()
  }, [])

  const data = props.dieselPage.fetchedDiesel.results

  const dieselOverviewPaginate = props.dieselPage.fetchedDiesel
  const fetchNextPaginatedUsersList = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(dieselOverviewPaginate.page) || 0;
    const itemsPerPage = Number(dieselOverviewPaginate.count) || 10;
    const totalPages = Number( dieselOverviewPaginate.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&page=${currentPage+1}`;
      props.getDieselData(clientId, paginationQuery);
    }
  };

  const fetchPrevPaginatedUsersList = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(dieselOverviewPaginate.page) || 0;
    const itemsPerPage = Number(dieselOverviewPaginate.count) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&page=${currentPage-1}`;
      props.getDieselData(clientId, paginationQuery);
    }
  };

  const dieselProcurePaginate = props.dieselPage.fetchedDieselProcurement
  const fetchNextPaginateProcurement = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(dieselProcurePaginate.page) || 0;
    const itemsPerPage = Number(dieselProcurePaginate.count) || 10;
    const totalPages = Number( dieselProcurePaginate.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&page=${currentPage+1}`;
      props.getDieselProcurementData(branchId, paginationQuery);
    }
  };

  const fetchPrevPaginateProcurement = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(dieselProcurePaginate.page) || 0;
    const itemsPerPage = Number(dieselProcurePaginate.count) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&page=${currentPage-1}`;
      props.getDieselProcurementData(branchId, paginationQuery);
    }
  };

  const dieselConsumePaginate = props.dieselPage.fetchedDieselProcurement
  const fetchNextPaginateConsumption = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(dieselConsumePaginate.page) || 0;
    const itemsPerPage = Number(dieselConsumePaginate.count) || 10;
    const totalPages = Number( dieselConsumePaginate.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&page=${currentPage+1}`;
      props.getDieselConsumptionData(branchId, paginationQuery);
    }
  };

  const fetchPrevPaginateConsumption = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(dieselConsumePaginate.page) || 0;
    const itemsPerPage = Number(dieselConsumePaginate.count) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&page=${currentPage-1}`;
      props.getDieselConsumptionData(branchId, paginationQuery);
    }
  };

  const consumptionsColumn = () => ({
    key: 'consumption',
    title: 'Consumptions',
    width: '10%',
    dataIndex: 'consumption',
    render: (_, record) => {
        return (
          <a
            target="_blank"
            onClick={(e) => {
              e.preventDefault();
              setShowConsumptionsModal(true);
              setDieselDataTable(record.id);
            }}
            rel="noopener noreferrer"
          >
            <Button
             style={{
              color:'#F9CF40',
              width: 44,
              height: 25,
              backgroundColor:' rgba(249, 207, 64, 0.12)',
              borderRadius: 12
             }}
            >
              <BsThreeDots />
            </Button>
            
          </a>
        );
    }
  });
  const procurementsColumn = () => ({
    key: 'procurements',
    title: 'Procurements',
    width: '10%',
    dataIndex: 'procurements',
    render: (_, record) => {
        return (
          <a
            target="_blank"
            onClick={(e) => {
              e.preventDefault();
              setShowprocurementsModal(true);
              setDieselDataTable(record.id);
            }}
            rel="noopener noreferrer"
          >
            <Button
             style={{
              color:'#5C12A7',
              width: 44,
              height: 25,
              backgroundColor:'rgba(92, 18, 167, 0.1)',
              borderRadius: 12
             }}
            >
              <BsThreeDots />
            </Button>
            
          </a>
        );
    }
  });
  
  const columns = [
    {
      title: "Branch Name",
      dataIndex: "name",
      width: "200px",
      render: (text) => {
        return (
          <span
            style={{
              fontWeight: 'bold',
            }}
          >
            {text}
          </span>
        )
      },
      key: "name",
    },
    {
      title: "Diesel consumed this month(L)",
      dataIndex: "current_month_consumption_in_litres",
      render: (value) => <>{value}</>,
      key: "current_month_consumption_in_litres",
    },
    {
      title: "Diesel consumed the previous day(L)",
      dataIndex: "previous_day_consumption_in_litres",
      render: (value) => <>{value}</>,
      key: "previous_day_consumption_in_litres",
    },
    {
      title: "Diesel remaining(L)",
      dataIndex: "remaining_diesel_litres",
      render: (value) => <>{value}</>,
      key: "remaining_diesel_litres",
    },
    procurementsColumn(),
    consumptionsColumn(),
  ];

  const branchId = dieselDataTable
  const showDieselProcurementsTrack = () => {
    props.getDieselProcurementData(branchId);
  }
  const showDieselConsumptionsTrack = () => {
    props.getDieselConsumptionData(branchId);
  }
  useEffect( () => {
    showDieselProcurementsTrack()
    showDieselConsumptionsTrack()
  }, [dieselDataTable])

  const procurementDataSource = props.dieselPage.fetchedDieselProcurement
  const consumptionDataSource = props.dieselPage.fetchedDieselConsumption
  const procurementModal = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Price Per Litre (\u20A6)",
      dataIndex: "price_per_litre",
      render: (value) => <>{value? value.toLocaleString(
        undefined,
        { maximumFractionDigits: 2 }) : 0}</>,
      key: "price_per_litre",
    },
    {
      title: "Litres",
      dataIndex: "quantity",
      render: (value) => <>{value? value.toLocaleString(
        undefined,
        { maximumFractionDigits: 2 }) + 'L' : 0}</>,
      key: "quantity",
    },
    {
      title: "Amount (\u20A6)",
      dataIndex: "amount",
      render: (value) => <>{value? value.toLocaleString(
        undefined,
        { maximumFractionDigits: 2 }) : 0}</>,
      key: "amount",
    },
  ];

  const consumptionModal = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Daily Consumption",
      dataIndex: "consumption",
      render: (value) => <>{value ? value.toLocaleString(
        undefined,
        { maximumFractionDigits: 2 }) + 'L' : 0}</>,
      key: "consumption",
    },
    {
      title: "Fuel efficiency ratio(%)",
      dataIndex: "fuel_efficiency_ratio",
      key: "fuel_efficiency_ratio",
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
  };

  const handleMonthChange = (date) => {
    setSelectedDate(date);
    if (date) {
      props.getDieselCardData(props.auth.userData.client_id, date.month() + 1, date.year());
      props.showDieselList(props.auth.userData.client_id, date.month() + 1, date.year());
    }
  };

  useEffect(() => {
    const now = dayjs();
    props.getDieselCardData(props.auth.userData.client_id, now.month() + 1, now.year());
  }, []);

  return (
    <div className="diesel-page">
      <div className="diesel-page-header">
        <Typography.Title className="diesel-page-title">
          Diesel Overview
        </Typography.Title>
        <DatePicker
          className="diesel-date-picker"
          defaultValue={selectedDate}
          value={selectedDate}
          disabledDate={(current) => current && current > dayjs().endOf('month')}
          picker="month"
          format={monthFormat}
          onChange={handleMonthChange}
        />
      </div>

      <Spin spinning={props.dieselCardLoading}>
        <div className="diesel-cards-row">
          <div className="diesel-card">
            <Typography.Title level={4} className="diesel-card-title">
              <img src="/icon/monthly-usage.svg" alt="Monthly Usage" className="diesel-card-icon" />
              Monthly Usage
            </Typography.Title>
            <div className="diesel-card-stats">
              <div className="diesel-card-stat-row">
                <span>Litres</span>
                <span className="diesel-card-value">{numberFormatter(props.dieselCardData?.monthly_usage?.litres) || 0}L</span>
              </div>
              <div className="diesel-card-stat-row">
                <span>Cost</span>
                <span className="diesel-card-value">₦ {numberFormatter(props.dieselCardData?.monthly_usage?.cost) || 0}</span>
              </div>
              <div className="diesel-card-stat-row">
                <span>Avg Price/L</span>
                <span className="diesel-card-value">₦ {numberFormatter(props.dieselCardData?.monthly_usage?.avg_price_per_litre) || 0}</span>
              </div>
            </div>
          </div>

          <div className="diesel-card">
            <Typography.Title level={4} className="diesel-card-title">
              <img src="/icon/stock-balance.svg" alt="Stock Balance" className="diesel-card-icon" />
              Stock Balance
            </Typography.Title>
            <div className="diesel-card-stats">
              <div className="diesel-card-stat-row">
                <span>Litres</span>
                <span className="diesel-card-value">{numberFormatter(props.dieselCardData?.stock_balance?.litres) || 0}L</span>
              </div>
              <div className="diesel-card-stat-row">
                <span>Cost</span>
                <span className="diesel-card-value">₦ {numberFormatter(props.dieselCardData?.stock_balance?.cost) || 0}</span>
              </div>
              <div className="diesel-card-stat-row">
                <span>Current Price/L</span>
                <span className="diesel-card-value">₦ {numberFormatter(props.dieselCardData?.stock_balance?.current_price_per_litre) || 0}</span>
              </div>
            </div>
          </div>

          <div className="diesel-card diesel-card--branches">
            <Typography.Title level={4} className="diesel-card-title">
              <img src="/icon/branch.svg" alt="Branches" className="diesel-card-icon" />
              Branches
            </Typography.Title>
            <div className="diesel-card-branch-count">
              <Typography.Title level={2} className="diesel-card-value">
                {numberFormatter(props.dieselCardData?.branch_count) || 0}
              </Typography.Title>
            </div>
          </div>
        </div>
      </Spin>

      <section className="diesel-table-section">
        <div className="table-responsive-wrapper">
          <Table
            className="custom-row-hover"
            loading={props.dieselPage.fetchDieselLoading}
            dataSource={data}
            columns={columns}
            onChange={onChange}
            pagination={false}
            scroll={{ x: true }}
          />
        </div>
        <Modal
          open={showprocurementsModal}
          title="Procurements Table"
          onCancel={() => setShowprocurementsModal(false)}
          footer={null}
          width={557}
        >
          <div className="table-responsive-wrapper">
            <Table
              dataSource={procurementDataSource}
              loading={props.dieselPage.fetchDieselProcurementLoading}
              columns={procurementModal}
              pagination={false}
              scroll={{ x: true }}
            />
          </div>
          <div className="modal_pagination">
            <Button onClick={fetchPrevPaginateProcurement}>Previous</Button>
            <Button onClick={fetchNextPaginateProcurement}>Next</Button>
          </div>
        </Modal>
        <Modal
          open={showConsumptionsModal}
          title="Consumptions Table"
          onCancel={() => setShowConsumptionsModal(false)}
          footer={null}
          width={557}
        >
          <div className="table-responsive-wrapper">
            <Table
              dataSource={consumptionDataSource}
              loading={props.dieselPage.fetchDieselConsumptionLoading}
              columns={consumptionModal}
              pagination={false}
              scroll={{ x: true }}
            />
          </div>
          <div className="modal_pagination">
            <Button onClick={fetchPrevPaginateConsumption}>Previous</Button>
            <Button onClick={fetchNextPaginateConsumption}>Next</Button>
          </div>
        </Modal>
        <div className="pagination">
          <div>
            <Button onClick={fetchPrevPaginatedUsersList}>Previous</Button>
          </div>
          <div>
            <Button onClick={fetchNextPaginatedUsersList}>Next</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const mapDispatchToProps = {
  getDieselData,
  getDieselProcurementData,
  getDieselConsumptionData,
  getDieselCardData
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
  dieselPage: state.dieselPage,
  dieselCardData: state.overviewPage.fetchedDieselCard,
  dieselCardLoading: state.overviewPage.fetchDieselCardLoading
});

export default connect(mapStateToProps, mapDispatchToProps)(DieselOverview);
