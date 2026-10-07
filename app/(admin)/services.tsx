import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { CreateModalServices, UpdateModalServices } from '@/components/admin/modal';

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/prestations");
      setServices(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Erreur services:", error);
      Alert.alert("Erreur", "Impossible de charger les prestations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadServices(); 
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert("Suppression", "Supprimer ce service ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Supprimer", 
        style: "destructive", 
        onPress: async () => {
          try {
            await api.delete(`/api/prestations/${id}`);
            loadServices();
          } catch (error) {
            console.error(error);
            Alert.alert("Erreur", "Impossible de supprimer le service.");
          }
        } 
      }
    ]);
  };

  // Déclencheur propre pour l'ouverture du modal de modification
  const handleOpenUpdateModal = (service: any) => {
    setSelectedService(service);
    setUpdateModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]" edges={['top']}>
      {/* HEADER SECTION */}
      <View className="px-6 py-6 flex-row justify-between items-center border-b border-white/5 bg-[#121212]">
        <View className="flex-1 mr-4">
          <Text className="text-white text-xl font-black italic uppercase">
            Services
          </Text>
        </View>
        <TouchableOpacity 
            className="bg-[#FBBF24] w-10 h-10 rounded-full items-center justify-center shadow-lg"
            onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* TABLE HEADER */}
      <View className="flex-row px-6 py-4 border-b border-white/10 bg-[#0F0F0F]">
        <Text className="flex-[2] text-gray-600 text-[10px] font-black uppercase">Service</Text>
        <Text className="flex-1 text-center text-gray-600 text-[10px] font-black uppercase">Prix(F CFA)</Text>
        <Text className="flex-1 text-right text-gray-600 text-[10px] font-black uppercase">Action</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#FBBF24" size="large" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id_service || item.id)}
          renderItem={({ item }) => {
            const itemId = item.id_service || item.id;
            
            return (
              <View className="flex-row items-center px-6 py-5 border-b border-white/5">
                <View className="flex-[2] flex-row items-center">
                  <View className="bg-[#1A1A1A] p-2 rounded-lg mr-3">
                      <Ionicons name="construct-outline" size={16} color="#FBBF24" />
                  </View>
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>{item.libelle}</Text>
                </View>

                <Text className="flex-1 text-[#FBBF24] font-black text-center">{item.prix} F</Text>

                <View className="flex-1 flex-row justify-end gap-4">
                  {/* Bouton Modifier : Crayon jaune/orange */}
                  <TouchableOpacity onPress={() => handleOpenUpdateModal(item)}>
                      <Ionicons name="create-outline" size={18} color="#FBBF24" />
                  </TouchableOpacity>
                  
                  {/* Bouton Supprimer : Poubelle rouge */}
                  <TouchableOpacity onPress={() => handleDelete(itemId)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* MODAL D'ENREGISTREMENT */}
      <CreateModalServices 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onRefresh={loadServices}
      />
      
      {/* MODAL DE MODIFICATION */}
      <UpdateModalServices 
        visible={updateModalVisible} 
        onClose={() => {
            setUpdateModalVisible(false);
            setSelectedService(null);
        }} 
        onRefresh={loadServices} 
        service={selectedService}
      />
    </SafeAreaView>
  );
}