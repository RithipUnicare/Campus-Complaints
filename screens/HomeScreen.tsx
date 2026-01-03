import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigation';
import { apiService } from '@/service/api.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { BASE_URL } from '@/service/configuration';
import { Input } from '@/components/ui/input';
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: Props) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    variant: 'info' as 'success' | 'error' | 'info',
  });
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.getProfile();
      setUserProfile(response);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiService.getUnreadNotifications(0, 100);
      console.log(response);
      if (response.success && response.data) {
        setNotifications(response.data.content || []);
        setUnreadCount(response.data.totalElements || 0);
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchComplaints = async (page = 0, append = false) => {
    try {
      if (page === 0) setLoading(true);
      else setLoadingMore(true);

      const response = await apiService.getMyComplaints(null, null, page, 10);

      if (response.success && response.data) {
        const newComplaints = response.data.content || [];
        setComplaints(append ? [...complaints, ...newComplaints] : newComplaints);
        setHasMore(!response.data.last);
        setCurrentPage(page);
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      showAlert('Error', 'Failed to load complaints', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchComplaints(0);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchComplaints(searchQuery, null, null, 0, 20);

      if (response.success && response.data) {
        setComplaints(response.data.content || []);
        setHasMore(!response.data.last);
      }
    } catch (error: any) {
      console.error('Error searching complaints:', error);
      showAlert('Error', 'Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: number[]) => {
    try {
      await apiService.markNotificationsAsRead(notificationIds);
      fetchNotifications();
      showAlert('Success', 'Notifications marked as read', 'success');
    } catch (error: any) {
      showAlert('Error', 'Failed to mark notifications as read', 'error');
    }
  };

  const showAlert = (
    title: string,
    message: string,
    variant: 'success' | 'error' | 'info' = 'info'
  ) => {
    setAlert({ visible: true, title, message, variant });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserProfile();
    fetchNotifications();
    fetchComplaints(0);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchComplaints(currentPage + 1, true);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchNotifications();
    fetchComplaints(0);
  }, []);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#eab308'; // yellow-500
      case 'IN_PROGRESS':
        return '#3b82f6'; // blue-500
      case 'RESOLVED':
        return '#22c55e'; // green-500
      case 'REJECTED':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      className="bg-background"
      edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View className="border-b border-border bg-card px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-muted-foreground">Welcome back,</Text>
            <Text className="text-2xl font-bold text-foreground">
              {userProfile?.name || 'Loading...'}
            </Text>
            {userProfile?.roles && (
              <View className="mt-2">
                <Badge style={{ maxWidth: width * 0.4, overflow: 'hidden' }}>
                  <Text
                    className={`text-xs font-semibold ${colorScheme === 'dark' ? 'text-black' : 'text-white'}`}>
                    {userProfile.roles}
                  </Text>
                </Badge>
              </View>
            )}
          </View>

          <View className="flex-row items-center" style={{ rowGap: width * 0.01 }}>
            {/* Theme Toggle */}
            <TouchableOpacity
              onPress={toggleColorScheme}
              className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Icon
                name={colorScheme === 'dark' ? 'white-balance-sunny' : 'moon-waning-crescent'}
                size={20}
                color={colorScheme === 'dark' ? '#fbbf24' : '#6366f1'}
              />
            </TouchableOpacity>

            {/* Notification Button */}
            <TouchableOpacity
              onPress={() => setNotificationDialog(true)}
              className="relative h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Icon name="bell" size={22} color="#6366f1" />
              {unreadCount > 0 && (
                <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                  <Text className="text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Profile Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className="h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Icon
                name="account"
                size={22}
                color={colorScheme === 'dark' ? '#f1f1f8ff' : '#ffffff'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        className="flex-1 px-4">
        {/* Search Bar with Add Button */}
        <View
          className="my-4 flex-row items-center gap-3"
          style={{ marginTop: width * 0.03, rowGap: width * 0.01, marginBottom: width * 0.02 }}>
          {/* Search Input */}
          <View className="flex-1 flex-row items-center gap-2 rounded-lg border border-input bg-background px-2 py-1">
            <Icon name="magnify" size={20} color="#6b7280" />
            <Input
              placeholder="Search complaints..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              className="flex-1 text-base text-foreground"
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  fetchComplaints(0);
                }}>
                <Icon name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          {/* Add Complaint Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddComplaint')}
            className="items-center justify-center rounded-lg bg-primary"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 4,
              width: width * 0.1,
              height: width * 0.1,
              marginLeft: width * 0.04,
            }}>
            <Icon name="plus" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Complaints List */}
        <View
          className="mb-8 flex-row items-center justify-between"
          style={{ marginBottom: width * 0.05, marginTop: width * 0.01 }}>
          <Text className="text-xl font-bold text-foreground">My Complaints </Text>
          <Text className="text-sm text-muted-foreground">{complaints.length} total</Text>
        </View>

        {loading && currentPage === 0 ? (
          <View className="py-12">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : complaints.length === 0 ? (
          <View className="items-center gap-2 py-12">
            <Icon name="clipboard-text-off-outline" size={64} color="#9ca3af" />
            <Text className="mt-4 text-lg text-muted-foreground">No complaints found</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Start by submitting your first complaint
            </Text>
          </View>
        ) : (
          <>
            {complaints.map((complaint) => (
              <TouchableOpacity
                key={complaint.id}
                onPress={() => {
                  setSelectedComplaint(complaint);

                  setDetailDialog(true);
                }}>
                <Card className="mb-4 gap-3 rounded-lg" style={{ marginBottom: width * 0.02 }}>
                  <CardHeader>
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <CardTitle className="text-base">Complaint #{complaint.id}</CardTitle>
                        <Text className="mt-1 text-xs text-muted-foreground">
                          {formatDate(complaint.submittedAt)}
                        </Text>
                      </View>
                      <Badge
                        style={{
                          height: height * 0.03,
                          backgroundColor: getStatusColor(complaint.status),
                        }}>
                        <Text
                          className={`font-semibold ${colorScheme === 'dark' ? 'text-black' : 'text-white'}`}
                          style={{ fontSize: width * 0.03 }}>
                          {complaint.status.replace('_', ' ')}
                        </Text>
                      </Badge>
                    </View>
                  </CardHeader>
                  <CardContent>
                    {complaint.photoUrl && (
                      <Image
                        source={{ uri: complaint.photoUrl }}
                        className="mb-3 h-48 w-full rounded-lg"
                        resizeMode="cover"
                      />
                    )}
                    <Text className="text-sm text-foreground" numberOfLines={3}>
                      {complaint.description}
                    </Text>
                    {complaint.locationAddress && (
                      <View className="mt-2 flex-row items-center">
                        <Icon name="map-marker" size={16} color="#6b7280" />
                        <Text className="ml-1 text-xs text-muted-foreground" numberOfLines={1}>
                          {complaint.locationAddress}
                        </Text>
                      </View>
                    )}
                    {complaint.updates && complaint.updates.length > 0 && (
                      <View className="mt-3 rounded-lg bg-secondary p-3">
                        <Text className="text-xs font-semibold text-foreground">
                          Latest Update:
                        </Text>
                        <Text className="mt-1 text-xs text-muted-foreground">
                          {complaint.updates[complaint.updates.length - 1].note}
                        </Text>
                      </View>
                    )}
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}

            {loadingMore && (
              <View className="py-4">
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            )}

            {hasMore && !loadingMore && (
              <Button onPress={loadMore} variant="outline" className="mb-6">
                <Text>Load More</Text>
              </Button>
            )}
          </>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Complaint Detail Dialog */}
      <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
        <DialogContent className="max-h-96">
          <DialogHeader>
            <DialogTitle>Complaint #{selectedComplaint?.id}</DialogTitle>
            <DialogDescription>
              Submitted on {selectedComplaint && formatDate(selectedComplaint.submittedAt)}
            </DialogDescription>
          </DialogHeader>

          <ScrollView className="max-h-96">
            {selectedComplaint?.photoUrl && (
              <View className="relative mb-4 h-64 w-full">
                {imageLoading && (
                  <View className="flex-1 items-center justify-center rounded-lg bg-secondary">
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text className="mt-2 text-sm text-muted-foreground">Loading image...</Text>
                  </View>
                )}

                <Image
                  source={{ uri: `${BASE_URL}${selectedComplaint.photoUrl}` }}
                  //className="h-64 w-full rounded-lg"
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  style={{ height: width * 0.6 }}
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-foreground">Status:</Text>
              <Badge
                className="self-start"
                style={{ backgroundColor: getStatusColor(selectedComplaint?.status || '') }}>
                <Text className="text-xs font-semibold text-white">
                  {selectedComplaint?.status.replace('_', ' ')}
                </Text>
              </Badge>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-semibold text-foreground">Description:</Text>
              <Text className="text-sm text-foreground">{selectedComplaint?.description}</Text>
            </View>

            {selectedComplaint?.locationAddress && (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-foreground">Location:</Text>
                <View className="flex-row items-center">
                  <Icon name="map-marker" size={18} color="#6b7280" />
                  <Text className="ml-2 text-sm text-muted-foreground">
                    {selectedComplaint.locationAddress}
                  </Text>
                </View>
              </View>
            )}

            {selectedComplaint?.submittedByName && (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-foreground">Submitted By:</Text>
                <Text className="text-sm text-foreground">{selectedComplaint.submittedByName}</Text>
              </View>
            )}

            {selectedComplaint?.resolutionNote && (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-foreground">Resolution Note:</Text>
                <Text className="text-sm text-foreground">{selectedComplaint.resolutionNote}</Text>
              </View>
            )}

            {selectedComplaint?.updates && selectedComplaint.updates.length > 0 && (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-foreground">Update History:</Text>
                {selectedComplaint.updates.map((update: any, index: number) => (
                  <View key={index} className="mb-2 rounded-lg bg-secondary p-3">
                    <View className="mb-1 flex-row items-center justify-between">
                      <Badge style={{ backgroundColor: getStatusColor(update.status) }}>
                        <Text className="text-xs font-semibold text-white">
                          {update.status.replace('_', ' ')}
                        </Text>
                      </Badge>
                      <Text className="text-xs text-muted-foreground">
                        {formatDate(update.timestamp)}
                      </Text>
                    </View>
                    {update.note && (
                      <Text className="mt-2 text-xs text-muted-foreground">{update.note}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <DialogFooter>
            <Button variant="outline" onPress={() => setDetailDialog(false)}>
              <Text className="text-sm">Close</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={notificationDialog} onOpenChange={setNotificationDialog}>
        <DialogContent className="max-h-80 w-full">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notifications`
                : 'No new notifications'}
            </DialogDescription>
          </DialogHeader>

          <ScrollView className="max-h-64">
            {notifications.length === 0 ? (
              <View className="items-center py-8">
                <Icon name="bell-off-outline" size={48} color="#9ca3af" />
                <Text className="mt-2 text-sm text-muted-foreground">No notifications</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  className="mb-3 rounded-lg border border-border bg-card p-3"
                  onPress={() => {
                    if (notification.relatedComplaintId) {
                      // Navigate to complaint detail
                      setNotificationDialog(false);
                    }
                  }}>
                  <Text className="text-sm text-foreground">{notification.message}</Text>
                  <Text className="mt-1 text-xs text-muted-foreground">
                    {formatDate(notification.sentAt)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <DialogFooter>
            {notifications.length > 0 && (
              <Button
                onPress={() => {
                  const ids = notifications.map((n) => n.id);
                  markAsRead(ids);
                  setNotificationDialog(false);
                }}
                className="mr-2">
                <Text className="text-sm text-white">Mark All as Read</Text>
              </Button>
            )}
            <Button variant="outline" onPress={() => setNotificationDialog(false)}>
              <Text className="text-sm">Close</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
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
