import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TechLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FBBF24', // Jaune Premium
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopWidth: 1,
          borderTopColor: '#1F2937',
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Interventions',
          tabBarIcon: ({ color, focused }) => (
            <View className={focused ? "bg-[#FBBF24]/10 p-2 rounded-xl" : ""}>
              <Ionicons name="clipboard-outline" size={24} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen 
        name="chat/index"
        options={{
          title: 'Discussions',
          tabBarIcon: ({ color, focused }) => (
            <View className={focused ? "bg-[#FBBF24]/10 p-2 rounded-xl" : ""}>
              <Ionicons name="chatbox-outline" size={24} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View className={focused ? "bg-[#FBBF24]/10 p-2 rounded-xl" : ""}>
              <Ionicons name="person-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen 
        name='chat/[userId]'
        options={{
          href: null,
          tabBarStyle: { display: 'none'}
        }}
      />
    </Tabs>
  );
}