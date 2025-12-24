import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useColorScheme } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigation';
import { apiService } from '@/service/api.service';
import { Badge } from '@/components/ui/badge';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const { width, height } = Dimensions.get('window');
const SPACING = {
  xs: width * 0.01,
  sm: width * 0.02,
  md: width * 0.04,
  lg: width * 0.06,
  xl: width * 0.08,
};

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    headerButton: {
      marginRight: SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    profileCard: {
      marginBottom: SPACING.md,
    },
    profileHeader: {
      alignItems: 'center',
      paddingVertical: SPACING.lg,
    },
    avatarContainer: {
      height: width * 0.24,
      width: width * 0.24,
      borderRadius: width * 0.12,
      backgroundColor:
        colorScheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
    },
    nameText: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
      marginBottom: SPACING.sm,
    },
    infoCard: {
      marginBottom: SPACING.md,
    },
    fieldContainer: {
      marginBottom: SPACING.md,
    },
    fieldLabel: {
      marginBottom: SPACING.xs,
    },
    fieldValue: {
      borderRadius: 12,
      borderWidth: 1,
      padding: SPACING.md,
    },
    buttonRow: {
      flexDirection: 'row',
      marginTop: SPACING.md,
      gap: SPACING.sm,
    },
    saveButton: {
      flex: 1,
      backgroundColor: '#22c55e',
    },
    cancelButton: {
      flex: 1,
    },
    actionsCard: {
      marginBottom: SPACING.md,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#ef4444',
      backgroundColor:
        colorScheme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      padding: SPACING.md,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: SPACING.md,
      fontSize: width * 0.045,
    },
  });

  // Set navigation header options with Edit button
  useLayoutEffect(() => {
    const isSuperAdmin = userProfile?.roles === 'SUPERADMIN';

    navigation.setOptions({
      title: 'Profile',
      headerRight: () =>
        !loading ? (
          isEditing ? (
            <TouchableOpacity
              onPress={() => {
                setIsEditing(false);
                setFormData({
                  name: userProfile?.name || '',
                  mobileNumber: userProfile?.mobileNumber || '',
                });
              }}
              style={{ marginRight: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="close" size={20} color={colorScheme === 'dark' ? '#fff' : '#374151'} />
              <Text
                style={{ color: colorScheme === 'dark' ? '#fff' : '#374151', fontWeight: '500' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={{ marginRight: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="pencil" size={20} color="#3b82f6" />
              <Text style={{ color: '#3b82f6', fontWeight: '600' }}>Edit</Text>
            </TouchableOpacity>
          )
        ) : null,
    });
  }, [navigation, isEditing, userProfile, colorScheme, loading]);

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
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
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
      <SafeAreaView style={styles.container} className="bg-background">
        <View style={styles.loadingContainer}>
          <Icon name="account-circle" size={64} color="#6b7280" />
          <Text style={styles.loadingText} className="text-muted-foreground">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSuperAdmin = userProfile?.roles === 'SUPERADMIN';

  return (
    <SafeAreaView
      style={styles.container}
      className="bg-background"
      edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Card */}
        <Card style={styles.profileCard}>
          <CardContent style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Icon name="account" size={width * 0.12} color="#3b82f6" />
            </View>
            <Text style={styles.nameText} className="text-foreground">
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
        <Card style={styles.infoCard}>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Name */}
            <View style={styles.fieldContainer}>
              <Label style={styles.fieldLabel}>Full Name</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter your name"
                />
              ) : (
                <View style={styles.fieldValue} className="border-input bg-secondary">
                  <Text className="text-base text-foreground">{userProfile?.name || 'N/A'}</Text>
                </View>
              )}
            </View>

            {/* Mobile Number */}
            <View style={styles.fieldContainer}>
              <Label style={styles.fieldLabel}>Mobile Number</Label>
              {isEditing ? (
                <Input
                  value={formData.mobileNumber}
                  onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              ) : (
                <View style={styles.fieldValue} className="border-input bg-secondary">
                  <Text className="text-base text-foreground">
                    {userProfile?.mobileNumber || 'N/A'}
                  </Text>
                </View>
              )}
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Label style={styles.fieldLabel}>Email</Label>
              <View style={styles.fieldValue} className="border-input bg-secondary">
                <Text className="text-base text-foreground">{userProfile?.email || 'N/A'}</Text>
              </View>
            </View>

            {/* User ID */}
            <View style={styles.fieldContainer}>
              <Label style={styles.fieldLabel}>User ID</Label>
              <View style={styles.fieldValue} className="border-input bg-secondary">
                <Text className="text-base text-foreground">{userProfile?.id || 'N/A'}</Text>
              </View>
            </View>

            {isEditing && (
              <View style={styles.buttonRow}>
                <Button onPress={handleSave} disabled={saving} style={styles.saveButton}>
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
                  style={styles.cancelButton}>
                  <Text>Cancel</Text>
                </Button>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card style={styles.actionsCard}>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <TouchableOpacity onPress={handleLogout}>
              <View style={styles.logoutButton}>
                <Icon name="logout" size={24} color="#ef4444" />
                <Text className="text-base font-semibold text-destructive">Logout</Text>
              </View>
            </TouchableOpacity>
          </CardContent>
        </Card>
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
