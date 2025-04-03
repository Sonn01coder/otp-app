import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Platform } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { post } from '@/fetch/apiClient';
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { getMe } from '@/fetch/authAPI';

const { width } = Dimensions.get('window');

export default function FaceRegisterTransaction() {
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation()

    const [user, setUser] = useState<any>(null)

    const handleGetMe = async () => {
        try {
            const res = getMe()
            setUser(res)
        } catch (error) {

        }
    }

    const captureFace = async () => {
        setIsLoading(true);
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Notification', 'Please grant permission to access the camera');
                return;
            }

            const result: any = await ImagePicker.launchCameraAsync({
                mediaType: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                aspect: [1, 1], // Tỉ lệ vuông cho ảnh chân dung
                quality: 0.8,
                base64: true
            });

            const imageFace = result.assets[0].uri

            if (!result.canceled) {

                if (!imageFace) {
                    throw new Error("No image selected");
                }

                const imageUri = Platform.OS === "ios" ? imageFace.replace("file://", "") : imageFace;

                const fileInfo = await FileSystem.getInfoAsync(imageUri);
                if (!fileInfo.exists) {
                    throw new Error("File does not exist");
                }

                const resizedImage = await ImageManipulator.manipulateAsync(
                    imageFace,
                    [{ resize: { width: 800 } }], // Resize width, giữ aspect ratio
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                )

                // Tạo FormData
                const formData: any = new FormData();
                formData.append('portrait_image', {
                    uri: resizedImage.uri,
                    type: 'image/jpeg', // Định dạng ảnh
                    name: 'ocr.jpeg', // Tên file
                });
                formData.append('front_image', user.image[0])

                // Gửi request lên server
                const res = await post(
                    'kyc/compare-face',
                    formData,
                    {
                        'Content-Type': 'multipart/form-data',
                    },
                    true
                );
                (navigation as any).replace('FaceTransactionRegisterSuccess', { portrait: result.assets[0].uri });
            }
        } catch (error) {
            Alert.alert('Error', 'Cannot open the camera');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleGetMe()
    }, [])

    return (
        <View style={styles.container}>
            <View style={styles.captureContainer}>
                <Text style={styles.guideText}>ALIGN YOUR FACE WITHIN THE FRAME</Text>
                <View style={styles.guideFrame}>
                    <View style={styles.faceOutline} >
                        <AntDesign
                            name="user"
                            size={120}
                            color="#007AFF"
                            style={{ marginBottom: 15 }}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={captureFace}
                    disabled={isLoading}
                >
                    <>
                        <MaterialIcons name="photo-camera" size={24} color="white" />
                        <Text style={styles.buttonText}>NEXT</Text>
                    </>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center'
    },
    captureContainer: {
        alignItems: 'center',
        width: '100%'
    },
    guideFrame: {
        width: width - 60,
        height: width - 60,
        borderRadius: (width - 60) / 2,
        borderWidth: 2,
        borderColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    faceOutline: {
        width: width - 120,
        height: width - 120,
        borderRadius: (width - 120) / 2,
        borderWidth: 1,
        borderColor: 'rgba(0,122,255,0.5)',
        borderStyle: 'dashed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    guideText: {
        position: 'absolute',
        top: -70,
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        width: '70%',
        paddingTop: 10,
        paddingBottom: 10,
    },
    captureButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5
    },
    previewContainer: {
        alignItems: 'center',
        width: '100%'
    },
    previewImage: {
        width: width - 60,
        height: width - 60,
        borderRadius: (width - 60) / 2,
        borderWidth: 2,
        borderColor: '#007AFF',
        marginBottom: 30
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 20
    },
    retakeButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    confirmButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600'
    }
});