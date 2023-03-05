import { TouchableOpacity } from "react-native-gesture-handler";
import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Pressable } from "react-native";
import PhoneDimensions from "../resources/layout";
import { Colors } from "../resources/colors";
import { FontFamilies } from "../resources/constants";

const FontSize = PhoneDimensions.window.width * 0.045;

export const CustomButton = (props: any) => {

    let roundCorners = props.roundCorners;
    let showProgressBar = props.showProgress || false;
    return (

        <Pressable
            onPress={() => props.onPress()}
            style={[styles.buttonStyle, { borderRadius: roundCorners ? 5 : 0, width: props.width || 'auto', backgroundColor: props.color || styles.buttonStyle.backgroundColor }]}
        >

            {showProgressBar ?
                <ActivityIndicator size="small" color={Colors.white} />
                : <Text style={[styles.labelStyle, props.labelSize && { fontSize: props.labelSize }]}>{props.label}</Text>}

        </Pressable >

    )
}


const styles = StyleSheet.create({

    buttonStyle: {
        paddingVertical: PhoneDimensions.window.height * 0.01,
        paddingHorizontal: PhoneDimensions.window.width * 0.06,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent:'center',
        height: FontSize * 2.8,
    },

    labelStyle: {
        fontFamily: FontFamilies.Poppins,
        fontSize: PhoneDimensions.window.width * 0.045,
        color: Colors.white,
    },
})