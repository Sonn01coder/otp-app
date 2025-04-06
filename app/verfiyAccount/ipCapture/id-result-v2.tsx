import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { post } from '@/fetch/apiClient';
import LoadingIndicator from '@/components/Loading';
import RNFS from 'react-native-fs';

const IDCardResultV2Screen = ({ route }: { route: { params: { ocrData: any } } }) => {

    const testImage = require('@/assets/images/ocr.jpeg')

    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)


    const navigation = useNavigation();

    const ocrData = route.params.ocrData

    // Các trường thông tin CCCD
    const fields = [
        { label: 'ID', value: data?.data?.data?.ocr?.id_eng },
        { label: 'Name', value: data?.data?.data?.ocr?.name_eng },
        { label: 'Father Name', value: data?.data?.data?.ocr?.father_name_eng },
        { label: 'Gender', value: data?.data?.data?.ocr?.gender },
        { label: 'Issue Date', value: data?.data?.data?.ocr?.issue_date_en },
    ];

    const handleOCR = async () => {
        setIsLoading(true);
        try {
            // B1: Đường dẫn gốc ảnh trong thư mục assets
            const sourcePath = Image.resolveAssetSource(require('@/assets/images/ocr.jpeg')).uri;

            // B2: Tạo đường dẫn đích tạm thời để copy vào bộ nhớ
            const destPath = `${RNFS.DocumentDirectoryPath}/ocr.jpg`;

            if (Platform.OS === 'android' && sourcePath.startsWith('asset:/')) {
                // Android không thể dùng trực tiếp asset:/ nên phải đọc và ghi lại
                const fileData = await RNFS.readFileAssets('images/ocr.jpeg', 'base64'); // Tên file tính từ android/app/src/main/assets/
                await RNFS.writeFile(destPath, fileData, 'base64');
            } else {
                // iOS hoặc uri hợp lệ thì copy luôn
                await RNFS.copyFile(sourcePath, destPath);
            }

            // B3: Upload file đã copy
            const formData: any = new FormData();
            formData.append('image', {
                uri: `file://${destPath}`, // Đường dẫn chuẩn cho FormData
                type: 'image/jpeg',
                name: 'ocr.jpg',
            });

            const res: any = await post(
                'kyc/OCR',
                formData,
                {}, // KHÔNG set Content-Type ở đây
                true
            );

            setData(res);
        } catch (error) {
            console.error('OCR Error:', error);
            Alert.alert('Error', 'Failed to process OCR. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            await handleOCR();
        };
        fetchData();
    }, []);

    return (
        isLoading ? (
            <View style={styles.containerImage}>
                <LoadingIndicator />
                <Text style={styles.loadingText}>Processing...</Text>
            </View>
        ) : (
            data?.data?.response_code === 200 ? (
                <ScrollView contentContainerStyle={styles.container}>
                    {/* Phần header */}
                    <View style={styles.header}>
                        <Text style={styles.successTitle}>OCR Successfully</Text>
                        {ocrData && (
                            <Image
                                source={testImage}
                                style={styles.idImage}
                                resizeMode="contain"
                            />
                        )}
                    </View>

                    {/* Phần thông tin chi tiết */}
                    <View style={styles.infoContainer}>
                        {fields.map((field, index) => (
                            field.value && (
                                <View key={index} style={styles.infoRow}>
                                    <Text style={styles.label}>{field.label}:</Text>
                                    <Text style={styles.value}>{field.value}</Text>
                                </View>
                            )
                        ))}
                    </View>

                    {/* Button tiếp tục */}
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => (navigation as any).replace('FaceCapture', { imageOcr: data?.imageUpload })}
                    >
                        <Text style={styles.continueButtonText}>Tiếp tục</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <View style={styles.container_error}>
                    <Text style={styles.errorTitle_error}>OCR Failed</Text>
                    <Image
                        source={require('@/assets/images/notData.jpeg')}
                        style={styles.errorImage_error}
                        resizeMode="contain"
                    />
                    <Text style={styles.errorMessage_error}>
                        Unable to recognize information from the image. Please try again with a clearer image.
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton_error}
                        onPress={() => (navigation as any).replace('IDCaptureV2Screen')}
                    >
                        <Text style={styles.buttonText_error}>BACK</Text>
                    </TouchableOpacity>
                </View >
            )
        )
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50', // Màu xanh lá
        marginBottom: 20,
    },
    idImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    infoContainer: {
        marginBottom: 30,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        width: '40%',
        fontWeight: 'bold',
        color: '#555',
    },
    value: {
        width: '60%',
        color: '#333',
    },
    continueButton: {
        backgroundColor: '#3498db', // Màu xanh dương
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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

export default IDCardResultV2Screen;