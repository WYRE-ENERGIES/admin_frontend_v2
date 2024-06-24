import { Button, Divider, Form, Input, Modal, Select, Typography } from 'antd'
import React, { Suspense, lazy, useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import TotalEnergyChart from '../TotalEnergyChart'
// import {
//   useCreateSupportTicketMutation,
//   useUpdateSupportTicketMutation,
// } from '../../../../features/slices/supportSlice'

// import { ReactComponent as TicketIcon } from '../../../../assets/ticket-icon.svg'
// import classes from './TicketForm.module.scss'
// import { getItemFromLocalStorage } from '../../../../utils/helpers'
// import { useListClientShsDevicesQuery } from '../../../../features/slices/allShsSlice'

const ButtonLoader = lazy(() =>
  import('./ButtonLoader'),
)
const { Option } = Select
const { TextArea } = Input
const { Text, Title } = Typography

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
}

export const getItemFromLocalStorage = (key, ttl) => {
  const item = JSON.parse(localStorage.getItem(key))

  if (!item || (ttl && ttl !== item?.ttl)) {
    removeItemFromLocalStorage(key)
    return null
  }
  return item
}

export const removeItemFromLocalStorage = (key) => localStorage.removeItem(key)

const ModalForm = ({ toggleModal, ticketData }) => {
  const [shsDevices, setShsDevices] = useState([])
  const [currentClient, setCurrentClient] = useState()

  const { isFetching: shsLoading, data: shsData } =
    TotalEnergyChart()

  const [createSupportTicket, { isLoading, isSuccess, isError }] =
    TotalEnergyChart()

  const [
    updateSupportTicket,
    {
      isLoading: isUpdating,
      isSuccess: isUpdateSuccess,
      isError: isisUpdateError,
    },
  ] = TotalEnergyChart()

  const [form] = Form.useForm()
  const onFinish = (values) => {
    if (ticketData.id) {
      updateSupportTicket({
        data: { ...values, client: currentClient },
        id: ticketData.id,
      })
    } else {
      createSupportTicket({ ...values, client: currentClient })
    }
  }

  useEffect(() => {
    if (isLoading || isUpdating) return

    if (isSuccess || isUpdateSuccess) {
      toast.success(ticketData.id ? 'Ticket Updated' : 'Ticket created', {
        hideProgressBar: true,
        autoClose: 1000,
        theme: 'colored',
      })

      toast.onChange((e) => {
        if (e.status === 'removed') {
          toggleModal()
          form.resetFields()
        }
      })
    }
  }, [
    isLoading,
    isSuccess,
    isUpdating,
    isUpdateSuccess,
    form,
    ticketData,
    toggleModal,
  ])

  useEffect(() => {
    if (shsLoading) return

    if (shsData?.length) {
      setShsDevices(
        shsData.map(({ id, name }) => (
          <Option key={id} value={id}>
            {name}
          </Option>
        )),
      )
    }
  }, [shsLoading, shsData])

  useEffect(() => {
    const currentClient = getItemFromLocalStorage('current_client')
    setCurrentClient(currentClient)
  }, [])

  return (
    <Form
      {...layout}
      name="support"
      className={TicketForm}
      form={form}
      onFinish={onFinish}
      initialValues={ticketData}
      requiredMark="optional"
    >
      <Divider />
      <Form.Item
        name="subject"
        label="Subject"
        labelAlign="left"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input
          placeholder="Enter Subject"
          className={''}
        />
      </Form.Item>
      <Form.Item
        name="priority"
        label="Priority"
        labelAlign="left"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          placeholder="Select Priority"
          className={''}
          allowClear
        >
          <Option value="Normal">Normal</Option>
          <Option value="Urgent">Urgent</Option>
        </Select>
      </Form.Item>
      <Form.Item name="shs" label="SHS" labelAlign="left">
        <Select
          placeholder="Select SHS"
          className={''}
          allowClear
        >
          {shsDevices}
        </Select>
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        labelAlign="left"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Enter a description..."
          className={''}
        />
      </Form.Item>
      <Divider />
      <div className={''}>
        <Button
          className={''}
          type="default"
          onClick={toggleModal}
        >
          Cancel
        </Button>
        <Suspense>
          <Button className={''} htmlType="submit">
            {isLoading ? <ButtonLoader color="#fff" /> : 'Submit'}
          </Button>
        </Suspense>
      </div>
      <ToastContainer />
    </Form>
  )
}

const TicketForm = ({ title, isOpen, toggleModal, ticketData }) => {
  return (
    <Modal
      title={
        <div className={''}>
          <div>
            <span style={{ marginRight: '16px' }} />
          </div>
          <div>
            <Title
              level={5}
              className={''}
              style={{ marginTop: 4 }}
            >
              {title}
            </Title>
            <Text type="secondary" className={''}>
              Submit a ticket for any issues you are experiencing
            </Text>
          </div>
        </div>
      }
      centered
      open={isOpen}
      onOk={toggleModal}
      onCancel={toggleModal}
      width={688}
      footer={null}
    >
      <ModalForm
        title={title}
        toggleModal={toggleModal}
        ticketData={ticketData}
      />
    </Modal>
  )
}

export default TicketForm
