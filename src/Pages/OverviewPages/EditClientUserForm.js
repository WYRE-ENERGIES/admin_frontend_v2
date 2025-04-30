import { Button, Form, Image, Input, Select, Space, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
// import { EditOutlined } from "@ant-design/icons";
import { connect, useSelector } from "react-redux";
import { addClientUsersData, assignLocation, getClientUsersData, getUserBranchesData, removeClientUsersData, updateClientUsersData } from "../../redux/actions/clientUser/clientUser.action";
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

  useEffect(() => {
    form.setFieldsValue({
      username: props.ClientUserTableData.username,
      email: props.ClientUserTableData.email,
      phone_number: props.ClientUserTableData.phone_number,
    })
    setSelectedLocation(props.ClientUserTableData.branches)
  }, [props.ClientUserTableData])
  console.log('selected location ->>>>', selectedLocation)
  console.log('holdLocationData ->>>>', holdLocationData)

  const options = [];
  useEffect(() => {
    const handleBranch = async () => {
      const userId = props.ClientUserTableData.id
      const requestBranchesData = await props.getLocationsData(clientId)
      // return requestBranchesData
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
    setSelectedLocation(value);
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
        defaultValue={selectedLocation}
        placeholder="Change Location"
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
  const submitUpdateClientUsers = async (values) => {
    const id = props.ClientUserTableData.id
    const {location, ...others } = values;

    const request = await props.updateClientUsersData(clientId, id, others);

    if (request.fulfilled) {
      // convert to numbers


      // selectedLocation -- list of selected data in array of string
      // holdLocationData -- list of all branch in array of object

    // make a filter to return values in the holdLocationData that are not in the selectedLocation

    // const returningIntArray = [2,5]
      // How do you ensure to product an array of numbers here

      // const filteredLocationData = holdLocationData.filter(filtered => selectedLocation.includes(filtered.name))
      const filteredLocationData = holdLocationData.filter(filtered => selectedLocation.includes(filtered.name)).map(data => data.id)
      console.log('filtered data ->>>>', filteredLocationData)

      const assignLocationRequest = await props.assignLocation(
        id,
        { branches: filteredLocationData }
      );
      if (assignLocationRequest.fulfilled) {
        successNotificationPopUp("success", "client user page");
        form.resetFields();
        setSelectedLocation(null)
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
                  label="Updat Location"
                // rules={[
                //   {
                //     required: true,
                //   },
                // ]}
                >
                  <SelectBranch branches={props.ClientUserTableData.branches} />
                </Form.Item>
                <Form.Item>
                  <SubmitButton form={form} />
                </Form.Item>
              </Form>
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
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(EditClientUserForm);
