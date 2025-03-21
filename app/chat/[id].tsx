import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, ArrowLeft, Phone, Info } from 'lucide-react-native';
import { MessageBubble } from '@/components/MessageBubble';
import { colors } from '@/constants/colors';
import { useChatStore } from '@/store/chat-store';
import { useDriverStore } from '@/store/driver-store';
import { useAuthStore } from '@/store/auth-store';
import { Message } from '@/types/chat';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { drivers } = useDriverStore();
  const { 
    conversations, 
    messages, 
    fetchMessages, 
    sendMessage, 
    markAsRead,
    isLoading 
  } = useChatStore();
  
  const [messageText, setMessageText] = useState('');
  const [driver, setDriver] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Set navigation ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Find the driver
  useEffect(() => {
    if (id) {
      const foundDriver = drivers.find(d => d.id === id);
      if (foundDriver) {
        setDriver(foundDriver);
      }
    }
  }, [id, drivers]);

  // Find or create conversation ID
  useEffect(() => {
    if (user && driver) {
      // Try to find existing conversation
      const existingConversation = conversations.find(conv => 
        conv.participants.includes(user.id) && 
        conv.participants.includes(driver.id)
      );
      
      if (existingConversation) {
        setConversationId(existingConversation.id);
        fetchMessages(existingConversation.id);
      } else {
        // In a real app, we would create a new conversation
        // For now, we'll use a mock ID
        const newConvId = `new-conv-${Date.now()}`;
        setConversationId(newConvId);
        setChatMessages([]);
      }
    }
  }, [user, driver, conversations, fetchMessages]);

  // Update messages when they change in the store
  useEffect(() => {
    if (conversationId && messages[conversationId]) {
      setChatMessages(messages[conversationId]);
      
      // Mark messages as read
      if (user) {
        markAsRead(conversationId, user.id);
      }
    }
  }, [conversationId, messages, user, markAsRead]);

  const handleSend = () => {
    if (!messageText.trim() || !user || !driver || !conversationId) return;
    
    sendMessage(
      conversationId,
      user.id,
      driver.id,
      messageText.trim()
    );
    
    setMessageText('');
    
    // Scroll to bottom after sending
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const handleCall = () => {
    if (!driver) return;
    
    if (!driver.allowCalls) {
      alert("This driver has disabled calls");
      return;
    }
    
    // In a real app, this would initiate a call
    alert(`Calling ${driver.name}...`);
  };

  const handleViewProfile = () => {
    if (!driver || !isNavigationReady) return;
    
    setTimeout(() => {
      router.push(`/driver/${driver.id}`);
    }, 200);
  };

  // FIXED: Added safe check for user
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerTitle: () => (
            <TouchableOpacity 
              style={styles.headerTitle}
              onPress={handleViewProfile}
              activeOpacity={0.7}
            >
              {driver && (
                <Image 
                  source={{ uri: driver.profilePicture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }} 
                  style={styles.headerAvatar} 
                />
              )}
              <View>
                <Text style={styles.headerText}>{driver?.name || 'Chat'}</Text>
                {driver?.isAvailable && (
                  <View style={styles.availabilityIndicator}>
                    <View style={styles.availabilityDot} />
                    <Text style={styles.availabilityText}>Available</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={handleCall} 
                style={styles.headerButton}
                disabled={!driver?.allowCalls}
              >
                <Phone 
                  size={24} 
                  color={driver?.allowCalls ? colors.primary : colors.disabled} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleViewProfile} 
                style={styles.headerButton}
              >
                <Info size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading && chatMessages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={({ item }) => (
              <MessageBubble 
                message={item} 
                isCurrentUser={item.senderId === user?.id}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onLayout={() => {
              if (flatListRef.current && chatMessages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
            onContentSizeChange={() => {
              if (flatListRef.current && chatMessages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: false });
              }
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            placeholderTextColor={colors.placeholder}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !messageText.trim() && styles.disabledSendButton
            ]} 
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Send size={20} color={colors.card} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  availabilityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  availabilityText: {
    fontSize: 12,
    color: colors.success,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    color: colors.text,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      }
    }),
  },
  disabledSendButton: {
    backgroundColor: colors.disabled,
  },
});