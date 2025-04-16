import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, ActivityIndicator, Alert, Dimensions, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function IDCaptureScreen() {
    const [idPhoto, setIdPhoto] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation()

    const captureID = async () => {
        setIsLoading(true);
        try {
            // Kiểm tra quyền hiện tại
            const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
            let finalStatus = existingStatus;

            // Nếu chưa có quyền, yêu cầu quyền
            if (existingStatus !== 'granted') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                finalStatus = status;

                // Nếu người dùng từ chối, hiển thị popup giải thích
                if (finalStatus !== 'granted') {
                    Alert.alert(
                        'Camera Access Permission',
                        'The app requires camera access to take pictures. Please grant permission in Settings.',
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                            {
                                text: 'Open Settings',
                                onPress: () => Linking.openSettings(),
                            },
                        ]
                    );
                    setIsLoading(false);
                    return;
                }
            }

            // Nếu đã có quyền, mở camera
            const result = await ImagePicker.launchCameraAsync({
                mediaType: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                aspect: [3, 2],
                quality: 0.8,
            });

            if (!result.canceled) {
                setIdPhoto(result.assets[0].uri);
                (navigation as any).replace('IdCardResult', { ocrData: result.assets[0].uri });
            }
        } catch (error) {
            Alert.alert('Error', 'Unable to open the camera');
        } finally {
            setIsLoading(false);
        }
    };

    if (!idPhoto) {
        return (
            <View style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                padding: 20,
                justifyContent: 'space-between'
            }}>
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                    <MaterialIcons
                        name="photo-camera"
                        size={50}
                        color="#007AFF"
                        style={{ marginBottom: 15 }}
                    />
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: 5,
                        textAlign: 'center'
                    }}>
                        CAPTURE FRONT SIDE OF ID CARD/PASSPORT
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        color: '#666',
                        marginBottom: 30,
                        textAlign: 'center'
                    }}>
                        Make sure the image fits within the frame.
                    </Text>

                    <View style={{
                        width: width - 40,
                        height: (width - 40) * 0.66,
                        borderWidth: 2,
                        borderColor: '#007AFF',
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 122, 255, 0.05)',
                        marginBottom: 30,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <View style={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            right: 10,
                            bottom: 10,
                            borderWidth: 1,
                            borderColor: 'rgba(0, 122, 255, 0.3)',
                            borderRadius: 8,
                            borderStyle: 'dashed'
                        }} />
                        <Image
                            source={require('@/assets/images/partport.jpg')}
                            style={{ width: '90%', height: '80%' }}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={{
                        backgroundColor: '#007AFF',
                        paddingVertical: 15,
                        paddingHorizontal: 20,
                        borderRadius: 30,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 10,
                        shadowColor: '#007AFF',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 5,
                        marginBottom: 30
                    }}
                    onPress={captureID}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialIcons name="camera-alt" size={24} color="white" />
                            <Text style={{
                                color: 'white',
                                fontSize: 16,
                                fontWeight: '600'
                            }}>
                                NEXT
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    }
};