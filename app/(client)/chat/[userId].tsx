// import React, { useState, useEffect, useRef } from "react";
// import { SendHorizonal } from "lucide-react-native";
// import { 
//   View, Text, TextInput, TouchableOpacity, 
//   FlatList, KeyboardAvoidingView, Platform, 
//   ActivityIndicator, Alert
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// // import { useAuthContext } from "@/context/auth-context";
// import { TokenService } from "@/services/storage";
// import { SOCKET_URL } from "@/constants/api";
// import { io, Socket } from "socket.io-client";
// import api from "@/services/api";

// export default function Chat() {
//   const { user } = useAuthContext();
//   const [messages, setMessages] = useState<any[]>([]);
//   const [message, setMessage] = useState<string>("");
//   const [loading, setLoading] = useState(true);
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const flatListRef = useRef<FlatList>(null);

//   // Connexion Socket.io
//   useEffect(() => {
//     connectSocket();
//     return () => {
//       socket?.disconnect();
//     };
//   }, []);

//   const connectSocket = async () => {
//     try {
//       const token = await TokenService.getAccessToken();
      
//       const newSocket = io(SOCKET_URL, {
//         auth: { token },
//         transports: ["websocket"],
//       });

//       newSocket.on("connect", () => {
//         console.log("[SOCKET] Connecté au chat");
//       });

//       // Recevoir un message en temps réel
//       newSocket.on("recevoir_message", (newMessage: any) => {
//         setMessages(prev => [...prev, newMessage]);
//         scrollToBottom();
//       });

//       newSocket.on("message_envoye", (newMessage: any) => {
//         setMessages(prev => [...prev, newMessage]);
//         scrollToBottom();
//       });

//       newSocket.on("connect_error", (err) => {
//         console.log("[SOCKET] Erreur:", err.message);
//       });

//       setSocket(newSocket);
//     } catch (error) {
//       console.log("Erreur connexion socket:", error);
//     }
//   };

//   // Charger l'historique des messages
//   // Pour l'instant on charge les messages avec le premier technicien disponible
//   // Plus tard on pourra sélectionner le destinataire
//   useEffect(() => {
//     loadMessages();
//   }, []);

//   const loadMessages = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get("/api/messages");
//       setMessages(response.data.data || []);
//     } catch (error) {
//       console.log("Erreur chargement messages:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const scrollToBottom = () => {
//     setTimeout(() => {
//       flatListRef.current?.scrollToEnd({ animated: true });
//     }, 100);
//   };

//   // Envoyer un message
//   const handleSend = async () => {
//     if (!message.trim()) {
//       Alert.alert("Erreur", "Veuillez saisir un message.");
//       return;
//     }
//     if (!socket) {
//       Alert.alert("Erreur", "Connexion perdue. Réessayez.");
//       return;
//     }

//     // Pour l'instant on envoie au premier technicien
//     // Plus tard on aura une liste de conversations
//     const messageData = {
//       receiverId: "ID_TECHNICIEN", // à remplacer par le vrai id
//       contenu: message.trim(),
//     };

//     socket.emit("envoyer_message", messageData);
//     setMessage("");
//   };

//   // Composant message
//   const renderMessage = ({ item }: { item: any }) => {
//     const isMe = item.senderId === user?.id;
//     const date = new Date(item.createdAt).toLocaleTimeString('fr-FR', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });

//     return (
//       <View className={`mb-3 flex-row ${isMe ? "justify-end" : "justify-start"}`}>
//         <View className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
//           isMe 
//             ? "bg-[#FBBF24] rounded-tr-none" 
//             : "bg-[#1F232B] rounded-tl-none border border-white/5"
//         }`}>
//           {/* Nom expéditeur */}
//           {!isMe && (
//             <Text className="text-[#FBBF24] text-[11px] font-semibold mb-0.5">
//               {item.sender?.prenom} {item.sender?.nom}
//             </Text>
//           )}

//           {/* Message */}
//           <Text className={`text-[14px] leading-5 ${
//             isMe ? "text-black font-medium" : "text-gray-200"
//           }`}>
//             {item.contenu}
//           </Text>

//           {/* Heure */}
//           <Text className={`text-[9px] text-right mt-1 ${
//             isMe ? "text-amber-900/60" : "text-gray-500"
//           }`}>
//             {date}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-[#0B0C10]">
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         className="flex-1"
//       >
//         {/* Liste des messages */}
//         {loading ? (
//           <View className="flex-1 items-center justify-center">
//             <ActivityIndicator color="#FBBF24" size="large" />
//           </View>
//         ) : (
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={(item) => item.id}
//             renderItem={renderMessage}
//             contentContainerStyle={{ 
//               paddingHorizontal: 16, 
//               paddingTop: 8,
//               paddingBottom: 20,
//               flexGrow: 1
//             }}
//             showsVerticalScrollIndicator={false}
//             onContentSizeChange={scrollToBottom}
//             ListEmptyComponent={
//               <View className="flex-1 items-center justify-center mt-32">
//                 <Text className="text-gray-500 text-center">
//                   Aucun message pour le moment.{"\n"}
//                   Commencez la conversation !
//                 </Text>
//               </View>
//             }
//           />
//         )}

//         {/* Barre de saisie */}
//         <View className="flex-row items-center px-4 py-3 bg-[#12141C] border-t border-white/5 gap-2">
//           <View className="flex-1 flex-row items-center bg-[#1F232B] rounded-full px-4 h-12 border border-white/5">
//             <TextInput
//               placeholder="Votre message..."
//               placeholderTextColor="#666"
//               className="flex-1 text-white text-[15px] h-full"
//               multiline
//               value={message}
//               onChangeText={(t: string) => setMessage(t)}
//             />
//           </View>

//           <TouchableOpacity
//             onPress={handleSend}
//             activeOpacity={0.7}
//             className="w-12 h-12 bg-[#FBBF24] rounded-full items-center justify-center shadow-md"
//           >
//             <SendHorizonal size={20} color="#000" />
//           </TouchableOpacity>
//         </View>

//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }


import React, { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    loadMessages();
    connectSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  const loadMessages = async () => {
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
  };

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