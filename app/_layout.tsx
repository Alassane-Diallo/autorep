// import { AuthProvider, useAuthContext } from "@/context/auth-context";
// import { Stack, useRouter, useSegments } from "expo-router";
// import { View, ActivityIndicator, StatusBar } from "react-native";
// import "../global.css";
// import { useEffect } from "react";

// export const unstable_settings = {
//   anchor: '(auth)',
// };

// function RootLayoutNav() {
//   const { isLoading, user } = useAuthContext();
//   const segments = useSegments();
//   const router = useRouter();

//   useEffect(() => {
//     if (isLoading) return;

//     // On regarde dans quel groupe de dossiers se trouve l'utilisateur actuellement
//     const inAuthGroup = segments[0] === "(auth)";

//     if (!user) {
//       // Si aucun utilisateur n'est connecté, on le force à aller (ou rester) sur le Login
//       if (!inAuthGroup) {
//         router.replace("/(auth)/login"); // Mets le chemin exact vers ton écran de login
//       }
//     } else {
//       // Si l'utilisateur est connecté et qu'il essaie d'aller sur le login, on le redirige selon son rôle
//       if (inAuthGroup) {
//         if (user.role === "ADMIN") {
//           console.log(user.role)
//           router.replace("/(admin)");
//         } else if (user.role === "TECHNICIEN") {
//           router.replace("/(technicien)");
//         } else {
//           router.replace("/(client)");
//         }
//       }
//     }
//   }, [isLoading, user, segments, router]);

//   if (isLoading) {
//     return (
//       <View className="flex-1 items-center justify-center bg-white">
//         <ActivityIndicator size="large" color="#F97316" />
//       </View>
//     );
//   }

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="(auth)" />
//       <Stack.Screen name="(client)" />
//       <Stack.Screen name="(technicien)" />
//       <Stack.Screen name="(admin)" />
//     </Stack>
//   );
// }

// export default function RootLayout() {
//   return (
//     <AuthProvider>
//       <StatusBar barStyle={"light-content"}/>
//       <RootLayoutNav />
//     </AuthProvider>
//   );
// }

import { AuthProvider, useAuthContext } from "@/context/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StatusBar } from "react-native";
import "../global.css";
import { useEffect } from "react";

function RootLayoutNav() {
  const { isLoading, user } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentFolder = segments[0];
    const inAuthGroup = currentFolder === "(auth)";

    if (!user) {
      // Force le Login si pas connecté
      if (!inAuthGroup) {
        router.replace("/(auth)/login"); 
      }
    } else {
      // L'utilisateur EST connecté. On vérifie la cohérence de son rôle avec le dossier actuel
      const role = user.role.toUpperCase();

      if (role === "ADMIN" && currentFolder !== "(admin)") {
        router.replace("/(admin)");
      } 
      else if (role === "TECHNICIEN" && currentFolder !== "(technicien)") {
        router.replace("/(technicien)");
      } 
      else if (role === "CLIENT" && currentFolder !== "(client)") {
        router.replace("/(client)");
      }
      // Si l'utilisateur est connecté et est déjà dans le bon dossier, on ne fait rien !
    }
  }, [isLoading, user, segments, router]);

  // Écran d'attente pendant la vérification du token
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      {/* <Stack.Screen name="(client)" />
      <Stack.Screen name="(technicien)" />
      <Stack.Screen name="(admin)" /> */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar barStyle={"light-content"}/>
      <RootLayoutNav />
    </AuthProvider>
  );
}