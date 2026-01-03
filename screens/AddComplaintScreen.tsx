import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigation';
import { apiService } from '@/service/api.service';
import { AlertDialog } from '@/components/ui/alert-dialog';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddComplaint'>;
};

const { width, height } = Dimensions.get('window');

const SPACING = {
  xs: width * 0.01,
  sm: width * 0.02,
  md: width * 0.04,
  lg: width * 0.06,
  xl: width * 0.08,
};

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function AddComplaintScreen({ navigation }: Props) {
  const { colorScheme } = useColorScheme();
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [imagePickerDialog, setImagePickerDialog] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    variant: 'info' as 'success' | 'error' | 'info',
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      height: width * 0.1,
      width: width * 0.1,
      borderRadius: width * 0.05,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    headerTitle: {
      fontSize: width * 0.06,
      fontWeight: 'bold',
    },
    headerSubtitle: {
      fontSize: width * 0.035,
      marginTop: SPACING.xs,
    },
    scrollContent: {
      paddingHorizontal: SPACING.md,
    },
    card: {
      marginTop: SPACING.md,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardTitleText: {
      fontSize: width * 0.045,
      fontWeight: '600',
      marginLeft: SPACING.sm,
    },
    descriptionInput: {
      minHeight: 50,
      textAlignVertical: 'top',
      paddingTop: 12,
      borderRadius: 12,
      marginTop: -SPACING.md,
    },
    photoHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    removeImageButton: {
      borderRadius: 20,
      backgroundColor: '#ef4444',
      padding: 4,
    },
    selectedImageContainer: {
      position: 'relative',
    },
    selectedImage: {
      width: '100%',
      height: width * 0.5,
      borderRadius: 12,
    },
    imageOverlay: {
      position: 'absolute',
      bottom: SPACING.sm,
      right: SPACING.sm,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    imagePlaceholder: {
      height: width * 0.4,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePlaceholderText: {
      marginTop: SPACING.sm,
      fontSize: width * 0.035,
    },
    imagePlaceholderHint: {
      marginTop: SPACING.xs,
      fontSize: width * 0.03,
    },
    locationCaptured: {
      borderRadius: 12,
      padding: SPACING.md,
    },
    locationCapturedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    locationCapturedText: {
      fontSize: width * 0.035,
      fontWeight: '500',
      marginLeft: SPACING.sm,
    },
    locationCoords: {
      fontSize: width * 0.03,
    },
    locationAddress: {
      marginTop: SPACING.sm,
      fontSize: width * 0.035,
    },
    refreshLocationButton: {
      marginTop: SPACING.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      paddingVertical: SPACING.sm,
    },
    refreshLocationText: {
      fontSize: width * 0.035,
      fontWeight: '500',
      marginLeft: SPACING.sm,
    },
    getLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      paddingVertical: SPACING.md,
    },
    getLocationText: {
      marginLeft: SPACING.sm,
      fontWeight: '500',
    },
    submitButtonContainer: {
      marginVertical: SPACING.lg,
    },
    submitButton: {
      paddingVertical: SPACING.md,
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    submitButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    submitButtonText: {
      fontSize: width * 0.045,
      fontWeight: 'bold',
      marginLeft: SPACING.sm,
      color: '#fff',
    },
    dialogOptionContainer: {
      marginTop: SPACING.sm,
    },
    dialogOption: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
    },
    dialogIconContainer: {
      height: width * 0.12,
      width: width * 0.12,
      borderRadius: width * 0.06,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.md,
    },
    dialogOptionTitle: {
      fontSize: width * 0.04,
      fontWeight: '600',
    },
    dialogOptionSubtitle: {
      fontSize: width * 0.033,
      marginTop: SPACING.xs,
    },
    bottomSpacer: {
      height: SPACING.md,
    },
  });

  const showAlert = (
    title: string,
    message: string,
    variant: 'success' | 'error' | 'info' = 'info'
  ) => {
    setAlert({ visible: true, title, message, variant });
  };

  const checkLocationPermission = async (): Promise<boolean> => {
    try {
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        showAlert(
          'GPS Disabled',
          'Please enable GPS/Location Services in your device settings to continue.',
          'error'
        );
        return false;
      }

      let { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        const permissionResponse = await Location.requestForegroundPermissionsAsync();
        status = permissionResponse.status;
      }

      if (status !== 'granted') {
        showAlert(
          'Permission Denied',
          'Location permission is required to tag your complaint. Please grant permission in settings.',
          'error'
        );
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const getCoordinates = async (): Promise<{ latitude: number; longitude: number }> => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (results && results.length > 0) {
        const result = results[0];
        const addressParts = [
          result.streetNumber,
          result.street,
          result.district,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);

        return addressParts.length > 0 ? addressParts.join(', ') : 'Address not found';
      }
      return 'Address not found';
    } catch (error) {
      return null;
    }
  };

  const fetchLocation = async () => {
    try {
      setFetchingLocation(true);

      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setFetchingLocation(false);
        return;
      }

      const { latitude, longitude } = await getCoordinates();
      const address = await getAddressFromCoords(latitude, longitude);
      setLocation({ latitude, longitude, address: address || undefined });
      showAlert('Success', 'Location fetched successfully!', 'success');
    } catch (error: any) {
      let errorMessage = 'Failed to get location. ';
      if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage += 'Please enable GPS in your device settings.';
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage += 'Location request timed out. Please try again.';
      } else {
        errorMessage += 'Please check GPS and try again.';
      }

      showAlert('Location Error', errorMessage, 'error');
    } finally {
      setFetchingLocation(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      setImagePickerDialog(false);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'Gallery access is required to select images.', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        //aspect: [4, 3],
        quality: 0.6,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick image from gallery.', 'error');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      setImagePickerDialog(false);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'Camera access is required to take photos.', 'error');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      showAlert('Error', 'Failed to take photo with camera.', 'error');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      showAlert('Validation Error', 'Please enter a description for your complaint.', 'error');
      return;
    }

    if (!location) {
      showAlert('Validation Error', 'Please fetch your location before submitting.', 'error');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      const requestData = {
        description: description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      formData.append('request', JSON.stringify(requestData));

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photo', {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);
      }

      const response = await apiService.submitComplaint(formData);
      console.log(response);
      if (response) {
        showAlert('Success', 'Complaint submitted successfully!', 'success');
        setDescription('');
        setSelectedImage(null);
        setImageUri(null);
        setLocation(null);

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        showAlert('Error', response.message || 'Failed to submit complaint.', 'error');
      }
    } catch (error: any) {
      console.log(error)
      showAlert('Error', error.message || 'Failed to submit complaint. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      className="bg-background"
      edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header} className="border-border bg-card">
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            className="bg-secondary">
            <Icon name="arrow-left" size={22} color={colorScheme === 'dark' ? '#fff' : '#333'} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle} className="text-foreground">
              New Complaint
            </Text>
            <Text style={styles.headerSubtitle} className="text-muted-foreground">
              Report an issue on campus
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Description Card */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>
              <View style={styles.cardTitleRow}>
                <Icon name="text-box-outline" size={20} color="#6366f1" />
                <Text style={styles.cardTitleText} className="text-foreground">
                  Description
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Describe your complaint in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              style={styles.descriptionInput}
              className="border border-input bg-background text-foreground"
            />
          </CardContent>
        </Card>

        {/* Photo Card */}
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.photoHeaderRow}>
              <CardTitle>
                <View style={styles.cardTitleRow}>
                  <Icon name="camera" size={20} color="#6366f1" />
                  <Text style={styles.cardTitleText} className="text-foreground">
                    Photo
                  </Text>
                </View>
              </CardTitle>
              {selectedImage && (
                <TouchableOpacity onPress={removeImage} style={styles.removeImageButton}>
                  <Icon name="close" size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </CardHeader>
          <CardContent>
            {selectedImage ? (
              <TouchableOpacity
                onPress={() => setImagePickerDialog(true)}
                style={styles.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Text className="text-xs text-white">Tap to change</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setImagePickerDialog(true)}
                style={styles.imagePlaceholder}
                className="border-muted-foreground/50 bg-secondary/30">
                <Icon name="camera-plus" size={48} color="#9ca3af" />
                <Text style={styles.imagePlaceholderText} className="text-muted-foreground">
                  Tap to add a photo
                </Text>
                <Text style={styles.imagePlaceholderHint} className="text-muted-foreground/70">
                  (Camera or Gallery)
                </Text>
              </TouchableOpacity>
            )}
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>
              <View style={styles.cardTitleRow}>
                <Icon name="map-marker" size={20} color="#6366f1" />
                <Text style={styles.cardTitleText} className="text-foreground">
                  Location
                </Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {location ? (
              <View style={styles.locationCaptured} className="bg-secondary/50">
                <View style={styles.locationCapturedHeader}>
                  <Icon name="crosshairs-gps" size={18} color="#22c55e" />
                  <Text style={styles.locationCapturedText} className="text-foreground">
                    Location Captured
                  </Text>
                </View>
                <Text style={styles.locationCoords} className="text-muted-foreground">
                  Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                </Text>
                {location.address && (
                  <Text
                    style={styles.locationAddress}
                    className="text-foreground"
                    numberOfLines={3}>
                    {location.address}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={fetchLocation}
                  disabled={fetchingLocation}
                  style={styles.refreshLocationButton}
                  className="bg-secondary">
                  <Icon name="refresh" size={18} color="#6366f1" />
                  <Text style={styles.refreshLocationText} className="text-primary">
                    Refresh Location
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={fetchLocation}
                disabled={fetchingLocation}
                style={styles.getLocationButton}
                className="bg-primary">
                {fetchingLocation ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.getLocationText} className="text-white">
                      Getting Location...
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="crosshairs-gps" size={22} color="#fff" />
                    <Text style={styles.getLocationText} className="text-white">
                      Get Current Location
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitButtonContainer}>
          <Button
            onPress={handleSubmit}
            disabled={loading || !description.trim() || !location}
            style={styles.submitButton}
            className={loading || !description.trim() || !location ? 'opacity-50' : ''}>
            {loading ? (
              <View style={styles.submitButtonContent}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </View>
            ) : (
              <View style={styles.submitButtonContent}>
                <Icon name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Complaint</Text>
              </View>
            )}
          </Button>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Image Picker Dialog */}
      <Dialog open={imagePickerDialog} onOpenChange={setImagePickerDialog}>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>Add Photo</DialogTitle>
            <DialogDescription>Choose how you want to add a photo</DialogDescription>
          </DialogHeader>

          <View style={styles.dialogOptionContainer}>
            <TouchableOpacity
              onPress={takePhotoWithCamera}
              style={styles.dialogOption}
              className="bg-secondary">
              <View style={styles.dialogIconContainer} className="bg-primary">
                <Icon name="camera" size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.dialogOptionTitle} className="text-foreground">
                  Take Photo
                </Text>
                <Text style={styles.dialogOptionSubtitle} className="text-muted-foreground">
                  Use your camera to capture
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImageFromGallery}
              style={styles.dialogOption}
              className="bg-secondary">
              <View style={styles.dialogIconContainer} className="bg-primary">
                <Icon name="image" size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.dialogOptionTitle} className="text-foreground">
                  Choose from Gallery
                </Text>
                <Text style={styles.dialogOptionSubtitle} className="text-muted-foreground">
                  Select from your photos
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <DialogFooter>
            <Button variant="outline" onPress={() => setImagePickerDialog(false)}>
              <Text>Cancel</Text>
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
