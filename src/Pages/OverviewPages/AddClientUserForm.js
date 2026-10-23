import { Button, Form, Image, Input, Select, Spin, notification } from "antd";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { addClientUsersData, assignLocation, getClientUsersData, getUserBranchesData } from "../../redux/actions/clientUser/clientUser.action"; 
import { getLocationsData } from "../../redux/actions/location/location.action";
import { getAllRoles } from "../../redux/actions/auth/auth.action";

function AddClientUserForm(props) {
  const [form] = Form.useForm();
  const [holdLocationData, setHoldLocationData] = useState([]);
  const [holdRolesData, setHoldRolesData] = useState([]);
  const clientId = props.auth.userData.client_id

  useEffect(() => {
    const handleBranch = async () => {
      const requestBranchesData = await props.getLocationsData(clientId)
      if (requestBranchesData.fulfilled) {
        setHoldLocationData(requestBranchesData.data.results)
      }
    }
    handleBranch()
  }, [])

  useEffect(() => {
    const handleRoles = async () => {
      await props.getAllRoles()
    }
    handleRoles()
  }, [])

  useEffect(() => {
    if (props.auth.fetchedRoles) {
      setHoldRolesData(props.auth.fetchedRoles)
    }
  }, [props.auth.fetchedRoles])

  const options = [];
  if (holdLocationData) {
    holdLocationData.map((locationData) => {
      options.push({
        label: locationData.name,
        value: locationData.id,
        key: locationData.id,
      });
    })
  }

  const excludedRoles = ['SUPERADMIN', 'CLIENT_ADMIN'];
  const options_roles = Object.entries(holdRolesData)
    .filter(([key]) => !excludedRoles.includes(key))
    .map(([label, value]) => ({ label, value }));

  const showclientUsersList = () => {
    const clientId = props.auth.userData.client_id
    props.getClientUsersData(clientId);
  }

  const submitNewClientUsers = async (values) => {  
    const { location, ...others } = values;
    const createUserRequest = await props.addClientUsersData(clientId, others);
    if (createUserRequest.fulfilled) {
      const assignLocationRequest = await props.assignLocation(
        createUserRequest.data.id,
        { user: createUserRequest.data.id, add: location }
      );
      if (assignLocationRequest.fulfilled) {
        notification.success({
          message: "Success",
          description: createUserRequest.data?.message,
        });
        form.resetFields();
        showclientUsersList();
        if (props.onSuccess) props.onSuccess();
      }
    } else {
      notification.error({
        message: "Error",
        description: createUserRequest?.message?.username || 'please try again later'
      });
    }
  };

  return (
    <div className="user-form-modal-content">
      <p className="user-form-heading">Add User</p>
      <div className="user-center-image">
        <Image src="/Images/Group 1688.png" preview={false} />
      </div>
      <Spin spinning={props.clientUsersPage.newClientUserLoading}>
        <Form
          form={form}
          name="addUserForm"
          layout="vertical"
          autoComplete="off"
          onFinish={submitNewClientUsers}
        >
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input placeholder="JohnDoe" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input placeholder="example@gmail.com" />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true }]}>
            <Input placeholder="+234 080 224 554 41" />
          </Form.Item>
          <Form.Item name="location" label="Assign Location" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              allowClear
              style={{ background: "#F2F2F8" }}
              placeholder="Add Location"
              options={options}
            />
          </Form.Item>
          <Form.Item name="roles" label="Assign Role" rules={[{ required: true }]}>
            <Select
              mode="single"
              allowClear
              style={{ background: "#F2F2F8" }}
              placeholder="Add Role"
              options={options_roles}
            />
          </Form.Item>
          <Form.Item>
            <Button className="user-form-submit-btn" type="primary" htmlType="submit">
              Add User
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
}

const mapDispatchToProps = {
  addClientUsersData,
  getClientUsersData,
  getUserBranchesData,
  getLocationsData,
  assignLocation,
  getAllRoles
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(AddClientUserForm);
