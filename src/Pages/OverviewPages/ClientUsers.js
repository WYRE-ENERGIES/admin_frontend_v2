import { Button, Dropdown, Form, Image, Input, List, Modal, Space, Table, Typography, notification } from "antd";

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PlusOutlined, SearchOutlined, UserOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { addClientUsersData, getClientUsersData, getViewUserBranchesData, removeClientUsersData, updateClientUsersData } from "../../redux/actions/clientUser/clientUser.action"; 
import EditClientUserForm from "./EditClientUserForm";
import AddClientUserForm from "./AddClientUserForm";
import { BsThreeDots } from "react-icons/bs";


function ClientUsers(props) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showAddButton, setShowAddButton] = useState(false)
  const [clientUserApiData, setClientUserApiData] = useState([])
  const [holdPaginatedData, setHoldPaginatedData] = useState([])
  const [paginateFilter, setpaginateFilter] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showUserBranches, setShowUserBranches] = useState(false)
  const [ClientUserTableData, setClientUserTableData] = useState({})

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);

  useEffect(() => {
    const clientId = props.auth.userData.client_id
    props.getClientUsersData(clientId);
  }, [])

  useEffect(() => {
      if (props.clientUsersPage.fetchedClientUser)
      {
        setClientUserApiData(props.clientUsersPage.fetchedClientUser)
      }
    }, [props.clientUsersPage.fetchedClientUser])

  useEffect(() => {
    props.getViewUserBranchesData(ClientUserTableData.id)
  }, [ClientUserTableData])



  const onSearchClientUser = (e) => {
    const clientId = props.auth.userData.client_id
    props.getClientUsersData(clientId, e.target.value)
    props.getClientUsersData(clientId, e.target.value)
  }

    const suffix = (
      <SearchOutlined
        onClick={onSearchClientUser}
        style={{
          fontSize: 16,
          color: "white",
        }}
      />
    );

    const handleSearch = (e) => {
      const filtered = clientUserApiData.filter((item) =>
        item.username.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setHoldPaginatedData(filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize))
    };
    const newModalData = props.clientUsersPage.fetchedViewUserBranches.data

  useEffect(() => {
    const paginatedData = clientUserApiData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    setHoldPaginatedData(paginatedData)
  }, [currentPage, clientUserApiData])

  const fetchNextPaginatedUsersList = () => {
      const totalPages = currentPage * pageSize < clientUserApiData.length;
      if (totalPages)
      {
        setCurrentPage(currentPage + 1);
      }
    };
  
    const fetchPrevPaginatedUsersList = () => {
      if (currentPage > 1)
      {
        setCurrentPage(currentPage - 1);
      }
    };

    useEffect(() => {
      const paginatedData = clientUserApiData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      setHoldPaginatedData(paginatedData)
    }, [currentPage, clientUserApiData])

    const handleMenuClick = () => {
      setShowUserBranches(true)
      setShowEditForm(false)
    }

    const items = [
      {
        label: ' View User Branches',
        key: '1',
        icon: <UserOutlined />,
        onClick: () => {
          // setClientUserTableData()
          handleMenuClick()
        }
      },
      {
        label: 'Edit',
        key: '2',
        icon: <EditOutlined />,
        onClick: () => {
          setShowEditForm(true);
        }
      },
    ];

    const menuProps = {
      items,
      // onClick: handleMenuClick,
    };

    const optionsColumn = () => ({
      key: 'operation',
      title: 'Options',
      width: '10%',
      dataIndex: 'operation',
      // render: (_, record) => {
      //     return (
      //       <a
      //         target="_blank"
      //         onClick={(e) => {
      //           e.preventDefault();
      //           console.log("On-click");
      //           setShowEditForm(true);
      //           setClientUserTableData(record);
      //         }}
      //         rel="noopener noreferrer"
      //       >
      //         <Button
      //          style={{
      //           color:'#5C12A7',
      //           // background:'#5C12A7'
      //          }}
      //         >
      //           Edit
      //         </Button>
            
      //       </a>
      //     );
      // }
      render: (_, record) => {
        return (
          <a
            target="_blank"
            onClick={(e) => {
              e.preventDefault();
              // setShowUserBranches(true);
              setClientUserTableData(record);
            }}
            rel="noopener noreferrer"
          >
            <Dropdown
              menu={menuProps}
            >
              <Button
                style={{
                  color: "#5C12A7",
                  width: 44,
                  height: 25,
                  backgroundColor: "rgba(92, 18, 167, 0.1)",
                  borderRadius: 12,
                }}
              >
                <BsThreeDots />
              </Button>
            </Dropdown>
          </a>
        );
      }
    });

    const modalColumns = [
      {
        title: "Branches",
        dataIndex: "name",
        key: "name",
      }
    ]
  
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
        <div className="AppHeader" style={{ margin: "30px" }}>
          <Typography.Title style={{ fontSize: "30Px", fontWeight: "bold" }}>
            Users
          </Typography.Title>
        </div>
        <div className="AppHeader" style={{ margin: "30px" }}>
          <Search
            // onClick={onSearchClientUser}
            onChange={handleSearch}
            // enterButton="suffix"
            // onClick={onSearchClientUser}
            // enterButton="suffix"
            allowClear
            placeholder="Search by name"
            className="user-search-input"
          />
          <Space>
            <div>
              <Button
                style={{ width: "183.68px", height: "46.96px", fontWeight: "bold", borderRadius: "12px", backgroundColor: "#5C12A7", color: "white" }}
                onClick={(e) => {
                  e.preventDefault();
                  setShowAddButton(true);
                  setShowEditForm(false);
                }}
              >
                <PlusOutlined />
                Add User
              </Button>
            </div>
          </Space>
        </div>
        <div className="##########">
          <section className="total-energy-bar-chart users-table">
            <div className="client-page-flex-display">
              <div className="client-user-table">
                <div className="table-responsive-wrapper">
                  <Table
                    className="custom-row-hover"
                    loading={props.clientUsersPage.fetchClientUserLoading}
                    dataSource={holdPaginatedData}
                    columns={columns}
                    onChange={onChange}
                    pagination={false}
                    scroll={{ x: true }}
                  />
                </div>
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
                <Modal
                  visible={showUserBranches}
                  title="User Branches"
                  onCancel={() => setShowUserBranches(false)}
                  footer={null}
                  width={557}
                  height={594}
                >
                  <div className="table-responsive-wrapper">
                    <Table
                      dataSource={newModalData}
                      columns={modalColumns}
                      pagination={false}
                      scroll={{ x: true }}
                    />
                  </div>
                </Modal>
              </div>
              {ClientUserTableData ? (
                <EditClientUserForm
                  ClientUserTableData={ClientUserTableData}
                  showEditForm={showEditForm}
                />
              ) : (
                <AddClientUserForm ClientUserTableData={ClientUserTableData} />
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
  getViewUserBranchesData,
  getViewUserBranchesData,
  updateClientUsersData,
  removeClientUsersData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(ClientUsers);
