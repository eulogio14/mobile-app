import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegistroScreen from '../screens/RegistroScreen';
import ChatScreen from '../screens/ChatScreen';
import Loader from '../components/common/Loader';
import { navigationRef, type RootStackParamList } from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0b141a' } }}>
        {token ? (
          <Stack.Screen name="Chat" component={ChatScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegistroScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
