import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  FileText, 
  BarChart3, 
  Users, 
  Target,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'suggestion' | 'alert' | 'prediction' | 'analysis';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  category: 'sales' | 'marketing' | 'customer' | 'product' | 'financial';
  actionable: boolean;
  createdAt: string;
  dismissed?: boolean;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  suggestions?: string[];
  data?: any;
}

interface AIAssistantProps {
  insights: AIInsight[];
  onInsightDismiss: (id: string) => void;
  onInsightAction: (id: string, action: string) => void;
  onChatMessage: (message: string) => Promise<ChatMessage>;
  onGenerateReport: (type: string) => void;
  onGenerateInsights: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  insights,
  onInsightDismiss,
  onInsightAction,
  onChatMessage,
  onGenerateReport,
  onGenerateInsights
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'reports'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const aiResponse = await onChatMessage(chatInput);
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return Lightbulb;
      case 'alert': return AlertCircle;
      case 'prediction': return TrendingUp;
      case 'analysis': return BarChart3;
      default: return Bot;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'text-blue-600 bg-blue-100';
      case 'alert': return 'text-red-600 bg-red-100';
      case 'prediction': return 'text-green-600 bg-green-100';
      case 'analysis': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const quickActions = [
    { label: 'Sales Performance', action: () => onGenerateReport('sales') },
    { label: 'Customer Insights', action: () => onGenerateReport('customers') },
    { label: 'Marketing ROI', action: () => onGenerateReport('marketing') },
    { label: 'Generate Insights', action: onGenerateInsights }
  ];

  const chatSuggestions = [
    "Show me sales trends for this month",
    "Which customers are at risk of churning?",
    "What are the top performing products?",
    "Generate a customer segmentation report",
    "What marketing campaigns should I run?"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
            <p className="text-gray-600">Get intelligent insights and automate your CRM tasks</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onGenerateInsights}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Generate Insights</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'chat', label: 'Chat Assistant', icon: Bot },
            { id: 'insights', label: 'AI Insights', icon: Lightbulb },
            { id: 'reports', label: 'Smart Reports', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-lg border border-gray-200 h-96 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Welcome to your AI Assistant!</p>
                <p className="text-sm">Ask me anything about your CRM data, or try one of these suggestions:</p>
                <div className="mt-4 space-y-2">
                  {chatSuggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setChatInput(suggestion)}
                      className="block w-full text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your CRM..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={() => setIsListening(!isListening)}
                  className={`absolute right-2 top-2 p-1 ${
                    isListening ? 'text-red-600' : 'text-gray-400'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.filter(insight => !insight.dismissed).map((insight) => {
              const InsightIcon = getInsightIcon(insight.type);
              return (
                <div key={insight.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                        <InsightIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                          {insight.priority} priority
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onInsightDismiss(insight.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {insight.confidence}% confidence
                    </div>
                  </div>
                  
                  {insight.actionable && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => onInsightAction(insight.id, 'implement')}
                        className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Take Action
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{action.label}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent AI-Generated Reports</h3>
            <div className="space-y-3">
              {[
                { name: 'Customer Churn Analysis', date: '2 hours ago', status: 'completed' },
                { name: 'Sales Performance Forecast', date: '1 day ago', status: 'completed' },
                { name: 'Marketing Campaign ROI', date: '2 days ago', status: 'completed' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600 capitalize">{report.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;



