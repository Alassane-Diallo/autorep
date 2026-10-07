import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, 
  RefreshControl, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';

const FILTERS = [
  { label: 'Toutes',     value: 'ALL' },
  { label: 'En attente', value: 'EN_ATTENTE' },
  { label: 'Acceptées',  value: 'ACCEPTEE' },
  { label: 'Payées',     value: 'PAYEE' },
  { label: 'En cours',   value: 'EN_COURS' },
  { label: 'Terminées',  value: 'TERMINEE' },
  { label: 'Refusées',  value: 'REFUSEE' }
];

const getStatusStyle = (statut: string) => {
  switch (statut) {
    case 'EN_ATTENTE': return { bg: 'bg-amber-500/10',  text: 'text-amber-400' };
    case 'ACCEPTEE':   return { bg: 'bg-indigo-500/10', text: 'text-indigo-400' };
    case 'PAYEE':      return { bg: 'bg-purple-500/10', text: 'text-purple-400' };
    case 'EN_COURS':   return { bg: 'bg-blue-500/10',   text: 'text-blue-400' };
    case 'TERMINEE':   return { bg: 'bg-green-500/10',  text: 'text-green-400' };
    case 'REFUSEE':    return { bg: 'bg-red-500/10',    text: 'text-red-400' };
    default:           return { bg: 'bg-gray-500/10',   text: 'text-gray-400' };
  }
};

export default function TechDashboard() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const fetchCommandes = useCallback(async () => {
    try {
      const response = await api.get('/api/commandes/disponibles');
      setCommandes(response.data.data);
    } catch (error) {
      console.error("Erreur fetch commandes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCommandes();
  }, [fetchCommandes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCommandes();
  }, [fetchCommandes]);

  // Filtrage dynamique
  const filteredCommandes = useMemo(() => {
    if (activeFilter === 'ALL') return commandes;
    return commandes.filter(item => item.statut === activeFilter);
  }, [activeFilter, commandes]);

  // Accepter une commande
  const handleAccepter = async (commandeId: string) => {
    try {
      await api.patch(`/api/commandes/${commandeId}/accepter`);
      Alert.alert("Succès", "Commande acceptée !");
      fetchCommandes();
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible d'accepter.");
    }
  };

  // Refuser une commande
  const handleRefuser = async (commandeId: string) => {
    Alert.alert(
      "Refuser",
      "Voulez-vous vraiment refuser cette commande ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui",
          style: "destructive",
          onPress: async () => {
            try {
              await api.patch(`/api/commandes/${commandeId}/refuser`);
              Alert.alert("Commande refusée.");
              fetchCommandes();
            } catch (error: any) {
              Alert.alert("Erreur", error.message);
            }
          }
        }
      ]
    );
  };

  // Démarrer une intervention
  const handleDemarrer = async (commandeId: string) => {
    try {
      await api.patch(`/api/commandes/${commandeId}/demarrer`);
      Alert.alert("Succès", "Intervention démarrée !");
      fetchCommandes();
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
  };

  // Terminer une intervention
  const handleTerminer = async (commandeId: string) => {
    Alert.alert(
      "Terminer",
      "Confirmer la fin de l'intervention ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui",
          onPress: async () => {
            try {
              await api.patch(`/api/commandes/${commandeId}/terminer`);
              Alert.alert("Succès", "Intervention terminée !");
              fetchCommandes();
            } catch (error: any) {
              Alert.alert("Erreur", error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">

      {/* Header + Filtres */}
      <View className="px-6 py-6 border-b border-white/5 bg-[#121212]">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-2xl font-black italic uppercase">
              Mes <Text className="text-[#FBBF24]">Tâches</Text>
            </Text>
            <Text className="text-gray-500 font-medium">Gestion des interventions</Text>
          </View>
          <TouchableOpacity
            onPress={fetchCommandes}
            className="bg-[#1A1A1A] p-2 rounded-xl border border-white/5"
          >
            <Ionicons name="refresh" size={20} color="#FBBF24" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setActiveFilter(f.value)}
              className={`px-5 py-2.5 rounded-2xl mr-2 border ${
                activeFilter === f.value 
                  ? 'bg-[#FBBF24] border-[#FBBF24]' 
                  : 'bg-[#1A1A1A] border-white/5'
              }`}
            >
              <Text className={`text-[11px] font-black uppercase ${
                activeFilter === f.value ? 'text-black' : 'text-gray-400'
              }`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FBBF24" />
        </View>
      ) : (
        <FlatList
          data={filteredCommandes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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
                <Ionicons name="clipboard-outline" size={60} color="#374151" />
              </View>
              <Text className="text-white text-xl font-bold">Aucune tâche</Text>
              <Text className="text-gray-500 mt-2 text-center px-10">
                Aucune commande pour ce filtre.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const style = getStatusStyle(item.statut);
            const montant = item.prestations?.reduce(
              (total: number, cp: any) => total + (cp.prestation?.prix || 0), 0
            ) || 0;

            return (
              <View className="bg-[#121212] mb-4 p-5 rounded-[32px] border border-white/5">
                
                {/* Header commande */}
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      Réf: {item.id.split('-')[0]}
                    </Text>
                    <Text className="text-white text-lg font-bold mt-1">
                      {item.prestations?.map((cp: any) => cp.prestation?.libelle).join(', ')}
                    </Text>
                  </View>
                  <View className={`px-3 py-1.5 rounded-xl ${style.bg}`}>
                    <Text className={`text-[10px] font-black ${style.text}`}>
                      {item.statut}
                    </Text>
                  </View>
                </View>

                {/* Infos client */}
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="flex-row items-center bg-[#1A1A1A] px-3 py-2 rounded-xl">
                    <Ionicons name="person-outline" size={14} color="#FBBF24" />
                    <Text className="text-gray-300 text-xs ml-2">
                      {item.client?.user?.prenom} {item.client?.user?.nom}
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-[#1A1A1A] px-3 py-2 rounded-xl flex-1">
                    <Ionicons name="location-outline" size={14} color="#FBBF24" />
                    <Text className="text-gray-300 text-xs ml-2" numberOfLines={1}>
                      {item.lieuIntervention}
                    </Text>
                  </View>
                </View>

                {/* Montant */}
                <View className="border-t border-white/5 pt-3 mb-4 flex-row justify-between items-center">
                  <Text className="text-gray-500 text-xs uppercase font-bold">Montant</Text>
                  <Text className="text-[#FBBF24] text-xl font-black">{montant} FCFA</Text>
                </View>

                {/* Boutons selon statut */}
                {item.statut === 'EN_ATTENTE' && (
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => handleRefuser(item.id)}
                      className="flex-1 py-3 rounded-2xl items-center border border-red-500/30 bg-red-500/10"
                    >
                      <Text className="text-red-400 font-black uppercase text-xs">
                        Refuser
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleAccepter(item.id)}
                      className="flex-1 py-3 rounded-2xl items-center bg-[#FBBF24]"
                    >
                      <Text className="text-black font-black uppercase text-xs">
                        Accepter
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.statut === 'PAYEE' && (
                  <TouchableOpacity
                    onPress={() => handleDemarrer(item.id)}
                    className="w-full py-4 rounded-2xl items-center bg-blue-500/20 border border-blue-500/30"
                  >
                    <Text className="text-blue-400 font-black uppercase text-xs">
                      Démarrer l&apos;intervention
                    </Text>
                  </TouchableOpacity>
                )}

                {item.statut === 'EN_COURS' && (
                  <TouchableOpacity
                    onPress={() => handleTerminer(item.id)}
                    className="w-full py-4 rounded-2xl items-center bg-green-500/20 border border-green-500/30"
                  >
                    <Text className="text-green-400 font-black uppercase text-xs">
                      Terminer l'intervention
                    </Text>
                  </TouchableOpacity>
                )}

              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}