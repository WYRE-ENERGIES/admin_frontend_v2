import { Button, Form, Image, Input, notification } from "antd";
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { addClientUsersData, getClientUsersData } from "../../redux/actions/clientUser/clientUser.action"; 

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
      style={{ backgroundColor: "#5C12A7", color: "white", width: "100%" }}
      type="primary"
      htmlType="submit"
      disabled={!submittable}
    >
      Submit
    </Button>
  );
};

function AddClientUserForm(props) {
  const [form] = Form.useForm();

  // const { Search } = Input;
  
  const showclientUsersList = () => {
    const clientId = props.auth.userData.client_id
    props.getClientUsersData(clientId);
  }
  const clientId = props.auth.userData.client_id
  const submitNewClientUsers = async (values) => {
    const request = await props.addClientUsersData(clientId, values);

    if (request.fulfilled) {
      successNotificationPopUp('success', 'client user page')
      form.resetFields();
      return showclientUsersList();
    }
    return errorNotificationPopUp('error', 'client user page')  
  };

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  return (
    <>
    <div className="percentage_container">
      <div className="sidePage-add-user-container">
        <div className="sidePage-add-user">
          <h3>Add User</h3>
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
    </>
  );
}

const mapDispatchToProps = {
  addClientUsersData,
  getClientUsersData,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  clientUsersPage: state.clientUsersPage
});

export default connect(mapStateToProps, mapDispatchToProps)(AddClientUserForm);
