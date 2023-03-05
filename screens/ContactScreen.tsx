import { View, Text, StyleSheet, Image, SafeAreaView,  Pressable } from "react-native";
import React from 'react';
import { exerciseJournal, foodMoodJournal, sleepJournal, waterJournal } from "../resources/imageObj";
import { Colors } from '../resources/colors';
import { CustomButton } from "../components/CustomButton";
import { SendEmail } from "../resources/common";
import { DefaultPadding, FontFamilies, FontSizes } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { AboutStrings, ContactUsStrings } from "../resources/strings";

/**
Contact screen, accessed from the naviagtion drawer. Users can send email to the ff app help center.
 */

export const ContactScreen = ({ navigation }: any) => {
    
    return (

        <View style={styles.container}>
            <View style={{ flex: 1 }} />

            <View style={{ width: '100%', alignItems: 'center', }}>
                <Text style={[styles.headerText, {}]}>{ContactUsStrings.title}</Text>
            </View>

            <View style={styles.iconsView}>
                <Image source={foodMoodJournal} style={styles.icon} />
                <Image source={waterJournal} style={styles.icon} />
                <Image source={exerciseJournal} style={styles.icon} />
                <Image source={sleepJournal} style={styles.icon} />
            </View>

            <View style={styles.textView}>
                <Text style={styles.summaryText}>{ContactUsStrings.mainText}</Text>
            </View>

            <Pressable style={{ width: '100%' }} onPress={() => SendEmail(ContactUsStrings.contactEmail)}>
                <Text style={styles.link}>{ContactUsStrings.contactEmail}</Text>
            </Pressable>

            <View style={styles.buttonView}>
                <CustomButton
                    label={AboutStrings.backButtonLabel}
                    onPress={navigation.goBack}
                    roundCorners={true}

                />
            </View>
            <View style={{ flex: 6 }} />

        </View>

    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: DefaultPadding,
        paddingVertical: '6%',
    },

    headerText: {
        color: Colors.primaryColor,
        fontSize: FontSizes.medium_1,
        fontFamily: FontFamilies.Verdana,
        textAlign: 'center',
    },

    iconsView: {
        width: '85%',
        alignSelf: 'center',
        marginVertical: PhoneDimensions.window.width * 0.1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',


    },

    textView: {
        flex: 4,
        justifyContent: 'center',
    },

    icon: {
        width: PhoneDimensions.window.width * 0.13,
        height: PhoneDimensions.window.width * 0.13,

    },

    link: {
        color: Colors.primaryColor,
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

    buttonView: {

    }

})