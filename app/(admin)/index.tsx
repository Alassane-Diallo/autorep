import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, ScrollView, RefreshControl, 
  ActivityIndicator, TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { useAuthContext } from '@/context/auth-context';

// --- COMPOSANT STAT CARD ---
const StatCard = ({ title, value, icon, color, subtitle }: {
  title: string, value: string | number,
  icon: any, color: string, subtitle: string
}) => (
  <View className="bg-[#121212] w-[48%] p-5 rounded-[28px] mb-4 border border-white/5 relative overflow-hidden">
    <View style={{ backgroundColor: color }} 
      className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-5" 
    />
    <View className="flex-row justify-between items-center mb-4">
      <View className="p-2 rounded-xl bg-[#1A1A1A] border border-white/5">
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Ionicons name="trending-up-outline" size={14} color="#4B5563" />
    </View>
    <Text className="text-white text-2xl font-black tracking-tight">{value}</Text>
    <Text className="text-gray-400 text-[11px] font-bold mt-1">{title}</Text>
    <Text className="text-gray-600 text-[9px] mt-0.5 font-medium">{subtitle}</Text>
  </View>
);

// --- COMPOSANT STATUS BADGE ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    TERMINEE:   "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    EN_COURS:   "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    REFUSEE:    "bg-red-500/10 text-red-500 border border-red-500/20",
    EN_ATTENTE: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
    ACCEPTEE:   "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
    PAYEE:      "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  };

  return (
    <View className={`px-2.5 py-1 rounded-xl ${styles[status] || styles.EN_ATTENTE}`}>
      <Text className="text-[8px] font-black uppercase tracking-wider">
        {status.replace('_', ' ')}
      </Text>
    </View>
  );
};

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const [commandes, setCommandes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    active: 0,
    revenue: 0,
    finished: 0,
    clients: 0
  });

  const loadDashboardData = async () => {
    try {
      // Charger commandes et users en parallèle
      const [commandesRes, usersRes] = await Promise.all([
        api.get('/api/commandes'),
        api.get('/api/users')
      ]);

      const orders = commandesRes.data.data || [];
      const allUsers = usersRes.data.data || [];

      setCommandes(orders);
      setUsers(allUsers);

      // Calcul des stats
      const active = orders.filter((o: any) => 
        !['TERMINEE', 'REFUSEE'].includes(o.statut)
      ).length;

      const finished = orders.filter((o: any) => 
        o.statut === 'TERMINEE'
      ).length;

      const revenue = orders
        .filter((o: any) => o.statut === 'TERMINEE')
        .reduce((acc: number, curr: any) => {
          const montant = curr.prestations?.reduce(
            (t: number, cp: any) => t + (cp.prestation?.prix || 0), 0
          ) || 0;
          return acc + montant;
        }, 0);

      const clients = allUsers.filter((u: any) => 
        u.role === 'CLIENT'
      ).length;

      setStats({ active, revenue, finished, clients });

    } catch (error) {
      console.error("Erreur Dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  const formatPrice = (amount: number) =>
    amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const recentOrders = commandes.slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#FBBF24" 
          />
        }
      >
        {/* HEADER */}
        <View className="px-6 py-8 flex-row justify-between items-center bg-[#121212]/30 border-b border-white/5 mb-6">
          <View>
            <View className="flex-row items-center">
              <Text className="text-white text-3xl font-black uppercase tracking-tight">
                Panel
              </Text>
              <View className="bg-[#FBBF24] ml-2 px-2 py-0.5 rounded-lg">
                <Text className="text-black text-xs font-black uppercase">Admin</Text>
              </View>
            </View>
            <Text className="text-gray-500 font-medium text-xs mt-1">
              Bonjour {user?.prenom} — Supervision en temps réel
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#1A1A1A] p-3 rounded-2xl border border-white/5"
          >
            <Ionicons name="notifications-outline" size={20} color="#FBBF24" />
          </TouchableOpacity>
        </View>

        {/* STATS */}
        {loading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#FBBF24" />
          </View>
        ) : (
          <>
            <View className="flex-row flex-wrap justify-between px-6">
              <StatCard
                title="Commandes Actives"
                value={stats.active}
                icon="duplicate-outline"
                color="#3B82F6"
                subtitle="Interventions en cours"
              />
              <StatCard
                title="Chiffre d'Affaires"
                value={`${formatPrice(stats.revenue)} F`}
                icon="wallet-outline"
                color="#10B981"
                subtitle="Prestations encaissées"
              />
              <StatCard
                title="Travaux Terminés"
                value={stats.finished}
                icon="checkmark-done-circle-outline"
                color="#A855F7"
                subtitle="Véhicules livrés"
              />
              <StatCard
                title="Clients"
                value={stats.clients}
                icon="people-outline"
                color="#FBBF24"
                subtitle="Inscrits sur la plateforme"
              />
            </View>

            {/* COMMANDES RECENTES */}
            <View className="mt-6 px-6 pb-12">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-white text-lg font-black tracking-tight">
                  Dernières Activités
                </Text>
                <TouchableOpacity>
                  <Text className="text-[#FBBF24] text-xs font-black uppercase tracking-wider">
                    Voir tout
                  </Text>
                </TouchableOpacity>
              </View>

              {recentOrders.length === 0 ? (
                <View className="bg-[#121212] rounded-[32px] p-10 items-center border border-dashed border-white/10">
                  <View className="bg-[#1A1A1A] p-4 rounded-full mb-3">
                    <Ionicons name="receipt-outline" size={28} color="#4B5563" />
                  </View>
                  <Text className="text-gray-500 text-center font-semibold text-sm">
                    Aucune commande enregistrée
                  </Text>
                </View>
              ) : (
                recentOrders.map((item) => {
                  const montant = item.prestations?.reduce(
                    (t: number, cp: any) => t + (cp.prestation?.prix || 0), 0
                  ) || 0;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      className="bg-[#121212] mb-3 p-4 rounded-[24px] border border-white/5 flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1 pr-3">
                        <View className="bg-[#1A1A1A] p-3 rounded-xl border border-white/5 mr-4">
                          <Ionicons name="car-sport-outline" size={18} color="#FBBF24" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-bold text-sm" numberOfLines={1}>
                            {item.client?.user?.prenom} {item.client?.user?.nom}
                          </Text>
                          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-wider mt-0.5" numberOfLines={1}>
                            {item.prestations?.map((cp: any) => cp.prestation?.libelle).join(', ')}
                          </Text>
                        </View>
                      </View>

                      <View className="items-end justify-center">
                        <Text className="text-white font-black text-sm">
                          {formatPrice(montant)} F
                        </Text>
                        <View className="mt-1.5">
                          <StatusBadge status={item.statut} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}