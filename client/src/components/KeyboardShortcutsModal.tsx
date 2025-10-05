import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Search, RefreshCw, MessageSquare, HelpCircle } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { keyboardShortcutService, ShortcutGroup } from '../services/keyboard-shortcuts-new';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const [shortcuts, setShortcuts] = useState<ShortcutGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      const shortcutGroups = keyboardShortcutService.getShortcutsByCategory();
      setShortcuts(shortcutGroups);
    }
  }, [isOpen]);

  const filteredShortcuts = shortcuts.map(group => ({
    ...group,
    shortcuts: group.shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.shortcuts.length > 0);

  const formatKeyCombo = (shortcut: any) => {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.meta) parts.push('⌘');
    parts.push(shortcut.key);
    return parts.join(' + ');
  };

  const getKeyIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'escape':
        return 'Esc';
      case ' ':
        return 'Space';
      case 'arrowup':
        return '↑';
      case 'arrowdown':
        return '↓';
      case 'arrowleft':
        return '←';
      case 'arrowright':
        return '→';
      default:
        return key.toUpperCase();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7F232E]/10 flex items-center justify-center">
                  <Keyboard className="h-5 w-5 text-[#7F232E]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#2b2b2b]">Keyboard Shortcuts</h2>
                  <p className="text-sm text-[#4b4b4b]">Quick actions and navigation</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-8 h-8 p-0"
                aria-label="Close keyboard shortcuts"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4b4b4b]" />
                <input
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F232E]/30"
                  autoFocus
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {filteredShortcuts.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No shortcuts found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredShortcuts.map((group, groupIndex) => (
                    <div key={group.name}>
                      <h3 className="text-lg font-semibold text-[#2b2b2b] mb-3 flex items-center gap-2">
                        {group.name}
                        <span className="text-sm font-normal text-[#4b4b4b]">
                          ({group.shortcuts.length})
                        </span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.shortcuts.map((shortcut, index) => (
                          <motion.div
                            key={`${group.name}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#2b2b2b]">
                                {shortcut.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-4">
                              {formatKeyCombo(shortcut).split(' + ').map((key, keyIndex) => (
                                <React.Fragment key={keyIndex}>
                                  {keyIndex > 0 && (
                                    <span className="text-[#4b4b4b] mx-1">+</span>
                                  )}
                                  <kbd className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded shadow-sm">
                                    {getKeyIcon(key)}
                                  </kbd>
                                </React.Fragment>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#4b4b4b]">
                  Press <kbd className="px-1 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">Esc</kbd> to close
                </div>
                
                <div className="flex items-center gap-4 text-sm text-[#4b4b4b]">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Toggle messages</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
