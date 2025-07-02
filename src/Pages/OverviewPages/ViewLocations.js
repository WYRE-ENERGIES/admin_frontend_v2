import { Button, DatePicker, Dropdown, Form, Image, Input, Modal, Space, Spin, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { getLocationsData } from "../../redux/actions/location/location.action";
import { EditOutlined, EyeOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { BsThreeDots } from "react-icons/bs";

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
        style={{ marginRight:20, backgroundColor: "white", color: "black", height: "40px", borderRadius: "7px", width: "20%" }}
        type="primary"
        htmlType="submit"
      // disabled={!submittable}
      >
        Done
      </Button>
      <Button
        style={{ backgroundColor: "red", color: "black", height: "40px", borderRadius: "7px", width: "20%" }}
        type="primary"
        htmlType="submit"
      // disabled={!submittable}
      >
        Remove
      </Button>
    </>
  );
};

function ViewLocations(props) {
  const [dieselDataTable, setDieselDataTable] = useState({})
  const [showEditForm, setShowEditForm] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showRegionsModal, setShowRegionsModal] = useState(false)
  const [locationTableData, setlocationTableData] = useState(false)
  const [regionsTableData, setRegionsTableData] = useState(false)
  const [form] = Form.useForm();

  const { Search } = Input;
  
  dayjs.extend(customParseFormat);
  const dateFormat = 'DD/MM/YYYY';
  const { RangePicker } = DatePicker;

  const showLocationList = () => {
    const clientId = props.auth.userData.client_id
    props.getLocationsData(clientId);
  }

  const onSelectDateLocation = (date) => {
    const clientId = props.auth.userData.client_id
    const date1 = dayjs(date[0]).format("DD-MM-YYYY HH:mm");
    const date2 = dayjs(date[1]).format("DD-MM-YYYY HH:mm");
    props.getLocationsData(clientId, date1, date2)
  }

  useEffect(() => {
    showLocationList()
  }, [])

  const data = props.locationPage.fetchedLocation.results
  const regionsData = [
    {
      region: 'North',
      no_of_branches: 10,
    },
    {
      region: 'Central',
      no_of_branches: 15,
    },
    {
      region: 'West',
      no_of_branches: 10,
    },
    {
      region: 'East',
      no_of_branches: 15,
    },
  ]

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
      setShowLocationModal(true)
      setShowRegionsModal(true)
      setShowEditForm(false)
    }

  const items = [
    {
      label: ' Edit',
      key: '1',
      icon: <EditOutlined />,
      onClick: () => {
        // setClientUserTableData()
        handleMenuClick()
      }
    },
    {
      label: 'View',
      key: '2',
      icon: <EyeOutlined />,
      onClick: () => {
        setShowEditForm(true);
      }
    },
  ];

  const menuProps = {
    items,
    // onClick: handleMenuClick,
  };

  const actionColumn = () => ({
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
            setlocationTableData(record);
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
      dataIndex: "current_month_consumption_in_litres",
      render: (value) => <>{}</>,
      key: "current_month_consumption_in_litres",
    },
    {
      title: "City",
      dataIndex: "remaining_diesel_litres",
      render: (value) => <>{}</>,
      key: "remaining_diesel_litres",
    },
    {
      title: "Address",
      dataIndex: "remaining_diesel_litres",
      render: (value) => <>{}</>,
      key: "remaining_diesel_litres",
    },
    actionColumn()
  ];

  const regiosColumns = [
    {
      title: "Region",
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
      title: "Number of branches",
      dataIndex: "no_of_branches",
      render: (value) => <>{value}</>,
      key: "no_of_branches",
    },
    actionColumn()
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="AppHeader">
        <Typography.Title style={{ fontSize: "30Px", fontWeight: "bold" }}>
          Location
        </Typography.Title>
        {/* <Space>
          <RangePicker
            style={{
              width: 264.29,
              height: 41.19,
              borderRadius: 11,
            }}
            defaultValue={[
              dayjs().startOf('month'),
              dayjs()
            ]}
            format={dateFormat}
            // onChange={onSelectDateDieselOverview}
          />
        </Space> */}
        <Space>
          <div>
            <Button
              style={{ width: "183.68px", height: "46.96px", fontWeight: "bold", borderRadius: "12px", backgroundColor: "#5C12A7", color: "white" }}
              onClick={(e) => {
                e.preventDefault();
                // setShowAddButton(true);
                // setShowEditForm(false);
              }}
            >
              <PlusOutlined />
              Add
            </Button>
          </div>
        </Space>
      </div>
      <div className="##########">
        <section className="total-energy-bar-chart">
          <Table
            className="custom-row-hover"
            // onRow={(record, index) => ({
            //   onClick: (event) => {
            //     window.location.href = `${window.location.href}/branch?ee=${record.id}`;
            //   },
            // })}
            // rowKey="id"
            rowKey={(record) => record.id}
            loading={props.locationPage.fetchLocationLoading}
            dataSource={data}
            columns={columns}
            onChange={onChange}
            pagination={false}
          />
          <div className="pagination">
            <div>
              <Button onClick={fetchPrevPage}>Previous</Button>
            </div>
            <div>
              <Button onClick={fetchNextPage}>Next</Button>
            </div>
          </div>
          <Modal
            // style={{borderRadius: '40px'}}
            visible={showLocationModal}
            title="Edit Location Data"
            onCancel={() => setShowLocationModal(false)}
            footer={null}
            width={857}
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
              // spinning={props.clientUsersPage.newClientUserLoading}
            >
              <Form
                form={form}
                // name="validateOnly"
                name="basic"
                layout="vertical"
                autoComplete="off"
                // onFinish={submitNewClientUsers}
              >
                <Form.Item
                  name="branch_name"
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
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Central" />
                </Form.Item>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Ebute meta" />
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
                  <Input placeholder="Ebute meta, Lagos-Island" />
                </Form.Item>
                <Form.Item>
                  <SubmitButton form={form} />
                </Form.Item>
              </Form>
            </Spin>
          </Modal>
          <Table
            className="regions-table"
            // onRow={(record, index) => ({
            //   onClick: (event) => {
            //     window.location.href = `${window.location.href}/branch?ee=${record.id}`;
            //   },
            // })}
            // rowKey="id"
            rowKey={(record) => record.id}
            loading={props.locationPage.fetchLocationLoading}
            dataSource={regionsData}
            columns={regiosColumns}
            onChange={onChange}
            pagination={false}
          />
          <Modal
            // style={{borderRadius: '40px'}}
            visible={showRegionsModal}
            title="Edit Region"
            onCancel={() => setShowRegionsModal(false)}
            footer={null}
            width={557}
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
              // spinning={props.clientUsersPage.newClientUserLoading}
            >
              <Form
                form={form}
                // name="validateOnly"
                name="basic"
                layout="vertical"
                autoComplete="off"
                // onFinish={submitNewClientUsers}
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
                <Form.Item
                  name="no_of_region"
                  label="Number of Regions"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="10" />
                </Form.Item>
                <Form.Item>
                  <SubmitButton form={form} />
                </Form.Item>
              </Form>
            </Spin>
          </Modal>
        </section>
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getLocationsData
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  locationPage: state.locationPage
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewLocations);