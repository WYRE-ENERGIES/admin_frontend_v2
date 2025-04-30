import { Button, Form, Image, Input, Select, notification } from "antd";
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { addClientUsersData, assignLocation, getClientUsersData, getUserBranchesData } from "../../redux/actions/clientUser/clientUser.action"; 
import { getLocationsData } from "../../redux/actions/location/location.action";

const successNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Client User Added',
    description: `Your addition to the ${formName} has been successfully created`,
  });
};
const errorNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Failed',
    description: `Your addition to the ${formName} failed, please try again later`,
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

  useEffect(() => {
  },[])

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
  // const submitNewClientUsers = async (values) => {
  //   const {location, ...others } = values;
  //   const createUserRequest = await props.addClientUsersData(clientId, others);

  //   if (createUserRequest.fulfilled) {
  //     // after the request has been created,
  //     // call the endpoint to assing user
  //     const assignLocationRequest = await props.assignLocation(
  //       createUserRequest.data.id,
  //       {branches: location}
  //     );
  //     if (assignLocationRequest.fulfilled) {
  //       successNotificationPopUp("success", "client user page");
  //       form.resetFields();
  //       return showclientUsersList();
  //     }

      
  //   }
  //   return errorNotificationPopUp('error', 'client user page')  
  // };

  const submitNewClientUsers = async (values) => {
    const {location, ...others } = values;
    // const createUserRequest = await props.addClientUsersData(clientId, others);
    console.log('Assign Location data ---> ', {add: location});

    // if (createUserRequest.fulfilled) {
      // after the request has been created,
      // call the endpoint to assing user

      // const assignLocationRequest = await props.assignLocation(
      //   createUserRequest.data.id,
      //   {branches: location}
      // );
      // if (assignLocationRequest.fulfilled) {
      //   successNotificationPopUp("success", "client user page");
      //   form.resetFields();
      //   return showclientUsersList();
      // }

      
    // }
    // return errorNotificationPopUp('error', 'client user page')  
  };

  const onChange = (pagination, filters, sorter, extra) => {
    // console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
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
                label="Name"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder="John Doe"/>
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
                <Input placeholder="example@gmail.com"/>
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
                <Input placeholder="+234 080 224 554 41"/>
              </Form.Item>
              <Form.Item
                name="location"
                label="Assign Location"
                // rules={[
                //   {
                //     required: true,
                //   },
                // ]}
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
              <Form.Item>
                <SubmitButton form={form} />
              </Form.Item>
            </Form>
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
  assignLocation
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(AddClientUserForm);
