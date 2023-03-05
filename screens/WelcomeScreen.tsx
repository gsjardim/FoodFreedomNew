import React from 'react'
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ImageBackground } from "react-native";
import { Value } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import { USERS_REF } from "../dao/databaseCommon";
import database from '@react-native-firebase/database'
import storage from '@react-native-firebase/storage'
import auth from '@react-native-firebase/auth'
import UserModel from "../models/UserModel";
import { updateUser } from "../redux.store/actions/userActions/creators";
import store from "../redux.store/configureStore";
import { Colors } from '../resources/colors';
import { DefaultPadding, FontFamilies, FontSizes } from "../resources/constants";
import { exerciseBackground, foodBackground, generalBackground, SarahPicture, sleepBackground, waterBackground } from "../resources/imageObj";
import PhoneDimensions from "../resources/layout";
import { WelcomeScreenStrings } from "../resources/strings";
import { PictureSize } from "./ProfileScreen";
import { BackHandler } from "react-native";



export const WelcomeScreen = ({ route, navigation }: any) => {

    const currentUser: UserModel = store.getState().users.currentUser
    const [userName, setUserName] = useState(currentUser.name);
    const pictureUrl = store.getState().users.currentUser.pictureUrl;
    const [userPhoto, setUserPhoto] = useState(pictureUrl !== '' ? { uri: pictureUrl } : null)
    const [imageObj, setImageObj] = useState<any>(null)
    const [quoteContent, setQuoteContent] = useState('')


    useEffect(() => {
        /**
            * Here we pick one quote randomly from the quotes available in the database. The background image used will depend on the
            * category of the selected quote.
            */
        let size = store.getState().general.quotesArray.length
        let quoteObj : any = null
        if (size != 0) {
            quoteObj = store.getState().general.quotesArray[Math.round(Math.random() * (size - 1))];
        }
        else {
            quoteObj = { category: 'general', content: 'Welcome to the Food Freedom App!' }
        }

        let imageObjPath = null;
        switch (quoteObj.category) {
            case 'water': imageObjPath = waterBackground; break;
            case 'sleep': imageObjPath = sleepBackground; break;
            case 'exercise': imageObjPath = exerciseBackground; break;
            case 'food': imageObjPath = foodBackground; break;
            case 'general': imageObjPath = generalBackground; break;
            default: imageObjPath = generalBackground;
        }
        setImageObj(imageObjPath)
        setQuoteContent(quoteObj.content)
    }, [])



    useEffect(() => {
        // store.dispatch(setLoginReady())
        database().ref(USERS_REF + '/' + currentUser.id).on('value', snapshot => store.dispatch(updateUser(snapshot)))
        /**
         * In case the user changes the display name or profile photo, this listener will update the Welcome screen
         */
        const unsubscribe = store.subscribe(() => {
            let currentUser = store.getState().users.currentUser;
            if (currentUser != null) {
                setUserName(currentUser.name);
                setUserPhoto(currentUser.pictureUrl !== '' ? { uri: currentUser.pictureUrl } : null)
            }

        })
        return unsubscribe;
    }, [])


    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={imageObj} style={styles.background}>
                <View style={[styles.headerView, styles.viewCommon]}>
                    {(userPhoto != null) && <Image source={userPhoto} style={styles.userImage} />}

                    <Text style={styles.welcomeText}>{WelcomeScreenStrings.welcomeText + '\n' + userName}</Text>

                </View>

                <View style={[styles.quoteView, styles.viewCommon]}>
                    <Text style={styles.quoteText}>{quoteContent}</Text>
                </View>

                <View style={[styles.buttonView, styles.viewCommon]}>
                    <CustomButton
                        label={WelcomeScreenStrings.startButton}
                        roundCorners={true}
                        onPress={() => navigation.navigate('Main')}
                        width={PhoneDimensions.window.width * 0.7}
                    />
                </View>


            </ImageBackground>

        </SafeAreaView>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    background: {
        flex: 1,
        padding: DefaultPadding,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerView: {
        flex: 1,

    },

    quoteView: {
        flex: 2,
    },

    buttonView: {
        flex: 1,
    },

    viewCommon: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },

    quoteText: {
        fontFamily: FontFamilies.Montserrat,
        fontSize: FontSizes.large_1,
        flexShrink: 1,
        color: Colors.white,
        textAlign: 'center',
    },

    userImage: {
        width: PictureSize * 0.85,
        height: PictureSize * 0.85,
        borderRadius: PictureSize * 0.85 * 0.5,
    },

    welcomeText: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.medium_1,
        flexShrink: 1,
        color: Colors.white,
        textAlign: 'center'
    }
})