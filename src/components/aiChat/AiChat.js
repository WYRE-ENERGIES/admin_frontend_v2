import { useState, useEffect, useRef, useMemo } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button, Input } from "antd";
import { DownloadOutlined, SendOutlined, DownOutlined, ShrinkOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { APIService } from "../../config/Api/apiServices";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function stripMarkdownArtifacts(raw) {
  if (!raw || typeof raw !== "string") return "";
  let text = raw;
  text = text.replace(/<br\s*\/?>\s*-\s*/gi, "\n- ");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/^(#{1,6})\s*<\/?strong>/gm, "$1 ");
  text = text.replace(/<\/?strong>/gi, "**");
  text = text.replace(/<\/?em>/gi, "*");
  text = text.replace(/<p>(.*?)<\/p>/gis, "$1\n\n");
  return text.trim();
}

function AiMessageContent({ html }) {
  const markdown = useMemo(() => stripMarkdownArtifacts(html), [html]);
  const clean = useMemo(() => DOMPurify.sanitize(markdown, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u", "a",
      "ul", "ol", "li", "h1", "h2", "h3", "h4",
      "table", "thead", "tbody", "tr", "th", "td",
      "code", "pre", "blockquote", "hr", "span", "div", "sub", "sup",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "title", "class"],
  }), [markdown]);

  return (
    <div className="wyre-ai-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          table: ({ children, ...props }) => (
            <div className="wyre-ai-table-wrap">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {clean}
      </ReactMarkdown>
    </div>
  );
}

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "ai",
      content:
        "Hello 👋, I'm here to help you with any questions you may have on your Admin Dashboard",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    // {
    //   id: "2",
    //   type: "user",
    //   content: "Is my battery fully charged?",
    //   timestamp: "12:48 pm",
    // },
    // {
    //   id: "3",
    //   type: "ai",
    //   content:
    //     "Your battery is currently at 78%. However, there's a communication issue between the inverter and the battery, so the status might not update in real time.",
    //   timestamp: "12:48 pm",
    // },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [topic, setTopic] = useState(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "What is my total energy usage?",
    "Which branch is contributing more to diesel consumption?",
    "Show total cost breakdown by branch for last month",
  ]);
  const [promptsVersion, setPromptsVersion] = useState(0);
  const chatRef = useRef(null);
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your AI chat session will be lost.';
      return 'Are you sure you want to leave? Your AI chat session will be lost.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const downloadChatAsPDF = async () => {
    setIsLoading(true);
    setIsDownloading(true);
    setDownloadError(null);
    
    try {
      if (isLoading) return;
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const chatElement = chatRef.current;
      const originalStyle = {
        overflowY: chatElement.style.overflowY,
        height: chatElement.style.height,
      };

      // Temporarily set the chat container to display all content
      chatElement.style.overflowY = 'visible';
      chatElement.style.height = 'auto';

      // Create canvas with full scroll height
      const canvas = await html2canvas(chatElement, {
        scale: 2,
        height: chatElement.scrollHeight,
        width: chatElement.offsetWidth,
        scrollX: 0,
        scrollY: 0,
      });

      // Restore original styles
      chatElement.style.overflowY = originalStyle.overflowY;
      chatElement.style.height = originalStyle.height;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const titleHeight = 20;
      const usablePageHeight = pageHeight - margin - titleHeight;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfImgWidth = pageWidth - 2 * margin;
      const pixelsPerMm = imgWidth / pdfImgWidth;

      // Add title on first page
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      const pdfTitle = topic ? `Wyre AI • ${topic}` : 'Wyre AI Chat';
      pdf.text(pdfTitle, pageWidth / 2, margin + 10, { align: 'center' });

      // Paginate content
      let yOffset = 0;
      let pageCount = 1;

      while (yOffset < imgHeight) {
        if (pageCount > 1) {
          pdf.addPage();
          pdf.setFontSize(20);
          pdf.setTextColor(0, 0, 0);
        }

        // Create a temporary canvas for cropping
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imgWidth;
        tempCanvas.height = Math.min(usablePageHeight * pixelsPerMm, imgHeight - yOffset);

        // Draw the cropped portion
        tempCtx.drawImage(canvas, 0, yOffset, imgWidth, tempCanvas.height, 0, 0, imgWidth, tempCanvas.height);
        const croppedImgData = tempCanvas.toDataURL('image/png');

        // Add cropped image to PDF
        const croppedImgHeight = tempCanvas.height / pixelsPerMm;
        pdf.addImage(croppedImgData, 'PNG', margin, margin + titleHeight, pdfImgWidth, croppedImgHeight);

        yOffset += usablePageHeight * pixelsPerMm;
        pageCount++;
      }

      pdf.save('wyre_ai_chat_history.pdf');
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      setDownloadError('Failed to generate PDF. Please try again.');
      setIsLoading(false);
      console.error('Error generating PDF:', error);
    } finally
    {
      setIsDownloading(false)
    }
  };
  

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const question = inputValue;
    setInputValue("");
    await sendQuestion(question);
  };

  const handleSuggestedQuestion = (question) => {
    sendQuestion(question);
  };

  const sendQuestion = async (question) => {
    const trimmed = (question || '').trim();
    if (!trimmed) return;

    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    try {
      const response = await APIService.post("/api/v1/chatbot/chat/client/", { question: trimmed, session_id: sessionId });
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.data.data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const responseData = response?.data?.data || {};
      setSessionId(responseData.session_id);
      if (!topic && responseData.topic) {
        setTopic(responseData.topic);
      }
      if (Array.isArray(responseData.suggested_prompts) && responseData.suggested_prompts.length > 0) {
        setSuggestedPrompts(responseData.suggested_prompts);
        setPromptsVersion((v) => v + 1);
      }
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    }
  };

  return (
    <>
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
     <img src="/icon/wyre-ai-logo.svg" alt="Wyre Ai Logo" style={{ width: "30px", height: "30px" }} />
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

      <div
        ref={widgetRef}
        style={{
          position: "fixed",
          bottom: "80px",
          right: "40px",
          width: "420px",
          height: "80%",
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
                fontWeight: 550,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}
            >
              {topic || 'Wyre AI Dashboard Assistant'}
            </p>
          </div>
          <Button 
          type="text" 
          size="small" 
          icon={<DownloadOutlined style={{ fontSize: "20px" }} />} 
            onClick={downloadChatAsPDF}
            style={{
                color: "#fff",
              }}
            disabled={isLoading || messages.length < 2}
          />
          {downloadError && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>
              {downloadError}
            </div>
          )}
        </div>

        <div
          ref={chatRef}
          style={{
            flex: 1,
            padding: "12px",
            overflowY: "auto",
            backgroundColor: !isDownloading ? "rgb(247,235,251, 0.5)" : "white",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {!isDownloading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <p style={{ fontSize: "14px", fontWeight: 550, letterSpacing: "0.5px", color: "gray" }}>Wyre AI Chat</p>
            <p style={{ fontSize: "12px", fontWeight: 500, letterSpacing: "0.5px", color: "gray", marginTop: "-8px" }}>
              <InfoCircleOutlined style={{ fontSize: "12px", marginRight: "6px" }} />
              Please Ask Questions Related to Wyre
            </p>
          </div>
          )}
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
                  <img src="/icon/wyre-ai-logo.svg" alt="Wyre Ai Logo" style={{ width: "15px", height: "15px" }} />
                  </div>
                  <div className="wyre-ai-bubble wyre-ai-bubble--ai">
                    <AiMessageContent html={message.content} />
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div className="wyre-ai-bubble wyre-ai-bubble--user">
                    <AiMessageContent html={message.content} />
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
                <span style={{ color: "#999", fontSize: "10px" }}>{message.timestamp}</span>
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
                 <img src="/icon/wyre-ai-logo.svg" alt="Wyre Ai Logo" style={{ width: "15px", height: "15px" }} />
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

        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "rgb(247,235,251, 0.5)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid #d9d9d9",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {suggestedPrompts.map((prompt, index) => (
            <Button
              key={`${prompt}-${index}-${promptsVersion}`}
              size="small"
              onClick={() => !isTyping && handleSuggestedQuestion(prompt)}
              disabled={isTyping}
              style={{
                textAlign: "left",
                height: "auto",
                padding: "8px 12px",
                borderRadius: "16px",
                backgroundColor: isTyping ? "#f5f5f5" : "white",
                border: "1px solid #d9d9d9",
                fontSize: "12px",
                color: isTyping ? "#ccc" : "#666",
                whiteSpace: "normal",
                lineHeight: "1.3",
                width: "fit-content",
                opacity: 0,
                animation: "fadeInUp 280ms ease-out forwards",
                animationDelay: `${index * 80}ms`,
                cursor: isTyping ? "not-allowed" : "pointer",
              }}
            >
              {prompt}
            </Button>
          ))}
        </div>

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
            onChange={(e) => !isTyping && setInputValue(e.target.value)}
            onPressEnter={!isTyping ? handleSendMessage : undefined}
            placeholder={isTyping ? "Wyre AI is responding..." : "Ask Wyre AI anything..."}
            disabled={isTyping}
            suffix={
              <Button
                type="primary"
                size="small"
                shape="circle"
                icon={<SendOutlined size={34} />}
                onClick={!isTyping ? handleSendMessage : undefined}
                disabled={!inputValue.trim() || isTyping}
                style={{
                  width: "34px",
                  height: "34px",
                  minWidth: "34px",
                  opacity: isTyping ? 0.5 : 1,
                }}
              />
            }
            style={{
              borderRadius: "20px",
              backgroundColor: isTyping ? "#f0f0f0" : "#fafafa",
              fontSize: "12px",
              paddingRight: "4px",
              cursor: isTyping ? "not-allowed" : "text",
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .wyre-ai-bubble {
          border-radius: 10px;
          padding: 10px 14px;
          max-width: 85%;
          word-break: break-word;
        }
        .wyre-ai-bubble--ai {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border: 1px solid #e8e8e8;
        }
        .wyre-ai-bubble--user {
          background: rgba(92, 53, 146, 0.11);
          border: 1px solid #d4c5e6;
        }

        .wyre-ai-content {
          font-size: 12.5px;
          line-height: 1.55;
          color: #1f1f1f;
        }
        .wyre-ai-content p {
          margin: 0 0 8px;
        }
        .wyre-ai-content p:last-child {
          margin-bottom: 0;
        }
        .wyre-ai-content strong {
          font-weight: 700;
          color: #111;
        }
        .wyre-ai-content br {
          display: block;
          content: "";
          margin-top: 2px;
        }
        .wyre-ai-content ul,
        .wyre-ai-content ol {
          margin: 4px 0 8px;
          padding-left: 18px;
        }
        .wyre-ai-content li {
          margin-bottom: 3px;
        }
        .wyre-ai-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
          font-size: 11.5px;
        }
        .wyre-ai-content table th,
        .wyre-ai-content table td {
          border: 1px solid #e0e0e0;
          padding: 5px 8px;
          text-align: left;
        }
        .wyre-ai-content table th {
          background: #f5f0fa;
          font-weight: 600;
          color: #333;
        }
        .wyre-ai-content table tr:nth-child(even) {
          background: #fafafa;
        }
        .wyre-ai-content a {
          color: #5C12A7;
          text-decoration: underline;
        }
        .wyre-ai-content code {
          background: #f3f0f7;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 11.5px;
          font-family: 'SF Mono', Menlo, monospace;
        }
        .wyre-ai-content pre {
          background: #1e1e2e;
          color: #cdd6f4;
          padding: 10px 12px;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 11px;
          margin: 8px 0;
        }
        .wyre-ai-content pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        .wyre-ai-content h1,
        .wyre-ai-content h2,
        .wyre-ai-content h3 {
          margin: 10px 0 6px;
          font-weight: 700;
          line-height: 1.3;
        }
        .wyre-ai-content h1 { font-size: 15px; }
        .wyre-ai-content h2 { font-size: 14px; }
        .wyre-ai-content h3 { font-size: 13px; }
      `}</style>
    </>
  );
}