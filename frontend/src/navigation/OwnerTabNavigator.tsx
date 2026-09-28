/**
 * navigation/OwnerTabNavigator.tsx
 * Premium Tab Navigator for Pet Owners — Warm Peach Theme
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, PawPrint, Stethoscope, Calendar, Sparkles, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../constants/colors';

import HomeScreen from '../screens/home/HomeScreen';
import PetListScreen from '../functions/function1-pets/screens/PetListScreen';
import VetListScreen from '../functions/function2-veterinarians/screens/VetListScreen';
import AppointmentListScreen from '../functions/function3-appointments/screens/AppointmentListScreen';
import ServiceListScreen from '../functions/function5-services/screens/ServiceListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type OwnerTabParamList = {
  HomeTab: undefined;
  PetsTab: undefined;
  VetsTab: undefined;
  AppointmentsTab: undefined;
  ServicesTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<OwnerTabParamList>();

const TAB_ITEMS = [
  { name: 'HomeTab', label: 'Home', Icon: Home },
  { name: 'PetsTab', label: 'My Pets', Icon: PawPrint },
  { name: 'VetsTab', label: 'Vets', Icon: Stethoscope },
  { name: 'AppointmentsTab', label: 'Visits', Icon: Calendar },
  { name: 'ServicesTab', label: 'Services', Icon: Sparkles },
  { name: 'ProfileTab', label: 'Profile', Icon: User },
];

const PremiumTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tabItem = TAB_ITEMS.find((t) => t.name === route.name);
        if (!tabItem) return null;
        const { label, Icon } = tabItem;
        const iconColor = isFocused ? colors.primary : colors.textMuted;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name as any);
        };
        return (
          <TouchableOpacity key={route.key} style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Icon size={22} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />
            </View>
            <Text style={[styles.label, { color: iconColor, fontWeight: isFocused ? '800' : '600' }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const OwnerTabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={(p) => <PremiumTabBar {...p} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeTab" component={HomeScreen} />
    <Tab.Screen name="PetsTab" component={PetListScreen} />
    <Tab.Screen name="VetsTab" component={VetListScreen} />
    <Tab.Screen name="AppointmentsTab" component={AppointmentListScreen} />
    <Tab.Screen name="ServicesTab" component={ServiceListScreen} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.08, shadowRadius: 14, elevation: 14,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  iconWrap: { width: 44, height: 34, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.primaryLight },
  label: { fontSize: 10, letterSpacing: 0.1 },
});

export default OwnerTabNavigator;
