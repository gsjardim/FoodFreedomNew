import { Text, View, StyleSheet, Pressable, Modal, TextInput, Touchable, Platform } from "react-native";
import React from 'react';
import { Colors } from "../resources/colors";
import PhoneDimensions from "../resources/layout";
import { ScrollView, TouchableOpacity, } from "react-native-gesture-handler";
import { DefaultPadding, FontFamilies, FontSizes } from "../resources/constants";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface InputProps {
    showModal: boolean,
    onClose: (value: string) => void,
    placeHolder: string,
}

const OverlayTextInput = ({ showModal, onClose, placeHolder }: InputProps) => {

    const [value, setValue] = useState('');

    return (

        <Modal
            visible={showModal}
            transparent={true}
            animationType="fade"
        >
            <SafeAreaView style={ModalStyle.wrapper}>
                <View style={ModalStyle.container}>
                    <TextInput
                        placeholder={placeHolder}
                        style={[ModalStyle.inputStyle, Platform.OS === 'ios' && {marginTop: PhoneDimensions.window.height * 0.05}]}
                        onChangeText={(text) => setValue(text)}
                    />

                    <Pressable
                        style={{ width: '100%', height: 30, alignItems: 'center', justifyContent: 'center', marginTop: 15 }}
                        onPress={() => onClose(value)}
                    >
                        <Text style={ModalStyle.okButton}>Ok</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </Modal>

    )
}

const ModalStyle = StyleSheet.create({

    wrapper: {
        flex: 1,
        backgroundColor: 'rgba(60, 60, 60, 0.6)',
        justifyContent: 'flex-start'
    },

    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        padding: DefaultPadding
    },

    inputStyle: {
        borderBottomColor: Colors.darkGray,
        borderBottomWidth: 2,
        padding: 7,
        width: '100%',
    },

    generalText: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.medium_1,
        color: Colors.fontColor,
    },

    okButton: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.medium_1,
        color: Colors.primaryColor,
    }
})

export default OverlayTextInput;