import { Button, Form, Image, Input, Space, Typography, notification } from "antd";
import { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { PercentageOutlined, ClockCircleOutlined, ProjectOutlined, FundOutlined, FundProjectionScreenOutlined, FieldTimeOutlined, MoneyCollectOutlined, MoneyCollectFilled } from "@ant-design/icons";
import { getTargetData, updateTargetData } from "../../redux/actions/target/target.action";

const successNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Client User Udded',
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
      style={{ backgroundColor: "#5C12A7", color: "white", width: "40%" }}
      type="primary"
      htmlType="submit"
      disabled={!submittable}
    >
      Save Changes
    </Button>
  );
};

function EditTarget(props, switchTarget, setSwitchTarget) {
  const [form] = Form.useForm();
  console.log('Switch-Target-Value in ediTarget------------', switchTarget);

  // const { Search } = Input;
  
  const showTargetInfo = () => {
    const clientId = props.auth.userData.client_id
    props.getTargetData(clientId);
  }
  
  const clientId = props.auth.userData.client_id
  const submitEditTargetInfo = async (values ) => {
    const payloadValues= {
      ...values,
      client: clientId
    }
    console.log('Payload-Values------------', payloadValues);
    // setSwitchTarget(false)
    const request = await props.updateTargetData(clientId, payloadValues);

    if (request.fulfilled) {
      successNotificationPopUp('success', 'Target page')
      // form.resetFields();
      // return showTargetInfo();
    }
    return errorNotificationPopUp('error', 'Target page')  
  };

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('paramssssssssssssssssss->>>>>>>', pagination, filters, sorter, extra);
  };

  useEffect(() => {
    showTargetInfo()
  }, [])

  useEffect(() => {
    // if (switchTarget) {
    // }
    form.setFieldsValue({
      blended_cost_of_energy: props.targetPage.fetchedTarget.blended_cost_of_energy,
      diesel_usage_accuracy: props.targetPage.fetchedTarget.diesel_usage_accuracy,
      utility_usage_accuracy: props.targetPage.fetchedTarget.utility_usage_accuracy,
      maximum_monthly_deviation_hours: props.targetPage.fetchedTarget.maximum_monthly_deviation_hours,
      papr: props.targetPage.fetchedTarget.papr,
      fuel_efficiency: props.targetPage.fetchedTarget.fuel_efficiency,
      generator_size_efficiency_1: props.targetPage.fetchedTarget.generator_size_efficiency_1,
      generator_size_efficiency_2: props.targetPage.fetchedTarget.generator_size_efficiency_2,
      generator_size_efficiency_3: props.targetPage.fetchedTarget.generator_size_efficiency_3,
    })
  }, [props.targetPage])

  return (
    <>
    {/* {switchTarget ? 
    }   */}
      <div className="set_target_page">
        <Form
          form={form}
          // name="validateOnly"
          name="basic"
          layout="vertical"
          autoComplete="off"
          onFinish={submitEditTargetInfo}
        >
          <div style={{ width: "842", display: "flex", marginBottom: '24px' }}>
            <div style={{ width: "405px", height: "82px", marginRight:"16px" }}>
              <Form.Item
                name="blended_cost_of_energy"
                label="Blended cost of energy"
              >
                <Input
                  style={{height: '52px'}}
                  height= '52px'
                  placeholder="enter cost"
                  prefix={<FundOutlined />}
                />
              </Form.Item>
            </div>
            <div style={{ width: "405px", height: "82px", marginLeft: "16px" }}>
              <Form.Item
                name="diesel_usage_accuracy"
                label="Usage accuracy diesel"
              >
                <Input
                  style={{height: '52px'}}
                  placeholder="enter percentage"
                  prefix={<PercentageOutlined />}
                />
              </Form.Item>
            </div>
          </div>
          <div style={{ width: "842", display: "flex", marginBottom: '24px' }}>
            <div style={{ width: "405px", height: "82px", marginRight:"16px" }}>
              <Form.Item
                name="utility_usage_accuracy"
                label="Usage accuracy utility"
              >
                <Input
                  style={{height: '52px'}}
                  placeholder="enter percentage"
                  prefix={<PercentageOutlined />}
                />
              </Form.Item>
            </div>
            <div style={{ width: "405px", height: "82px", marginLeft: "16px" }}>
              <Form.Item
                name="maximum_monthly_deviation_hours"
                label="Maximum Deviation hours (Month)"
              >
                <Input
                  style={{height: '52px'}}
                  placeholder="enter time"
                  prefix={<ClockCircleOutlined />}
                />
              </Form.Item>
            </div>
          </div>
          <div style={{ width: "842", display: "flex", marginBottom: '24px' }}>
            <div style={{ width: "405px", height: "82px", marginRight:"16px" }}>
              <Form.Item
                name="papr"
                label="PAPR"
              >
                <Input
                  style={{height: '52px'}}
                  placeholder="enter PAPR"
                  prefix={<ProjectOutlined />}
                />
              </Form.Item>
            </div>
            <div style={{ width: "405px", height: "82px", marginLeft: "16px" }}>
              <Form.Item
                name="fuel_efficiency"
                label="Fuel efficiency kWh/L"
              >
                <Input
                  style={{height: '52px'}}
                  placeholder="enter fuel efficiency"
                  prefix={<ProjectOutlined />}
                />
              </Form.Item>
            </div>
          </div>
          <div>
            <p>Generator Size Efficiency</p>
          </div>
          <div style={{ width: "842", display: "flex", marginBottom: '40px' }}>
            <div style={{ width: "270px", height: "82px", marginRight:"8px" }}>
              <Form.Item
                name="generator_size_efficiency_1"
                label="Generator 1"
              >
                <Input
                  style={{height: '52px'}}
                  placeholder="Enter efficiency"
                />
              </Form.Item>
            </div>
            <div style={{ width: "270px", height: "82px", marginRight: "8px", marginLeft: "8px" }}>
              <Form.Item
                name="generator_size_efficiency_2"
                label="Generator 2"
              >
                <Input
                  style={{height: '52px'}}
                  placeholder="Enter efficiency"
                />
              </Form.Item>
            </div>
            <div style={{ width: "270px", height: "82px", marginLeft: "8px" }}>
              <Form.Item
                name="generator_size_efficiency_3"
                label="Generator 3"
              >
                <Input
                  style={{height: '52px'}}
                  placeholder="Enter efficiency"
                />
              </Form.Item>
            </div>
          </div>
          <Form.Item>
            <SubmitButton form={form} />
          </Form.Item>
        </Form>
      </div> : 'NOTING'
    </>
  );
}

const mapDispatchToProps = {
  updateTargetData,
  getTargetData,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  targetPage: state.targetPage,
});

export default connect(mapStateToProps, mapDispatchToProps)(EditTarget);