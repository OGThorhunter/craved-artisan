import React, { useState } from 'react';
import { MessageSquare, Mail, Plus, Tag, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Card from '../../../ui/Card';

interface MessagingCRMTabProps {
  userId: string;
}

export default function MessagingCRMTab({ userId }: MessagingCRMTabProps) {
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  
  const handleAddNote = async () => {
    try {
      await fetch(`/api/admin/users/${userId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newNote })
      });
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* CRM Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Engagement Score</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">72/100</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">Messages</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Last Outreach</span>
          </div>
          <div className="text-sm font-medium text-gray-900">Never</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Tag className="w-5 h-5" />
            <span className="text-sm font-medium">Tags</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </Card>
      </div>
      
      {/* Notes & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Notes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2b2b2b]">Admin Notes</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this user..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Note
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No notes yet</p>
            </div>
          </div>
        </Card>
        
        {/* Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2b2b2b]">Tasks</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                console.log('Create task:', newTask);
                setNewTask('');
              }}
              disabled={!newTask.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Task
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No tasks yet</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* CRM Tags */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2b2b2b]">CRM Tags</h2>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Plus className="w-4 h-4" />
            Add Tag
          </button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No tags assigned</p>
        </div>
      </Card>
      
      {/* Broadcast */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#2b2b2b] mb-4">Send Message</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              placeholder="Message subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
            />
          </div>
          
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Mail className="w-4 h-4 inline mr-2" />
              Send Email
            </button>
            <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Send SMS
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

