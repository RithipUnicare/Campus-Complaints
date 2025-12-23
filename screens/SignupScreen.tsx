import React, { useState } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { apiService } from '@/service/api.service';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '@/navigation/AppNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'>;
};

export default function SignupScreen({ navigation }: props) {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info';
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const showAlert = (
    title: string,
    message: string,
    variant: 'success' | 'error' | 'info' = 'info',
    onConfirm?: () => void
  ) => {
    setAlert({ visible: true, title, message, variant, onConfirm });
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    const { name, mobileNumber, email, password, confirmPassword } = formData;
    if (!name || !mobileNumber || !email || !password || !confirmPassword) {
      showAlert('Error', 'Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.signup(formData);
      if (response) {
        showAlert('Success', 'Account created successfully', 'success', () =>
          navigation.replace('Login')
        );
      } else {
        showAlert('Error', response.message || 'Signup failed', 'error');
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          enableOnAndroid={true}
          extraScrollHeight={20}>
          {/* Theme Toggle */}
          <View style={{ position: 'absolute', right: 16, top: 16, zIndex: 10 }}>
            <TouchableOpacity
              onPress={toggleColorScheme}
              className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Icon
                name={colorScheme === 'dark' ? 'white-balance-sunny' : 'moon-waning-crescent'}
                size={20}
                color={colorScheme === 'dark' ? '#fbbf24' : '#6366f1'}
              />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-40 w-40 items-center justify-center rounded-full bg-black/10">
              <Icon name="account-plus" size={40} color="#3b82f6" />
            </View>
            <Text className="mb-2 text-center text-3xl font-bold text-foreground">Join Us</Text>
            <Text className="text-center text-sm text-muted-foreground">
              Create your account to get started
            </Text>
          </View>

          {/* Signup Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Fill in your details to register</CardDescription>
            </CardHeader>
            <CardContent>
              <View className="gap-4">
                {/* Name */}
                <View className="gap-2">
                  <Label nativeID="name">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChangeText={(text) => handleChange('name', text)}
                    aria-labelledby="name"
                  />
                </View>

                {/* Mobile Number */}
                <View className="gap-2">
                  <Label nativeID="mobile">Mobile Number</Label>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1">
                      <Input
                        placeholder="9876543210"
                        value={formData.mobileNumber}
                        onChangeText={(text) => handleChange('mobileNumber', text)}
                        keyboardType="phone-pad"
                        maxLength={10}
                        aria-labelledby="mobile"
                      />
                    </View>
                    {formData.mobileNumber.length === 10 && (
                      <Icon name="check-circle" size={20} color="#22c55e" />
                    )}
                  </View>
                </View>

                {/* Email */}
                <View className="gap-2">
                  <Label nativeID="email">Email</Label>
                  <Input
                    placeholder="john@example.com"
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    aria-labelledby="email"
                  />
                </View>

                {/* Password */}
                <View className="gap-2">
                  <Label nativeID="password">Password</Label>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1">
                      <Input
                        placeholder="Create a secure password"
                        value={formData.password}
                        onChangeText={(text) => handleChange('password', text)}
                        secureTextEntry={!showPassword}
                        aria-labelledby="password"
                      />
                    </View>
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View className="gap-2">
                  <Label nativeID="confirmPassword">Confirm Password</Label>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1">
                      <Input
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChangeText={(text) => handleChange('confirmPassword', text)}
                        secureTextEntry={!showConfirmPassword}
                        aria-labelledby="confirmPassword"
                      />
                    </View>
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Icon
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button onPress={handleSignup} disabled={loading} size="lg" className="w-full">
                <Text className="font-bold">{loading ? 'Creating Account...' : 'Sign Up'}</Text>
              </Button>
              <View className="flex-row items-center justify-center gap-1">
                <Text className="text-sm text-muted-foreground">Already a member?</Text>
                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                  <Text className="text-sm font-bold text-primary">Sign In</Text>
                </TouchableOpacity>
              </View>
            </CardFooter>
          </Card>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>

      <AlertDialog
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onClose={() => setAlert({ ...alert, visible: false })}
        onConfirm={alert.onConfirm}
      />
    </SafeAreaView>
  );
}
