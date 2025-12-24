import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigation';
const { height, width } = Dimensions.get('window');

type props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: props) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      if (response) {
        showAlert('Success', 'Login successful', 'success');
        navigation.replace('Home');
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
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 40,
          }}
          enableOnAndroid
          extraScrollHeight={80}
          keyboardShouldPersistTaps="handled">
          {/* Theme Toggle - Absolute positioned */}
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
              <Icon name="shield-check" size={40} color="#3b82f6" />
            </View>
            <Text className="mb-2 text-center text-3xl font-bold text-foreground">
              Campus Guard
            </Text>
            <Text className="text-center text-sm text-muted-foreground">
              Sign in to resolve campus issues
            </Text>
          </View>

          {/* Login Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <View className="gap-6">
                {/* Mobile Number */}
                <View className="gap-2">
                  <Label nativeID="mobile">Mobile Number</Label>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1">
                      <Input
                        placeholder="9876543210"
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        keyboardType="phone-pad"
                        maxLength={10}
                        aria-labelledby="mobile"
                        //className="border-2 border-blue-500"
                        autoFocus
                      />
                    </View>
                    {mobileNumber.length === 10 && (
                      <Icon name="check-circle" size={20} color="#22c55e" />
                    )}
                  </View>
                </View>

                {/* Password */}
                <View className="gap-2">
                  <Label nativeID="password">Password</Label>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1">
                      <Input
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        aria-labelledby="password"
                      />
                    </View>
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
                    </TouchableOpacity>
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
              <View
                className="flex-row items-center justify-center gap-1"
                style={{ marginTop: height * 0.01 }}>
                <Text className="text-sm text-muted-foreground">New member?</Text>
                <TouchableOpacity onPress={() => navigation.replace('Signup')}>
                  <Text className="text-sm font-bold text-primary">Create Account</Text>
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
      />
    </SafeAreaView>
  );
}
