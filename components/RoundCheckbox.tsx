import { Pressable, View} from "react-native";
import React from 'react';
import { Colors } from "../resources/colors";
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from "react";

interface checkboxProps {
    onPress: (value: boolean) => void,
    isChecked: boolean,
    size: number,
    isDisabled?: boolean
}

export const RoundCheckbox = ({ onPress, isChecked, size, isDisabled }: checkboxProps) => {

    let disabled = (isDisabled != undefined) ? isDisabled : false
   
    return (

        <Pressable onPress={() => { if(!disabled) onPress(!isChecked)}}
            style={{
                width: (size + 4),
                height: (size + 4),
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 6
            }}>

            {
                (isChecked && !disabled) ?
                    <Ionicons name="checkmark-circle-outline" size={size} color={Colors.darkGray} /> :
                    <View style={{
                        width: (size - 5),
                        height: (size - 5),
                        borderRadius: 15,
                        borderColor: !disabled ? Colors.darkGray : Colors.mediumGray,
                        borderWidth: 2
                    }} />

            }
        </Pressable>
    )
}

