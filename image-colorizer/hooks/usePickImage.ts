import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export enum ImageSource {
  Camera = 'Camera',
  Gallery = 'Gallery',
}

const baseOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 1,
} satisfies ImagePicker.ImagePickerOptions;

export const usePickImage = () => {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const resetImage = () => setImage(null);

  const handlePermissions = async () => {
    const permission = await ImagePicker.getCameraPermissionsAsync();
    if (!permission.granted) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'You need to grant camera permissions to use this feature.'
        );
      }
    }
  };

  const pickImage = async (source: ImageSource) => {
    const method =
      source === ImageSource.Camera
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    if (source === ImageSource.Camera) await handlePermissions();

    const result = await method(baseOptions);

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const pickFromCamera = () => pickImage(ImageSource.Camera);
  const pickFromGallery = () => pickImage(ImageSource.Gallery);

  return { image, pickFromCamera, pickFromGallery, resetImage };
};
