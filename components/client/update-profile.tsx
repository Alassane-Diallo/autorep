import { UserResponse } from "@/lib/type";
import { X } from "lucide-react-native";
import { useState, useEffect } from "react";
import { 
  Keyboard, KeyboardAvoidingView, Modal, Platform, 
  Pressable, Text, TouchableWithoutFeedback, View, 
  TextInput, TouchableOpacity, Alert, ActivityIndicator 
} from "react-native";
import api from "@/services/api";

export function UpdateProfileUser({ 
  profile, visible, onClose, onSuccess 
}: { 
  profile: UserResponse | null, 
  visible: boolean, 
  onClose: () => void,
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
  });
  const [loading, setLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(true);

  const regexPhone = /^\d{2}(\s\d{2}){3}$/;

  // Pré-remplir avec les données actuelles
  useEffect(() => {
    if (profile) {
      // Si le téléphone existe déjà en base de données, on le formate pour l'affichage initial
      const initialPhone = profile.telephone ? formatPhoneNumber(profile.telephone) : '';
      
      setForm({
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        telephone: initialPhone,
        adresse: profile.client?.adresse || '',
      });
      setIsPhoneValid(initialPhone === '' ? true : regexPhone.test(initialPhone));
    }
  }, [profile, visible]);

  // Fonction magique pour formater automatiquement la saisie (XX XX XX XX)
  const formatPhoneNumber = (text: string) => {
    // On nettoie pour ne garder QUE les chiffres
    const cleaned = text.replace(/[^0-9]/g, "");
    
    // On découpe par blocs de 2 chiffres avec des espaces
    const parts = cleaned.match(/.{1,2}/g);
    
    // On limite à 4 blocs (soit 8 chiffres max au total) et on rassemble avec un espace
    return parts ? parts.slice(0, 4).join(" ") : cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setForm({ ...form, telephone: formatted });

    if (formatted === "") {
      setIsPhoneValid(true);
      return;
    }

    // On teste le texte formaté avec la regex (ex: "76 00 11 22")
    setIsPhoneValid(regexPhone.test(formatted));
  };

  const handleUpdate = async () => {
    // Vérification des champs obligatoires
    if (!form.nom.trim()) {
      Alert.alert("Erreur", "Le nom est requis.");
      return;
    }
    if (!form.prenom.trim()) {
      Alert.alert("Erreur", "Le prénom est requis.");
      return;
    }

    // Bloquer la sauvegarde si le téléphone est invalide
    if (form.telephone.trim() && !isPhoneValid) {
      Alert.alert("Erreur", "Le numéro de téléphone doit contenir exactement 8 chiffres.");
      return;
    }

    // Vérifier si quelque chose a changé
    const hasChanged = 
      form.nom !== profile?.nom ||
      form.prenom !== profile?.prenom ||
      form.telephone !== (profile?.telephone || '') ||
      form.adresse !== (profile?.client?.adresse || '');

    if (!hasChanged) {
      Alert.alert("Info", "Aucune modification détectée.");
      return;
    }

    try {
      setLoading(true);
      await api.patch('/api/users/profile', {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        // On envoie le téléphone au serveur (on peut enlever les espaces ou le laisser tel quel selon ton API)
        telephone: form.telephone.trim() || undefined,
        adresse: form.adresse.trim() || undefined,
      });

      Alert.alert("Succès", "Profil mis à jour avec succès.");
      onSuccess();
      onClose();

    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      transparent
      statusBarTranslucent
      animationType="slide"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/60">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="bg-[#1A1A1A] rounded-t-[40px]"
          >
            {/* Handle */}
            <View className="items-center mt-3">
              <View className="w-12 h-1.5 bg-slate-700 rounded-full" />
            </View>

            <View className="p-8">
              
              {/* Header */}
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-white text-xl font-black uppercase italic tracking-tighter">
                  Modifier le <Text className="text-[#FBBF24]">profil</Text>
                </Text>
                <Pressable
                  onPress={onClose}
                  className="bg-[#0F0F0F] p-2 rounded-full"
                >
                  <X size={16} color="#64748b" />
                </Pressable>
              </View>

              {/* Champ Prénom */}
              <InputField
                label="Prénom"
                value={form.prenom}
                onChange={(v) => setForm({ ...form, prenom: v })}
                placeholder="Votre prénom"
              />

              {/* Champ Nom */}
              <InputField
                label="Nom"
                value={form.nom}
                onChange={(v) => setForm({ ...form, nom: v })}
                placeholder="Votre nom"
              />

              {/* Champ Téléphone personnalisé avec gestion de la Regex */}
              <InputField
                label="Téléphone"
                value={form.telephone}
                onChange={handlePhoneChange}
                placeholder="Ex: 76 00 11 22"
                keyboard="phone-pad"
                isValid={isPhoneValid}
                errorMessage="Format invalide (Ex: 76 00 11 22)"
                maxLength={11} // 8 chiffres + 3 espaces générés automatiquement
              />

              {/* Champ Adresse — seulement pour CLIENT */}
              {profile?.role === 'CLIENT' && (
                <InputField
                  label="Adresse"
                  value={form.adresse}
                  onChange={(v) => setForm({ ...form, adresse: v })}
                  placeholder="Votre adresse"
                />
              )}

              {/* Bouton Sauvegarder */}
              <TouchableOpacity
                onPress={handleUpdate}
                disabled={loading}
                className="bg-[#FBBF24] h-14 rounded-2xl items-center justify-center mt-6"
              >
                {loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black font-black text-base uppercase">
                    Sauvegarder
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

// --- COMPOSANT INPUT MIS À JOUR ---
function InputField({ label, value, onChange, placeholder, keyboard, isValid = true, errorMessage, maxLength }: {
  label: string,
  value: string,
  onChange: (v: string) => void,
  placeholder: string,
  keyboard?: any,
  isValid?: boolean,
  errorMessage?: string,
  maxLength?: number
}) {
  return (
    <View className="mb-4">
      <Text className="text-gray-400 text-xs uppercase font-bold mb-2 ml-1">
        {label}
      </Text>
      <View 
        className={`bg-[#0F0F0F] border rounded-2xl px-4 h-14 justify-center ${
          isValid ? 'border-white/10 focus:border-[#FBBF24]' : 'border-red-500'
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#374151"
          keyboardType={keyboard || 'default'}
          maxLength={maxLength}
          className="text-white text-base"
        />
      </View>
      {!isValid && errorMessage && (
        <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{errorMessage}</Text>
      )}
    </View>
  );
}