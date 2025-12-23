import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigation';
import { apiService } from '@/service/api.service';
import { Badge } from '@/components/ui/badge';
import { AlertDialog } from '@/components/ui/alert-dialog';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: Props) {
  const { colorScheme } = useColorScheme();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
  });
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    variant: 'info' as 'success' | 'error' | 'info',
    onConfirm: undefined as (() => void) | undefined,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await apiService.getProfile();
      setUserProfile(response);
      setFormData({
        name: response.name || '',
        mobileNumber: response.mobileNumber || '',
      });
    } catch (error: any) {
      showAlert('Error', 'Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.mobileNumber.trim()) {
      showAlert('Error', 'Please fill in all fields', 'error');
      return;
    }

    if (formData.mobileNumber.length !== 10) {
      showAlert('Error', 'Mobile number must be 10 digits', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await apiService.updateProfile(formData);
      if (response.success) {
        showAlert('Success', 'Profile updated successfully', 'success');
        setIsEditing(false);
        fetchUserProfile(); // Refresh profile data
      } else {
        showAlert('Error', response.message || 'Failed to update profile', 'error');
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    showAlert('Logout', 'Are you sure you want to logout?', 'info', async () => {
      try {
        await apiService.logout();
        navigation.replace('Login');
      } catch (error: any) {
        console.error('Logout error:', error);
        navigation.replace('Login');
      }
    });
  };

  const showAlert = (
    title: string,
    message: string,
    variant: 'success' | 'error' | 'info' = 'info',
    onConfirm?: () => void
  ) => {
    setAlert({ visible: true, title, message, variant, onConfirm });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return '#ef4444'; // red-500
      case 'ADMIN':
        return '#3b82f6'; // blue-500
      case 'STUDENT':
        return '#22c55e'; // green-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-background">
        <View className="flex-1 items-center justify-center">
          <Icon name="account-circle" size={64} color="#6b7280" />
          <Text className="mt-4 text-lg text-muted-foreground">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSuperAdmin = userProfile?.roles === 'SUPERADMIN';

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      {/* Header */}
      <View className="border-b border-border bg-card px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Profile</Text>
          </View>

          {isEditing && (
            <TouchableOpacity
              onPress={() => {
                setIsEditing(false);
                setFormData({
                  name: userProfile.name || '',
                  mobileNumber: userProfile.mobileNumber || '',
                });
              }}>
              <Icon name="close" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="items-center py-8">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Icon name="account" size={48} color="#3b82f6" />
            </View>
            <Text className="mb-2 text-2xl font-bold text-foreground">
              {userProfile?.name || 'User'}
            </Text>
            {userProfile?.roles && (
              <Badge style={{ backgroundColor: getRoleBadgeColor(userProfile.roles) }}>
                <Text className="text-xs font-semibold text-white">{userProfile.roles}</Text>
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              {!isSuperAdmin && !isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Icon name="pencil" size={20} color="#3b82f6" />
                </TouchableOpacity>
              )}
            </View>
          </CardHeader>
          <CardContent className="gap-4">
            {/* Name */}
            <View className="gap-2">
              <Label>Full Name</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter your name"
                />
              ) : (
                <View className="rounded-lg border border-input bg-secondary p-3">
                  <Text className="text-base text-foreground">{userProfile?.name || 'N/A'}</Text>
                </View>
              )}
            </View>

            {/* Mobile Number */}
            <View className="gap-2">
              <Label>Mobile Number</Label>
              {isEditing ? (
                <Input
                  value={formData.mobileNumber}
                  onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              ) : (
                <View className="rounded-lg border border-input bg-secondary p-3">
                  <Text className="text-base text-foreground">
                    {userProfile?.mobileNumber || 'N/A'}
                  </Text>
                </View>
              )}
            </View>

            {/* Email */}
            <View className="gap-2">
              <Label>Email</Label>
              <View className="rounded-lg border border-input bg-secondary p-3">
                <Text className="text-base text-foreground">{userProfile?.email || 'N/A'}</Text>
              </View>
            </View>

            {/* User ID */}
            <View className="gap-2">
              <Label>User ID</Label>
              <View className="rounded-lg border border-input bg-secondary p-3">
                <Text className="text-base text-foreground">{userProfile?.id || 'N/A'}</Text>
              </View>
            </View>

            {isEditing && (
              <View className="mt-4 flex-row gap-3">
                <Button
                  onPress={handleSave}
                  disabled={saving}
                  className="flex-1"
                  style={{ backgroundColor: '#22c55e' }}>
                  <Text className="font-bold text-white">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </Button>
                <Button
                  onPress={() => {
                    setIsEditing(false);
                    setFormData({
                      name: userProfile.name || '',
                      mobileNumber: userProfile.mobileNumber || '',
                    });
                  }}
                  variant="outline"
                  className="flex-1">
                  <Text>Cancel</Text>
                </Button>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Actions Card - Only show for non-SUPERADMIN */}
        {!isSuperAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <TouchableOpacity onPress={handleLogout}>
                <View className="flex-row items-center gap-3 rounded-lg border border-destructive bg-destructive/10 p-4">
                  <Icon name="logout" size={24} color="#ef4444" />
                  <Text className="text-base font-semibold text-destructive">Logout</Text>
                </View>
              </TouchableOpacity>
            </CardContent>
          </Card>
        )}
      </ScrollView>

      {/* Alert Dialog */}
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
