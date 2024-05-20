import { Button, DatePicker, Dropdown, Form, Image, Input, Modal, Space, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { BsThreeDots } from 'react-icons/bs'
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { getDieselConsumptionData, getDieselData, getDieselProcurementData } from "../../redux/actions/diesel/diesel.action"; 

function DieselOverview(props) {
  const [showprocurementsModal, setShowprocurementsModal] = useState(false)
  const [showConsumptionsModal, setShowConsumptionsModal] = useState(false)
  const [dieselDataTable, setDieselDataTable] = useState({})
  const [dieselProcureDataTable, setDieselProcureDataTable] = useState({})

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const showDieselList = () => {
    const clientId = props.auth.userData.client_id
    props.getDieselData(clientId);
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
      render: (value) => <>{value + 'L'}</>,
      key: "current_month_consumption_in_litres",
    },
    {
      title: "Diesel consumed the previous day(L)",
      dataIndex: "previous_day_consumption_in_litres",
      render: (value) => <>{value + 'L'}</>,
      key: "previous_day_consumption_in_litres",
    },
    {
      title: "Diesel remaining(L)",
      dataIndex: "remaining_diesel_litres",
      render: (value) => <>{value + 'L'}</>,
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
      title: "Price",
      dataIndex: "price_per_litre",
      // render: (value) => <>{value + 'L'}</>,
      key: "price_per_litre",
    },
    {
      title: "Liters",
      dataIndex: "quantity",
      render: (value) => <>{value + 'L'}</>,
      key: "quantity",
    },
  ];

  const consumptionModal = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Consumed",
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
            defaultValue={[
              dayjs("01/05/2024", dateFormat),
              dayjs("31/05/2024", dateFormat),
            ]}
            format={dateFormat}
            // onChange={onSelectDateKeyMetrics}
          />
        </Space>
      </div>
      <div className="##########">
        <section className="total-energy-bar-chart">
          {/* <div className="client-page-flex-display"> */}
          {/* <div className="client-user-table"> */}
          <Table
            className="custom-row-hover"
            loading={props.dieselPage.fetchDieselLoading}
            dataSource={data}
            columns={columns}
            onChange={onChange}
            pagination={false}
          />
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