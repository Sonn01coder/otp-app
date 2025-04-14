import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { post } from '@/fetch/apiClient';
import { getMe } from '@/fetch/authAPI';
import LoadingIndicator from '@/components/Loading';

const HomeScreen = () => {
    const navigation = useNavigation()
    const [data, setData] = useState<any>({})
    const [isLoading, setIsLoading] = useState<Boolean>(true)

    const handleGetMe = async () => {
        try {
            const res = await getMe()
            setData(res)
        } catch (error) {
        } finally {
            setIsLoading(false)

        }
    }

    const handleCreateSession = async () => {
        (navigation as any).navigate('TransferConfirmFace', { amount: 1000 })
        // (navigation as any).navigate('TransferConfirmFace')
        // try {
        //     // Gọi API tạo session
        //     const res = await post('kyc/create_session');


        //     // Kiểm tra phản hồi từ API
        //     if (res?.data.access_token) {
        //         // Điều hướng đến màn hình TransactionRegister với các phương thức thanh toán
        //         // (navigation as any).navigate('IdCapture')
        //     } else {
        //         // Hiển thị thông báo lỗi nếu API trả về không thành công
        //         Alert.alert('Error', res?.message || 'Failed to create session.');
        //     }
        // } catch (error) {
        //     // Xử lý lỗi khi gọi API
        //     Alert.alert('Error', 'An error occurred while creating the session. Please try again.');
        // }
    };

    useEffect(() => {
        handleGetMe()
    }, [])

    return (

        isLoading ? (
            <View style={styles.containerImage}>
                <LoadingIndicator />
            </View>
        ) : (
            <SafeAreaView style={styles.container}>
                {/* Header với tiêu đề */}
                <View style={styles.header}>
                    <Text style={styles.title}>HOME</Text>
                </View>

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Hi, {data?.name || 'User'}</Text>
                    <Text style={styles.balanceAmount}>
                        {data?.balance ? `$${data.balance.toLocaleString()}` : '$0'}
                    </Text>
                </View>

                {/* Nội dung chính */}
                <View style={styles.content}>
                    <Image
                        source={require('@/assets/images/logo1.jpg')}
                        style={styles.illustration}
                        resizeMode="contain"
                    />

                    <Text style={styles.welcomeText}>Welcome to the app</Text>
                    <Text style={styles.subText}>Start registering for transactions now!</Text>

                </View>

                {/* Nút đăng ký giao dịch */}
                {
                    !data?.isPin &&
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleCreateSession}
                    >
                        <MaterialIcons name="payment" size={24} color="white" />
                        <Text style={styles.buttonText}>ACCOUNT VERIFICATION</Text>
                    </TouchableOpacity>
                }

                {
                    data?.isPin &&
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => (navigation as any).navigate('TransactionRegister', {
                            isOpenFace: data?.isOpenFace,
                            isOpenOTP: data?.isOpenOTP,
                            userId: data?._id
                        })}
                    >
                        <MaterialIcons name="payment" size={24} color="white" />
                        <Text style={styles.buttonText}>TRANSACTION REGISTRATION</Text>
                    </TouchableOpacity>
                }

                {
                    (data?.isOpenOTP || data?.isOpenFace) &&
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => (navigation as any).navigate('TransferBank')}
                    >
                        <MaterialCommunityIcons name="bank-transfer-in" size={26} color="white" />
                        <Text style={styles.buttonText}>BANK TRANSFER</Text>
                    </TouchableOpacity>
                }
            </SafeAreaView >)
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    illustration: {
        width: 350,
        height: 200,
        marginBottom: 26,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    containerImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    subText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    balanceContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        margin: 15,
        shadowColor: '#c3c3c3',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    balanceLabel: {
        fontSize: 22,
        fontWeight: 800,
        marginBottom: 5,
    },
    balanceAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    registerButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 30,
        margin: 20,
        marginTop: 0,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default HomeScreen;