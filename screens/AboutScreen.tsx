import { View, Text, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import React from 'react';
import { SarahPicture } from "../resources/imageObj";
import { Colors } from '../resources/colors';
import { CustomButton } from "../components/CustomButton";
import { openUrlInBrowser } from "../resources/common";
import { FF_APP_URL, FontFamilies, FontSizes } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { AboutStrings } from "../resources/strings";


/**
 *About screen, accessed from the navigation drawer. Contains information about Sarah and her work
 *
 */
export const AboutScreen = ({ props, navigation }: any) => {

    return (

        <ScrollView style={styles.container}>
            <View style={{ width: '100%', alignItems: 'center', }}>
                <Text style={[styles.headerText, { marginBottom: 10, fontSize: FontSizes.medium_2 }]}>{AboutStrings.sarahName}</Text>
                <Text style={styles.headerText}>{AboutStrings.certCoach}</Text>
            </View>

            <View style={styles.photoView}>
                <Image source={SarahPicture} style={styles.photo} />
            </View>
            {/**This is the main content */}
            <Text style={styles.summaryText}>{AboutStrings.aboutSummary + '\n\n' + AboutStrings.aboutSummary2}</Text>

            <Pressable style={{ width: '100%' }} onPress={() => openUrlInBrowser(FF_APP_URL)}>
                <Text style={styles.link}>{'FoodFreedomApp.com'}</Text>
            </Pressable>


            <CustomButton
                label={AboutStrings.backButtonLabel}
                onPress={navigation.goBack}
                roundCorners={true}

            />

            <View style={{ height: 80 }} />

        </ScrollView>

    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: '6%',
        paddingTop: 25,
    },

    headerText: {
        color: Colors.primaryColor,
        fontSize: FontSizes.medium_1,
        fontFamily: FontFamilies.Verdana,
        textAlign: 'center',
    },

    photoView: {
        alignSelf: 'center',
        marginVertical: 33,
        elevation: 9,
    },

    photo: {
        width: PhoneDimensions.window.width * 0.65,
        height: PhoneDimensions.window.width * 0.65,

    },

    link: {
        color: Colors.weblink,
        fontSize: FontSizes.small_2,
        fontFamily: FontFamilies.Verdana,
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginBottom: 40,
    },

    summaryText: {
        color: Colors.fontColor,
        fontSize: FontSizes.small_2,
        fontFamily: FontFamilies.Verdana,
        textAlign: 'justify',
        marginBottom: 20,
    },

})