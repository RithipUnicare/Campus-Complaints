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
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgetPassword'>;
};

export default function ForgetPasswordScreen({ navigation }: props) {
  const [step, setStep] = useState(1); // 1: Request, 2: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
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

  const handleRequestReset = async () => {
    if (!email) {
      showAlert('Error', 'Please enter your email', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.requestPasswordReset(email);
      if (response.success) {
        showAlert('Success', 'OTP sent to your email', 'success');
        setStep(2);
      } else {
        showAlert('Error', response.message || 'Request failed', 'error');
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      showAlert('Error', 'Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.resetPassword({ email, otp, newPassword });
      if (response.success) {
        showAlert('Success', 'Password updated successfully', 'success', () =>
          navigation.navigate('Login')
        );
      } else {
        showAlert('Error', response.message || 'Reset failed', 'error');
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
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Icon name="lock-reset" size={40} color="#3b82f6" />
            </View>
            <Text className="mb-2 text-center text-3xl font-bold text-foreground">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </Text>
            <Text className="text-center text-sm text-muted-foreground">
              {step === 1
                ? 'Enter your email to receive a recovery code'
                : 'Enter the code and set your new password'}
            </Text>
          </View>

          {/* Reset Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{step === 1 ? 'Account Recovery' : 'Set New Password'}</CardTitle>
              <CardDescription>
                {step === 1
                  ? 'We will send you a verification code'
                  : 'Make sure your password is secure'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View className="gap-4">
                {/* Email */}
                <View className="gap-2">
                  <Label nativeID="email">Email Address</Label>
                  <Input
                    placeholder="john@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={step === 1}
                    aria-labelledby="email"
                  />
                </View>

                {step === 2 && (
                  <>
                    {/* OTP */}
                    <View className="gap-2">
                      <Label nativeID="otp">Verification Code</Label>
                      <Input
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                        maxLength={6}
                        aria-labelledby="otp"
                      />
                    </View>

                    {/* New Password */}
                    <View className="gap-2">
                      <Label nativeID="newPassword">New Password</Label>
                      <Input
                        placeholder="Create a new password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        aria-labelledby="newPassword"
                      />
                    </View>
                  </>
                )}
              </View>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                onPress={step === 1 ? handleRequestReset : handleResetPassword}
                disabled={loading}
                size="lg"
                className="w-full">
                <Text className="font-bold">
                  {loading ? 'Processing...' : step === 1 ? 'Send Code' : 'Reset Password'}
                </Text>
              </Button>
              <TouchableOpacity
                onPress={() => (step === 1 ? navigation.replace('Login') : setStep(1))}
                className="self-center">
                <Text className="text-sm font-semibold text-primary">
                  {step === 1 ? 'Back to Sign In' : 'Use different email'}
                </Text>
              </TouchableOpacity>
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
