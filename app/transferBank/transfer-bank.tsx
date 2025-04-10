import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TransferSuccess = () => {
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [bankModalVisible, setBankModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    const navigation = useNavigation()

    // Danh sách ngân hàng đơn giản
    const banks = [
        'Vietcombank',
        'Techcombank',
        'BIDV',
        'Agribank',
        'Vietinbank',
        'MB Bank',
        'ACB',
        'Sacombank',
        'VPBank',
        'SHB'
    ];

    // Lọc ngân hàng theo từ khóa
    const filteredBanks = searchText
        ? banks.filter(bank =>
            bank.toLowerCase().includes(searchText.toLowerCase())
        )
        : banks;

    const handleContinue = () => {
        (navigation as any).navigate('TransferBankConfirm', {
            bank: selectedBank,
            accountNumber,
            accountName
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Select Beneficiary</Text>

            {/* Ô chọn ngân hàng */}
            <TouchableOpacity
                style={styles.bankInput}
                onPress={() => setBankModalVisible(true)}
            >
                <Text style={selectedBank ? styles.bankText : styles.placeholderText}>
                    {selectedBank || 'Select Beneficiary Bank'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>

            {/* Modal chọn ngân hàng */}
            <Modal
                visible={bankModalVisible}
                animationType="slide"
                transparent={false}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Beneficiary Bank</Text>
                        <TouchableOpacity onPress={() => setBankModalVisible(false)}>
                            <MaterialIcons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* Ô tìm kiếm */}
                    <View style={styles.searchBox}>
                        <MaterialIcons name="search" size={20} color="#999" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for a bank..."
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus={true}
                        />
                    </View>

                    {/* Danh sách ngân hàng */}
                    <FlatList
                        data={filteredBanks}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.bankItem}
                                onPress={() => {
                                    setSelectedBank(item);
                                    setBankModalVisible(false);
                                    setSearchText('');
                                }}
                            >
                                <Text style={styles.bankName}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>

            {/* Ô nhập số tài khoản (chỉ số) */}
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account number</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Numbers"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                />
            </View>

            {/* Ô nhập tên chủ tài khoản (chỉ chữ) */}
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Beneficiary name</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Enter full name"
                    value={accountName}
                    onChangeText={setAccountName}
                />
            </View>

            {/* Nút tiếp tục */}
            <TouchableOpacity
                style={[styles.continueBtn, (!accountNumber || !accountName || !selectedBank) && styles.disabledBtn]}
                onPress={handleContinue}
                disabled={!accountNumber || !accountName || !selectedBank}
            >
                <Text style={styles.continueText}>NEXT</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.continueBack}
                onPress={() => (navigation as any).navigate('Home')}
            >
                <Text style={styles.continueBackText}>BACK</Text>
            </TouchableOpacity>
        </View>
    );
};

// Styles được tối ưu cho giao diện sạch sẽ
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#2c3e50',
    },
    bankInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    bankText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#999',
    },
    modalView: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 15,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    searchInput: {
        flex: 1,
        height: 40,
        marginLeft: 10,
    },
    bankItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    bankName: {
        fontSize: 16,
        color: '#333',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10,
    },
    switchLabel: {
        fontSize: 16,
        color: '#555',
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
        fontWeight: '500',
    },
    textInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    continueBtn: {
        backgroundColor: '#3498db',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    disabledBtn: {
        backgroundColor: '#007AFF',
        opacity: 0.7,
    },
    continueText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueBack: {
        backgroundColor: 'white',       // Nền trắng
        borderWidth: 1,                // Độ dày viền
        borderColor: '#3498db',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    continueBackText: {
        color: '#3498db',              // Chữ màu xanh
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default TransferSuccess;