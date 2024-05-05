import { Button, Dropdown, Form, Image, Input, Modal, Space, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { addClientUsersData, getClientUsersData, removeClientUsersData, updateClientUsersData } from "../../redux/actions/clientUser/clientUser.action"; 
import EditClientUserForm from "./EditClientUserForm";
import AddClientUserForm from "./AddClientUserForm";


function ClientUsers(props) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showAddButton, setShowAddButton] = useState(false)
  const [ClientUserTableData, setClientUserTableData] = useState({})

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const showclientUsersList = () => {
    const clientId = props.auth.userData.client_id
    props.getClientUsersData(clientId);
  }

  useEffect(() => {
    showclientUsersList()
  }, [])

  const data = props.clientUsersPage.fetchedClientUser.results

  const clientUersListPaginate = props.clientUsersPage.fetchedClientUser
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

  const optionsColumn = () => ({
    key: 'operation',
    title: 'Operation',
    width: '10%',
    dataIndex: 'operation',
    render: (_, record) => {
        return (
          <a
            target="_blank"
            onClick={(e) => {
              e.preventDefault();
              console.log("On-click");
              setShowEditForm(true);
              setClientUserTableData(record);
            }}
            rel="noopener noreferrer"
          >
            <Button
             style={{
              color:'#5C12A7',
              // background:'#5C12A7'
             }}
            >
              Edit
            </Button>
            
          </a>
        );
    }
  });
  
  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone number",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    optionsColumn()
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="AppHeader">
        <Typography.Title style={{ fontSize: "30Px", fontWeight: "bold" }}>
          Client Users
        </Typography.Title>
      </div>
      <div className="AppHeader">
        <Search
          placeholder="Search by name"
          style={{
            width: "349.68px",
            height: "49.69px",
          }}
        />
        <Space>
          <div>
            <Button
              style={{ backgroundColor: "#5C12A7", color: "white" }}
              onClick={(e) => {
                e.preventDefault();
                setShowAddButton(true);
                setShowEditForm(false);
                console.log("This button is expecting Actions");
              }}
            >
              <PlusOutlined />
              Add User
            </Button>
          </div>
        </Space>
      </div>
      <div className="##########">
        <section className="total-energy-bar-chart">
          <div className="client-page-flex-display">
              <div className="client-user-table">
                <Table
                  className="custom-row-hover"
                  loading={props.clientUsersPage.fetchClientUserLoading}
                  dataSource={data}
                  columns={columns}
                  onChange={onChange}
                  pagination={false}
                />
                <div className="pagination">
                  <div>
                    <Button onClick={fetchPrevPaginatedUsersList}>
                      Previous
                    </Button>
                  </div>
                  <div>
                    <Button onClick={fetchNextPaginatedUsersList}>Next</Button>
                  </div>
                </div>
              </div>
            {ClientUserTableData ? (
              <EditClientUserForm
                ClientUserTableData={ClientUserTableData}
                showEditForm={showEditForm}
              />
            ) : (
              <AddClientUserForm />
            )}
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
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(ClientUsers);
