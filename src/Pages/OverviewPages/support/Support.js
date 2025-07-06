import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Typography, Row, Col, Card, Collapse, Spin, Upload, notification } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { APIService } from '../../../config/Api/apiServices'

const { Title } = Typography
const { TextArea } = Input
const { Panel } = Collapse

const CONTACTS = [
  { label: 'Email', value: 'info@wyreng.com' },
  { label: 'Phone', value: '+234 806 270 1039' },
  { label: 'Address', value: '10A Merret Road, Yaba Lagos, Nigeria' },
]

const Support = () => {
  const [loading, setLoading] = useState(false)
  const [faqs, setFaqs] = useState([])
  const [faqsLoading, setFaqsLoading] = useState(true)
  const [faqsError, setFaqsError] = useState(null)
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('subject', values.subject)
      formData.append('body', values.message)
      
      if (values.attachment) {
        formData.append('attachments', values.attachment[0].originFileObj)
      }

      const response = await APIService.postMultipart('/socials/support-request/', formData)
      
      notification.success({
        message: 'Support Request Sent',
        description: 'Your support request has been submitted successfully. We will get back to you soon.',
      })
      
      // Reset form after successful submission
      form.resetFields()
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to submit support request. Please try again.',
      })
      console.error('Error submitting support request:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await APIService.get('/socials/faqs/')
        setFaqs(response.data)
        setFaqsError(null)
      } catch (error) {
        setFaqsError('Failed to load FAQs')
        console.error('Error fetching FAQs:', error)
      } finally {
        setFaqsLoading(false)
      }
    }
    fetchFaqs()
  }, [])


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
            <Form 
              layout="vertical" 
              form={form}
              onFinish={onFinish}
              encType="multipart/form-data"
            >
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
              <Form.Item
                label="Attachment (Optional)"
                name="attachment"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  name="attachment"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block
                >
                  Send
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 48, marginLeft: 'auto', marginRight: 'auto' }}>
        <Title level={3} style={{ marginBottom: 32 }}>Frequently Asked Questions</Title>
        {faqsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : faqsError ? (
          <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
            {faqsError}
          </div>
        ) : (
          <Collapse accordion>
            {faqs.map((faq) => (
              <Panel header={faq.question} key={faq.id}>
                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </Panel>
            ))}
          </Collapse>
        )}
      </div>
    </div>
  )
}

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e
  }
  return e && e.fileList
}

export default Support

