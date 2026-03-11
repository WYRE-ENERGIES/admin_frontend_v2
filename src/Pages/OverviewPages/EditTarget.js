import { Button, Form, Input, InputNumber, Popconfirm, Spin, notification } from "antd";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { PercentageOutlined, ClockCircleOutlined, ProjectOutlined, FundOutlined } from "@ant-design/icons";
import { getTargetData, resetTargetData, updateTargetData } from "../../redux/actions/target/target.action";

const successNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Target Updated',
    description: `Your update to the ${formName} has been successfully submitted`,
  });
};
const resetSuccessNotification = (type, formName) => {
  notification[type]({
    message: 'Target Reset',
    description: `Your Target values have now been reset`,
  });
};
const errorNotificationPopUp = (type, formName) => {
  notification[type]({
    message: 'Failed',
    description: `Your update to the ${formName} failed, please try again later`,
  });
};
const resetErrorNotification = (type, formName) => {
  notification[type]({
    message: 'Failed',
    description: `Your Target values can not be reset at the moment, please try again later`,
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
      Update Changes
    </Button>
  );
};

function EditTarget(props) {
  const [form] = Form.useForm();
  
  const showTargetInfo = () => {
    const clientId = props.auth.userData.client_id
    props.getTargetData(clientId);
  }
  
  const clientId = props.auth.userData.client_id
  const submitEditTargetInfo = async (values) => {
    const payloadValues = {
      ...values,
      total_monthly_cost: values.total_monthly_cost != null ? Number(values.total_monthly_cost) : values.total_monthly_cost,
      client: clientId,
    };
    const request = await props.updateTargetData(clientId, payloadValues);

    if (request.fulfilled) {
      successNotificationPopUp('success', 'Target page')
      return showTargetInfo();
    }
    return errorNotificationPopUp('error', 'Target page')  
  };

  const submitResetTargetInfo = async (values) => {
    const payloadValues = {
      ...values,
      total_monthly_cost: values.total_monthly_cost != null ? Number(values.total_monthly_cost) : values.total_monthly_cost,
      client: clientId,
    };
    const request = await props.resetTargetData(clientId, payloadValues);

    if (request.fulfilled) {
      resetSuccessNotification('success', 'Target page')
      form.resetFields();
      return showTargetInfo();
    }
    return resetErrorNotification('error', 'Target page')  
  };

  useEffect(() => {
    form.setFieldsValue({
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
  }, [props.targetPage])

  const formatTotalMonthlyCost = (value) =>
    value != null && value !== "" ? Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "";
  const parseTotalMonthlyCost = (value) =>
    value === "" || value == null ? undefined : parseFloat(String(value).replace(/,/g, "")) || undefined;

  const maxLengthCheck = (object) => {
    let showString = 'Digit can not be more than 1'
    if (object > 1) {
      return alert(showString)
    }
  }

  const onChange = (value) => {};

  return (
    <div className="set_target_page">
      <Spin spinning={props.targetPage.updateTargetLoading}>
        <Form
          form={form}
          name="basic"
          layout="vertical"
          autoComplete="off"
          onFinish={submitEditTargetInfo}
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
                  type="number"
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
                  type="number"
                  className="set-target-input"
                  placeholder="enter percentage"
                  prefix={<PercentageOutlined />}
                />
              </Form.Item>
            </div>
            <div className="set-target-field">
              <Form.Item name="utility_usage_accuracy" label="Usage accuracy utility">
                <Input
                  type="number"
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
                  type="number"
                  className="set-target-input"
                  placeholder="enter time"
                  prefix={<ClockCircleOutlined />}
                />
              </Form.Item>
            </div>
            <div className="set-target-field">
              <Form.Item name="papr" label="PAPR">
                <InputNumber
                  type="number"
                  className="set-target-input"
                  min="0"
                  max="1"
                  step="0.01"
                  onInput={maxLengthCheck}
                  onKeyDown={(evt) => evt.key === 'e' && evt.preventDefault()}
                  onChange={onChange}
                  stringMode
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
                  type="number"
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
                <Input
                  className="set-target-input"
                  placeholder="Enter efficiency"
                  count={{ show: true, max: 10 }}
                />
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
            <div className="set-target-actions">
              <SubmitButton form={form} />
              <Popconfirm
                title="Are you sure you want to reset your target?"
                onConfirm={() => submitResetTargetInfo()}
              >
                <Button className="set-target-reset-btn">
                  Reset
                </Button>
              </Popconfirm>
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  );
}

const mapDispatchToProps = {
  updateTargetData,
  getTargetData,
  resetTargetData
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  targetPage: state.targetPage,
});

export default connect(mapStateToProps, mapDispatchToProps)(EditTarget);
