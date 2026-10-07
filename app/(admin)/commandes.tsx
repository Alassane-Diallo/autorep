import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, ScrollView
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
  { label: 'Refusées',   value: 'REFUSEE' },
];

const getStatusStyle = (statut: string) => {
  switch (statut) {
    case 'EN_ATTENTE': return { bg: 'bg-amber-500/10',   text: 'text-amber-400' };
    case 'ACCEPTEE':   return { bg: 'bg-indigo-500/10',  text: 'text-indigo-400' };
    case 'PAYEE':      return { bg: 'bg-yellow-500/10',  text: 'text-yellow-400' };
    case 'EN_COURS':   return { bg: 'bg-blue-500/10',    text: 'text-blue-400' };
    case 'TERMINEE':   return { bg: 'bg-emerald-500/10', text: 'text-emerald-400' };
    case 'REFUSEE':    return { bg: 'bg-red-500/10',     text: 'text-red-400' };
    default:           return { bg: 'bg-gray-500/10',    text: 'text-gray-400' };
  }
};

export default function AdminCommandesScreen() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const loadCommandes = useCallback(async () => {
    try {
      const response = await api.get('/api/commandes');
      setCommandes(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCommandes();
  }, [loadCommandes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCommandes();
  }, [loadCommandes]);

  const filteredCommandes = activeFilter === 'ALL'
    ? commandes
    : commandes.filter(c => c.statut === activeFilter);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Supprimer",
      "Supprimer définitivement cette commande ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/commandes/${id}`);
              setCommandes(prev => prev.filter(c => c.id !== id));
              Alert.alert("Succès", "Commande supprimée.");
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
      <View className="px-6 py-6 border-b border-white/5 bg-[#121212]">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-xl font-black italic uppercase">
              Gestion <Text className="text-[#FBBF24]">Commandes</Text>
            </Text>
            <Text className="text-gray-500 text-xs font-medium">
              {commandes.length} commande(s) au total
            </Text>
          </View>
          <TouchableOpacity
            onPress={loadCommandes}
            className="bg-[#1A1A1A] p-2 rounded-xl border border-white/5"
          >
            <Ionicons name="refresh" size={20} color="#FBBF24" />
          </TouchableOpacity>
        </View>

        {/* FILTRES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setActiveFilter(f.value)}
              className={`px-4 py-2.5 rounded-2xl mr-2 border ${
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
                <Ionicons name="receipt-outline" size={60} color="#374151" />
              </View>
              <Text className="text-white text-xl font-bold">Aucune commande</Text>
              <Text className="text-gray-500 mt-2 text-center px-10">
                Aucune commande pour ce filtre.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const style = getStatusStyle(item.statut);
            const montant = item.prestations?.reduce(
              (t: number, cp: any) => t + (cp.prestation?.prix || 0), 0
            ) || 0;

            return (
              <View className="bg-[#121212] mb-4 p-5 rounded-[28px] border border-white/5">

                {/* Header */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      Réf: {item.id.split('-')[0]}
                    </Text>
                    <Text className="text-white font-bold text-base mt-1" numberOfLines={1}>
                      {item.prestations?.map((cp: any) => cp.prestation?.libelle).join(', ')}
                    </Text>
                  </View>
                  <View className={`px-3 py-1.5 rounded-xl ${style.bg}`}>
                    <Text className={`text-[10px] font-black ${style.text}`}>
                      {item.statut.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                {/* Client + Technicien */}
                <View className="flex-row gap-2 mb-3">
                  <View className="flex-row items-center bg-[#1A1A1A] px-3 py-2 rounded-xl flex-1">
                    <Ionicons name="person-outline" size={12} color="#FBBF24" />
                    <Text className="text-gray-300 text-xs ml-2" numberOfLines={1}>
                      {item.client?.user?.prenom} {item.client?.user?.nom}
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-[#1A1A1A] px-3 py-2 rounded-xl flex-1">
                    <Ionicons name="construct-outline" size={12} color="#FBBF24" />
                    <Text className="text-gray-300 text-xs ml-2" numberOfLines={1}>
                      {item.technicien?.user?.prenom || 'Non assigné'}
                    </Text>
                  </View>
                </View>

                {/* Lieu */}
                <View className="flex-row items-center bg-[#1A1A1A] px-3 py-2 rounded-xl mb-3">
                  <Ionicons name="location-outline" size={12} color="#FBBF24" />
                  <Text className="text-gray-300 text-xs ml-2" numberOfLines={1}>
                    {item.lieuIntervention}
                  </Text>
                </View>

                {/* Footer */}
                <View className="flex-row justify-between items-center border-t border-white/5 pt-3">
                  <View>
                    <Text className="text-gray-500 text-[10px] uppercase font-bold">
                      Montant
                    </Text>
                    <Text className="text-[#FBBF24] text-lg font-black">
                      {montant.toLocaleString()} FCFA
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <Text className="text-gray-500 text-xs">
                      {new Date(item.dateCommande).toLocaleDateString('fr-FR')}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}