import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, Text, ScrollView, Image, TouchableOpacity, 
  Modal, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/context/auth-context';
import api from '@/services/api';

const CATEGORIES = [
  { id: '1', title: 'Toutes', slug: 'all', icon: 'apps' },
  { id: '2', title: 'Carrosserie', slug: 'carrosserie', icon: 'car' },
  { id: '3', title: 'Peinture', slug: 'peinture', icon: 'brush' },
  { id: '4', title: 'Mécanique', slug: 'mecanique', icon: 'build' },
];

export default function ClientDashboard() {
  const { user } = useAuthContext();

  // États UI
  const [activeTab, setActiveTab] = useState('all');
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPrestations, setLoadingPrestations] = useState(true);

  // États données
  const [prestations, setPrestations] = useState<any[]>([]);
  const [selectedPrestations, setSelectedPrestations] = useState<string[]>([]);
  const [lieuIntervention, setLieuIntervention] = useState(user?.client?.adresse || '');

  // Charger les prestations depuis l'API
  useEffect(() => {
    fetchPrestations();
  }, []);

  const fetchPrestations = async () => {
    try {
      setLoadingPrestations(true);
      const response = await api.get('/api/prestations');
      setPrestations(response.data.data);
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible de charger les services.");
    } finally {
      setLoadingPrestations(false);
    }
  };

  // Filtrage selon la catégorie
  const filteredPrestations = useMemo(() => {
    if (activeTab === 'all') return prestations;
    return prestations.filter(p => 
      p.libelle.toLowerCase().includes(activeTab)
    );
  }, [activeTab, prestations]);

  // Sélectionner/désélectionner une prestation
  const togglePrestation = (id: string) => {
    setSelectedPrestations(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]
    );
  };

  // Créer la commande
  const handleCreateOrder = async () => {
    if (selectedPrestations.length === 0) {
      Alert.alert("Attention", "Veuillez sélectionner au moins un service.");
      return;
    }
    if (!lieuIntervention) {
      Alert.alert("Attention", "Veuillez indiquer le lieu d'intervention.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/commandes', {
        prestationsIds: selectedPrestations,
        lieuIntervention
      });

      Alert.alert("Succès", "Votre commande a été envoyée !");
      setModalVisible(false);
      setSelectedPrestations([]);
      setLieuIntervention('');
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de créer la commande.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HERO BANNER */}
        <View className="mx-4 mt-4 rounded-3xl overflow-hidden h-48 relative mb-8 shadow-2xl">
          <Image 
            source={require("../../assets/images/login_img.jpg")} 
            className="w-full h-full opacity-60" 
          />
          <View className="absolute inset-0 bg-black/20" />
          <View className="absolute bottom-6 left-6">
            <Text className="text-white text-3xl font-black uppercase italic">
              Auto <Text className="text-[#FBBF24]">Rep</Text>
            </Text>
            <Text className="text-gray-200 mt-1">
              Bonjour {user?.prenom} 👋
            </Text>
          </View>
        </View>

        {/* CATEGORIES */}
        <View className="mb-6">
          <Text className="text-white text-xl font-bold px-5 mb-4">
            Nos Services
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="px-5"
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveTab(cat.slug)}
                className={`flex-row items-center px-5 py-3.5 rounded-2xl mr-3 border ${
                  activeTab === cat.slug 
                    ? 'bg-[#FBBF24] border-[#FBBF24]' 
                    : 'bg-[#1A1A1A] border-white/5'
                }`}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={18} 
                  color={activeTab === cat.slug ? '#000' : '#9CA3AF'} 
                />
                <Text className={`ml-2 font-bold ${
                  activeTab === cat.slug ? 'text-black' : 'text-gray-400'
                }`}>
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* LISTE PRESTATIONS */}
        <View className="px-5">
          {loadingPrestations ? (
            <ActivityIndicator color="#FBBF24" size="large" className="mt-10" />
          ) : filteredPrestations.length === 0 ? (
            <Text className="text-gray-400 text-center mt-10">
              Aucun service disponible
            </Text>
          ) : (
            filteredPrestations.map((item) => (
              <View 
                key={item.id} 
                className="bg-[#1A1A1A] rounded-[32px] overflow-hidden mb-6 border border-white/5"
              >
                <View className="p-6">
                  <View className="flex-row justify-between items-start mb-3">
                    <Text className="text-white text-2xl font-bold tracking-tight flex-1">
                      {item.libelle}
                    </Text>
                    <View className={`px-3 py-1 rounded-full ${
                      item.statut === 'DISPONIBLE' 
                        ? 'bg-green-500/20' 
                        : 'bg-red-500/20'
                    }`}>
                      <Text className={`text-xs font-bold ${
                        item.statut === 'DISPONIBLE' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {item.statut === 'DISPONIBLE' ? 'Disponible' : 'Indisponible'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center mt-4">
                    <View>
                      <Text className="text-gray-500 text-xs uppercase font-bold">
                        Prix
                      </Text>
                      <Text className="text-[#FBBF24] text-2xl font-black">
                        {item.prix} FCFA
                      </Text>
                    </View>
                    {item.statut === 'DISPONIBLE' && (
                      <TouchableOpacity
                        onPress={() => {
                          togglePrestation(item.id);
                          setModalVisible(true);
                        }}
                        className="bg-[#FBBF24] px-8 py-3.5 rounded-2xl"
                      >
                        <Text className="text-black font-black uppercase text-xs">
                          Réserver
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* MODAL COMMANDE */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible}>
        <View className="flex-1 justify-end bg-black/90">
          <View className="bg-[#1A1A1A] rounded-t-[40px] p-8 border-t border-white/10">
            <View className="w-12 h-1.5 bg-gray-700 rounded-full self-center mb-8" />

            <Text className="text-white text-2xl font-black mb-1">
              Confirmer la commande
            </Text>
            <Text className="text-gray-400 mb-6">
              {selectedPrestations.length} service(s) sélectionné(s)
            </Text>

            {/* Lieu d'intervention */}
            <View className="bg-[#0F0F0F] p-4 rounded-2xl border border-white/5 mb-6">
              <Text className="text-[#FBBF24] text-[10px] font-black uppercase mb-2">
                Lieu d&apos;intervention
              </Text>
              <TextInput
                placeholder="Ex: Bamako, ACI 2000"
                placeholderTextColor="#333"
                value={lieuIntervention}
                onChangeText={setLieuIntervention}
                className="text-white text-lg font-bold"
              />
            </View>

            <TouchableOpacity
              onPress={handleCreateOrder}
              disabled={loading}
              className="bg-[#FBBF24] w-full py-5 rounded-2xl"
            >
              {loading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text className="text-black text-center font-black text-lg uppercase">
                  Envoyer au technicien
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setModalVisible(false);
                setSelectedPrestations([]);
              }} 
              className="mt-4 py-2"
            >
              <Text className="text-gray-500 text-center font-bold uppercase tracking-widest text-xs">
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOUTON FLOTTANT */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-6 bg-[#FBBF24] w-16 h-16 rounded-full items-center justify-center shadow-2xl"
        style={{ elevation: 15 }}
      >
        <Ionicons name="add" size={38} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}