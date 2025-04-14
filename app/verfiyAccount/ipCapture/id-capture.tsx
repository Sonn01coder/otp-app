import React, { useState, useRef, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, ActivityIndicator, Alert, Dimensions, Linking, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const frameAspectRatio = 85.6 / 54; // Tỉ lệ thẻ căn cước

export default function IDCaptureScreen() {
    const [idPhoto, setIdPhoto] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [facing] = useState<CameraType>('back');
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

    const captureID = async () => {
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

            setIdPhoto(photo.uri);
            (navigation as any).replace('IdCardResult', { ocrData: photo.uri });
        } catch (error) {
            Alert.alert('Error', 'Unable to take photo');
        } finally {
            setIsLoading(false);
        }
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

    if (idPhoto) {
        return (
            <View style={styles.previewContainer}>
                <View style={styles.idCardFrame}>
                    <Image source={{ uri: idPhoto }} style={styles.previewImage} />
                    <View style={styles.idCardOverlay} />
                </View>

                <View style={styles.actionButtons}>
                    <Pressable style={styles.retakeButton} onPress={() => setIdPhoto(null)}>
                        <AntDesign name="retweet" size={24} color="white" />
                        <Text style={styles.buttonText}>Retake</Text>
                    </Pressable>

                    <Pressable
                        style={styles.saveButton}
                        onPress={() => (navigation as any).replace('IdCardResult', { ocrData: idPhoto })}
                    >
                        <AntDesign name="check" size={24} color="white" />
                        <Text style={styles.buttonText}>Confirm</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.cameraHeader}>
                <Text style={styles.headerText}>CAPTURE FRONT SIDE OF ID CARD/PASSPORT</Text>
                <Text style={styles.subHeaderText}>Make sure the image fits within the frame</Text>
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
                    onPress={captureID}
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
        marginTop: height * 0.1,
    },
    headerText: {
        color: '#333',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subHeaderText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    idCardFrame: {
        width: '100%', // Sử dụng 100% width
        maxWidth: width - 48, // Giới hạn chiều rộng tối đa
        aspectRatio: frameAspectRatio,
        alignSelf: 'center',
        marginTop: 30, // Giảm margin top
        borderRadius: 10,
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
        bottom: height * 0.05,
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