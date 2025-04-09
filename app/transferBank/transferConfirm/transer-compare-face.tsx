import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LoadingIndicator from '@/components/Loading';
import { post } from '@/fetch/apiClient';
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

const FaceTransferSuccess = ({ route }: { route: { params: { portrait: any, amount: any } } }) => {
    // const testImage = require('@/assets/images/ocr.jpeg')

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [data, setData] = useState<any>(null)

    const { portrait, amount } = route.params

    const navigation = useNavigation();

    const handleCompare = async () => {
        try {

            if (!portrait) {
                throw new Error("No image selected");
            }

            const imageUri = Platform.OS === "ios" ? portrait.replace("file://", "") : portrait;

            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            if (!fileInfo.exists) {
                throw new Error("File does not exist");
            }

            const resizedImage = await ImageManipulator.manipulateAsync(
                portrait,
                [{ resize: { width: 800 } }], // Resize width, giữ aspect ratio
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            )

            // Tạo FormData
            const formData: any = new FormData();
            formData.append('portraint_1', {
                uri: resizedImage.uri,
                // uri: Image.resolveAssetSource(testImage).uri,
                type: 'image/jpeg', // Định dạng ảnh
                name: 'ocr.jpeg', // Tên file
            });

            formData.append('money', Number(amount))

            // Gửi request lên server
            const res = await post(
                'kyc/withdraw',
                formData,
                {
                    'Content-Type': 'multipart/form-data',
                },
                true
            );
            setData(res);

        } catch (error) {
            throw error
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        const initialize = async () => {
            try {
                await handleCompare(); // Truyền id vào handleUpdatePayment
            } catch (error) {
                throw error
            }
        };

        initialize();
    }, []);

    return (
        isLoading ?
            <View style={styles.containerImage} >
                <LoadingIndicator />
                <Text style={styles.loadingText}>Processing...</Text>
            </View > :
            (
                data?.message === 'Withdrawal successful' ?
                    <View style={styles.container}>
                        {/* Ảnh khuôn mặt */}
                        <Image
                            source={require('@/assets/images/success.jpg')} // Thay bằng đường dẫn hình ảnh của bạn
                            style={styles.faceImage}
                            resizeMode="contain"
                        />

                        {/* Thông báo phụ */}
                        <Text style={styles.subText}>Your face has been successfully authenticated</Text>

                        {/* Nút tiếp tục */}
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={() => (navigation as any).replace('TransferSuccessScreen')} // Thay bằng màn hình tiếp theo
                        >
                            <Text style={styles.buttonText}>HOME</Text>
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
                            onPress={() => (navigation as any).replace('Home')}

                        >
                            <Text style={styles.buttonText_error}>HOME</Text>
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
    }
});
export default FaceTransferSuccess;