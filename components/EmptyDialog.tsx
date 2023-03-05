import {View, StyleSheet, Modal,} from "react-native";
import React from 'react';
import { DefaultPadding, } from "../resources/constants";
import { SafeAreaView } from "react-native-safe-area-context";

interface DialogProps {
    showModal: boolean,
    dialogWidth?: string,
    content: any
}


const EmptyDialog = ({ showModal, dialogWidth, content }: DialogProps) => {
    return (

        <Modal
            visible={showModal}
            transparent={true}
            animationType="fade"
        >
            <SafeAreaView style={ModalStyle.wrapper}>
                <View style={[ModalStyle.container, {width: dialogWidth}]}>
                   {content}
                </View>
            </SafeAreaView>
        </Modal>

    )
}

const ModalStyle = StyleSheet.create({

    wrapper: {
        flex: 1,
        backgroundColor: 'rgba(60, 60, 60, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        padding: DefaultPadding
    },

   
})

export default EmptyDialog;