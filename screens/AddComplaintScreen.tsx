import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddComplaintScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-foreground">Add Complaint Screen</Text>
        <Text className="mt-4 text-center text-muted-foreground">
          Add complaint form coming soon...
        </Text>
      </View>
    </SafeAreaView>
  );
}
