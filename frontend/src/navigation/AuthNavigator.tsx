/**
 * navigation/AuthNavigator.tsx
 * Stack Navigator for unauthenticated users — Welcome → Login / Register
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            opacity: current.progress,
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width * 0.08, 0],
                }),
              },
            ],
          },
        }),
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
