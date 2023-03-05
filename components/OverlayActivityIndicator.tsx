import { View, StyleSheet, Modal, ActivityIndicator } from "react-native";
import React from 'react';
import { Colors } from "../resources/colors";


const ActivityIndicatorOverlay = ({ showModal}: any) => {

    

    return (

        <Modal
            visible={showModal}
            transparent={true}
            animationType="fade"
        >
            <View style={ModalStyle.wrapper}>
               <ActivityIndicator size={'large'} color={Colors.primaryColor} />
            </View>
        </Modal>

    )
}



const ModalStyle = StyleSheet.create({
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
    },

})

export default ActivityIndicatorOverlay;