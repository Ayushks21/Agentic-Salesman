import React, { useState, useRef, useEffect } from 'react';
import { Send, ShoppingCart, Loader } from 'lucide-react';
import "./agentic.css";

const AgenticSalesDemo = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\'m your AI Sales Agent. I can help you find products across any channel. Try saying "I need running shoes" or "Show me jackets"' }
  ]);
  const [input, setInput] = useState('');
  const [session, setSession] = useState({
    id: 'SESS_' + Math.random().toString(36).substr(2, 9),
    cart: [],
    preferences: {},
    channel: 'Web',
    customerName: 'Guest'
  });
  const [activeAgents, setActiveAgents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const products = [
    { id: 1, name: 'Nike ZoomX Marathon', price: 180, category: 'running', stock: 15, image: '👟' },
    { id: 2, name: 'Brooks Adrenaline', price: 120, category: 'running', stock: 8, image: '👟' },
    { id: 3, name: 'Adidas Ultraboost', price: 150, category: 'running', stock: 0, image: '👟' },
    { id: 4, name: 'Blue Winter Jacket', price: 150, category: 'jacket', stock: 3, image: '🧥' },
    { id: 5, name: 'Navy Puffer Jacket', price: 130, category: 'jacket', stock: 12, image: '🧥' },
    { id: 6, name: 'Waterproof Hiking Boots', price: 200, category: 'boots', stock: 5, image: '🥾' }
  ];
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAgentWork = (agentName, duration = 800) => {
    return new Promise(resolve => {
      setActiveAgents(prev => [...prev, agentName]);
      setTimeout(() => {
        setActiveAgents(prev => prev.filter(a => a !== agentName));
        resolve();
      }, duration);
    });
  };
  
  const processMessage = async (userMessage) => {
    setIsProcessing(true);
    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('running') || lowerMsg.includes('shoes') || lowerMsg.includes('marathon')) {
      await simulateAgentWork('Recommendation Agent');
      const runningShoes = products.filter(p => p.category === 'running');
      const inStock = runningShoes.filter(p => p.stock > 0);

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `I found ${inStock.length} running shoes perfect for you:`,
        products: inStock
      }]);

      setSession(prev => ({ ...prev, preferences: { category: 'running' } }));
    } else if (lowerMsg.includes('jacket') || lowerMsg.includes('coat')) {
      await simulateAgentWork('Recommendation Agent');
      const jackets = products.filter(p => p.category === 'jacket');

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Here are our top jackets:`,
        products: jackets
      }]);

      setSession(prev => ({ ...prev, preferences: { category: 'jacket' } }));
    } else if (lowerMsg.includes('add to cart') || lowerMsg.includes('add')) {
      const match = userMessage.match(/\d+/);
      if (match) {
        const productId = parseInt(match[0]);
        const product = products.find(p => p.id === productId);
        if (product) {
          await simulateAgentWork('Inventory Agent');
          if (product.stock > 0) {
            setSession(prev => ({
              ...prev,
              cart: [...prev.cart, product]
            }));
            const total = [...session.cart, product].reduce((sum, p) => sum + p.price, 0);
            setMessages(prev => [...prev, {
              role: 'assistant',
              text: `✅ Added ${product.name} to your cart! Your cart total is $${total}`,
              icon: '🛒'
            }]);
          } else {
            setMessages(prev => [...prev, {
              role: 'assistant',
              text: `❌ Sorry, ${product.name} is out of stock. But I found similar alternatives in stock. Would you like to see them?`,
              icon: '⚠️'
            }]);
          }
        }
      }
    } else if (lowerMsg.includes('checkout') || lowerMsg.includes('pay') || lowerMsg.includes('purchase')) {
      if (session.cart.length === 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `Your cart is empty. Let me help you find something!`
        }]);
      } else {
        await simulateAgentWork('Loyalty & Offers Agent', 600);
        await simulateAgentWork('Payment Agent', 1000);
        await simulateAgentWork('Fulfillment Agent', 800);

        const total = session.cart.reduce((sum, p) => sum + p.price, 0);
        const discount = Math.floor(total * 0.1);
        const finalTotal = total - discount;

        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `🎉 Order Complete!\n\nItems: ${session.cart.map(p => p.name).join(', ')}\nSubtotal: $${total}\nMember Discount (10%): -$${discount}\nFinal Total: $${finalTotal}\n\nOrder #${Math.floor(Math.random() * 10000)}\nEstimated Delivery: December 19, 2024\n\nTracking info sent to your email!`,
          icon: '✅'
        }]);

        setSession(prev => ({ ...prev, cart: [] }));
      }
    } else if (lowerMsg.includes('cart') || lowerMsg.includes('show cart')) {
      if (session.cart.length === 0) {
        setMessages(prev => [...prev, { role: 'assistant', text: `Your cart is empty. Browse our products to get started!` }]);
      } else {
        const total = session.cart.reduce((sum, p) => sum + p.price, 0);
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: `🛒 Your Cart:\n\n${session.cart.map((p, i) => `${i + 1}. ${p.name} - $${p.price}`).join('\n')}\n\nTotal: $${total}\n\nReady to checkout?`
        }]);
      }
    } else if (lowerMsg.includes('switch') || lowerMsg.includes('whatsapp') || lowerMsg.includes('mobile')) {
      const newChannel = lowerMsg.includes('whatsapp') ? 'WhatsApp' : lowerMsg.includes('mobile') ? 'Mobile' : 'In-Store Kiosk';
      setSession(prev => ({ ...prev, channel: newChannel }));
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `✨ Switched to ${newChannel}!\n\nYour session (${session.id}) traveled with you. Cart and preferences are intact. No need to repeat anything!`,
        icon: '🔄'
      }]);
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `I can help you with:\n• Finding products ("show me jackets")\n• Adding to cart ("add #1 to cart")\n• Checking out ("checkout")\n• Switching channels ("switch to WhatsApp")\n\nWhat would you like to do?`
      }]);
    }

    setIsProcessing(false);
  };
  const handleQuickAction = async (action) => {
  setMessages(prev => [...prev, { role: 'user', text: action }]);
  await processMessage(action);
};
  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const userMsg = input;
    setInput('');
    await processMessage(userMsg);
  };

  const quickActions = [
    "I need running shoes",
    "Show me jackets",
    "Add #1 to cart",
    "Checkout",
    "Switch to WhatsApp"
  ];
   {/* Quick Actions */}
<div style={{ padding: "8px 16px" }}>
  {quickActions.map((action, idx) => (
    <button
      key={idx}
      onClick={() => handleQuickAction(action)}
      style={{
        marginRight: "8px",
        marginBottom: "6px",
        padding: "6px 12px",
        fontSize: "12px",
        borderRadius: "12px",
        border: "1px solid #ccc",
        background: "#f5f5f5",
        cursor: "pointer"
      }}
    >
      {action}
    </button>
  ))}
</div>
  // return (
  //   <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  //     {/* Left Panel */}
  //     <div className="w-80 bg-white shadow-xl p-6 overflow-y-auto">
  //       <h2 className="text-2xl font-bold text-gray-800 mb-4">System Status</h2>
  //       <div className="mb-6 p-4 bg-blue-50 rounded-lg">
  //         <div className="text-sm text-gray-600 mb-1">Session ID</div>
  //         <div className="font-mono text-xs text-blue-600">{session.id}</div>
  //         <div className="text-sm text-gray-600 mt-3 mb-1">Channel</div>
  //         <div className="font-semibold text-indigo-700">{session.channel}</div>
  //       </div>

  //       <div className="mb-6">
  //         <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
  //           <ShoppingCart size={18} /> Cart ({session.cart.length})
  //         </h3>
  //         {session.cart.length === 0 ? (
  //           <p className="text-sm text-gray-500 italic">Empty</p>
  //         ) : (
  //           <div className="space-y-2">
  //             {session.cart.map((item, idx) => (
  //               <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
  //                 {item.image} {item.name} - ${item.price}
  //               </div>
  //             ))}
  //             <div className="font-bold text-right text-indigo-600 pt-2 border-t">
  //               Total: ${session.cart.reduce((s, p) => s + p.price, 0)}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </div>

  //     {/* Right Panel */}
  //     <div className="flex-1 flex flex-col">
  //       <div className="bg-white shadow-md p-4 border-b">
  //         <h1 className="text-2xl font-bold text-indigo-600">Agentic AI Sales System</h1>
  //         <p className="text-sm text-gray-600">Live Interactive Demo</p>
  //       </div>

  //       <div className="flex-1 overflow-y-auto p-6 space-y-4">
  //         {messages.map((msg, idx) => (
  //           <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
  //             <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'} rounded-lg p-4 shadow-md`}>
  //               {msg.icon && <div className="text-2xl mb-2">{msg.icon}</div>}
  //               <div className="whitespace-pre-line">{msg.text}</div>
  //             </div>
  //           </div>
  //         ))}
  //         {isProcessing && (
  //           <div className="flex justify-start">
  //             <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
  //               <Loader className="animate-spin text-indigo-600" />
  //             </div>
  //           </div>
  //         )}
  //         <div ref={messagesEndRef} />
  //       </div>

  //       {/* Quick Actions */}
  //       <div className="px-6 pb-3">
  //         <div className="text-xs text-gray-500 mb-2">Quick Actions:</div>
  //         <div className="flex gap-2 flex-wrap">
  //           {quickActions.map((action, idx) => (
  //             <button key={idx} onClick={() => { setInput(action); setMessages(prev => [...prev, { role: 'user', text: action }]); processMessage(action); }} className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full transition">
  //               {action}
  //             </button>
  //           ))}
  //         </div>
  //       </div>

  //       {/* Input */}
  //       <div className="bg-white border-t p-4">
  //         <div className="flex gap-2">
  //           <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your message..." className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={isProcessing} />
  //           <button onClick={handleSend} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition disabled:opacity-50">
  //             <Send size={18} /> Send
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
  <div className="app-container">
    
    {/* LEFT */}
    <div className="sidebar">
      <h2>System Status</h2>
      <div className="card">Session: {session.id}</div>
      <div className="card">Channel: {session.channel}</div>
      <div className="card">Cart Items: {session.cart.length}</div>
    </div>

    {/* RIGHT */}
    <div className="chat-container">
      <div className="header">
        <h2>Agentic AI Sales System (Local Demo)</h2>
      </div>

      <div className="messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role}`}
          >
            {msg.text}

            {msg.products && (
              <div className="product-grid">
                {msg.products.map(p => (
                  <div key={p.id} className="product">
                    <div style={{ fontSize: "24px" }}>{p.image}</div>
                    <div>
                      <b>{p.name}</b><br />
                      ${p.price}<br />
                      <span className="product-id">#{p.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type here..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  </div>
);
};

export default AgenticSalesDemo;