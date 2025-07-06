import React, { useState } from 'react'
import { Form, Input, Button, Typography, message, Row, Col, Card, Collapse } from 'antd'

const { Title } = Typography
const { TextArea } = Input
const { Panel } = Collapse

const CONTACTS = [
  { label: 'Email', value: 'hello@wyreng.com' },
  { label: 'Phone', value: '070-----***' },
  { label: 'Address', value: '123 Wyre Street, Lagos, Nigeria' },
]

const FAQS = [
  {
    question: 'How do I contact support?',
    answer: 'You can fill out the form or email us at hello@wyreng.com.'
  },
  {
    question: 'How long does it take to get a response?',
    answer: 'We aim to respond to all queries within 24 hours.'
  },
  {
    question: 'Can I call support?',
    answer: 'Yes, you can call us at 070-----***.'
  }
]

const Support = () => {
  const [loading, setLoading] = useState(false)

  const onFinish = (values) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      message.success('Your message has been sent!')
    }, 1000)
  }

  return (
    <div style={{ margin: '0 auto', padding: 24 }}>
      <Title level={2} style={{ marginBottom: 32 }}>Support</Title>
      <Row gutter={[32, 32]} justify="center" align="top">
        <Col xs={24} md={10}>
          <Card title="Contact Details" bordered={false} style={{ minHeight: 220 }}>
            {CONTACTS.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 16 }}>
                <strong>{item.label}:</strong>
                <div style={{ color: '#555', marginTop: 2 }}>{item.value}</div>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card bordered={false} style={{ minHeight: 220 }}>
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: 'Please enter a subject' }]}
              >
                <Input placeholder="Enter subject" />
              </Form.Item>
              <Form.Item
                label="Message"
                name="message"
                rules={[{ required: true, message: 'Please enter your message' }]}
              >
                <TextArea rows={5} placeholder="Enter your message" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Send
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 48, marginLeft: 'auto', marginRight: 'auto' }}>
           <Title level={3} style={{ marginBottom: 32 }}>Frequently Asked Questions</Title>
        <Collapse accordion>
          {FAQS.map((faq, idx) => (
            <Panel header={faq.question} key={idx}>
              <div style={{ color: '#555' }}>{faq.answer}</div>
            </Panel>
          ))}
        </Collapse>
      </div>
    </div>
  )
}

export default Support

