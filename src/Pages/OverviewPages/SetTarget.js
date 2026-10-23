import { Button, Form, Input, InputNumber, Spin, Typography, notification } from "antd";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { PercentageOutlined, ClockCircleOutlined, FundOutlined, ProjectOutlined } from "@ant-design/icons";
import { getTargetData, setTargetData } from "../../redux/actions/target/target.action";
import EditTarget from "./EditTarget";

const successNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Target Added',
    description: `Your addition to the ${formName} has been successfully created`,
  });
};
const errorNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Failed',
    description: `Your addition to the ${formName} failed, please try again later`,
  });
};

const SubmitButton = ({ form }) => {
  const [submittable, setSubmittable] = useState(false);

  const values = Form.useWatch([], form);
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(
        () => setSubmittable(true),
        () => setSubmittable(false),
      );
  }, [values]);
  return (
    <Button
      className="set-target-submit-btn"
      type="primary"
      htmlType="submit"
      disabled={!submittable}
    >
      Save Changes
    </Button>
  );
};

function SetTarget(props) {
  const [form] = Form.useForm();
  const [switchTarget, setSwitchTarget] = useState(false)
  
  const showTargetInfo = () => {
    const clientId = props.auth.userData.client_id
    props.getTargetData(clientId);
  }
  
  const clientId = props.auth.userData.client_id

  const formatTotalMonthlyCost = (value) =>
    value != null && value !== "" ? Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "";
  const parseTotalMonthlyCost = (value) =>
    value === "" || value == null ? undefined : parseFloat(String(value).replace(/,/g, "")) || undefined;

  const submitSetTargetInfo = async (values) => {
    const payloadValues = {
      ...values,
      total_monthly_cost: values.total_monthly_cost != null ? Number(values.total_monthly_cost) : values.total_monthly_cost,
      client: clientId,
    };
    const request = await props.setTargetData(clientId, payloadValues);

    if (request.fulfilled) {
      successNotificationPopUp('success', 'Target page')
      setSwitchTarget(true)
      return showTargetInfo();
    }
    return errorNotificationPopUp('error', 'Target page')  
  };

  useEffect(() => {
    showTargetInfo()
  }, [])

  const holdFormValues = form.setFieldsValue({
    blended_cost_of_energy: props.targetPage.fetchedTarget.blended_cost_of_energy,
    diesel_usage_accuracy: props.targetPage.fetchedTarget.diesel_usage_accuracy,
    utility_usage_accuracy: props.targetPage.fetchedTarget.utility_usage_accuracy,
    maximum_monthly_deviation_hours: props.targetPage.fetchedTarget.maximum_monthly_deviation_hours,
    total_monthly_cost: props.targetPage.fetchedTarget.total_monthly_cost,
    papr: props.targetPage.fetchedTarget.papr,
    fuel_efficiency: props.targetPage.fetchedTarget.fuel_efficiency,
    generator_size_efficiency_1: props.targetPage.fetchedTarget.generator_size_efficiency_1,
    generator_size_efficiency_2: props.targetPage.fetchedTarget.generator_size_efficiency_2,
    generator_size_efficiency_3: props.targetPage.fetchedTarget.generator_size_efficiency_3,
  })

  useEffect(() => {
    if (holdFormValues) {
    }
    setSwitchTarget(true)
  }, [props.targetPage])

  return (
    <>
      <div className="AppHeader">
        <Typography.Title style={{ fontSize: "30px", fontWeight: "bold" }}>
          Set Target
        </Typography.Title>
      </div>
      {props.targetPage.fetchedTarget ? (
        <EditTarget />
      ) : (
        <div className="set_target_page">
          <Spin spinning={props.targetPage.addTargetLoading}>
            <Form
              form={form}
              name="basic"
              layout="vertical"
              autoComplete="off"
              onFinish={submitSetTargetInfo}
            >
              <div className="set-target-row">
                <div className="set-target-field">
                  <Form.Item name="total_monthly_cost" label="Total monthly cost">
                    <InputNumber
                      className="set-target-input"
                      placeholder="enter total monthly cost"
                      prefix={<FundOutlined />}
                      formatter={formatTotalMonthlyCost}
                      parser={parseTotalMonthlyCost}
                      min={0}
                    />
                  </Form.Item>
                </div>
                <div className="set-target-field">
                  <Form.Item name="blended_cost_of_energy" label="Blended cost of energy">
                    <Input
                      className="set-target-input"
                      placeholder="enter cost"
                      prefix={<FundOutlined />}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="set-target-row">
                <div className="set-target-field">
                  <Form.Item name="diesel_usage_accuracy" label="Usage accuracy diesel">
                    <Input
                      className="set-target-input"
                      placeholder="enter percentage"
                      prefix={<PercentageOutlined />}
                    />
                  </Form.Item>
                </div>
                <div className="set-target-field">
                  <Form.Item name="utility_usage_accuracy" label="Usage accuracy utility">
                    <Input
                      className="set-target-input"
                      placeholder="enter percentage"
                      prefix={<PercentageOutlined />}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="set-target-row">
                <div className="set-target-field">
                  <Form.Item name="maximum_monthly_deviation_hours" label="Maximum Deviation hours (Month)">
                    <Input
                      className="set-target-input"
                      placeholder="enter time"
                      prefix={<ClockCircleOutlined />}
                    />
                  </Form.Item>
                </div>
                <div className="set-target-field">
                  <Form.Item name="papr" label="PAPR">
                    <Input
                      className="set-target-input"
                      placeholder="enter PAPR"
                      prefix={<ProjectOutlined />}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="set-target-row">
                <div className="set-target-field">
                  <Form.Item name="fuel_efficiency" label="Fuel efficiency kWh/L">
                    <Input
                      className="set-target-input"
                      placeholder="enter fuel efficiency"
                      prefix={<ProjectOutlined />}
                    />
                  </Form.Item>
                </div>
                <div className="set-target-field set-target-field--empty" />
              </div>

              <p className="set-target-section-label">Generator Size Efficiency</p>

              <div className="set-target-row set-target-row--generators">
                <div className="set-target-field">
                  <Form.Item name="generator_size_efficiency_1" label="Generator 1">
                    <Input className="set-target-input" placeholder="Enter efficiency" />
                  </Form.Item>
                </div>
                <div className="set-target-field">
                  <Form.Item name="generator_size_efficiency_2" label="Generator 2">
                    <Input className="set-target-input" placeholder="Enter efficiency" />
                  </Form.Item>
                </div>
                <div className="set-target-field">
                  <Form.Item name="generator_size_efficiency_3" label="Generator 3">
                    <Input className="set-target-input" placeholder="Enter efficiency" />
                  </Form.Item>
                </div>
              </div>

              <Form.Item>
                <SubmitButton form={form} />
              </Form.Item>
            </Form>
          </Spin>
        </div>
      )}
    </>
  );
}

const mapDispatchToProps = {
  setTargetData,
  getTargetData,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  targetPage: state.targetPage,
});

export default connect(mapStateToProps, mapDispatchToProps)(SetTarget);
