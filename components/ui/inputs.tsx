import React from "react";
import { LucideIcon } from "lucide-react-native";
import { KeyboardTypeOptions, Text, TextInput, View } from "react-native";

interface InputFieldProps {
    label: string;
    icon: LucideIcon;
    placeholder: string;
    value: string;
    onChange: (text: string) => void; 
    isPassword?: boolean;
    keyboard?: KeyboardTypeOptions;
}

export const InputField = ({ 
    label, 
    icon: Icon, 
    placeholder, 
    value, 
    onChange, 
    isPassword = false,
    keyboard = 'default' 
}: InputFieldProps) => (
    <View className="mb-4">
        <Text className="text-gray-400 mb-2 ml-1 text-[10px] uppercase tracking-[2px]">{label}</Text>
        <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 h-14">
            <Icon color="#FBBF24" size={18} />
            <TextInput 
                placeholder={placeholder}
                placeholderTextColor="#555"
                secureTextEntry={isPassword}
                keyboardType={keyboard}
                className="flex-1 ml-3 text-white"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
            />
        </View>
    </View>
);