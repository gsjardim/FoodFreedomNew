import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { RATE_FAIR, RATE_HAPPY, RATE_SAD } from '../resources/constants';
import { sadFace, fairFace, happyFace, sadFaceSelected, fairFaceSelected, happyFaceSelected } from "../resources/imageObj";
import PhoneDimensions from '../resources/layout';

const faceSize = PhoneDimensions.window.width * 0.15;

const FaceSelector = ({ selectedFace, onSelect }: any) => {

    const getSelectedImageStyle = (option: string) => {

        return {
            width: selectedFace === option ? faceSize * 1.2 : faceSize,
            height: selectedFace === option ? faceSize * 1.2 : faceSize,
        }
    }

    return (

        <View style={styles.facesView}>
            <Pressable onPress={() => onSelect(RATE_SAD)}>
                <Image source={selectedFace === RATE_SAD ? sadFaceSelected : sadFace} style={[styles.faces, getSelectedImageStyle(RATE_SAD)]} />
            </Pressable>
            <Pressable onPress={() => onSelect(RATE_FAIR)}>
                <Image source={selectedFace === RATE_FAIR ? fairFaceSelected : fairFace} style={[styles.faces, getSelectedImageStyle(RATE_FAIR)]} />
            </Pressable>
            <Pressable onPress={() => onSelect(RATE_HAPPY)}>
                <Image source={selectedFace === RATE_HAPPY ? happyFaceSelected : happyFace} style={[styles.faces, getSelectedImageStyle(RATE_HAPPY)]} />
            </Pressable>

        </View>
    )
}

const styles = StyleSheet.create({

    facesView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
        marginTop: 10,
    },

    faces: {
        width: faceSize,
        height: faceSize,
    },
});

export default FaceSelector;