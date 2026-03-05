import { Button, Dropdown, Input, Modal, Popconfirm, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PlusOutlined, UserOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { addClientUsersData, assignLocation, getClientUsersData, getUserBranchesData, getViewUserBranchesData, removeClientUsersData, updateClientUsersData } from "../../redux/actions/clientUser/clientUser.action"; 
import EditClientUserForm from "./EditClientUserForm";
import AddClientUserForm from "./AddClientUserForm";
import { BsThreeDots } from "react-icons/bs";
import { getLocationsData } from "../../redux/actions/location/location.action";
import { getAllRoles } from "../../redux/actions/auth/auth.action";

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
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [clientUserApiData, setClientUserApiData] = useState([])
  const [holdPaginatedData, setHoldPaginatedData] = useState(null)
  const [pageDataHolder, setPageDataHolder] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showUserBranches, setShowUserBranches] = useState(false)
  const [seletedBranches, setseletedBranches] = useState([])
  const [ClientUserTableData, setClientUserTableData] = useState({})
  const pageSize = 10
  const isNextLoadable = currentPage * pageSize < pageDataHolder.length;

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);

  useEffect(() => {
    const clientId = props.auth.userData.client_id
    props.getClientUsersData(clientId);
  }, [])

  useEffect(() => {
    if (props.clientUsersPage.fetchedClientUser) {
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
      const fetchAllLocationsData = await props.getLocationsData(props.auth.userData.client_id)
    }
    fetchAllLocations()
  }, [ClientUserTableData.id])
  
  const handleCancel = async (record) => {
    const doCancelLocation = await props.assignLocation(ClientUserTableData.id, { user: ClientUserTableData.id, remove: [record.id] })
    if (doCancelLocation.fulfilled) {
      successNotificationPopUp("success", "user");
      props.getViewUserBranchesData(ClientUserTableData.id)
      props.getClientUsersData(props.auth.userData.client_id);
    } else {
      errorNotificationPopUp('error', 'user')
    }
  }
  
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = clientUserApiData.filter((item) =>
      item.username.toLowerCase().includes(searchValue) ||
      item.email.toLowerCase().includes(searchValue) ||
      item.phone_number.includes(e.target.value)
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
    if (isNextLoadable) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const fetchPrevPaginatedUsersList = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleMenuClick = () => {
    setShowUserBranches(true)
  }

  const items = [
    {
      label: 'View User Branches',
      key: '1',
      icon: <UserOutlined />,
      onClick: () => handleMenuClick()
    },
    {
      label: 'Edit',
      key: '2',
      icon: <EditOutlined />,
      onClick: () => setShowEditModal(true)
    },
  ];

  const menuProps = { items };

  const optionsColumn = () => ({
    key: 'operation',
    title: 'Options',
    width: '10%',
    dataIndex: 'operation',
    render: (_, record) => (
      <Dropdown
        menu={menuProps}
        trigger={['click']}
      >
        <Button
          className="options-dot-btn"
          onClick={(e) => {
            e.preventDefault();
            setClientUserTableData(record);
          }}
        >
          <BsThreeDots />
        </Button>
      </Dropdown>
    )
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
          <Button className="removeBtn">Remove</Button>
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

  return (
    <div className="client-users-page">
      <div className="client-users-header">
        <div className="client-users-header-top">
          <Typography.Title className="client-users-title">
            Users
          </Typography.Title>
          <Button
            className="adding-btn add-user-btn--mobile"
            onClick={() => setShowAddModal(true)}
          >
            <PlusOutlined />
            Add User
          </Button>
        </div>
        <div className="client-users-header-search-row">
          <div className="client-users-search-wrapper">
            <Search
              onChange={handleSearch}
              allowClear
              placeholder="Search by username or email or phone number"
              className="user-search-input"
            />
          </div>
          <div className="add-user-btn--desktop-wrap">
            <Button
              className="adding-btn add-user-btn--desktop"
              onClick={() => setShowAddModal(true)}
            >
              <PlusOutlined />
              Add User
            </Button>
          </div>
        </div>
      </div>

      <div className="client-users-table-section">
        <div className="client-users-table-card">
          <div className="table-responsive-wrapper">
            <Table
              className="custom-row-hover"
              loading={props.clientUsersPage.fetchClientUserLoading}
              dataSource={holdPaginatedData}
              columns={columns}
              pagination={false}
              scroll={{ x: true }}
            />
          </div>
          <div className="client-users-pagination">
            <Button
              className="pagination-btn"
              onClick={fetchPrevPaginatedUsersList}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="pagination-info">
              Page {currentPage} of {Math.ceil(pageDataHolder.length / pageSize)}
            </span>
            <Button
              className="pagination-btn"
              onClick={fetchNextPaginatedUsersList}
              disabled={currentPage * pageSize >= pageDataHolder.length}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={showUserBranches}
        title="User Branches"
        onCancel={() => setShowUserBranches(false)}
        footer={null}
        width={557}
        className="client-users-modal"
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

      <Modal
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        width={520}
        destroyOnClose
        className="client-users-modal"
      >
        <AddClientUserForm onSuccess={() => setShowAddModal(false)} />
      </Modal>

      <Modal
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        width={520}
        destroyOnClose
        className="client-users-modal"
      >
        <EditClientUserForm
          ClientUserTableData={ClientUserTableData}
          assignedLocationData={seletedBranches}
          onSuccess={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
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
  getAllRoles,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(ClientUsers);
