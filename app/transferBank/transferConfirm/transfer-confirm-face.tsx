import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { post } from '@/fetch/apiClient';

const { width } = Dimensions.get('window');

export default function TransferConfirmFace({ route }: any) {
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation()

    const { amount, secretKey } = route.params

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

            if (!result.canceled) {
                const newRes = await handleCreateSession()
                if (newRes) {
                    (navigation as any).replace('FaceTransferSuccess', { portrait: result.assets[0].uri, amount: amount });
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Cannot open the camera');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSession = async () => {
        try {
            // Gọi API tạo session
            const res = await post('kyc/create_session');
            // Kiểm tra phản hồi từ API
            return res?.data.access_token
        } catch (error) {
            // Xử lý lỗi khi gọi API
            Alert.alert('Error', 'Please try again.');
        }
        return;
    };

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