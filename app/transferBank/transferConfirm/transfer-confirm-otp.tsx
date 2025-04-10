import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { post } from '@/fetch/apiClient';

const TransferConfirmOTP = ({ route }: any) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const { paymentMethod, amount } = route.params

    const handleNumberPress = (num: string) => {
        if (pin.length < 4) {
            setPin(pin + num);
        }
    };

    const handleDelete = () => {
        if (pin.length > 0) {
            setPin(pin.slice(0, -1));
        }
    };

    const verifyPin = async () => {
        setLoading(true);

        try {
            const res = await post('otp/verify-pin', { pin: pin })
            if (res.success) {
                (navigation as any).replace(paymentMethod === 'face' ? 'TransferConfirmFace' : 'TransferSendOTP', { amount: amount, secretKey: res.secretKey });
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while verifying the PIN. Please try again.');
            setPin('');
        } finally {
            setLoading(false);
        }

    };

    const renderDots = () => {
        return (
            <View style={styles.dotsContainer}>
                {[...Array(4)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i < pin.length && styles.filledDot
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>VERIFY PIN</Text>

            {renderDots()}

            <View style={styles.keyboard}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <TouchableOpacity
                        key={num}
                        style={styles.numberButton}
                        onPress={() => handleNumberPress(num.toString())}
                        disabled={loading}
                    >
                        <Text style={styles.numberText}>{num}</Text>
                    </TouchableOpacity>
                ))}

                <View style={styles.emptyButton} />

                <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => handleNumberPress('0')}
                    disabled={loading}
                >
                    <Text style={styles.numberText}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={pin.length === 0 || loading}
                >
                    <MaterialIcons name="backspace" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Nhóm 2 button nằm cùng hàng */}
            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => (navigation as any).goBack()}
                    disabled={loading}
                >
                    <View style={styles.buttonContent}>
                        <AntDesign name="arrowleft" size={20} color="#007AFF" />
                        <Text style={styles.backText}>BACK</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.verifyButton,
                        (pin.length < 4 || loading) && styles.disabledButton
                    ]}
                    onPress={verifyPin}
                    disabled={pin.length < 4 || loading}
                >
                    <View style={styles.buttonContent}>
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.verifyText}>CONFIRM</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 40,
        color: '#333'
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 40
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 10
    },
    filledDot: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF'
    },
    keyboard: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '80%',
        marginBottom: 40
    },
    numberButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 8,
        backgroundColor: '#f5f5f5'
    },
    numberText: {
        fontSize: 24,
        color: '#333'
    },
    emptyButton: {
        width: 70,
        height: 70,
        margin: 8,
        backgroundColor: 'transparent'
    },
    deleteButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 8
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
        flex: 1,
        marginRight: 10
    },
    backText: {
        color: '#333',
        fontWeight: '600',
        marginLeft: 8
    },
    verifyButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center'
    },
    disabledButton: {
        backgroundColor: '#ccc'
    },
    verifyText: {
        color: 'white',
        fontWeight: '600'
    }
});

export default TransferConfirmOTP;