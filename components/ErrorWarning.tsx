import { View, Text } from "react-native";
import React from 'react';
import { FontFamilies, FontSizes } from "../resources/constants";


export const ErrorWarning = ({ text }: any) => {

    return (
        <View style={{ width: '100%', alignItems: 'flex-start' }}>
            <Text style={{ fontFamily: FontFamilies.Verdana, fontSize: FontSizes.small_1, color: 'red' }}>{text}</Text>
        </View>
    )
}