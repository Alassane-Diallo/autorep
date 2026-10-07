import { 
  View, 
  Text, 
  TextInput, 
  ImageBackground, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useAuthContext } from '@/context/auth-context';
import { useState } from 'react';
import { LoginSchema } from '@/lib/type';
import { router } from 'expo-router';

export default function Login() {
  const { login } = useAuthContext();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const validatedData = LoginSchema.parse({ email, password });
      await login(validatedData);
    } catch (error: any) {
      // Erreur Zod — champs invalides
      if (error.name === "ZodError") {
        const firstError = error.issues[0]?.message || "Veuillez remplir tous les champs."
        Alert.alert("Champs invalides", firstError)
        return;
      }

      // Erreur API — mauvais identifiants etc.
      Alert.alert("Erreur", error.message || "Erreur de connexion.")
      Alert.alert("Erreur", error.message || "Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/login_img.jpg")}
      className="flex-1"
    >
      <View className="flex-1 bg-black/60 justify-center px-6">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          <BlurView
            intensity={40}
            tint="dark"
            className="p-8 rounded-[40px] border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-white text-2xl font-bold">Connexion</Text>
              <Text className="text-gray-400 text-sm mt-1">Accédez à votre espace pro</Text>
            </View>

            {/* Champ Email */}
            <View className="mb-4">
              <Text className="text-gray-300 mb-2 ml-1 text-xs uppercase tracking-widest">
                Email
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 h-14">
                <Mail color="#FBBF24" size={20} />
                <TextInput
                  placeholder="votre@email.com"
                  placeholderTextColor="#666"
                  className="flex-1 ml-3 text-white"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(t: string) => setEmail(t)}
                />
              </View>
            </View>

            {/* Champ Password */}
            <View className="mb-8">
              <Text className="text-gray-300 mb-2 ml-1 text-xs uppercase tracking-widest">
                Mot de passe
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 h-14">
                <Lock color="#FBBF24" size={20} />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#666"
                  secureTextEntry
                  className="flex-1 ml-3 text-white"
                  value={password}
                  onChangeText={(t: string) => setPassword(t)}
                />
              </View>
            </View>

            {/* Bouton Connexion */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
              className="bg-[#FBBF24] h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-yellow-500/40"
            >
              {isLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <>
                  <Text className="text-black font-bold text-lg mr-2">
                    Se connecter
                  </Text>
                  <ArrowRight color="black" size={20} />
                </>
              )}
            </TouchableOpacity>

            {/* Lien Register */}
            <TouchableOpacity
              className="mt-6 self-center"
              onPress={() => router.push("/(auth)/register")}
            >
              <Text className="text-gray-400 text-sm">
                Pas encore de compte ?{" "}
                <Text className="text-[#FBBF24] font-bold">S&apos;inscrire</Text>
              </Text>
            </TouchableOpacity>

          </BlurView>

        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}