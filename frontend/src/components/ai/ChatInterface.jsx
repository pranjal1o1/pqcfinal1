// ========================================
// src/components/ai/ChatInterface.jsx
// ========================================
import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useGroqAI } from '../../hooks/useGroqAI';
import Button from '../common/Button';

const ChatInterface = ({ scanId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { askQuestion, loading } = useGroqAI();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        try {
            const result = await askQuestion(scanId, input);
            const aiMessage = { role: 'assistant', content: result.answer };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-slate-900 p-4 flex items-center gap-3 border-b border-slate-700">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Ask AI About This Scan</h3>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                        <p>Ask me anything about this security scan!</p>
                        <p className="text-sm mt-2">Try: "What are the most critical vulnerabilities?"</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-700 text-slate-100'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question..."
                        className="input flex-1"
                        disabled={loading}
                    />
                    <Button type="submit" loading={loading}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;
