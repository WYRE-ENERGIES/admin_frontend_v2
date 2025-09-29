import { Button, Form, Image, Input, Select, Spin, notification } from "antd";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { addClientUsersData, assignLocation, getClientUsersData, getUserBranchesData } from "../../redux/actions/clientUser/clientUser.action"; 
import { getLocationsData } from "../../redux/actions/location/location.action";
import { getAllRoles } from "../../redux/actions/auth/auth.action";

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
      style={{ backgroundColor: "#5C12A7", color: "white", height:"40px", borderRadius:"7px", width: "100%" }}
      type="primary"
      htmlType="submit"
      // disabled={!submittable}
    >
      Add User
    </Button>
  );
};

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
  },[])
  useEffect(() => {
    const handleRoles = async () => {
      const requestRolesData = await props.getAllRoles()
      if (requestRolesData.fulfilled) {
        // setHoldRolesData(requestRolesData.data)
      }
    }
    handleRoles()
  },[])
  useEffect(() => {
    if (props.auth.fetchedRoles) {
      setHoldRolesData(props.auth.fetchedRoles)
    }
  },[props.auth.fetchedRoles])

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
    .map(([label, value]) => ({
      label,
      value
    }));
  // const options_roles = Object.entries(holdRolesData).map(([label, value]) => ({
  //   label,
  //   value
  // }));

  const assignLocationToUser = async (value) => {
    const userId = clientId
    const callSelectionApi = await props.assignLocation(userId,value)
    return callSelectionApi
  }

  const handleChange = (value) => {
  };
  
  
  const showclientUsersList = () => {
    const clientId = props.auth.userData.client_id
    props.getClientUsersData(clientId);
  }
  const submitNewClientUsers = async (values) => {  
    const {location, ...others } = values;
    const createUserRequest = await props.addClientUsersData(clientId, others);
    if (createUserRequest.fulfilled) {
      const assignLocationRequest = await props.assignLocation(
        createUserRequest.data.id,
        { user: createUserRequest.data.id, add: location }
      );
      if (assignLocationRequest.fulfilled) {
        // successNotificationPopUp("success", "client user page");
        notification.success({
          message: "Success",
          description: createUserRequest.data?.message,
        });
        form.resetFields();
        return showclientUsersList();
      }
    } else {
      notification.error({
        message: "Error",
        description:
          createUserRequest?.message?.username || 'please try again later'
      });
    }
    // return errorNotificationPopUp('error', 'client user page')  
  };
  


  return (
    <>
      <div id="add-user" className="percentage_container">
        <div className="sidePage-add-user-container">
          <div className="sidePage-add-user">
            <p className="user-form-heading">Add User</p>
            <div className="user-center-image">
              <Image src="/Images/Group 1688.png"></Image>
            </div>
            <Spin
              spinning={props.clientUsersPage.newClientUserLoading}
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
                  name="username"
                  label="Username"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="JohnDoe" />
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
                  <Input placeholder="example@gmail.com" />
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
                  <Input placeholder="+234 080 224 554 41" />
                </Form.Item>
                <Form.Item
                  name="location"
                  label="Assign Location"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  {/* <Input /> */}
                  {/* <SelectBranch /> */}
                  <Select
                    mode="multiple"
                    allowClear
                    style={
                      {
                        // width: "100%",
                        background: "#F2F2F8"
                      }
                    }
                    placeholder="Add Location"
                    // defaultValue={["AdeolaHopewell", "Agodi"]}
                    onChange={handleChange}
                    options={options}
                  />
                </Form.Item>
                <Form.Item
                  name="roles"
                  label="Assign Role"
                rules={[
                  {
                    required: true,
                  },
                ]}
                >
                  {/* <Input /> */}
                  {/* <SelectBranch /> */}
                  <Select
                    mode="single"
                    allowClear
                    style={
                      {
                        // width: "100%",
                        background: "#F2F2F8"
                      }
                    }
                    placeholder="Add Role"
                    // defaultValue={["AdeolaHopewell", "Agodi"]}
                    onChange={handleChange}
                    options={options_roles}
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
    </>
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
