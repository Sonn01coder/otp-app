import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PinRegistrationScreen = () => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const navigation = useNavigation()

    const [step, setStep] = useState(1); // 1: Nhập PIN, 2: Xác nhận PIN

    // Tự động kiểm tra khi confirmPin đủ 4 số
    useEffect(() => {
        if (step === 2 && confirmPin.length === 4) {
            if (pin === confirmPin) {
                Alert.alert(
                    'Thành công',
                    'Đăng ký PIN thành công',
                    [{ text: 'OK', onPress: () => (navigation as any).replace('SuccessAccount') }]
                );
                // Lưu PIN vào AsyncStorage hoặc state management ở đây
            } else {
                Alert.alert('Lỗi', 'PIN không khớp. Vui lòng thử lại', [
                    {
                        text: 'Đồng ý',
                        onPress: () => {
                            setPin('');
                            setConfirmPin('');
                            setStep(1);
                        }
                    }
                ]);
            }
        }
    }, [confirmPin]);

    const handleNumberPress = (num: any) => {
        if (step === 1 && pin.length < 4) {
            setPin(pin + num);
            if (pin.length === 3) setStep(2); // Chuyển bước khi đủ 4 số
        } else if (step === 2 && confirmPin.length < 4) {
            setConfirmPin(confirmPin + num);
        }
    };

    const handleDelete = () => {
        if (step === 1 && pin.length > 0) {
            setPin(pin.slice(0, -1));
        } else if (step === 2 && confirmPin.length > 0) {
            setConfirmPin(confirmPin.slice(0, -1));
        }
    };

    const checkPinStrength = (pin: any) => {
        if (pin.length < 4) return 'weak';
        if (/^(\d)\1+$/.test(pin)) return 'weak'; // Tất cả số giống nhau
        if ('0123456789'.includes(pin) || '9876543210'.includes(pin)) return 'weak';
        return 'strong';
    };

    const renderDots = () => {
        const length = step === 1 ? pin.length : confirmPin.length;
        return (
            <View style={styles.dotsContainer}>
                {[...Array(4)].map((_, i) => ( // Thay đổi từ 6 thành 4 dots
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i < length && styles.filledDot
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {step === 1 ? 'Tạo mã PIN mới' : 'Xác nhận mã PIN'}
            </Text>
            <Text style={styles.subtitle}>
                {step === 1 ? 'Nhập 4 chữ số' : 'Nhập lại mã PIN để xác nhận'}
            </Text>

            {renderDots()}

            <View style={styles.keyboard}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <TouchableOpacity
                        key={num}
                        style={styles.numberButton}
                        onPress={() => handleNumberPress(num.toString())}
                    >
                        <Text style={styles.numberText}>{num}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.emptyButton} disabled />

                <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => handleNumberPress('0')}
                >
                    <Text style={styles.numberText}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={(step === 1 && pin.length === 0) || (step === 2 && confirmPin.length === 0)}
                >
                    <MaterialIcons name="backspace" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
        justifyContent: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333'
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        color: '#666'
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
        marginHorizontal: 8
    },
    filledDot: {
        backgroundColor: '#007AFF'
    },
    keyboard: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginHorizontal: 30
    },
    numberButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e1e1e1'
    },
    numberText: {
        fontSize: 24,
        color: '#333'
    },
    emptyButton: {
        width: 70,
        height: 70,
        margin: 10,
        backgroundColor: 'transparent'
    },
    deleteButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10
    }
});

export default PinRegistrationScreen;