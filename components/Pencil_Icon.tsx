import { Image, View, Text, StyleSheet, Pressable } from "react-native";
import React from 'react';
import PhoneDimensions from "../resources/layout";
import { customPencil } from "../resources/imageObj";

const FontSize = PhoneDimensions.window.width * 0.045;

export const PencilIcon = (props: any) => {

  const height = props.height;
  const width = props.width;
  return (
    <View style={styles.iconStyle}>
        <Image source={customPencil} style={{width: width, height: height}}/>
    </View>
  )
}


const styles = StyleSheet.create({

    iconStyle: {
       
        alignItems: 'center',
        justifyContent:'center',
    },

})