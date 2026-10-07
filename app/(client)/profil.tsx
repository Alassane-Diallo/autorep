import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { UserResponse } from "@/lib/type";
import api from "@/services/api";
import { UpdateProfileUser } from "@/components/client/update-profile";
import { UpdatePasswordUser } from "@/components/client/update-password";

export default function Profile() {
  const [imageUri, setImageUri] = useState<string>("");
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [visibleModalPassword, setVisibleModalPassword] = useState<boolean>(false);

  const loadProfile = useCallback(async () => {
    try {
      const response = await api.get("/api/auth/me");
      setProfile(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadAvatarUser = useCallback(async () => {
    try {
      const savedUri = await SecureStore.getItemAsync("user_avatar");
      if (savedUri) setImageUri(savedUri);
    } catch (error) {
      console.log("Erreur SecureStore :", error);
    }
  }, []);

  useEffect(() => {
    loadAvatarUser();
    loadProfile();
  }, [loadAvatarUser, loadProfile]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission requise", "Autorisez l'accès à vos photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUri = result.assets[0].uri;
      setImageUri(newUri);
      await SecureStore.setItemAsync("user_avatar", newUri);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HEADER */}
        <View className="px-6 py-6 items-center">
          <Text className="text-gray-500 font-medium">Vos informations personnelles</Text>
        </View>

        {/* AVATAR */}
        <View className="items-center mt-2 mb-8">
          <View className="relative w-28 h-28">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full rounded-full border-2 border-[#FBBF24]"
              />
            ) : (
              <View className="w-full h-full rounded-full bg-[#FBBF24]/20 border-2 border-[#FBBF24] items-center justify-center">
                <Text className="text-[#FBBF24] text-4xl font-black">
                  {profile?.prenom?.charAt(0)}{profile?.nom?.charAt(0)}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={pickImage}
              className="absolute bottom-0 right-0 bg-[#FBBF24] w-9 h-9 rounded-full items-center justify-center border-2 border-[#0F0F0F]"
            >
              <Ionicons name="camera" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-xl font-bold mt-4">
            {profile?.prenom} {profile?.nom}
          </Text>
          <Text className="text-gray-400 text-sm">{profile?.email}</Text>
        </View>

        {/* INFOS */}
        <View className="mx-5 bg-[#1A1A1A] rounded-[28px] border border-white/5 overflow-hidden mb-6">
          
          <InfoRow icon="mail-outline" label="Email" value={profile?.email} />
          
          {profile?.telephone && (
            <InfoRow icon="call-outline" label="Téléphone" value={profile.telephone} />
          )}

          {profile?.client?.adresse && (
            <InfoRow icon="location-outline" label="Adresse" value={profile.client.adresse} last />
          )}

        </View>

        {/* ACTIONS */}
        <View className="mx-5 gap-3">
          <TouchableOpacity
            className="bg-[#FBBF24] h-14 rounded-2xl flex-row items-center justify-center"
            onPress={() => setVisibleModal(!visibleModal)}
         >
            <Ionicons name="create-outline" size={20} color="#000" />
            <Text className="text-black font-black text-base ml-2 uppercase">
              Modifier le profil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#1A1A1A] h-14 rounded-2xl flex-row items-center justify-center border border-white/10"
            onPress={() => setVisibleModalPassword(true)}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#FBBF24" />
            <Text className="text-white font-black text-base ml-2 uppercase">
              Changer le mot de passe
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <UpdateProfileUser profile={profile} visible={visibleModal} onClose={() => setVisibleModal(!visibleModal)} onSuccess={loadProfile}/>
      <UpdatePasswordUser visible={visibleModalPassword} onClose={() => setVisibleModalPassword(!visibleModalPassword)}/>
    </SafeAreaView>
  );
}

// --- COMPOSANT INFO ROW ---
function InfoRow({ icon, label, value, last }: { 
  icon: any, label: string, value?: string, last?: boolean 
}) {
  return (
    <View className={`flex-row items-center px-5 py-4 ${!last ? 'border-b border-white/5' : ''}`}>
      <View className="w-9 h-9 rounded-full bg-[#FBBF24]/10 items-center justify-center mr-4">
        <Ionicons name={icon} size={18} color="#FBBF24" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs uppercase font-bold">{label}</Text>
        <Text className="text-white font-medium mt-0.5">{value || '—'}</Text>
      </View>
    </View>
  );
}