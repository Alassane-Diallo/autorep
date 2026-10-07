import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { Home, ClipboardList, User, Settings, MessageCircle, LogOut } from "lucide-react-native";
import { View, Text, Alert } from "react-native";
import { useAuthContext } from "@/context/auth-context";

// Contenu personnalisé du Drawer
function CustomDrawerContent(props: any) {
  const { logout, user } = useAuthContext();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      
      {/* Header du Drawer */}
      <View className="px-4 py-6 border-b border-white/10 mb-2">
        <View className="w-14 h-14 rounded-full bg-yellow-400/20 items-center justify-center mb-3">
          <Text className="text-[#FBBF24] text-2xl font-bold">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </Text>
        </View>
        <Text className="text-white font-bold text-lg">
          {user?.prenom} {user?.nom}
        </Text>
        <Text className="text-gray-400 text-sm">{user?.email}</Text>
      </View>

      {/* Items du menu */}
      <DrawerItemList {...props} />

      {/* Footer — Déconnexion */}
      <View className="mt-auto pb-8 px-2 border-t border-white/10 pt-4">
        <DrawerItem
          label="Déconnexion"
          onPress={() => {
            Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
                { text: "Annuler", style: "cancel" },
                { 
                    text: "Déconnexion",
                    style: "destructive",
                    onPress: logout
                }
            ])
          }}
          icon={({ color }) => <LogOut color="#EF4444" size={22} />}
          labelStyle={{ color: "#EF4444", fontWeight: "600" }}
        />
      </View>

    </DrawerContentScrollView>
  );
}

export default function ClientLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#0F172A" },
          headerTintColor: "#FBBF24",
          headerTitleStyle: { fontWeight: "bold", color: "#FBBF24" },
          drawerStyle: { backgroundColor: "#0F172A", width: 280 },
          drawerActiveTintColor: "#FBBF24",
          drawerInactiveTintColor: "#9CA3AF",
          drawerActiveBackgroundColor: "rgba(251, 191, 36, 0.1)",
          drawerItemStyle: { borderRadius: 12, marginVertical: 2 },
          drawerLabelStyle: { fontSize: 15, fontWeight: "600" },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "Accueil",
            drawerIcon: ({ color }) => <Home color={color} size={22} />
          }}
        />
        <Drawer.Screen
          name="commandes"
          options={{
            title: "Mes Commandes",
            drawerIcon: ({ color }) => <ClipboardList color={color} size={22} />
          }}
        />
        <Drawer.Screen
          name="profil"
          options={{
            title: "Mon Profil",
            drawerIcon: ({ color }) => <User color={color} size={22} />
          }}
        />
        <Drawer.Screen
          name="parametres"
          options={{
            title: "Paramètres",
            drawerIcon: ({ color }) => <Settings color={color} size={22} />
          }}
        />

        <Drawer.Screen
          name="chat/index"
          options={{
            title: "Messages",
            drawerIcon: ({ color }) => <MessageCircle color={color} size={22} />
          }}
        />
        <Drawer.Screen
          name="chat/[userId]"
          options={{
            headerShown: false,
            drawerItemStyle: { display: 'none' } // caché dans le menu
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}