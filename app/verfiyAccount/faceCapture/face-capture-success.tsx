import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoadingIndicator from '@/components/Loading';
import { post } from '@/fetch/apiClient';
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

const FaceCaptureSuccess = ({ route }: { route: { params: { portrait_image: any, imageOcr: any } } }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [data, setData] = useState<any>(null)


    const image = route.params

    const navigation = useNavigation();

    const handleCompare = async () => {
        try {

            if (!image.portrait_image) {
                throw new Error("No image selected");
            }

            const imageUri = Platform.OS === "ios" ? image.portrait_image.replace("file://", "") : image.portrait_image;

            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            if (!fileInfo.exists) {
                throw new Error("File does not exist");
            }

            const resizedImage = await ImageManipulator.manipulateAsync(
                image.portrait_image,
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

            formData.append('front_image', image.imageOcr)

            // Gửi request lên server
            const res = await post(
                'kyc/compare-face',
                formData,
                {
                    'Content-Type': 'multipart/form-data',
                },
                true
            );
            setData(res);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            await handleCompare();
        };
        fetchData();
    }, []);

    return (
        isLoading ?
            <View style={styles.containerImage} >
                <LoadingIndicator />
                <Text style={styles.loadingText}>Processing...</Text>
            </View > :
            (
                data?.remoteResponse?.ocr_results?.response_code === 200 ?
                    <View style={styles.container}>
                        {/* Tiêu đề */}
                        <Text style={styles.title}>FACE AUTHENTICATION SUCCESSFUL</Text>

                        {/* Ảnh khuôn mặt */}
                        <Image
                            source={require('@/assets/images/logo1.jpg')}
                            style={styles.faceImage}
                            resizeMode="contain"
                        />

                        {/* Thông báo phụ */}
                        <Text style={styles.subText}>Your face has been successfully authenticated</Text>

                        {/* Nút tiếp tục */}
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={() => (navigation as any).replace('RegisterPin')} // Thay bằng màn hình tiếp theo
                        >
                            <Text style={styles.buttonText}>NEXT</Text>
                        </TouchableOpacity>
                    </View> : <View style={styles.container_error}>
                        {/* Tiêu đề màu đỏ */}
                        <Text style={styles.errorTitle_error}>Failed</Text>

                        {/* Hình ảnh thất bại */}
                        <Image
                            source={require('@/assets/images/notData.jpeg')} // Thay bằng đường dẫn hình ảnh của bạn
                            style={styles.errorImage_error}
                            resizeMode="contain"
                        />

                        {/* Thông báo lỗi */}
                        <Text style={styles.errorMessage_error}>
                            Please try again with a clearer image.
                        </Text>

                        {/* Nút quay lại màu xanh */}
                        <TouchableOpacity
                            style={styles.backButton_error}
                            onPress={() => (navigation as any).replace('FaceCaptureV2', { imageOcr: image.imageOcr })}
                        >
                            <Text style={styles.buttonText_error}>BACK</Text>
                        </TouchableOpacity>
                    </View>
            ))
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2ecc71', // Màu xanh lá
        marginBottom: 30,
        textAlign: 'center',
        textTransform: 'uppercase', // Chữ in hoa
    },
    faceImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 4,
        borderColor: '#2ecc71',
        marginBottom: 20,
    },
    subText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    continueButton: {
        backgroundColor: '#3498db', // Màu xanh dương
        width: '100%',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    containerImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#333', // màu chữ
    },
    container_error: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    errorTitle_error: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 20,
    },
    errorImage_error: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    errorMessage_error: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    backButton_error: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        width: '80%',
    },
    buttonText_error: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default FaceCaptureSuccess;