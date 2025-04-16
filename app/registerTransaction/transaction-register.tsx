import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { put } from '@/fetch/apiClient';

const TransactionMethodScreen = ({ route }: {
    route: {
        params: {
            isOpenFace: any,
            isOpenOTP: any,
            userId: any
        }
    }
}) => {
    const { isOpenFace, isOpenOTP, userId }: any = route?.params;
    const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

    const navigation = useNavigation();


    const methods = [
        {
            id: 'face',
            title: 'Sign up with Face Recognition',
            icon: 'face',
            description: 'Easily authenticate using facial recognition',
            isCheck: isOpenFace
        },
        {
            id: 'otp',
            title: 'Sign up with Smart OTP',
            icon: 'sms',
            description: 'Enter your PIN to generate a Smart OTP automatically',
            isCheck: isOpenOTP
        }
    ];

    const handleCancelPayment = async (methodCancel: any) => {
        const newData: any = {};

        if (methodCancel === 'face') {
            newData.isOpenFace = false;
        } else {
            newData.isOpenOTP = false;
        }

        try {
            await put(`users/${userId}`, newData);
            (navigation as any).navigate('Home');

        } catch (error) {
            throw error;
        }
    }

    const handleContinue = () => {
        if (selectedMethods.length === 0) {
            Alert.alert('Notification', 'Please select exactly one registration method');
            return;
        } else if (selectedMethods.length === 2) {
            if (isOpenFace && isOpenOTP) {
                Alert.alert('Notification', 'You have registered this method');
                return;
            } else if (isOpenFace && !isOpenOTP) {

                (navigation as any).navigate('SmartOtpRegister');
            }
            else if (!isOpenFace && isOpenOTP) {

                (navigation as any).navigate('FaceRegister');
            } else {
                Alert.alert('Notification', 'Please select only one registration method');
                return;
            }

        } else if (selectedMethods.length === 1) {
            if ((isOpenFace && selectedMethods.includes('face')) || (isOpenOTP && selectedMethods.includes('otp'))) {
                Alert.alert('Notification', 'You have registered this method');
            } else {
                (navigation as any).navigate(selectedMethods[0] === 'face' ? 'FaceRegister' : 'SmartOtpRegister');
            }
        }
    };

    const handleMethodPress = (methodId: string) => {
        if (selectedMethods.includes(methodId)) {
            // Show confirmation when unchecking
            if ((methodId === 'face' && isOpenFace) || (methodId === 'otp' && isOpenOTP)) {
                Alert.alert(
                    'Confirm',
                    'Are you sure you want to deselect this method?',
                    [
                        {
                            text: 'No',
                            style: 'cancel',
                            onPress: () => { } // Không làm gì
                        },
                        {
                            text: 'Yes',
                            onPress: () => {
                                handleCancelPayment(methodId)
                            }
                        }
                    ]
                );
            } else {
                setSelectedMethods(selectedMethods.filter(id => id !== methodId));
            }
        } else {
            // When checking new method, add to current selection
            setSelectedMethods([...selectedMethods, methodId]);
        }
    };

    useEffect(() => {
        const newData = []
        if (isOpenFace) {
            newData.push('face')
        }
        if (isOpenOTP) {
            newData.push('otp')
        }
        setSelectedMethods([...newData])
    }, [])

    useEffect(() => {
    }, [selectedMethods])

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>REGISTER TRANSACTION</Text>
            </View>

            {/* Main content */}
            <View style={styles.content}>
                <Text style={styles.subTitle}>Select Registration Method</Text>

                {methods.map((method) => (
                    <TouchableOpacity
                        key={method.id}
                        style={[
                            styles.methodCard,
                            selectedMethods.includes(method.id) && styles.selectedCard,
                        ]}
                        onPress={() => handleMethodPress(method.id)}
                    >
                        <View style={styles.checkboxContainer}>
                            <View style={[
                                styles.checkbox,
                                selectedMethods.includes(method.id) && styles.checkedBox
                            ]}>
                                {selectedMethods.includes(method.id) && (
                                    <MaterialIcons
                                        name="check"
                                        size={18}
                                        color="white"
                                    />
                                )}
                            </View>
                        </View>

                        <View style={styles.methodInfo}>
                            <View style={styles.methodHeader}>
                                <MaterialIcons
                                    name={method.icon}
                                    size={24}
                                    color={selectedMethods.includes(method.id) ? '#007AFF' : '#666'}
                                />
                                <Text style={[
                                    styles.methodTitle,
                                    selectedMethods.includes(method.id) && styles.selectedText
                                ]}>
                                    {method.title}
                                </Text>
                            </View>
                            <Text style={styles.methodDescription}>{method.description}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Continue button */}
            <TouchableOpacity
                style={[
                    styles.continueButton,
                    selectedMethods.length === 0 && styles.disabledButton
                ]}
                onPress={handleContinue}
                disabled={selectedMethods.length === 0}
            >
                <Text style={styles.continueText}>NEXT</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.continueBack}
                onPress={() => (navigation as any).navigate('Home')}
            >
                <Text style={styles.continueBackText}>BACK</Text>
            </TouchableOpacity>

        </SafeAreaView>
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
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    subTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    methodCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedCard: {
        borderColor: '#007AFF',
        backgroundColor: '#F0F7FF',
    },
    checkboxContainer: {
        marginRight: 15,
    },
    checkbox: {
        height: 24,
        width: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedBox: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    methodInfo: {
        flex: 1,
        minHeight: 70,
    },
    methodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 10,
        color: '#333',
    },
    selectedText: {
        color: '#007AFF',
    },
    methodDescription: {
        fontSize: 14,
        color: '#666',
        paddingLeft: 0,
    },
    continueButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        margin: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    continueText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20,
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalButtonNo: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 5,
        marginRight: 10,
    },
    modalButtonNoText: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    modalButtonYes: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#007AFF',
        borderRadius: 5,
    },
    modalButtonYesText: {
        color: 'white',
        fontWeight: 'bold',
    },
    continueBack: {
        backgroundColor: 'white',       // Nền trắng
        borderWidth: 1,                // Độ dày viền
        borderColor: '#3498db',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        margin: 20,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 30,
    },
    continueBackText: {
        color: '#3498db',              // Chữ màu xanh
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default TransactionMethodScreen;