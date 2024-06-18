import { LoadingOutlined } from '@ant-design/icons'
import React from 'react'
import { Spin } from 'antd'

const antIcon = (
  <LoadingOutlined
    style={{
      fontSize: 24,
    }}
    spin
  />
)

const ButtonLoader = ({ color }) => {
  return <Spin indicator={antIcon} style={{ color }} />
}

export default ButtonLoader
