import { useState, useEffect, useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button, Input } from "antd"
import { DownloadOutlined, SendOutlined, DownOutlined, ShrinkOutlined } from "@ant-design/icons"



export default function AiChat() {
  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "ai",
      content:
        "Welcome back, chief! Just ran a quick check on your energy habits today and guess what? You're doing great, power use is smooth, no major spikes.",
      timestamp: "12:47 pm",
    },
    {
      id: "2",
      type: "user",
      content: "Is my battery fully charged?",
      timestamp: "12:48 pm",
    },
    {
      id: "3",
      type: "ai",
      content:
        "Your battery is currently at 78%. However, there's a communication issue between the inverter and the battery, so the status might not update in real time.",
      timestamp: "12:48 pm",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const chatRef = useRef(null)
  const widgetRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Small delay to ensure smooth initial animation
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const downloadChatAsPDF = async () => {
    setIsLoading(true);
    setDownloadError(null);

    try {
      // Prevent multiple downloads
      if (isLoading) return;

      // Create a canvas from the chat container
      const canvas = await html2canvas(chatRef.current);
        // Create a new PDF document
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Get the canvas data URL
        const imgData = canvas.toDataURL('image/png');
        
        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', 15, 40, 180, 0);
        
        // Add title
        pdf.setFontSize(20);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Wyre AI Chat History', 105, 30, { align: 'center' });
        
        // Save the PDF
        pdf.save('wyre_ai_chat_history.pdf');
        
        // Reset loading state after a short delay to ensure the download completes
        setTimeout(() => setIsLoading(false), 1000);
    ;
    } catch (error) {
      setDownloadError('Failed to generate PDF. Please try again.');
      setIsLoading(false);
      console.error('Error generating PDF:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Thanks for your question! I'm analyzing your battery and power consumption data. This is a simulated response for demonstration purposes.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestedQuestion = (question) => {
    setInputValue(question)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating AI Button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "40px",
          width: "50px",
          height: "50px",
          backgroundColor: "#5C12A7",
          borderColor: "#5C12A7",
          fontSize: "18px",
          fontWeight: "500",
          zIndex: 40,
          transition: "all 0.3s ease",
          transform: isOpen ? "scale(0)" : "scale(1)",
          opacity: isOpen ? 0 : 1,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        AI
      </Button>
      <Button
        type="primary"
        shape="circle"
        size="large"
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "40px",
          width: "50px",
          height: "50px",
          backgroundColor: "#5C12A7",
          borderColor: "#5C12A7",
          fontSize: "18px",
          fontWeight: "bold",
          zIndex: 40,
          transition: "all 0.3s ease",
          transform: !isOpen ? "scale(0)" : "scale(1)",
          opacity: !isOpen ? 0 : 1,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <DownOutlined />
      </Button>

      {/* Chat Widget */}
      <div
        ref={widgetRef}
        style={{
          position: "fixed",
          bottom: "80px",
          right: "40px",
          width: "420px",
          height: "80%",
          // backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          transition: "all 0.3s ease-in-out",
          zIndex: 50,
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#5C12A7",
            color: "white",
            padding: "12px",
            borderRadius: "8px 8px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Button
              type="text"
              size="small"
              icon={<ShrinkOutlined style={{ fontSize: "20px" }} />}
              onClick={() => setIsOpen(false)}
              style={{
                color: "white",
                border: "none",
                padding: "0",
                width: "24px",
                height: "24px",
                minWidth: "24px",
              }}
            />
            <p
              style={{
                color: "white",
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "0.5px",
              }}
            >
              BATTERY HEALTH & POWER
            </p>
          </div>
          <DownloadOutlined 
            style={{ fontSize: "20px", cursor: "pointer" }} 
            onClick={downloadChatAsPDF}
            disabled={isLoading}
          />
          {downloadError && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>
              {downloadError}
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div
          ref={chatRef}
          style={{
            flex: 1,
            padding: "12px",
            overflowY: "auto",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === "ai" ? (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      backgroundColor: "#5C12A7",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <p style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>AI</p>
                  </div>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "2px 12px",
                      maxWidth: "200px",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                      border: "1px solid #b9b9b9",
                    }}
                  >
                    <p style={{ fontSize: "12px", lineHeight: "1.4", wordBreak: "break-word" }}>
                      {message.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      backgroundColor: "#5C35922B",
                      borderRadius: "8px",
                        padding: "2px 12px",
                        border: "1px solid #b9b9b9",
                      maxWidth: "200px",
                    }}
                  >
                    <p style={{ fontSize: "12px", wordBreak: "break-word" }}>{message.content}</p>
                  </div>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: message.type === "user" ? "flex-end" : "flex-start",
                  marginTop: "4px",
                }}
              >
                <p style={{ color: "#999", fontSize: "10px" }}>{message.timestamp}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  backgroundColor: "#5C12A7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <p style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>AI</p>
              </div>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "8px",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div style={{ display: "flex", gap: "4px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#ccc",
                      borderRadius: "50%",
                      animation: "bounce 1.4s infinite ease-in-out",
                    }}
                  />
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#ccc",
                      borderRadius: "50%",
                      animation: "bounce 1.4s infinite ease-in-out 0.16s",
                    }}
                  />
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#ccc",
                      borderRadius: "50%",
                      animation: "bounce 1.4s infinite ease-in-out 0.32s",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#fafafa",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Button
            size="small"
            onClick={() => handleSuggestedQuestion("Which branch is contributing more to diesel consumption?")}
            style={{
              textAlign: "left",
              height: "auto",
              padding: "8px 12px",
              borderRadius: "16px",
              backgroundColor: "white",
              border: "1px solid #d9d9d9",
              fontSize: "12px",
              color: "#666",
              whiteSpace: "normal",
              lineHeight: "1.3",
            }}
          >
            Which branch is contributing more to diesel consumption?
          </Button>
          <Button
            size="small"
            onClick={() => handleSuggestedQuestion("Average diesel usage?")}
            style={{
              textAlign: "left",
              height: "auto",
              padding: "8px 12px",
              borderRadius: "16px",
              backgroundColor: "white",
              border: "1px solid #d9d9d9",
              fontSize: "12px",
              color: "#666",
              width: "fit-content",
            }}
          >
            Average diesel usage?
          </Button>
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #f0f0f0",
            backgroundColor: "white",
            borderRadius: "0 0 8px 8px",
          }}
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="Ask Wyre AI anything..."
            suffix={
              <Button
                type="primary"
                size="small"
                shape="circle"
                icon={<SendOutlined size={34} />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                style={{
                  // backgroundColor: "#5C12A7",
                  // borderColor: "#5C12A7",
                  width: "34px",
                  height: "34px",
                  minWidth: "34px",
                }}
              />
            }
            style={{
              borderRadius: "20px",
              backgroundColor: "#fafafa",
              fontSize: "12px",
              paddingRight: "4px",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  )
}
