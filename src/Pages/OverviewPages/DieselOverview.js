import { Button, DatePicker, Dropdown, Form, Image, Input, Modal, Space, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PlusOutlined } from "@ant-design/icons";
import { BsThreeDots } from 'react-icons/bs'
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { addClientUsersData, getClientUsersData, removeClientUsersData, updateClientUsersData } from "../../redux/actions/clientUser/clientUser.action"; 
import EditClientUserForm from "./EditClientUserForm";
import AddClientUserForm from "./AddClientUserForm";
import { getDieselData } from "../../redux/actions/diesel/diesel.action";

function DieselOverview(props) {
  const [showprocurementsModal, setShowprocurementsModal] = useState(false)
  const [showConsumptionsModal, setShowConsumptionsModal] = useState(false)
  const [ClientUserTableData, setDieselDataTable] = useState({})

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

  const clientUersListPaginate = props.dieselPage.fetchedDiesel.results
  const fetchNextPaginatedUsersList = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(clientUersListPaginate.page) || 0;
    const itemsPerPage = Number(clientUersListPaginate.count) || 10;
    const totalPages = Number( clientUersListPaginate.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&page=${currentPage+1}`;
      props.getClientUsersData(clientId, paginationQuery);
    }
  };

  const fetchPrevPaginatedUsersList = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(clientUersListPaginate.page) || 0;
    const itemsPerPage = Number(clientUersListPaginate.count) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&page=${currentPage-1}`;
      props.getClientUsersData(clientId, paginationQuery);
    }
  };

  const consumptionsColumn = () => ({
    key: 'consumptions',
    title: 'Consumptions',
    width: '10%',
    dataIndex: 'consumptions',
    render: (_, record) => {
        return (
          <a
            target="_blank"
            onClick={(e) => {
              e.preventDefault();
              console.log("On-click");
              setShowConsumptionsModal(true);
              setDieselDataTable(record);
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
              console.log("procurement clicked for ==> ", record);
              setShowprocurementsModal(true);
              setDieselDataTable(record);
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

  const procurementModal = [
    {
      title: "Date",
      // dataIndex: "name",
      // key: "name",
    },
    {
      title: "Price",
      // dataIndex: "current_month_consumption_in_litres",
      // render: (value) => <>{value + 'L'}</>,
      // key: "current_month_consumption_in_litres",
    },
    {
      title: "Liters",
      // dataIndex: "previous_day_consumption_in_litres",
      // render: (value) => <>{value + 'L'}</>,
      // key: "previous_day_consumption_in_litres",
    },
  ];

  const consumptionModal = [
    {
      title: "Date",
      // dataIndex: "name",
      // key: "name",
    },
    {
      title: "Consumed",
      // dataIndex: "previous_day_consumption_in_litres",
      // render: (value) => <>{value + 'L'}</>,
      // key: "previous_day_consumption_in_litres",
    },
    {
      title: "Fuel efficiency ratio(%)",
      // dataIndex: "previous_day_consumption_in_litres",
      // render: (value) => <>{value + 'L'}</>,
      // key: "previous_day_consumption_in_litres",
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
              dayjs("01/04/2024", dateFormat),
              dayjs("30/04/2024", dateFormat),
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
              // dataSource={}
              // loading={}
              columns={procurementModal}
              pagination={false}
            />
            <div className="modal_pagination">
              <div>
                <Button onClick={fetchPrevPaginatedUsersList}>Previous</Button>
              </div>
              <div>
                <Button onClick={fetchNextPaginatedUsersList}>Next</Button>
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
              // dataSource={}
              // loading={}
              columns={consumptionModal}
              pagination={false}
            />
            <div className="modal_pagination">
              <div>
                <Button onClick={fetchPrevPaginatedUsersList}>Previous</Button>
              </div>
              <div>
                <Button onClick={fetchNextPaginatedUsersList}>Next</Button>
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
  addClientUsersData,
  getClientUsersData,
  updateClientUsersData,
  removeClientUsersData,
  getDieselData
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
  clientUsersPage: state.clientUsersPage,
  dieselPage: state.dieselPage
});

export default connect(mapStateToProps, mapDispatchToProps)(DieselOverview);