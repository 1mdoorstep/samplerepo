import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { useDriverStore } from '@/store/driver-store';
import { Conversation } from '@/types/chat';

export default function ChatsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { conversations, fetchConversations, isLoading } = useChatStore();
  const { drivers, fetchDrivers } = useDriverStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Set navigation ready after first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only fetch data if authenticated
    if (isAuthenticated && user) {
      fetchConversations(user.id);
      fetchDrivers();
    }
  }, [isAuthenticated, user, fetchConversations, fetchDrivers]);

  // Don't render content until authentication is checked
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await fetchConversations(user.id);
    }
    setRefreshing(false);
  };

  const handleChatPress = (conversation: Conversation) => {
    if (!isNavigationReady) return;
    
    // Find the other participant (not the current user)
    const otherParticipantId = conversation.participants.find(id => id !== user?.id);
    
    if (otherParticipantId) {
      setTimeout(() => {
        router.push(`/chat/${otherParticipantId}`);
      }, 200);
    }
  };

  const getDriverInfo = (driverId: string) => {
    return drivers.find(driver => driver.id === driverId || driver.userId === driverId);
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    // Find the other participant (not the current user)
    const otherParticipantId = item.participants.find(id => id !== user?.id);
    const driver = otherParticipantId ? getDriverInfo(otherParticipantId) : undefined;
    
    if (!driver) return null;
    
    const formattedTime = item.lastMessage 
      ? new Date(item.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem} 
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: driver.profilePicture || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }} 
          style={styles.avatar} 
        />
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
          
          {item.lastMessage && (
            <Text 
              style={[
                styles.lastMessage,
                item.unreadCount > 0 && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.content}
            </Text>
          )}
        </View>
        
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleFindDrivers = () => {
    if (isNavigationReady) {
      setTimeout(() => {
        router.push('/(tabs)/drivers');
      }, 200);
    }
  };

  const renderEmptyState = () => (
    <EmptyState
      icon={<MessageSquare size={64} color={colors.textLight} />}
      title="No Conversations Yet"
      message="Start chatting with drivers to see your conversations here."
      action={
        <Button
          title="Find Drivers"
          onPress={handleFindDrivers}
          type="primary"
        />
      }
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textLight,
  },
  unreadMessage: {
    fontWeight: '500',
    color: colors.text,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
});