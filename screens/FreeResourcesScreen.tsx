import { View, Text, StyleSheet, ImageBackground } from "react-native";
import React from 'react';
import { freeResourcesBack } from "../resources/imageObj";
import { Colors } from '../resources/colors';
import { CustomButton } from "../components/CustomButton";
import { openUrlInBrowser } from "../resources/common";
import { FF_APP_URL, FontFamilies } from "../resources/constants";
import PhoneDimensions from "../resources/layout";

const FontSize = PhoneDimensions.window.width * 0.05;

export const FreeResourcesScreen = ({ props, navigation }: any) => {
    

    const handleFoodFreedomAppbutton = () => {
        openUrlInBrowser(FF_APP_URL)
    }

    return (
        <View style={styles.container} >
            <ImageBackground source={freeResourcesBack} style={styles.backgroundImage} >
                <View style={{ flex: 1 }} />
                <View style={styles.contentView }>
                    <Text style={[styles.contentText, {textAlign: 'center', fontSize: FontSize * 1.15}]}>{'Want MORE freedom?\nVisit'}</Text>
                    <CustomButton
                        onPress={handleFoodFreedomAppbutton}
                        color={Colors.waterCircle}
                        label={'FoodFreedomApp.com'}
                        roundCorners={true}
                        width={PhoneDimensions.window.width * 0.85}
                    />
                    <View>
                        <Text style={styles.contentText}>{'• Free trainings'}</Text>
                        <Text style={styles.contentText}>{'• Recipes'}</Text>
                        <Text style={styles.contentText}>{'• Inspiration'}</Text>
                        <Text style={styles.contentText}>{'• Downloads'}</Text>
                    </View>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <CustomButton
                        onPress={navigation.goBack}
                        roundCorners={true}
                        label={'Back to Home Page'}
                        
                    />
                </View>
            </ImageBackground>
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },

    contentView: {
        flex: 2,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
      
    },

    contentText: {
        fontFamily: FontFamilies.Verdana,
        fontSize: FontSize,
        color: Colors.fontColor,
    },

    backgroundImage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})