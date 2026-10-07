import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

export function CreateModalServices({ visible, onClose, onRefresh }: { visible: boolean, onClose: () => void, onRefresh: () => void }){
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleAddService = async () => {
        if (!name || !price) {
            Alert.alert("Erreur", "Le nom et le prix sont obligatoires.");
            return;
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
            Alert.alert("Erreur", "Le prix doit être un nombre valide.");
            return;
        }

        try {
            await api.post("/api/prestations", { 
                libelle: name, 
                statut: "DISPONIBLE", 
                prix: parsedPrice 
            });
            
            setName(''); 
            setPrice('');
            onClose();
            onRefresh();
        } catch (error: any) {
            console.error("Erreur ajout:", error.response?.data);
            Alert.alert("Erreur", error.response?.data?.message || "Impossible d'ajouter le service.");
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-end bg-black/80">
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                        <View className="bg-[#121212] p-8 rounded-t-[40px] border-t border-white/10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-white text-xl font-black">NOUVEAU SERVICE</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close-circle" size={28} color="#4B5563" />
                                </TouchableOpacity>
                            </View>

                            <TextInput 
                                placeholder="Nom du service (ex: Vidange)"
                                placeholderTextColor="#4B5563"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-4 border border-white/5"
                                value={name}
                                onChangeText={setName}
                            />
                            
                            <TextInput 
                                placeholder="Prix (F CFA)"
                                placeholderTextColor="#4B5563"
                                keyboardType="numeric"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-8 border border-white/5"
                                value={price}
                                onChangeText={setPrice}
                            />

                            <TouchableOpacity 
                                onPress={handleAddService}
                                className="bg-[#FBBF24] p-5 rounded-2xl items-center"
                            >
                                <Text className="text-black font-black uppercase">Enregistrer le service</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

export function UpdateModalServices({ visible, onClose, onRefresh, service }: { visible: boolean, onClose: () => void, onRefresh: () => void, service: any }){
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        if (service) {
            setName(service.libelle || '');
            setPrice(service.prix ? String(service.prix) : '');
        }
    }, [service, visible]);

    const handleUpdateService = async () => {
        if (!name || !price) {
            Alert.alert("Erreur", "Le nom et le prix sont obligatoires.");
            return;
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
            Alert.alert("Erreur", "Le prix doit être un nombre valide.");
            return;
        }

        const serviceId = service?.id_service || service?.id;

        try {
            await api.patch(`/api/prestations/${serviceId}`, { 
                libelle: name, 
                statut: "DISPONIBLE", 
                prix: parsedPrice 
            });
            
            onClose();
            onRefresh();
        } catch (error: any) {
            console.error("Erreur modification:", error.response?.data);
            Alert.alert("Erreur", error.response?.data?.message || "Impossible de modifier le service.");
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-end bg-black/80">
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                        <View className="bg-[#121212] p-8 rounded-t-[40px] border-t border-white/10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-white text-xl font-black">MODIFIER LE SERVICE</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close-circle" size={28} color="#4B5563" />
                                </TouchableOpacity>
                            </View>

                            <TextInput 
                                placeholder="Nom du service"
                                placeholderTextColor="#4B5563"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-4 border border-white/5"
                                value={name}
                                onChangeText={setName}
                            />
                            
                            <TextInput 
                                placeholder="Prix (F CFA)"
                                placeholderTextColor="#4B5563"
                                keyboardType="numeric"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-8 border border-white/5"
                                value={price}
                                onChangeText={setPrice}
                            />

                            <TouchableOpacity 
                                onPress={handleUpdateService}
                                className="bg-[#FBBF24] p-5 rounded-2xl items-center"
                            >
                                <Text className="text-black font-black uppercase">Enregistrer les modifications</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}