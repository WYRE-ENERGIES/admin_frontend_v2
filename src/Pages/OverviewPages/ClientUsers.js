import { Button, Dropdown, Form, Image, Input, List, Modal, Popconfirm, Space, Table, Typography, notification } from "antd";

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PlusOutlined, SearchOutlined, UserOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { addClientUsersData, assignLocation, getClientUsersData, getUserBranchesData, getViewUserBranchesData, removeClientUsersData, updateClientUsersData } from "../../redux/actions/clientUser/clientUser.action"; 
import EditClientUserForm from "./EditClientUserForm";
import AddClientUserForm from "./AddClientUserForm";
import { BsThreeDots } from "react-icons/bs";
import { getLocationsData } from "../../redux/actions/location/location.action";

const successNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'User Branch Deleted',
    description: `branch assigned to this ${formName} has been deleted`,
  });
};
const errorNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Failed',
    description: `deleting this ${formName} branch failed, please try again later`,
  });
};

function ClientUsers(props) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showAddButton, setShowAddButton] = useState(false)
  const [clientUserApiData, setClientUserApiData] = useState([])
  const [holdPaginatedData, setHoldPaginatedData] = useState(null)
  const [pageDataHolder, setPageDataHolder] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserBranches, setShowUserBranches] = useState(false)
  const [seletedBranches, setseletedBranches] = useState([])
  const [holdLocationData, setHoldLocationData] = useState([])
  const [ClientUserTableData, setClientUserTableData] = useState({})
  const pageSize = 10
  const isNextLoadable = currentPage*pageSize < pageDataHolder.length;

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
    if (ClientUserTableData.id) {
      props.getViewUserBranchesData(ClientUserTableData.id)   
    }
  }, [ClientUserTableData.id])

  useEffect(() => {
    if (props.clientUsersPage.fetchedViewUserBranches.data) {
      setseletedBranches(props.clientUsersPage.fetchedViewUserBranches.data)    
    }
  }, [props.clientUsersPage.fetchedViewUserBranches.data])

  useEffect(() => {
    const fetchAllLocations = async () => {
      const userId = ClientUserTableData.id
      const fetchAllLocationsData = await props.getLocationsData(props.auth.userData.client_id)
      if (fetchAllLocationsData.fulfilled) {
        setHoldLocationData(fetchAllLocationsData.data.data)
      }
    }
    fetchAllLocations()
  }, [ClientUserTableData.id])
  
  const handleCancel = async (record) => {
    const doCancelLocation = await props.assignLocation(ClientUserTableData.id, {user: ClientUserTableData.id, remove: [record.id]})
    if (doCancelLocation.fulfilled) {
      successNotificationPopUp("success", "user");
      props.getViewUserBranchesData(ClientUserTableData.id)
      props.getClientUsersData(props.auth.userData.client_id);
    }else{
      errorNotificationPopUp('error', 'user')
    }
  }
  
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = clientUserApiData.filter((item) =>
      item.username.toLowerCase().includes(searchValue) ||
      item.email.toLowerCase().includes(searchValue)
    );
    setPageDataHolder(filtered)
    setCurrentPage(1);
  };

  useEffect(() => {
    const paginatedData = pageDataHolder.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    setHoldPaginatedData(paginatedData)
  }, [currentPage, pageDataHolder])

  useEffect(() => {
    setPageDataHolder(clientUserApiData)
  }, [clientUserApiData])

  const fetchNextPaginatedUsersList = () => {
      if (isNextLoadable)
      {
        setCurrentPage(currentPage+ 1);
      }
  };
  
  const fetchPrevPaginatedUsersList = () => {
    if (currentPage > 1)
    {
      setCurrentPage(currentPage - 1);
    }
  };

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
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Popconfirm
            title="Are you sure you want to remove this location?"
            onConfirm={() => handleCancel(record)}
            okText="Yes"
            cancelText="No"
          >
            <CloseOutlined style={{ color: 'red', cursor: 'pointer' }} />
          </Popconfirm>
        ),
      },
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
                    <Button onClick={fetchPrevPaginatedUsersList} disabled={currentPage===1}>
                      Previous
                    </Button>
                  </div>
                  <span style={{ margin: '0 8px' }}>
                    Page {currentPage} of {Math.ceil(pageDataHolder.length / pageSize)}
                  </span>
                  <div>
                    <Button onClick={fetchNextPaginatedUsersList} disabled={currentPage*pageSize >= pageDataHolder.length}>Next</Button>
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
                      dataSource={seletedBranches}
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
                  assignedLocationData={seletedBranches}
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
  getLocationsData,
  getUserBranchesData,
  assignLocation,
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
