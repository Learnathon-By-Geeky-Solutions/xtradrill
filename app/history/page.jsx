'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, Download } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setHistory(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadConversation = (conversation) => {
    const content = conversation.messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-${new Date(conversation.timestamp).toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b p-4 flex items-center">
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="mr-4">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Interview History</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-500">No interviews recorded yet</div>
        ) : (
          history.map((conversation) => (
            <Card key={conversation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(conversation.timestamp).toLocaleString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadConversation(conversation)}
                    title="Download conversation"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {conversation.messages.slice(0, 3).map((message, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <p className="text-xs font-medium mb-1">
                        {message.role === 'user' ? 'You' : 'Interviewer'}
                      </p>
                      <p className="text-sm line-clamp-2">{message.content}</p>
                    </div>
                  ))}
                  {conversation.messages.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      + {conversation.messages.length - 3} more messages
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
