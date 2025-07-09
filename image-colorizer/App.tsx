import React, { useState } from 'react';
import * as FileSystem from 'expo-file-system';

import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { usePickImage } from './hooks/usePickImage';
import { PrimaryButton } from './components/ui/PrimaryButton';

const IP_ADDRESS = '192.168.0.150';

const BASE_URL = `http://${IP_ADDRESS}:5000`;

export default function App() {
  const { pickFromCamera, pickFromGallery, image, resetImage } = usePickImage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const colorizeImage = async () => {
    if (!image) return;

    try {
      setIsProcessing(true);

      const res = await FileSystem.uploadAsync(
        `${BASE_URL}/colorize`,
        image.uri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
        }
      );
      const responseBody = JSON.parse(res.body);
      const processedImageUrl = responseBody.processedImageUrl;

      if (processedImageUrl) {
        const processedImg = processedImageUrl.replace('127.0.0.1', IP_ADDRESS);
        setProcessedImage(processedImg);
      } else {
        Alert.alert('Error', 'Failed to colorize image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setProcessedImage(null);
    resetImage();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        alwaysBounceVertical={false}
      >
        <Text style={styles.title}>Image Colorizer</Text>
        <View>
          <PrimaryButton
            label="Take a Photo"
            onPress={() => {
              reset();
              pickFromCamera();
            }}
            buttonStyles={{ marginBottom: 8 }}
          />
          <PrimaryButton
            label="Choose from Gallery"
            onPress={() => {
              reset();
              pickFromGallery();
            }}
          />
        </View>
        {image && <Image source={{ uri: image.uri }} style={styles.image} />}
        {image && !isProcessing && !processedImage && (
          <View>
            <PrimaryButton
              label="Colorize"
              onPress={colorizeImage}
              buttonStyles={[styles.cta]}
              labelStyles={styles.cta}
            />
          </View>
        )}
        {isProcessing && <ActivityIndicator size="large" color="#747474" />}
        {processedImage && image && (
          <View>
            <Image source={{ uri: processedImage }} style={styles.image} />
            <PrimaryButton label="Reset" onPress={reset} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 180,
    height: 180,
    marginVertical: 20,
    borderRadius: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cta: {
    color: 'white',
    backgroundColor: 'black',
  },
});
