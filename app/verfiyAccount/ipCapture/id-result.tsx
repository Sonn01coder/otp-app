import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { post } from '@/fetch/apiClient';
import LoadingIndicator from '@/components/Loading';
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

const IDCardResultScreen = ({ route }: { route: { params: { ocrData: any } } }) => {
    const testImage = require('@/assets/images/ocr.jpeg')
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const navigation = useNavigation();
    const ocrData = route.params.ocrData

    // Các trường thông tin CCCD
    const fields = [
        { label: 'Country', value: 'Malaysia' },
        { label: 'ID', value: data?.data?.data?.ocr?.id },
        { label: 'ID English', value: data?.data?.data?.ocr?.id_eng },
        { label: 'Birthday', value: data?.data?.data?.ocr?.birthday },
        { label: 'Birthday English', value: data?.data?.data?.ocr?.birthday_eng },
        { label: 'Name', value: data?.data?.data?.ocr?.name_eng },
        { label: 'Name English', value: data?.data?.data?.ocr?.name_eng },
        { label: 'Gender', value: data?.data?.data?.ocr?.gender },
        { label: 'Religion', value: data?.data?.data?.ocr?.religion },
        { label: 'Religion English', value: data?.data?.data?.ocr?.religion_eng },
        { label: 'Issue Date', value: data?.data?.data?.ocr?.issue_date },
        { label: 'Issue Date English', value: data?.data?.data?.ocr?.issue_date_en },
        { label: 'Township', value: data?.data?.data?.ocr?.township },
        { label: 'Township English', value: data?.data?.data?.ocr?.township_eng },
        { label: 'Issue Date', value: data?.data?.data?.ocr?.issue_date },
        { label: 'Issue Date English', value: data?.data?.data?.ocr?.issue_date_en },
        { label: 'Township', value: data?.data?.data?.ocr?.township },
        { label: 'Township English', value: data?.data?.data?.ocr?.township_eng },
    ];


    const handleOCR = async () => {
        try {
            if (!ocrData) {
                throw new Error("No image selected");
            }

            const imageUri = Platform.OS === "ios" ? ocrData.replace("file://", "") : ocrData;
            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            if (!fileInfo.exists) {
                throw new Error("File does not exist");
            }

            const resizedImage = await ImageManipulator.manipulateAsync(
                ocrData,
                [{ resize: { width: 800 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );

            const formData: any = new FormData();
            formData.append("image", {
                uri: resizedImage.uri,
                type: "image/jpeg",
                name: "ocr.jpg",
            });

            const res: any = await post(
                'kyc/OCR',
                formData,
                {
                    'Content-Type': 'multipart/form-data',
                },
                true
            );
            setData(res)
        } catch (error) {
            console.error("OCR Error:", error);
            Alert.alert("Error", "Failed to process OCR. Please try again.");
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingIndicator />
                <Text style={styles.loadingText}>Processing...</Text>
            </View>
        );
    }

    if (data?.data?.response_code !== 200) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>OCR Failed</Text>
                <Image
                    source={require('@/assets/images/notData.jpeg')}
                    style={styles.errorImage}
                    resizeMode="contain"
                />
                <Text style={styles.errorMessage}>
                    Unable to recognize information from the image. Please try again with a clearer image.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => (navigation as any).replace('IDCaptureV2Screen')}
                >
                    <Text style={styles.buttonText}>BACK</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.title}>OCR Successfully</Text>
                {ocrData && (
                    <Image
                        source={{ uri: ocrData }}
                        style={styles.idImage}
                        resizeMode="contain"
                    />
                )}
            </View>

            {/* Scrollable Content Section */}
            <View style={styles.content}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    persistentScrollbar={Platform.OS === 'android'} // Android
                    showsVerticalScrollIndicator={true} // Cả 2 platform
                    indicatorStyle="black" // Màu thanh scroll
                    scrollEventThrottle={16}
                    alwaysBounceVertical={Platform.OS === 'ios'} // Hiệu ứng bounce iOS
                    keyboardDismissMode="on-drag" // Tắt keyboard khi scroll
                >
                    {fields.map((field, index) => (
                        field.value && (
                            <View key={index} style={styles.infoRow}>
                                <Text style={styles.label}>{field.label}:</Text>
                                <Text style={styles.value}>{field.value}</Text>
                            </View>
                        )
                    ))}
                </ScrollView>
            </View>

            {/* Fixed Footer Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => (navigation as any).replace('FaceCapture', { imageOcr: data?.imageUpload })}
                >
                    <Text style={styles.buttonText}>NEXT</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 16,
    },
    idImage: {
        width: '100%',
        height: 180,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        flexGrow: 1, // Cho phép nội dung mở rộng
        paddingBottom: 20,
        minHeight: '100%',
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    label: {
        width: '40%',
        fontWeight: '600',
        color: '#555',
        fontSize: 14,
    },
    value: {
        width: '60%',
        color: '#333',
        fontSize: 14,
        flexShrink: 1,
    },
    footer: {
        padding: 16,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'red',
        marginBottom: 20,
    },
    errorImage: {
        width: 180,
        height: 180,
        marginBottom: 20,
    },
    errorMessage: {
        fontSize: 15,
        textAlign: 'center',
        color: '#333',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#3498db',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default IDCardResultScreen;