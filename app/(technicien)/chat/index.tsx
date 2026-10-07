import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import api from '@/services/api';

export default function ChatScreen() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get('/api/users/clients');
      setClients(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B0C10]">

      {/* Header */}
      <View className="px-6 py-6">
        <Text className="text-white text-3xl font-black italic uppercase">
          Nos <Text className="text-[#FBBF24]">Clients</Text>
        </Text>
        <Text className="text-gray-500 font-medium">
          Contactez un client directement
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FBBF24" />
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(technicien)/chat/${item.id}` as any)}
              className="flex-row items-center bg-[#1A1A1A] rounded-[24px] p-4 mb-3 border border-white/5"
            >
              {/* Avatar */}
              <View className="w-14 h-14 rounded-full bg-[#FBBF24]/20 border border-[#FBBF24]/30 items-center justify-center mr-4">
                <Text className="text-[#FBBF24] text-xl font-black">
                  {item.prenom?.charAt(0)}{item.nom?.charAt(0)}
                </Text>
              </View>

              {/* Infos */}
              <View className="flex-1">
                <Text className="text-white font-bold text-base">
                  {item.prenom} {item.nom}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="map-outline" size={12} color="#FBBF24" />
                  <Text className="text-[#FBBF24] text-xs ml-1 font-medium">
                    {item.client?.adresse || 'Adresse'}
                  </Text>
                </View>
              </View>

              {/* Flèche */}
              <Ionicons name="chatbubble-outline" size={20} color="#374151" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center mt-32">
              <View className="bg-[#1A1A1A] p-8 rounded-full mb-6">
                <Ionicons name="people-outline" size={60} color="#374151" />
              </View>
              <Text className="text-white text-xl font-bold">
                Aucun client
              </Text>
              <Text className="text-gray-500 mt-2 text-center px-10">
                Aucun client disponible pour le moment.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}