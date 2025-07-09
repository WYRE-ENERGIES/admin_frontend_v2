import { Button, DatePicker, Dropdown, Form, Image, Input, Modal, Space, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { BsThreeDots } from 'react-icons/bs'
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { APIService} from "../../config/Api/apiServices";
import { getDieselConsumptionData, getDieselData, getDieselProcurementData } from "../../redux/actions/diesel/diesel.action"; 

function DieselOverview(props) {
  const [showprocurementsModal, setShowprocurementsModal] = useState(false)
  const [showConsumptionsModal, setShowConsumptionsModal] = useState(false)
  const [dieselDataTable, setDieselDataTable] = useState({})
  const [selectedDate,setSelectedDate] = useState([dayjs().startOf('month'),
      dayjs(),])
  const [dieselProcureDataTable, setDieselProcureDataTable] = useState({})
  const [dieselSummary, setDieselSummary] = useState({
    monthly_usage: {
      litres: 0,
      cost: 0,
      avg_price_per_litre: 0
    },
    stock_balance: {
      litres: 0,
      cost: 0,
      current_price_per_litre: 0
    },
    branch_count: 0
  });

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const monthFormat = 'MM/YYYY';
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const showDieselList = () => {
    const clientId = props.auth.userData.client_id
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
      // sorter: (a, b) => a.name.length - b.name.length,
      // sortDirections: ["descend"],
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
  const naira = '\u20A6'
  console.log('Naira == ', naira);
  
  const procurementModal = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Price Per Month (\u20A6)",
      dataIndex: "price_per_litre",
      render: (value) => <>{value.toLocaleString(
        undefined,
        { maximumFractionDigits: 2 })}</>,
      key: "price_per_litre",
    },
    {
      title: "Liters",
      dataIndex: "quantity",
      render: (value) => <>{value.toLocaleString(
        undefined,
        { maximumFractionDigits: 2 }) + 'L'}</>,
      key: "quantity",
    },
    {
      title: "Amount (\u20A6)",
      dataIndex: "amount",
      render: (value) => <>{value.toLocaleString(
        undefined,
        { maximumFractionDigits: 2 })}</>,
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
      render: (value) => <>{value + 'L'}</>,
      key: "consumption",
    },
    {
      title: "Fuel efficiency ratio(%)",
      dataIndex: "fuel_efficiency_ratio",
      // render: (value) => <>{value + 'L'}</>,
      key: "fuel_efficiency_ratio",
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  const fetchDieselSummary = async () => {
    try {
      const clientId = props.auth.userData.client_id;
      const selectedDate = selectedDate[0];
      const month = selectedDate.month() + 1;
      const year = selectedDate.year();
      
      const response = await APIService.instance.get(
        `/api/v2/client-cumulative-diesel-data/${clientId}/?month=7&year=2025`
      );
      setDieselSummary(response.data);
    } catch (error) {
      console.error('Error fetching diesel summary:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to fetch diesel summary data',
      });
    }
  };

  useEffect(() => {
    fetchDieselSummary();
  }, [selectedDate]);

  return (
    <>
      <div className="AppHeader">
        <Typography.Title style={{ fontSize: "30Px", fontWeight: "bold" }}>
          Diesel Overview
        </Typography.Title>
        <Space>
          <RangePicker
            style={{
              width: 264.29,
              height: 41.19,
              borderRadius: 11,
            }}
            defaultValue={[dayjs().startOf("month"), dayjs()]} 
            format={dateFormat}
            onChange={onSelectDateDieselOverview}
          />
        </Space>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', marginTop: '24px', paddingInline: '24px' }}>
        <div style={{
          flex: 1,
          paddingInline: '24px',
          borderRadius: '12px',
          backgroundColor: '#F5F7FA',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Typography.Title level={4}>Monthly Usage</Typography.Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Litres</span>
              <span>{dieselSummary.monthly_usage.litres.toLocaleString()}L</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cost</span>
              <span>₦{dieselSummary.monthly_usage.cost.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Avg Price/L</span>
              <span>₦{dieselSummary.monthly_usage.avg_price_per_litre.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{
          flex: 1,
          paddingInline: '24px',
          borderRadius: '12px',
          backgroundColor: '#F5F7FA',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Typography.Title level={4}>Stock Balance</Typography.Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Litres</span>
              <span>{dieselSummary.stock_balance.litres.toLocaleString()}L</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cost</span>
              <span>₦{dieselSummary.stock_balance.cost.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Current Price/L</span>
              <span>₦{dieselSummary.stock_balance.current_price_per_litre.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{
          flex: 1,
          paddingInline: '24px',
          borderRadius: '12px',
          backgroundColor: '#F5F7FA',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Typography.Title level={4}>Branches</Typography.Title>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
            <Typography.Title level={2} style={{ color: '#5C12A7' }}>
              {dieselSummary.branch_count}
            </Typography.Title>
          </div>
        </div>
      </div>
      <div className="##########">
        <section className="total-energy-bar-chart diesel-overview-table">
          {/* <div className="client-page-flex-display"> */}
          {/* <div className="client-user-table"> */}
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
            visible={showprocurementsModal}
            title="Procurements Table"
            onCancel={() => setShowprocurementsModal(false)}
            footer={null}
            width={557}
            height={594}
          >
            <Table
              dataSource={procurementDataSource}
              loading={props.dieselPage.fetchDieselProcurementLoading}
              columns={procurementModal}
              pagination={false}
              scroll={{ x: true }}
            />
            <div className="modal_pagination">
              <div>
                <Button onClick={fetchPrevPaginateProcurement}>Previous</Button>
              </div>
              <div>
                <Button onClick={fetchNextPaginateProcurement}>Next</Button>
              </div>
            </div>
          </Modal>
          <Modal
            visible={showConsumptionsModal}
            title="Consumptions Table"
            onCancel={() => setShowConsumptionsModal(false)}
            footer={null}
            width={557}
            height={594}
          >
            <Table
              dataSource={consumptionDataSource}
              loading={props.dieselPage.fetchDieselConsumptionLoading}
              columns={consumptionModal}
              pagination={false}
            />
            <div className="modal_pagination">
              <div>
                <Button onClick={fetchPrevPaginateConsumption}>Previous</Button>
              </div>
              <div>
                <Button onClick={fetchNextPaginateConsumption}>Next</Button>
              </div>
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
    </>
  );
}

const mapDispatchToProps = {
  getDieselData,
  getDieselProcurementData,
  getDieselConsumptionData
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
  dieselPage: state.dieselPage
});

export default connect(mapStateToProps, mapDispatchToProps)(DieselOverview);