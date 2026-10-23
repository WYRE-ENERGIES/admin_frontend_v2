import { Button, Form, Image, Input, Select, Spin, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { assignLocation, getClientUsersData, getUserBranchesData, getViewUserBranchesData, updateClientUsersData } from "../../redux/actions/clientUser/clientUser.action";
import { getLocationsData } from "../../redux/actions/location/location.action";
import { getAllRoles } from "../../redux/actions/auth/auth.action";

const successNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Client User Updated',
    description: `Your update to the ${formName} has been successfully submitted`,
  });
};

const formatServerError = (error) => {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error.detail) return typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
  const fieldMessages = [];
  for (const [, messages] of Object.entries(error)) {
    if (Array.isArray(messages)) {
      fieldMessages.push(messages.join(' '));
    } else if (typeof messages === 'string') {
      fieldMessages.push(messages);
    }
  }
  if (fieldMessages.length) return fieldMessages.join(' ');
  return null;
};

const errorNotificationPopUp = (type, formName, serverError) => {
  const description = formatServerError(serverError) || `Your update to the ${formName} failed, please try again later`;
  notification[type]({
    message: 'Failed',
    description,
  });
};

function EditClientUserForm(props) {
  const [form] = Form.useForm();
  const [holdLocationData, setHoldLocationData] = useState([])
  const [holdRolesData, setHoldRolesData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [newLocation, setNewLocation] = useState([]);
  const [addedLocations, setAddedLocations] = useState([]);
  const [removedLocations, setRemovedLocations] = useState([]);
  const clientId = props.auth.userData.client_id

  dayjs.extend(customParseFormat);

  useEffect(() => {
    if (props.ClientUserTableData) {
      form.setFieldsValue({
        username: props.ClientUserTableData.username,
        email: props.ClientUserTableData.email,
        phone_number: props.ClientUserTableData.phone_number,
      })
      setSelectedLocation(props.ClientUserTableData.branches)
      setNewLocation(props.ClientUserTableData.branches)
      setSelectedRoles(props.ClientUserTableData.roles)
    }
  }, [props.ClientUserTableData])

  useEffect(() => {
    const handleBranch = async () => {
      const requestBranchesData = await props.getLocationsData(clientId)
      if (requestBranchesData.fulfilled) {
        setHoldLocationData(requestBranchesData.data.results)
      }
    }
    handleBranch()
  }, [props.ClientUserTableData.id])

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
    holdLocationData.map((location) => {
      options.push({
        label: location.name,
        value: location.name,
        key: location.id,
      })
    })
  }

  const excludedRoles = ['SUPERADMIN', 'CLIENT_ADMIN'];
  const options_roles = Object.entries(holdRolesData)
    .filter(([key]) => !excludedRoles.includes(key))
    .map(([label, value]) => ({ label, value }));

  const handleChange = (value) => {
    const newSelections = value.filter(branch => !selectedLocation.includes(branch));
    const removedSelections = selectedLocation.filter(branch => !value.includes(branch))
    setAddedLocations(newSelections)
    setRemovedLocations(removedSelections)
    setNewLocation(value);
  };

  const SelectBranch = () => (
    <Select
      mode="multiple"
      allowClear
      style={{ background: "#F2F2F8" }}
      defaultValue={newLocation}
      onChange={handleChange}
      options={options}
    />
  );

  const showclientUsersList = () => {
    props.getClientUsersData(props.auth.userData.client_id);
  }
  
  const getAddedId = holdLocationData.filter(location => addedLocations.includes(location.name)).map(filtered => filtered.id)
  const getRemovedId = holdLocationData.filter(location => removedLocations.includes(location.name)).map(filtered => filtered.id)

  const submitUpdateClientUsers = async (values) => {
    const id = props.ClientUserTableData.id
    const { location, ...others } = values;
    const request = await props.updateClientUsersData(clientId, id, others);
    if (request.fulfilled) {
      const assignLocationRequest = await props.assignLocation(
        id,
        { user: id, add: getAddedId, remove: getRemovedId }
      );
      if (assignLocationRequest.fulfilled) {
        successNotificationPopUp("success", "client user page");
        form.resetFields(); 
        setNewLocation(null)
        setSelectedRoles(null)
        props.getViewUserBranchesData(props.ClientUserTableData.id)
        showclientUsersList();
        if (props.onSuccess) props.onSuccess();
      } else {
        successNotificationPopUp('error', 'error assigning user to branch');
        form.resetFields();
        showclientUsersList()
      }
    } else {
      errorNotificationPopUp('error', 'client user page', request.error);
    }
  };

  return (
    <div className="user-form-modal-content">
      <p className="user-form-heading">Edit User</p>
      <div className="user-center-image">
        <Image src="/Images/Group 1688.png" preview={false} />
      </div>
      <Spin spinning={props.clientUsersPage.updateClientUserLoading}>
        <Form
          form={form}
          name="editUserForm"
          layout="vertical"
          autoComplete="off"
          onFinish={submitUpdateClientUsers}
        >
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Update Location">
            <SelectBranch branches={props.ClientUserTableData.branches} />
          </Form.Item>
          <Form.Item name="roles" label="Update Role">
            <Select
              mode="single"
              allowClear
              style={{ background: "#F2F2F8" }}
              placeholder="Change Role"
              defaultValue={selectedRoles}
              options={options_roles}
            />
          </Form.Item>
          <Form.Item>
            <Button className="user-form-submit-btn" type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
}

const mapDispatchToProps = {
  getClientUsersData,
  getLocationsData,
  getUserBranchesData,
  updateClientUsersData,
  assignLocation,
  getViewUserBranchesData,
  getAllRoles
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(EditClientUserForm);
