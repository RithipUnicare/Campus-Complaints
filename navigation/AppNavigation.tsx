import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgetPasswordScreen from '../screens/ForgetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
    </Stack.Navigator>
  );
}
