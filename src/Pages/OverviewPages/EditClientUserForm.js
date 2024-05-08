import { Button, Form, Image, Input, Space, Table, Typography, notification } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
// import { EditOutlined } from "@ant-design/icons";
import { connect, useSelector } from "react-redux";
import { addClientUsersData, getClientUsersData, removeClientUsersData, updateClientUsersData } from "../../redux/actions/clientUser/clientUser.action"; 
import AddClientUserForm from "./AddClientUserForm";

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
      style={{ backgroundColor: "#5C12A7", color: "white", width: "100%" }}
      type="primary"
      htmlType="submit"
      disabled={!submittable}
    >
      Save
    </Button>
  );
};

function EditClientUserForm(props) {
  const [form] = Form.useForm();

  const { Search } = Input;

  useEffect(() => {
    form.setFieldsValue({
      username: props.ClientUserTableData.username,
      email: props.ClientUserTableData.email,
      phone_number: props.ClientUserTableData.phone_number,
    })
  }, [props.ClientUserTableData])
  console.log("user-Id = ", props.ClientUserTableData.id);
  
  dayjs.extend(customParseFormat);
  const showclientUsersList = () => {
    const clientId = props.auth.userData.client_id
    props.getClientUsersData(clientId);
  }
  const clientId = props.auth.userData.client_id
  const submitUpdateClientUsers = async (values) => {
    const id = props.ClientUserTableData.id
    const request = await props.updateClientUsersData(clientId, id, values);

    if (request.fulfilled) {
      successNotificationPopUp('success', 'client user page');
      form.resetFields();
      return showclientUsersList()
    }
      errorNotificationPopUp('error', 'client user page')
      // form.resetFields()
    
    
  };

  return (
    <>
      {props.showEditForm ? (
        <div className="percentage_container">
          <div className="sidePage-add-user-container">
            <div className="sidePage-add-user">
              <h3>Edit User</h3>
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
      ) : (
        <AddClientUserForm />
      )}
    </>
  );
}

const mapDispatchToProps = {
  getClientUsersData,
  updateClientUsersData,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(EditClientUserForm);
