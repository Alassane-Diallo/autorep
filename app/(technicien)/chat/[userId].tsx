import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { SendHorizonal, ArrowLeft } from 'lucide-react-native';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/constants/api';
import { TokenService } from '@/services/storage';
import { useAuthContext } from '@/context/auth-context';
import api from '@/services/api';

export default function ConversationScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    try {
      const response = await api.get(`/api/messages/${userId}`);
      setMessages(response.data.data);

      // Marquer comme lus
      await api.patch(`/api/messages/${userId}/lu`);

      // Récupérer les infos de l'autre user
      if (response.data.data.length > 0) {
        const first = response.data.data[0];
        setOtherUser(
          first.sender?.id === user?.id ? first.receiver : first.sender
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, userId]);
  
  useEffect(() => {
    loadMessages();
    connectSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId, loadMessages]);


  const connectSocket = async () => {
    const token = await TokenService.getAccessToken();

    socketRef.current = io(SOCKET_URL, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('[SOCKET] Connecté au chat');
    });

    // Recevoir un message en temps réel
    socketRef.current.on('recevoir_message', (newMessage: any) => {
      setMessages(prev => [...prev, newMessage]);
      flatListRef.current?.scrollToEnd({ animated: true });
    });

    // Confirmation d'envoi
    socketRef.current.on('message_envoye', (newMessage: any) => {
      setMessages(prev => [...prev, newMessage]);
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un message.");
      return;
    }

    socketRef.current?.emit('envoyer_message', {
      receiverId: userId,
      contenu: message.trim()
    });

    setMessage('');
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender?.id === user?.id;

    return (
      <View className={`mb-3 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isMe
            ? 'bg-[#FBBF24] rounded-tr-none'
            : 'bg-[#1F232B] rounded-tl-none border border-white/5'
        }`}>
          <Text className={`text-[14px] leading-5 ${
            isMe ? 'text-black font-medium' : 'text-gray-200'
          }`}>
            {item.contenu}
          </Text>
          <Text className={`text-[9px] text-right mt-1 ${
            isMe ? 'text-amber-900/60' : 'text-gray-500'
          }`}>
            {new Date(item.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B0C10]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 bg-[#12141C] border-b border-white/5">
          <TouchableOpacity
            onPress={() => router.replace("/(client)/chat")}
            className="bg-[#1F232B] p-2 rounded-full mr-3"
          >
            <ArrowLeft size={20} color="#FBBF24" />
          </TouchableOpacity>

          <View className="w-10 h-10 rounded-full bg-[#FBBF24]/20 items-center justify-center mr-3">
            <Text className="text-[#FBBF24] font-black">
              {otherUser?.prenom?.charAt(0)}{otherUser?.nom?.charAt(0)}
            </Text>
          </View>

          <View>
            <Text className="text-white font-bold">
              {otherUser?.prenom} {otherUser?.nom}
            </Text>
            <Text className="text-green-400 text-xs">En ligne</Text>
          </View>
        </View>

        {/* Messages */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FBBF24" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              <View className="items-center mt-20">
                <Text className="text-gray-500">Démarrez la conversation !</Text>
              </View>
            }
          />
        )}

        {/* Zone de saisie */}
        <View className="flex-row items-center px-4 py-3 bg-[#12141C] border-t border-white/5 gap-2">
          <View className="flex-1 flex-row items-center bg-[#1F232B] rounded-full px-4 h-12 border border-white/5">
            <TextInput
              placeholder="Votre message..."
              placeholderTextColor="#666"
              className="flex-1 text-white text-[15px]"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.7}
            className="w-12 h-12 bg-[#FBBF24] rounded-full items-center justify-center"
          >
            <SendHorizonal size={20} color="#000" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}