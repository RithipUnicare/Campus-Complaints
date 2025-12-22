import React from 'react';
import { Modal, View, Pressable } from 'react-native';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function AlertDialog({
  visible,
  title,
  message,
  variant = 'info',
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: AlertDialogProps) {
  const iconConfig = {
    success: { name: 'check-circle', color: '#22c55e' },
    error: { name: 'alert-circle', color: '#ef4444' },
    info: { name: 'information', color: '#3b82f6' },
  };

  const config = iconConfig[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/50 p-6" onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Card className="w-full max-w-sm">
            <CardHeader className="items-center pb-4">
              <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Icon name={config.name} size={36} color={config.color} />
              </View>
              <CardTitle className="text-center">{title}</CardTitle>
              <CardDescription className="text-center">{message}</CardDescription>
            </CardHeader>
            <CardFooter className="flex-col gap-2">
              <Button onPress={onConfirm || onClose} className="w-full">
                <Text className="font-bold">{confirmText}</Text>
              </Button>
              {onConfirm && (
                <Button variant="outline" onPress={onClose} className="w-full">
                  <Text>{cancelText}</Text>
                </Button>
              )}
            </CardFooter>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
