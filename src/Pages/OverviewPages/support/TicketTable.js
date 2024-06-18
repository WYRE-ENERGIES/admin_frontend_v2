import React, { useEffect } from 'react'
import { Space, Table, Tag, Tooltip } from 'antd'

import { BsDot } from 'react-icons/bs'
import { FaRegQuestionCircle } from 'react-icons/fa'
import Swal from 'sweetalert2'
// import { useDeleteSupportTicketMutation } from '../../../../features/slices/supportSlice'

const getColor = (name) => {
  let color = ''

  switch (name) {
    case 'Pending':
      color = 'warning'
      break
    case 'Resolved':
      color = 'success'
      break
    default:
      color = 'error'
      break
  }

  return color
}

const getPriorityColor = (name) => {
  let color = ''

  switch (name) {
    case 'Urgent':
      color = '#B42318'
      break
    case 'Normal':
      color = '#363F72'
      break
  }

  return color
}

const handleDelete = async (id, cb) => {
  const res = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  })

  if (res.isConfirmed) {
    await cb(id)
  }
}

const TicketTable = ({ onEditTicket, footer, loading, data }) => {
  // const [deleteSupportTicket, {  }] = ''
    // useDeleteSupportTicketMutation()

  // useEffect(() => {
  //   if (isSuccess) {
  //     Swal.fire('Deleted!', 'ticket has been deleted.', 'success')
  //   }
  // }, [isSuccess])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '5%',
      render: (text) => `#${text}`,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Priority',
      key: 'priority',
      dataIndex: 'priority',
      width: '10%',
      render: (text) => {
        const color = getPriorityColor(text)
        return (
          <Tag
            key={text}
            style={{
              backgroundColor: 'white',
              border: `1px solid ${color}`,
              borderRadius: '10px',
              color: color,
            }}
          >
            {text}
          </Tag>
        )
      },
    },
    {
      title: (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Status{' '}
          <Tooltip title="SHS status">
            <FaRegQuestionCircle style={{ marginLeft: 5, color: '#999999' }} />
          </Tooltip>
        </span>
      ),
      key: 'status',
      dataIndex: 'status',
      width: '10%',
      render: (text) => {
        const color = getColor(text)
        return (
          <Tag
            color={color}
            key={text}
            style={{
              borderRadius: '10px',
              paddingLeft: 0,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: 'fit-content',
            }}
          >
            <BsDot size={20} />
            {text}
          </Tag>
        )
      },
    },
    {
      title: '',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Space size="middle">
          <a
            style={{ color: '#737373' }}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </a>
          <a
            style={{ color: '#737373' }}
            onClick={
              record.status !== 'Pending' ? null : () => onEditTicket(record)
            }
          >
            Edit
          </a>
        </Space>
      ),
    },
  ]

  return (
    <Table
      style={{ width: '100%', overflow: 'scroll' }}
      columns={columns}
      dataSource={data}
      footer={footer}
      loading={loading}
      pagination={{
        hideOnSinglePage: true,
      }}
    />
  )
}

export default TicketTable
