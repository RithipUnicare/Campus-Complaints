import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
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
const { height, width } = Dimensions.get('window');
export default function LoginScreen() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });
  const navigation = useNavigation<any>();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const showAlert = (
    title: string,
    message: string,
    variant: 'success' | 'error' | 'info' = 'info'
  ) => {
    setAlert({ visible: true, title, message, variant });
  };

  const handleLogin = async () => {
    if (!mobileNumber || !password) {
      showAlert('Error', 'Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login({ mobileNumber, password });
      if (response.success) {
        showAlert('Success', 'Login successful', 'success');
      } else {
        showAlert('Error', response.message || 'Login failed', 'error');
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Theme Toggle */}
      <View className="right-4 top-4 z-10">
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

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="mb-8 items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Icon name="shield-check" size={40} color="#3b82f6" />
          </View>
          <Text className="mb-2 text-center text-3xl font-bold text-foreground">Campus Guard</Text>
          <Text className="text-center text-sm text-muted-foreground">
            Sign in to resolve campus issues
          </Text>
        </View>

        {/* Login Card */}
        <Card className="w-full" style={{ marginTop: width * 0.06 }}>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="flex justify-center gap-5">
              {/* Mobile Number */}
              <View className="gap-2">
                <Label nativeID="mobile">Mobile Number</Label>
                <View className="flex-row gap-1">
                  <Input
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                    aria-labelledby="mobile"
                  />
                  {mobileNumber.length === 10 && (
                    <View className="mr-2 flex justify-center gap-2">
                      <Icon name="check-circle" size={20} color="#22c55e" />
                    </View>
                  )}
                </View>
              </View>

              {/* Password */}
              <View className="gap-2">
                <Label nativeID="password">Password</Label>
                <View className="flex">
                  <Input
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    aria-labelledby="password"
                  />
                </View>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgetPassword')}
                className="self-end">
                <Text className="text-sm font-semibold text-primary">Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button onPress={handleLogin} disabled={loading} size="lg" className="w-full">
              <Text className="font-bold">{loading ? 'Signing In...' : 'Sign In'}</Text>
            </Button>
            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-sm text-muted-foreground">New member?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text className="text-sm font-bold text-primary">Create Account</Text>
              </TouchableOpacity>
            </View>
          </CardFooter>
        </Card>
      </ScrollView>

      <AlertDialog
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </SafeAreaView>
  );
}
