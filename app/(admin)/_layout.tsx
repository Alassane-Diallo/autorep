import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FBBF24',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopWidth: 1,
          borderTopColor: '#1F2937',
          height: 75,
          paddingBottom: 15,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      {/* Tableau de bord (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* Gestion des Services */}
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "construct" : "construct-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* Gestion des Clients */}
      <Tabs.Screen
        name='clients'
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen 
        name='commandes'
        options={{
          title: "Commandes",
          tabBarIcon: ({ color, size}) => (
            <Ionicons name="clipboard-outline" color={color} size={size} />
          )
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}