import { Button, Form, Image, Input, Select, Space, Spin, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
// import { EditOutlined } from "@ant-design/icons";
import { connect, useSelector } from "react-redux";
import { addClientUsersData, assignLocation, getClientUsersData, getUserBranchesData, getViewUserBranchesData, removeClientUsersData, updateClientUsersData } from "../../redux/actions/clientUser/clientUser.action";
import AddClientUserForm from "./AddClientUserForm";
import { getLocationsData } from "../../redux/actions/location/location.action";

const successNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Client User Updated',
    description: `Your update to the ${formName} has been successfully submitted`,
  });
};
const errorNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Failed',
    description: `Your update to the ${formName} failed, please try again later`,
  });
};
const NotAllowedNotification = () => {
  notification.error({
    message: 'Request Error',
    description: 'NOT ALLOWED',
    duration: 5
  })
}

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
      style={{ backgroundColor: "#5C12A7", color: "white", height: "40px", borderRadius: "7px", width: "100%" }}
      type="primary"
      htmlType="submit"
    // disabled={!submittable}
    >
      Save
    </Button>
  );
};

function EditClientUserForm(props) {
  const [form] = Form.useForm();
  const [holdLocationData, setHoldLocationData] = useState([])
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [newLocation, setNewLocation] = useState([]);
  const [addedLocations, setAddedLocations] = useState([]);
  const [removedLocations, setRemovedLocations] = useState([]);

  useEffect(() => {
    form.setFieldsValue({
      username: props.ClientUserTableData.username,
      email: props.ClientUserTableData.email,
      phone_number: props.ClientUserTableData.phone_number,
    })
    setSelectedLocation(props.ClientUserTableData.branches)
    setNewLocation(props.ClientUserTableData.branches)
  }, [props.ClientUserTableData])

  const options = [];
  useEffect(() => {
    const handleBranch = async () => {
      const requestBranchesData = await props.getLocationsData(clientId)
      if (requestBranchesData.fulfilled) {
        // return requestBranchesData.data.data
        setHoldLocationData(requestBranchesData.data.results)
      }
    }
    handleBranch()
  }, [props.ClientUserTableData.id])

  if (holdLocationData) {
    // options = branches[eachBranch];
    holdLocationData.map((location) => {
      options.push({
        label: location.name,
        value: location.name,
        key: location.id,
      })
    })

  }

  const handleChange = (value) => {
    const newSelections = value.filter(branch => !selectedLocation.includes(branch));
    const removedSelections = selectedLocation.filter(branch => !value.includes(branch))
    setAddedLocations(newSelections)
    setRemovedLocations(removedSelections)
    setNewLocation(value);
  };

  const SelectBranch = () => {
    return (
      <Select
        mode="multiple"
        allowClear
        style={{
          // width: "100%",
          background: "#F2F2F8"
        }}
        defaultValue={newLocation}
        // placeholder="Change Location"
        // defaultValue={[]}
        onChange={handleChange}
        options={options}
      />
    );
  }

  dayjs.extend(customParseFormat);
  const showclientUsersList = () => {
    const clientId = props.auth.userData.client_id
    props.getClientUsersData(clientId);
  }
  const clientId = props.auth.userData.client_id
  
  const getAddedId = holdLocationData.filter(location => addedLocations.includes(location.name)).map(filtered => filtered.id)
  const getRemovedId = holdLocationData.filter(location => removedLocations.includes(location.name)).map(filtered => filtered.id)

  const submitUpdateClientUsers = async (values) => {
    const id = props.ClientUserTableData.id
    const {location, ...others } = values;
    const request = await props.updateClientUsersData(clientId, id, others);
    if (request.fulfilled) {
      const assignLocationRequest = await props.assignLocation(
        id,
        {user: id, add: getAddedId, remove: getRemovedId}
      );
      if (assignLocationRequest.fulfilled) {
        successNotificationPopUp("success", "client user page");
        form.resetFields(); 
        setNewLocation(null)
        props.getViewUserBranchesData(props.ClientUserTableData.id)
        return showclientUsersList();
      }else{
        successNotificationPopUp('error', 'error assigning user to branch');
        form.resetFields();
        return showclientUsersList()
      }

    }
      errorNotificationPopUp('error', 'client user page')
  };

  return (
    <>
      {props.showEditForm ? (
        <div className="percentage_container">
          <div className="sidePage-add-user-container">
            <div className="sidePage-add-user">
              <p className="user-form-heading">Edit User</p>
              <div className="user-center-image">
                <Image src="/Images/Group 1688.png"></Image>
              </div>
              <Spin
                spinning={props.clientUsersPage.updateClientUserLoading}
              >
                <Form
                  form={form}
                  // name="validateOnly"
                  name="basic"
                  layout="vertical"
                  autoComplete="off"
                  onFinish={submitUpdateClientUsers}
                >
                  <Form.Item
                    name="username"
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
                    name="phone_number"
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
                    name="location"
                    label="Update Location"
                  // rules={[
                  //   {
                  //     required: true,
                  //   },
                  // ]}
                  >
                    <SelectBranch branches={props.ClientUserTableData.branches} />
                  </Form.Item>
                  <Form.Item
                    name="role"
                    label="Update Role"
                  // rules={[
                  //   {
                  //     required: true,
                  //   },
                  // ]}
                  >
                    <Select
                    mode="single"
                    allowClear
                    style={
                      {
                        // width: "100%",
                        background: "#F2F2F8"
                      }
                    }
                    placeholder="Change Role"
                    // defaultValue={["AdeolaHopewell", "Agodi"]}
                    onChange={handleChange}
                    options={[]}
                  />
                  </Form.Item>
                  <Form.Item>
                    <SubmitButton form={form} />
                  </Form.Item>
                </Form>
              </Spin>
            </div>
          </div>
        </div>
      ) : (
        <AddClientUserForm />
      )}
    </>
  );
}

const mapDispatchToProps = {
  getClientUsersData,
  getLocationsData,
  getUserBranchesData,
  updateClientUsersData,
  assignLocation,
  getViewUserBranchesData
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(EditClientUserForm);
