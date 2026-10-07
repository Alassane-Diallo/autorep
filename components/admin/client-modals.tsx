import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

// ==========================================
// A. MODAL POUR CRÉER UN CLIENT (REGISTER)
// ==========================================
export function CreateClientModal({ visible, onClose, onRefresh }: { visible: boolean, onClose: () => void, onRefresh: () => void }){
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telephone, setTelephone] = useState('');

    const handleRegisterClient = async () => {
        if (!name || !email || !password) {
            Alert.alert("Erreur", "Le nom, l'email et le mot de passe sont obligatoires.");
            return;
        }

        try {
            // Utilise ta route globale d'inscription
            await api.post("/api/auth/register", { 
                name,
                email,
                password,
                telephone,
                role: "CLIENT" // L'admin force le rôle à CLIENT à la création
            });
            
            Alert.alert("Succès", "Le client a été créé avec succès.");
            setName(''); setEmail(''); setPassword(''); setTelephone('');
            onClose();
            onRefresh();
        } catch (error: any) {
            console.error("Erreur création client:", error.response?.data);
            Alert.alert("Erreur", error.response?.data?.message || "Impossible de créer le client.");
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-end bg-black/80">
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                        <View className="bg-[#121212] p-8 rounded-t-[40px] border-t border-white/10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-white text-xl font-black">NOUVEAU CLIENT</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close-circle" size={28} color="#4B5563" />
                                </TouchableOpacity>
                            </View>

                            <TextInput 
                                placeholder="Nom complet du client"
                                placeholderTextColor="#4B5563"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-4 border border-white/5"
                                value={name}
                                onChangeText={setName}
                            />
                            
                            <TextInput 
                                placeholder="Adresse Email"
                                placeholderTextColor="#4B5563"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-4 border border-white/5"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <TextInput 
                                placeholder="Téléphone"
                                placeholderTextColor="#4B5563"
                                keyboardType="phone-pad"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-4 border border-white/5"
                                value={telephone}
                                onChangeText={setTelephone}
                            />

                            <TextInput 
                                placeholder="Mot de passe temporaire"
                                placeholderTextColor="#4B5563"
                                secureTextEntry
                                autoCapitalize="none"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-8 border border-white/5"
                                value={password}
                                onChangeText={setPassword}
                            />

                            <TouchableOpacity 
                                onPress={handleRegisterClient}
                                className="bg-[#FBBF24] p-5 rounded-2xl items-center"
                            >
                                <Text className="text-black font-black uppercase">Enregistrer le Client</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

// ==========================================
// B. MODAL POUR MODIFIER UN CLIENT 
// ==========================================
export function UpdateClientModal({ visible, onClose, onRefresh, client }: { visible: boolean, onClose: () => void, onRefresh: () => void, client: any }){
    const [name, setName] = useState('');
    const [telephone, setTelephone] = useState('');

    useEffect(() => {
        if (client) {
            setName(client.name || '');
            setTelephone(client.telephone || '');
        }
    }, [client, visible]);

    const handleUpdateClient = async () => {
        if (!name) {
            Alert.alert("Erreur", "Le nom est obligatoire.");
            return;
        }

        const clientId = client?.id; 

        try {
            // On tape dans /api/users/profile en lui passant l'ID du client ciblé
            await api.patch(`/api/users/profile/${clientId}`, { 
                name, 
                telephone 
            });
            
            Alert.alert("Succès", "Le compte du client a été modifié.");
            onClose();
            onRefresh();
        } catch (error: any) {
            console.error("Erreur modif client:", error.response?.data);
            Alert.alert("Erreur", error.response?.data?.message || "Impossible de modifier ce client.");
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-end bg-black/80">
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                        <View className="bg-[#121212] p-8 rounded-t-[40px] border-t border-white/10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-white text-xl font-black">MODIFIER LE CLIENT</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close-circle" size={28} color="#4B5563" />
                                </TouchableOpacity>
                            </View>

                            <TextInput 
                                placeholder="Nom complet"
                                placeholderTextColor="#4B5563"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-4 border border-white/5"
                                value={name}
                                onChangeText={setName}
                            />

                            <TextInput 
                                placeholder="Téléphone"
                                placeholderTextColor="#4B5563"
                                keyboardType="phone-pad"
                                className="bg-[#1A1A1A] p-4 rounded-2xl text-white mb-8 border border-white/5"
                                value={telephone}
                                onChangeText={setTelephone}
                            />

                            <TouchableOpacity 
                                onPress={handleUpdateClient}
                                className="bg-[#FBBF24] p-5 rounded-2xl items-center"
                            >
                                <Text className="text-black font-black uppercase">Sauvegarder les modifications</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}