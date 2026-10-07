import React, { useState } from 'react';
import { 
  View, Text, ImageBackground, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, 
  Alert, ActivityIndicator 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Phone, ArrowLeft, CheckCircle2, MapPin, Wrench } from 'lucide-react-native';
import { InputField } from '@/components/ui/inputs';
import { RegisterSchema } from '@/lib/type';
import { useAuthContext } from '@/context/auth-context';

export default function Register() {
  const router = useRouter();
  const { register } = useAuthContext();

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT' as 'CLIENT' | 'TECHNICIEN',
    adresse: '',
    specialite: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      if (form.password !== form.confirmPassword) {
        Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
        return;
      }

      setLoading(true);

      const validatedData = RegisterSchema.parse(form);
      const { ...dataToSend } = validatedData;
      await register(dataToSend);

    } catch (error: any) {
      console.log(error);
      // Erreur Zod 4
      if (error?.issues) {
        const firstError = error.issues[0]?.message || "Données invalides."
        Alert.alert("Erreur", firstError)
        return
      }

      // Erreur API
      Alert.alert("Erreur", error.message || "Erreur lors de l'inscription.")

    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/login_img.jpg")}
      className="flex-1"
    >
      <View className="flex-1 bg-black/70 px-6">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 60 }}
          >
            {/* Bouton Retour */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6 self-start bg-white/10 p-2 rounded-full"
            >
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>

            <BlurView
              intensity={40}
              tint="dark"
              className="p-8 rounded-[40px] border border-white/10 overflow-hidden"
            >
              {/* Header */}
              <View className="items-center mb-8">
                <Text className="text-white text-3xl font-bold">Créer un compte</Text>
                <View className="flex-row items-center mt-2">
                  <CheckCircle2 color="#FBBF24" size={16} />
                  <Text className="text-[#FBBF24] ml-2 font-medium capitalize">
                    Espace pro
                  </Text>
                </View>
              </View>

              {/* Choix du rôle */}
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  onPress={() => setForm({ ...form, role: 'CLIENT' })}
                  className={`flex-1 h-12 rounded-2xl items-center justify-center border ${
                    form.role === 'CLIENT'
                      ? 'bg-[#FBBF24] border-[#FBBF24]'
                      : 'border-white/20'
                  }`}
                >
                  <Text className={form.role === 'CLIENT' ? 'text-black font-bold' : 'text-white'}>
                    Client
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setForm({ ...form, role: 'TECHNICIEN' })}
                  className={`flex-1 h-12 rounded-2xl items-center justify-center border ${
                    form.role === 'TECHNICIEN'
                      ? 'bg-[#FBBF24] border-[#FBBF24]'
                      : 'border-white/20'
                  }`}
                >
                  <Text className={form.role === 'TECHNICIEN' ? 'text-black font-bold' : 'text-white'}>
                    Technicien
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Champs */}
              <InputField
                label="Prénom"
                icon={User}
                placeholder="Alassane"
                value={form.prenom}
                onChange={(v: string) => setForm({ ...form, prenom: v })}
              />

              <InputField
                label="Nom"
                icon={User}
                placeholder="Diallo"
                value={form.nom}
                onChange={(v: string) => setForm({ ...form, nom: v })}
              />

              <InputField
                label="Email"
                icon={Mail}
                placeholder="votre@email.com"
                keyboard="email-address"
                value={form.email}
                onChange={(v: string) => setForm({ ...form, email: v })}
              />

              <InputField
                label="Téléphone"
                icon={Phone}
                placeholder="93 05 02 60"
                keyboard="phone-pad"
                value={form.telephone}
                onChange={(v: string) => setForm({ ...form, telephone: v })}
              />

              {/* Champ selon le rôle */}
              {form.role === 'CLIENT' && (
                <InputField
                  label="Adresse"
                  icon={MapPin}
                  placeholder="Bamako, ACI 2000"
                  value={form.adresse}
                  onChange={(v: string) => setForm({ ...form, adresse: v })}
                />
              )}

              {form.role === 'TECHNICIEN' && (
                <InputField
                  label="Spécialité"
                  icon={Wrench}
                  placeholder="Carrosserie, Mécanique..."
                  value={form.specialite}
                  onChange={(v: string) => setForm({ ...form, specialite: v })}
                />
              )}

              <InputField
                label="Mot de passe"
                icon={Lock}
                placeholder="••••••••"
                isPassword
                value={form.password}
                onChange={(v: string) => setForm({ ...form, password: v })}
              />

              <InputField
                label="Confirmer le mot de passe"
                icon={Lock}
                placeholder="••••••••"
                isPassword
                value={form.confirmPassword}
                onChange={(v: string) => setForm({ ...form, confirmPassword: v })}
              />

              {/* Bouton S'inscrire */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                className="bg-[#FBBF24] h-14 rounded-2xl items-center justify-center mt-6 shadow-lg shadow-yellow-500/40"
              >
                {loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black font-bold text-lg">S&apos;inscrire</Text>
                )}
              </TouchableOpacity>

              {/* Lien Login */}
              <TouchableOpacity
                className="mt-6 self-center"
                onPress={() => router.back()}
              >
                <Text className="text-gray-400 text-sm">
                  Déjà un compte ?{" "}
                  <Text className="text-[#FBBF24] font-bold">Se connecter</Text>
                </Text>
              </TouchableOpacity>

            </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}