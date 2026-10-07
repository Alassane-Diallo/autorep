import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, RefreshControl, 
  ActivityIndicator, TouchableOpacity, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';

// --- STATUTS ---
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'TERMINEE':  return { bg: 'bg-green-500/20',  text: 'text-green-400',  icon: 'checkmark-circle' };
    case 'REFUSEE':   return { bg: 'bg-red-500/20',    text: 'text-red-400',    icon: 'close-circle' };
    case 'EN_COURS':  return { bg: 'bg-blue-500/20',   text: 'text-blue-400',   icon: 'hammer' };
    case 'ACCEPTEE':  return { bg: 'bg-indigo-500/20', text: 'text-indigo-400', icon: 'calendar' };
    case 'PAYEE':     return { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: 'card' };
    default:          return { bg: 'bg-amber-500/20',  text: 'text-amber-400',  icon: 'time' };
  }
};

// --- COMPOSANT ITEM ---
const OrderItem = ({ item, onPay }: { item: any, onPay: (id: string) => void }) => {
  const style = getStatusStyle(item.statut);

  // Calcul du montant total
  const montantTotal = item.prestations?.reduce(
    (total: number, cp: any) => total + (cp.prestation?.prix || 0), 0
  ) || 0;

  return (
    <View className="bg-[#1A1A1A] mb-4 p-5 rounded-[32px] border border-white/5">
      
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-2">
          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
            Réf: {item.id.split('-')[0]}
          </Text>
          <Text className="text-white text-lg font-bold mt-1">
            {item.prestations?.map((cp: any) => cp.prestation?.libelle).join(', ')}
          </Text>
        </View>
        <View className={`px-3 py-1.5 rounded-xl flex-row items-center ${style.bg}`}>
          <Ionicons name={style.icon as any} size={12} color="#fff" />
          <Text className={`${style.text} text-[10px] font-black ml-1`}>
            {item.statut}
          </Text>
        </View>
      </View>

      {/* Infos */}
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-row items-center bg-[#0F0F0F] px-3 py-2 rounded-lg">
          <Ionicons name="calendar-outline" size={14} color="#FBBF24" />
          <Text className="text-gray-300 ml-2 text-xs font-medium">
            {new Date(item.dateCommande).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View className="flex-row items-center bg-[#0F0F0F] px-3 py-2 rounded-lg flex-1">
          <Ionicons name="location-outline" size={14} color="#FBBF24" />
          <Text className="text-gray-300 ml-2 text-xs font-medium" numberOfLines={1}>
            {item.lieuIntervention}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="border-t border-white/5 pt-4 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500 text-xs font-bold uppercase">Montant Total</Text>
          <Text className="text-[#FBBF24] text-2xl font-black">{montantTotal} FCFA</Text>
        </View>

        {/* Bouton payer si ACCEPTEE */}
        {item.statut === 'ACCEPTEE' && (
          <TouchableOpacity
            onPress={() => onPay(item.id)}
            className="bg-[#FBBF24] px-6 py-3 rounded-2xl"
          >
            <Text className="text-black font-black uppercase text-xs">Payer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// --- ECRAN PRINCIPAL ---
export default function CommandesScreen() {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCommandes = async () => {
    try {
      const response = await api.get('/api/commandes/mes');
      setCommandes(response.data.data);
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCommandes();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCommandes();
  }, []);

  const handlePay = (commandeId: string) => {
    Alert.alert(
      "Mode de paiement",
      "Choisissez votre mode de paiement",
      [
        {
          text: "Mobile Money",
          onPress: () => payCommande(commandeId, 'MOBILE_MONEY')
        },
        {
          text: "Cash",
          onPress: () => payCommande(commandeId, 'CASH')
        },
        {
          text: "Carte",
          onPress: () => payCommande(commandeId, 'CARTE')
        },
        { text: "Annuler", style: "cancel" }
      ]
    );
  };

  const payCommande = async (commandeId: string, mode: string) => {
    try {
      await api.post(`/api/commandes/${commandeId}/payer`, { mode });
      Alert.alert("Succès", "Paiement effectué avec succès !");
      loadCommandes();
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Erreur lors du paiement.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      
      {/* Header */}
      <View className="px-6 py-6 flex-row justify-between items-end">
        <View>
          <Text className="text-white text-3xl font-black italic uppercase">
            Mes <Text className="text-[#FBBF24]">Suivis</Text>
          </Text>
          <Text className="text-gray-500 font-medium">
            Historique de vos interventions
          </Text>
        </View>
        <TouchableOpacity 
          onPress={loadCommandes}
          className="bg-[#1A1A1A] p-2 rounded-full border border-white/5"
        >
          <Ionicons name="refresh" size={20} color="#FBBF24" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FBBF24" />
        </View>
      ) : (
        <FlatList
          data={commandes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderItem item={item} onPay={handlePay} />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
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
                Vous n&apos;avez pas encore passé de commande.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}