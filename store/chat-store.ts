import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Conversation, Message } from '@/types/chat';

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoading: boolean;
  error: string | null;
}

interface ChatStore extends ChatState {
  fetchConversations: (userId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, senderId: string, receiverId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      isLoading: false,
      error: null,

      fetchConversations: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would fetch from an API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock conversations
          const mockConversations: Conversation[] = [
            {
              id: "conv-1",
              participants: ["user-1", "driver-2"],
              unreadCount: 2,
              lastMessage: {
                id: "msg-1",
                senderId: "driver-2",
                receiverId: "user-1",
                content: "I'll be there in 10 minutes",
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                read: false
              }
            },
            {
              id: "conv-2",
              participants: ["user-1", "driver-3"],
              unreadCount: 0,
              lastMessage: {
                id: "msg-2",
                senderId: "user-1",
                receiverId: "driver-3",
                content: "Thanks for the ride!",
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                read: true
              }
            }
          ];
          
          set({ 
            conversations: mockConversations,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to fetch conversations" 
          });
        }
      },

      fetchMessages: async (conversationId: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would fetch from an API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock messages
          const mockMessages: Message[] = conversationId === "conv-1" 
            ? [
                {
                  id: "msg-1-1",
                  senderId: "user-1",
                  receiverId: "driver-2",
                  content: "Hello, are you available for a ride?",
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                  read: true
                },
                {
                  id: "msg-1-2",
                  senderId: "driver-2",
                  receiverId: "user-1",
                  content: "Yes, I am. Where do you need to go?",
                  timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString(),
                  read: true
                },
                {
                  id: "msg-1-3",
                  senderId: "user-1",
                  receiverId: "driver-2",
                  content: "I need to go to the airport",
                  timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
                  read: true
                },
                {
                  id: "msg-1-4",
                  senderId: "driver-2",
                  receiverId: "user-1",
                  content: "Sure, I can take you there. What time?",
                  timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                  read: true
                },
                {
                  id: "msg-1-5",
                  senderId: "user-1",
                  receiverId: "driver-2",
                  content: "In about an hour?",
                  timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                  read: true
                },
                {
                  id: "msg-1-6",
                  senderId: "driver-2",
                  receiverId: "user-1",
                  content: "I'll be there in 10 minutes",
                  timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                  read: false
                }
              ]
            : [
                {
                  id: "msg-2-1",
                  senderId: "user-1",
                  receiverId: "driver-3",
                  content: "Hi, can you pick me up from downtown?",
                  timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                  read: true
                },
                {
                  id: "msg-2-2",
                  senderId: "driver-3",
                  receiverId: "user-1",
                  content: "Yes, I'll be there in 15 minutes",
                  timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
                  read: true
                },
                {
                  id: "msg-2-3",
                  senderId: "user-1",
                  receiverId: "driver-3",
                  content: "Thanks for the ride!",
                  timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                  read: true
                }
              ];
          
          const { messages } = get();
          
          set({ 
            messages: {
              ...messages,
              [conversationId]: mockMessages
            },
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to fetch messages" 
          });
        }
      },

      sendMessage: async (conversationId: string, senderId: string, receiverId: string, content: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would send via an API
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId,
            receiverId,
            content,
            timestamp: new Date().toISOString(),
            read: false
          };
          
          const { messages, conversations } = get();
          const conversationMessages = messages[conversationId] || [];
          
          // Update messages
          const updatedMessages = {
            ...messages,
            [conversationId]: [...conversationMessages, newMessage]
          };
          
          // Update conversation with last message
          const updatedConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: newMessage,
                unreadCount: senderId === receiverId ? conv.unreadCount + 1 : conv.unreadCount
              };
            }
            return conv;
          });
          
          set({ 
            messages: updatedMessages,
            conversations: updatedConversations,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to send message" 
          });
        }
      },

      markAsRead: async (conversationId: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would update via an API
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const { messages, conversations } = get();
          const conversationMessages = messages[conversationId] || [];
          
          // Mark messages as read
          const updatedMessages = conversationMessages.map(msg => {
            if (msg.receiverId === userId && !msg.read) {
              return { ...msg, read: true };
            }
            return msg;
          });
          
          // Update conversations
          const updatedConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                unreadCount: 0
              };
            }
            return conv;
          });
          
          set({ 
            messages: {
              ...messages,
              [conversationId]: updatedMessages
            },
            conversations: updatedConversations,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : "Failed to mark messages as read" 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        conversations: state.conversations,
        messages: state.messages 
      }),
    }
  )
);