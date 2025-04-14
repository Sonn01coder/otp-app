import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Dimensions, Alert, Linking, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { post } from '@/fetch/apiClient';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.8; // Tỉ lệ thẻ face

export default function FaceRegisterTransaction() {
    const [isLoading, setIsLoading] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [facing] = useState<CameraType>('front');
    const cameraRef = useRef<CameraView>(null);
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        if (permission && !permission.granted && !permission.canAskAgain) {
            setShowPermissionDialog(true);
        }
    }, [permission]);

    const handleOpenSettings = () => {
        Linking.openSettings();
        setShowPermissionDialog(false);
    };

    const captureFace = async () => {
        if (!cameraRef.current) return;

        setIsLoading(true);
        try {

            if (!permission?.granted) {
                const { granted } = await requestPermission();
                if (!granted) {
                    setShowPermissionDialog(true);
                    setIsLoading(false);
                    return;
                }
            }

            const photo: any = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: true,
            });

            if (photo.uri) {
                const newRes = await handleCreateSession()
                if (newRes) {
                    (navigation as any).replace('FaceTransactionRegisterSuccess', { portrait: photo.uri });
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

    if (showPermissionDialog) {
        return (
            <View style={styles.permissionDialog}>
                <View style={styles.dialogContent}>
                    <MaterialIcons name="photo-camera" size={50} color="#FF6B6B" />
                    <Text style={styles.dialogTitle}>Camera Access Required</Text>
                    <Text style={styles.dialogText}>
                        The app requires camera access to capture ID cards.
                        Please grant permission in Settings.
                    </Text>
                    <Pressable
                        style={styles.settingsButton}
                        onPress={handleOpenSettings}
                    >
                        <Text style={styles.settingsButtonText}>Open Settings</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    if (!permission?.granted) {
        return (
            <View style={styles.permissionRequest}>
                <Text style={styles.permissionText}>
                    The app needs camera access to function
                </Text>
                <Pressable
                    style={styles.permissionButton}
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
                </Pressable>
            </View>
        );
    }

    // if (idPhoto) {
    //     return (
    //         <View style={styles.previewContainer}>
    //             <View style={styles.idCardFrame}>
    //                 <Image source={{ uri: idPhoto }} style={styles.previewImage} />
    //                 <View style={styles.idCardOverlay} />
    //             </View>

    //             <View style={styles.actionButtons}>
    //                 <Pressable style={styles.retakeButton} onPress={() => setIdPhoto(null)}>
    //                     <AntDesign name="retweet" size={24} color="white" />
    //                     <Text style={styles.buttonText}>Retake</Text>
    //                 </Pressable>

    //                 <Pressable
    //                     style={styles.saveButton}
    //                     onPress={() => (navigation as any).replace('IdCardResult', { ocrData: idPhoto })}
    //                 >
    //                     <AntDesign name="check" size={24} color="white" />
    //                     <Text style={styles.buttonText}>Confirm</Text>
    //                 </Pressable>
    //             </View>
    //         </View>
    //     );
    // }

    return (
        <View style={styles.container}>
            <View style={styles.cameraHeader}>
                <Text style={styles.headerText}>FACE AUTHENTICATION</Text>
                <Text style={styles.subHeaderText}>Align the face in the frame</Text>
            </View>

            <View style={styles.idCardFrame}>
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={facing}
                    enableTorch={false}
                    mode="picture"
                />
                <View style={styles.idCardOverlay} />
            </View>

            <View style={styles.cameraFooter}>
                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={captureFace}
                    disabled={isLoading}
                    activeOpacity={0.7}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <MaterialIcons name="photo-camera" size={32} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    permissionDialog: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialogContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        width: '90%',
    },
    dialogTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: '#333',
    },
    dialogText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
        color: '#555',
        lineHeight: 22,
    },
    settingsButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    settingsButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    permissionRequest: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#f8f9fa',
    },
    permissionText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    permissionButton: {
        backgroundColor: '#4A90E2',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    cameraHeader: {
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        marginTop: height * 0.05,
    },
    headerText: {
        color: '#333',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subHeaderText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
    },
    idCardFrame: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE, // Phải bằng width để thành hình tròn
        borderRadius: CIRCLE_SIZE / 2, // Một nửa width/height → hình tròn
        alignSelf: 'center',
        marginTop: 30,

        // Style trang trí:
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    idCardOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.3)',
        borderRadius: 8,
        margin: 10,
        borderStyle: 'dashed',
    },
    camera: {
        flex: 1,
    },
    previewContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 20,
    },
    previewImage: {
        flex: 1,
        resizeMode: 'contain',
    },
    cameraFooter: {
        position: 'absolute',
        bottom: height * 0.1,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF', // Background với opacity 0.5
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
        paddingHorizontal: 20,
    },
    retakeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C3E50',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
    },
    buttonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
});