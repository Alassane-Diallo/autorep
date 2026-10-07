import { KeyIcon, X } from "lucide-react-native";
import { useState } from "react";
import {
  Keyboard, KeyboardAvoidingView, Modal, Platform,
  Pressable, Text, TouchableOpacity, TouchableWithoutFeedback,
  View, Alert, ActivityIndicator
} from "react-native";
import { InputField } from "../ui/inputs";
import api from "@/services/api";
import { router } from "expo-router";

export function UpdatePasswordUser({ 
  visible, 
  onClose 
}: { 
  visible: boolean, 
  onClose: () => void 
}) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetForm = () => {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUpdate = async () => {

    // Vérification des champs vides
    if (!form.currentPassword.trim()) {
      Alert.alert("Erreur", "L'ancien mot de passe est requis.");
      return;
    }
    if (!form.newPassword.trim()) {
      Alert.alert("Erreur", "Le nouveau mot de passe est requis.");
      return;
    }
    if (!form.confirmPassword.trim()) {
      Alert.alert("Erreur", "La confirmation est requise.");
      return;
    }

    // Vérification longueur minimum
    if (form.newPassword.length < 6) {
      Alert.alert("Erreur", "Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    // Vérification correspondance
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    // Vérification que le nouveau est différent de l'ancien
    if (form.currentPassword === form.newPassword) {
      Alert.alert("Erreur", "Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    try {
      setIsLoading(true);

      await api.patch('/api/users/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      Alert.alert("Succès", "Mot de passe modifié avec succès.");
      router.replace("/(auth)/login")
      resetForm();
      onClose();

    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Erreur lors de la modification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      transparent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/60">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="bg-[#1A1A1A] rounded-t-[40px]"
          >
            {/* Handle */}
            <View className="items-center mt-3">
              <View className="w-12 h-1.5 bg-[#FBBF24]/70 rounded-full" />
            </View>

            <View className="p-8">

              {/* Header */}
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-white text-xl font-black uppercase italic tracking-tighter">
                  Modifier le <Text className="text-[#FBBF24]">mot de passe</Text>
                </Text>
                <Pressable
                  onPress={handleClose}
                  className="bg-[#0F0F0F] p-2 rounded-full"
                >
                  <X size={16} color="#64748b" />
                </Pressable>
              </View>

              {/* Ancien mot de passe */}
              <InputField
                label="Ancien mot de passe"
                icon={KeyIcon}
                placeholder="Votre ancien mot de passe"
                value={form.currentPassword}
                onChange={(t: string) => setForm(prev => ({ ...prev, currentPassword: t }))}
                isPassword={true}
              />

              {/* Nouveau mot de passe */}
              <InputField
                label="Nouveau mot de passe"
                icon={KeyIcon}
                placeholder="Minimum 6 caractères"
                value={form.newPassword}
                onChange={(t: string) => setForm(prev => ({ ...prev, newPassword: t }))}
                isPassword={true}
              />

              {/* Confirmation */}
              <InputField
                label="Confirmer le mot de passe"
                icon={KeyIcon}
                placeholder="Répétez le nouveau mot de passe"
                value={form.confirmPassword}
                onChange={(t: string) => setForm(prev => ({ ...prev, confirmPassword: t }))}
                isPassword={true}
              />

              {/* Bouton */}
              <TouchableOpacity
                onPress={handleUpdate}
                disabled={isLoading}
                className="bg-[#FBBF24] h-14 rounded-2xl items-center justify-center mt-4"
              >
                {isLoading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black text-base font-black uppercase">
                    Modifier
                  </Text>
                )}
              </TouchableOpacity>

            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}