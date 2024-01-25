import { Button, Form, Image, Input, Space, Table, Typography } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
// import { EditOutlined } from "@ant-design/icons";
import { connect, useSelector } from "react-redux";
import { getClientUsersData } from "../../redux/actions/clientUser/clientUser.action";

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
    <Button
      style={{ backgroundColor: "#5C12A7", color: "white", width: "100%" }}
      type="primary"
      htmlType="submit"
      disabled={!submittable}
    >
      {/* Submit */}
      Save
    </Button>
  );
};

function ClientUsers(props) {
  const [form] = Form.useForm();

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
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: () => {
        return (
          <Typography.Link disabled={''} onClick={() => ''}>
            Edit
          </Typography.Link>
        );
      },
    }
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="AppHeader">
        <Typography.Title>Client Users</Typography.Title>
      </div>
      <div className="AppHeader">
        <Search
          placeholder="Search by name"
          style={{
            width: 170,
          }}
        />
        <Space>
          <div>
            <Button style={{ backgroundColor: "#5C12A7", color: "white" }}>
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
                loading={props.clientUsersPage.fetchClientUserLoading}
                dataSource={data}
                columns={columns}
                onChange={onChange}
                pagination={false}
              />
            </div>
            <div className="sidePage-add-user-container">
              <div className="sidePage-add-user">
                <h3>Edit User</h3>
                <div className="user-center-image">
                  <Image src="/Images/Group 1688.png"></Image>
                </div>
                <Form
                  form={form}
                  name="validateOnly"
                  layout="vertical"
                  autoComplete="off"
                >
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="phone number"
                    label="Phone Number"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="assign location"
                    label="Assign Location"
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item>
                      <SubmitButton form={form} />
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const mapDispatchToProps = {
  getClientUsersData,
};

const mapStateToProps = (state) => ({
  overviewPage: state.overviewPage,
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(ClientUsers);
