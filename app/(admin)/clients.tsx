import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';

export default function AdminClientsScreen() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadClients = useCallback(async () => {
    try {
      const response = await api.get('/api/users');
      const allUsers = response.data.data || [];
      // Filtrer seulement les clients
      setClients(allUsers.filter((u: any) => u.role === 'CLIENT'));
    } catch (error) {
      console.error("Erreur chargement clients:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClients();
  }, [loadClients]);

  const handleDeleteClient = (id: string, nom: string) => {
    Alert.alert(
      "Suppression",
      `Supprimer définitivement le client : ${nom} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/users/${id}`);
              setClients(prev => prev.filter(c => c.id !== id));
              Alert.alert("Succès", "Client supprimé.");
            } catch (error: any) {
              Alert.alert("Erreur", error.message || "Impossible de supprimer.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]" edges={['top']}>

      {/* HEADER */}
      <View className="px-6 py-6 flex-row justify-between items-center border-b border-white/5 bg-[#121212]">
        <View>
          <Text className="text-white text-xl font-black italic uppercase">
            Gestion <Text className="text-[#FBBF24]">Clients</Text>
          </Text>
          <Text className="text-gray-500 text-xs font-medium">
            {clients.length} client(s) enregistré(s)
          </Text>
        </View>
        <TouchableOpacity
          onPress={loadClients}
          className="bg-[#1A1A1A] w-10 h-10 rounded-full items-center justify-center border border-white/5"
        >
          <Ionicons name="refresh" size={18} color="#FBBF24" />
        </TouchableOpacity>
      </View>

      {/* TABLE HEADER */}
      <View className="flex-row px-6 py-4 border-b border-white/10 bg-[#0F0F0F]">
        <Text className="flex-[2] text-gray-600 text-[10px] font-black uppercase">
          Nom / Email
        </Text>
        <Text className="flex-1 text-center text-gray-600 text-[10px] font-black uppercase">
          Téléphone
        </Text>
        <Text className="flex-1 text-right text-gray-600 text-[10px] font-black uppercase">
          Actions
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#FBBF24" size="large" />
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FBBF24"
            />
          }
          ListEmptyComponent={
            <View className="items-center mt-32">
              <View className="bg-[#1A1A1A] p-8 rounded-full mb-6">
                <Ionicons name="people-outline" size={60} color="#374151" />
              </View>
              <Text className="text-white text-xl font-bold">Aucun client</Text>
              <Text className="text-gray-500 mt-2 text-center px-10">
                Aucun client enregistré pour le moment.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="flex-row items-center px-6 py-5 border-b border-white/5">

              {/* Infos principales */}
              <View className="flex-[2] flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-[#FBBF24]/20 items-center justify-center mr-3">
                  <Text className="text-[#FBBF24] font-black text-sm">
                    {item.prenom?.charAt(0)}{item.nom?.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>
                    {item.prenom} {item.nom}
                  </Text>
                  <Text className="text-gray-500 text-xs" numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
              </View>

              {/* Téléphone */}
              <View className="flex-1 items-center">
                <Text className="text-gray-300 text-xs text-center" numberOfLines={1}>
                  {item.telephone || '—'}
                </Text>
              </View>

              {/* Actions */}
              <View className="flex-1 flex-row justify-end gap-4">
                <TouchableOpacity
                  onPress={() => handleDeleteClient(item.id, `${item.prenom} ${item.nom}`)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}