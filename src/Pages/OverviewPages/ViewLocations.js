import { Button, DatePicker, Dropdown, Form, Image, Input, List, Menu, Modal, Popconfirm, Select, Space, Spin, Table, Typography, message, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import { addALocation, addARegion, deleteARegion, getLocationsData, getRegionsListData, updateALocation, updateARegion } from "../../redux/actions/location/location.action";
import { forceLoginBranchAction } from "../../redux/actions/branch/branch.creator";
import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { BsThreeDots } from "react-icons/bs";
import axios from "axios";

const successNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Region Added',
    description: `Your addition to the ${formName} has been successfully created`,
  });
};
const errorNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Failed',
    description: `Your addition to the ${formName} failed, please try again later`,
  });
};

const SubmitButton = ({ form }) => {
  const [submittable, setSubmittable] = useState(false);

  // Watch all values
  const values = Form.useWatch([], form);
  useEffect(() => {
    form
      .validateFields({
        validateOnly: true,
      })
      .then(
        () => {
          setSubmittable(true);
        },
        () => {
          setSubmittable(false);
        },
      );
  }, [values]);
  return (
    <>
      <Button
        style={{ marginRight:20, backgroundColor: "white", color: "black", height: "40px", borderRadius: "7px", width: "47%" }}
        // type="primary"
        htmlType="submit"
      // disabled={!submittable}
      >
        Done
      </Button>
    </>
  );
};

function ViewLocations(props) {
  const dispatch = useDispatch();
  const [dieselDataTable, setDieselDataTable] = useState({})
  const [viewLocationModal, setviewLocationModal] = useState(false)
  const [addLocationModal, setAddLocationModal] = useState(false)
  const [addRegionsModal, setAddRegionsModal] = useState(false)
  const [viewRegionsModal, setviewRegionsModal] = useState(false)
  const [editLocationModal, setEditLocationModal] = useState(false)
  const [editRegionsModal, setEditRegionsModal] = useState(false)
  const [locationTableData, setlocationTableData] = useState(false)
  const [regionsTableData, setRegionsTableData] = useState(false)
  
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const [form] = Form.useForm();
  const [addLocationform] = Form.useForm();
  const [editLocationform] = Form.useForm();
  const [addRegionform] = Form.useForm();

  const handleBranchLogin = async (branchId) => {
    try {
      const data = await dispatch(forceLoginBranchAction(branchId));
      const params = new URLSearchParams({
        access: data.token.access,
        refresh: data.token.refresh,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      window.open(`http://localhost:3001/dashboard/force-login?${params.toString()}`, '_blank');
    } catch (err) {
      // Check for specific permission error
      if (err?.response?.data?.detail === "You do not have permission for this branch") {
        notification.error({
          message: 'Access Denied',
          description: 'You do not have permission to access this branch dashboard. Please contact your administrator for access rights.',
          duration: 5,
        });
      } else if (err?.response?.data?.detail) {
        // Handle other detailed error responses
        notification.error({
          message: 'Branch Access Failed',
          description: err.response.data.detail,
          duration: 5,
        });
      } else if (err?.response?.data?.message) {
        // Handle error messages from API
        notification.error({
          message: 'Branch Force Login Failed',
          description: err.response.data.message,
          duration: 5,
        });
      } else {
        // Handle generic errors
        notification.error({
          message: 'Branch Force Login Failed',
          description: err?.message || 'Unable to login to branch dashboard. Please try again later.',
          duration: 5,
        });
      }
    }
  };

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const clientId = props.auth.userData.client_id
  const showLocationList = () => {
    props.getLocationsData(clientId);
  }

  const showRegionLists = () => {
    props.getRegionsListData(clientId);
  }

  const onSelectDateLocation = (date) => {
    const clientId = props.auth.userData.client_id
    const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    props.getLocationsData(clientId, date1, date2)
  }

  useEffect(() => {
    showLocationList()
    showRegionLists()
  }, [])

  const handleEditRegion = (record) => {
    setSelectedRegion(record);
    form.setFieldsValue({ region: record.region });
    setEditModalVisible(true);
  };

  const handleClickEditLocation = (record) => {    
    setlocationTableData(record);
    editLocationform.setFieldsValue({ 
      name: record.name,
      region: record.region,
      address: record.address,
      city: record.city,
    });
    setEditLocationModal(true);
  };

  const handleViewRegion = (record) => {
    setSelectedRegion(record);
    setViewModalVisible(true);
  };

  const handleDeleteRegion = async (record) => {   
    setSelectedRegion(record);
    const request = await props.deleteARegion(record);
    if (request.fulfilled) {
      notification.success({
        message: "Success",
        description: request.data?.message || 'Region deleted successfully',
      });
      showRegionLists()
    }else{
      notification.error({
      message: "Error",
      description:
        request?.message || 'please try again later'
    });
    }
  };

  const data = props.locationPage.fetchedLocation.results
  const regionData = props.locationPage.fetchedRegion.regions
  // const regionOptions = regionData.map((item) => ({
  //   label: item.region,
  //   value: item.id,
  // }));
  const regionOptions = (regionData || []).map((item) => ({
  label: item.region,
  value: item.id,
}));
  
  const regionColumns = [
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <>
    //       <Button
    //         type="link"
    //         onClick={() => {
    //           setSelectedRegion(record);
    //           setEditModalVisible(true);
    //         }}
    //       >
    //         Edit
    //       </Button>
    //       <Button
    //         type="link"
    //         onClick={() => {
    //           setSelectedRegion(record);
    //           setViewModalVisible(true);
    //         }}
    //       >
    //         View
    //       </Button>
    //     </>
    //   ),
    // },
    {
      title: 'Number of Branches',
      dataIndex: 'branches',
      key: 'branches',
      render: branches => branches.length // or JSON.stringify(branches) if needed
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() => handleViewRegion(record)}
            >
              View
            </Menu.Item>
            <Menu.Item
              key="edit"
              icon={<EditOutlined />}
              onClick={() => handleEditRegion(record)}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              key="delete"
              icon={<DeleteOutlined/>}
            >
              <Popconfirm
                title="Are you sure to delete this region?"
                onConfirm={() => handleDeleteRegion(record.id)}
                okText="Yes"
                cancelText="No"
              >
                Delete
              </Popconfirm>
            </Menu.Item>            
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button
              shape="none"
              type="text"
              icon={<MoreOutlined />}
              // style={{ borderColor: "#a855f7", color: "#a855f7" }}
            />
          </Dropdown>
        );
      },
    }
  ];


  const viewLocationPaginate = props.locationPage.fetchedLocation
  const fetchNextPage = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(viewLocationPaginate.page) || 0;
    const itemsPerPage = Number(viewLocationPaginate.count) || 10;
    const totalPages = Number( viewLocationPaginate.total_pages) || 0
    if (!currentPage || (totalPages - currentPage) > 0) {
      const paginationQuery = `&page=${currentPage+1}`;
      props.getLocationsData(clientId, paginationQuery);
    }
  };

  const fetchPrevPage = () => {
    const clientId = props.auth.userData.client_id;
    const currentPage = Number(viewLocationPaginate.page) || 0;
    const itemsPerPage = Number(viewLocationPaginate.count) || 10;
    if (currentPage && currentPage > 1) {
      const paginationQuery = `&page=${currentPage-1}`;
      props.getLocationsData(clientId, paginationQuery);
    }
  };

  const handleMenuClick = () => {
    // setEditLocationModal(true)
    // setviewLocationModal(false)
    setEditRegionsModal(true)
    // setviewRegionsModal(true)
  }
  const handleRegionsMenuClick = () => {
    setEditRegionsModal(true)
    setviewRegionsModal(false)
  }

  const items = [
    {
      label: ' Edit',
      key: '1',
      icon: <EditOutlined />,
      onClick: () => {
        // setClientUserTableData()
        // handleMenuClick()
        setEditRegionsModal(true)
      }
    },
    {
      label: 'View',
      key: '2',
      icon: <EyeOutlined />,
      onClick: () => {
        setviewRegionsModal(true);
      }
    },
  ];
  const itemsRegion = [
    {
      label: ' Edit',
      key: '1',
      icon: <EditOutlined />,
      onClick: () => {
        // setClientUserTableData()
        handleRegionsMenuClick()
      }
    },
    {
      label: 'View',
      key: '2',
      icon: <EyeOutlined />,
      onClick: () => {
        setviewRegionsModal(true);
      }
    },
  ];

  const menuProps = {
    items,
    // onClick: handleMenuClick,
  };
  const menuPropsRegions = {
    itemsRegion,
    // onClick: handleMenuClick,
  };

  const actionColumn = () => ({
    key: 'action',
    title: 'Actions',
    width: '10%',
    dataIndex: 'action',
    render: (_, record) => {
      const menu = (
        <Menu>
          <Menu.Item
            key="edit"
            icon={<EditOutlined />}
            onClick={() => handleClickEditLocation(record)}
          >
            Edit
          </Menu.Item>
          <Menu.Item
            key="view-dashboard"
            icon={<EyeOutlined />}
            onClick={() => handleBranchLogin(record.id)}
          >
            View Branch Dashboard
          </Menu.Item>
        </Menu>
      );

      return (
        <Dropdown overlay={menu} trigger={["click"]}>
          <Button
            shape="none"
            type="text"
            icon={<BsThreeDots />}
            style={{
              color: "#5C12A7",
              width: 44,
              height: 25,
              backgroundColor: "rgba(92, 18, 167, 0.1)",
              borderRadius: 12,
            }}
          />
        </Dropdown>
      );
    }
  });
  const regionActionsColumn = () => ({
    key: 'action',
    title: 'Actions',
    width: '10%',
    dataIndex: 'action',
    render: (_, record) => {
      return (
        <a
          target="_blank"
          onClick={(e) => {
            e.preventDefault();
            // setShowUserBranches(true);
            setRegionsTableData(record);
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
      title: "Region",
      dataIndex: "region",
      render: (value) => <>{value}</>,
      key: "region",
    },
    {
      title: "City",
      dataIndex: "city",
      render: (value) => <>{value}</>,
      key: "city",
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (value) => <>{value}</>,
      key: "address",
    },
    actionColumn()
  ];

  const regiosColumns = [
    {
      title: "Name of regions",
      dataIndex: "region",
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
      key: "region",
      // sorter: (a, b) => a.name.length - b.name.length,
      // sortDirections: ["descend"],
    },
    {
      title: 'Number of Branches',
      dataIndex: 'branches',
      key: 'branches',
      render: branches => branches.length // or JSON.stringify(branches) if needed
    },
    regionActionsColumn()
  ];
  const regionTotalsColumns = [
    {
      title: "Branch Name",
      dataIndex: "region",
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
      key: "region",
      // sorter: (a, b) => a.name.length - b.name.length,
      // sortDirections: ["descend"],
    },
    {
      title: 'Number of Branches',
      dataIndex: 'branches',
      key: 'branches',
      render: branches => branches.length // or JSON.stringify(branches) if needed
    },
    regionActionsColumn()
  ];

  const submitNewLocation = async (values) => {
    const request = await props.addALocation(clientId, values);

    if (request.fulfilled) {
      notification.success({
        message: "Success",
        description: request.data?.message,
      });
      addLocationform.resetFields();
      showLocationList()
    } else {
      notification.error({
        message: "Error",
        description:
          request?.message || 'please try again later'
      });
    }
  };
  const submitNewRegion = async (values) => {
    const request = await props.addARegion(clientId,
      {
        region: values.region
      }
    );

    if (request.fulfilled) {
      notification.success({
        message: "Success",
        description: request.data?.message,
      });
      addRegionform.resetFields();
      showRegionLists();
      setAddRegionsModal(false)
    } else {
      notification.error({
        message: "Error",
        description:
          request?.message || 'please try again later'
      });
    }
  };

  const handleUpdateLocation = async (values) => {
    const request = await props.updateALocation(locationTableData.id,values
    );

    if (request.fulfilled) {
      notification.success({
      message: "Success",
      description: request.data?.message,
    });
      editLocationform.resetFields();
      showLocationList()
      showRegionLists()
      setEditLocationModal(false)
    } else {
      notification.error({
        message: "Error",
        description:
          request?.message || 'please try again later'
      });
    }
  };
  const handleUpdateRegion = async (values) => {
    const request = await props.updateARegion(selectedRegion.id,
      {
        region: values.region
      }
    );

    if (request.fulfilled) {
      notification.success({
      message: "Success",
      description: request.data?.message,
    });
      addRegionform.resetFields();
      setEditModalVisible(false)
      showRegionLists()
      showLocationList()
    } else {
      notification.error({
        message: "Error",
        description:
          request?.message || 'please try again later'
      });
    }
  };

  const onChange = (pagination, filters, sorter, extra) => {
  };

  return (
    <>
      <div className="AppHeader">
        <Typography.Title style={{ fontSize: "30Px", fontWeight: "bold" }}>
          Location
        </Typography.Title>
        {/* Location Button */}
        {/* <Space>
          <div>
            <Button
              style={{ width: "183.68px", height: "46.96px", fontWeight: "bold", borderRadius: "12px", backgroundColor: "#5C12A7", color: "white" }}
              onClick={(e) => {
                e.preventDefault();
                setAddLocationModal(true);
              }}
            >
              <PlusOutlined />
              Add Location
            </Button>
          </div>
        </Space> */}
        {/* <Modal
          visible={addLocationModal}
          title="Add new Location"
          onCancel={() => setAddLocationModal(false)}
          footer={null}
          height={594}
        >
          <Spin
            spinning={false}
          >
            <Form
              form={addLocationform}
              name="basic"
              layout="vertical"
              autoComplete="off"
            onFinish={submitNewLocation}
            >
              <Form.Item
                name="name"
                label="Branch Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="eg; Head Office" />
              </Form.Item>
              <Form.Item
                name="region"
                label="Region"
              >
                <Select
                  mode="single"
                  allowClear
                  style={
                    {
                      background: "#F2F2F8"
                    }
                  }
                  placeholder="Select Region"
                  defaultValue={''}
                  onChange={''}
                  options={regionOptions}
                />
              </Form.Item>
              <Form.Item
                name="city"
                label="City"
              ><Input.TextArea placeholder="eg; Ikeja" />
              </Form.Item>
              <Form.Item
                name="address"
                label="Address"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input.TextArea placeholder="eg; Ebute metaaaa, Lagos-Island" />
              </Form.Item>
              <Form.Item>
                <Button
                  style={{ marginRight: 20, backgroundColor: "#5C12A7", color: "white", height: "40px", borderRadius: "7px", width: "47%" }}
                  // type="primary"
                  htmlType="submit"
                // disabled={!submittable}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </Modal> */}
      </div>
      <div className="##########">
        <section className="total-energy-bar-chart">
          <Table
            className="custom-row-hover"
            rowKey={(record) => record.id}
            loading={props.locationPage.fetchLocationLoading}
            dataSource={data}
            columns={columns}
            onChange={onChange}
            pagination={false}
          />
          <Modal
            // style={{borderRadius: '40px'}}
            visible={editLocationModal}
            title="Edit Location"
            onCancel={() => setEditLocationModal(false)}
            onOk={() => {
            // perform update action here
            setEditLocationModal(false);
          }}
            footer={null}
            // maxWidth={457}
            height={594}
          >
            {/* <div className="table-responsive-wrapper">
              <Table
                // dataSource={seletedBranches}
                // columns={modalColumns}
                pagination={false}
                scroll={{ x: true }}
              />
            </div> */}
            <Spin
              spinning={props.locationPage.updateLocationLoading}
            >
              <Form
                form={editLocationform}
                // name="validateOnly"
                name="basic"
                layout="vertical"
                autoComplete="off"
                onFinish={handleUpdateLocation}
              >
                <Form.Item
                  name="name"
                  label="Branch Name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Head Office" />
                </Form.Item>
                <Form.Item
                  name="region"
                  label="Region"
                // rules={[
                //   {
                //     required: true,
                //   },
                // ]}
                >
                  {/* <Input style={{ fontSize: 16 }} placeholder="Enter email" /> */}
                  <Select
                    mode="single"
                    allowClear
                    style={
                      {
                        // width: "100%",
                        background: "#F2F2F8"
                      }
                    }
                    placeholder="None"
                    // defaultValue={[]}
                    // onChange={handleChange}
                    options={regionOptions}
                  />
                </Form.Item>
                <Form.Item
                  name="city"
                  label="City"
                // rules={[
                //   {
                //     required: true,
                //   },
                // ]}
                >
                  <Input placeholder="eg; Ikeja" />
                </Form.Item>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input.TextArea placeholder="Ebute meta, Lagos-Island" />
                </Form.Item>
                <Form.Item>
                  <SubmitButton form={form} /> <Button
                    style={{ backgroundColor: "#C72525", color: "#fff", height: "40px", borderRadius: "7px", width: "47%" }}
                    type="primary"
                    // htmlType="council"
                    // disabled={!submittable}
                    onClick={() => setEditLocationModal(false)}
                  >
                    Cancel
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Modal>
          <div className="pagination">
            <div>
              <Button onClick={fetchPrevPage}>Previous</Button>
            </div>
            <div>
              <Button onClick={fetchNextPage}>Next</Button>
            </div>
          </div>
          
        </section>
        <div className="AppHeader">
          <Typography.Title style={{ fontSize: "30Px", fontWeight: "bold" }}>
            Regions
          </Typography.Title>
          <Space>
            <div>
              <Button
                style={{ width: "183.68px", height: "46.96px", fontWeight: "bold", borderRadius: "12px", backgroundColor: "#5C12A7", color: "white" }}
                onClick={(e) => {
                  e.preventDefault();
                  setAddRegionsModal(true);
                }}
              >
                <PlusOutlined />
                Add Region
              </Button>
            </div>
          </Space>
          <Modal
            // style={{borderRadius: '40px'}}
            visible={addRegionsModal}
            title="Add new Region"
            onCancel={() => setAddRegionsModal(false)}
            footer={null}
            // maxWidth={457}
            height={594}
          >
            <Spin
              spinning={props.locationPage.addNewRegionLoading}
            >
              <Form
                form={addRegionform}
                // name="validateOnly"
                name="basic"
                layout="vertical"
                autoComplete="off"
                onFinish={submitNewRegion}
              >
                <Form.Item
                  name="region"
                  label="Region Name"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input style={{ fontSize: 16 }} placeholder="e.g; South-East" />
                </Form.Item>
                <Form.Item>
                  <Button
                  style={{ marginRight: 20, backgroundColor: "#5C12A7", color: "white", height: "40px", borderRadius: "7px", width: "47%" }}
                  type="primary"
                  htmlType="submit"
                // disabled={!submittable}
                >
                  Submit
                </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Modal>
        </div>
        {/* <Table
          className="custom-row-hover"
          rowKey={(record) => record.id}
          loading={props.locationPage.fetchLocationLoading}
          dataSource={regionData}
          columns={regionColumns}
          onChange={onChange}
          pagination={false}
        /> */}

        <section className="total-energy-bar-chart" >
          <Table
            className="regions-table"
            rowKey="id"
            dataSource={regionData}
            columns={regionColumns}
            pagination={false}
          />

          {/* Edit Region Modal */}
          <Modal
            title="Edit Region"
            open={editModalVisible}
            onCancel={() => setEditModalVisible(false)}
            footer={null}
          >
            <Spin
              spinning={props.locationPage.updateRegionLoading}
            >
              <Form form={form} layout="vertical" onFinish={handleUpdateRegion}>
                <Form.Item
                  name="region"
                  label="Region Name"
                  rules={[{ required: true, message: "Region name is required" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" type="primary" block>
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Modal>

          {/* View Branches Modal */}
          <Modal
            title="Branches"
            open={viewModalVisible}
            onCancel={() => setViewModalVisible(false)}
            footer={null}
          >
            {selectedRegion?.branches?.length > 0 ? (
              <ul>
                {selectedRegion.branches.map((branch, idx) => (
                  <li key={idx}>{branch.branch_name}</li>
                ))}
              </ul>
            ) : (
              <p>No branches available for this region.</p>
            )}
          </Modal>
        </section>
    
        {/* <Modal
          title="Edit Region"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={() => {
            // perform update action here
            setEditModalVisible(false);
          }}
        >
          <Form
            initialValues={{ region: selectedRegion?.region }}
            onFinish={(values) => {
              // Call API or update state with new region name
              setEditModalVisible(false);
            }}
          >
            <Form.Item name="region" label="Region Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Button htmlType="submit" type="primary">
              Save
            </Button>
          </Form>
        </Modal> */}
        {/* <Modal
          title="View Branches"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
        >
          {selectedRegion?.branches?.length > 0 ? (
            <ul>
              {selectedRegion.branches.map((branch, index) => (
                <li key={index}>{branch}</li>
              ))}
            </ul>
          ) : (
            <p>No branches available.</p>
          )}
        </Modal> */}


        {/* <section className="total-energy-bar-chart">
          <Table
            className="regions-table"
            rowKey={(record) => record.id}
            loading={props.locationPage.fetchLocationLoading}
            dataSource={regionData}
            columns={regiosColumns}
            onChange={onChange}
            pagination={false}
          />
          <Modal
            visible={editRegionsModal}
            title="Edit Region"
            onCancel={() => setEditRegionsModal(false)}
            footer={null}
            width={557}
            height={594}
          >
            <Spin
              spinning={false}
            >
              <Form
                form={form}
                // name="validateOnly"
                name="basic"
                layout="vertical"
                autoComplete="off"
                onFinish={submitNewClientUsers}
              >
                <Form.Item
                  name="branch_name"
                  label="Region"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Head Office" />
                </Form.Item>
                <Form.Item>
                  <SubmitButton form={form} />
                </Form.Item>
              </Form>
            </Spin>
          </Modal>
          <Modal
            visible={viewRegionsModal}
            title="Branches per Region"
            onCancel={() => setviewRegionsModal(false)}
            footer={null}
            width={557}
            height={594}
          >
            <div className="table-responsive-wrapper">
              <Table
                dataSource={regionsTableData}
                columns={modalColumns}
                pagination={false}
                scroll={{ x: true }}
              />
            </div>
          </Modal>
        </section> */}
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getLocationsData,
  addALocation,
  updateALocation,
  getRegionsListData,
  addARegion,
  updateARegion,
  deleteARegion,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  locationPage: state.locationPage
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewLocations);