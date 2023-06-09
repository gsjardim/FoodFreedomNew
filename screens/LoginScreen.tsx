import { useEffect, useState } from "react";
import React from 'react'
import { Image, View, Text, StyleSheet, Pressable, Platform, TouchableOpacity, Alert } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import { RoundCheckbox } from "../components/RoundCheckbox";
import { Colors } from '../resources/colors';
import { DefaultPadding, FontFamilies, FontSizes, GeneralTextStyle, GoogleWebClient, ToastDuration, ExpoClientID, IOSClientId } from "../resources/constants";
import { FF_logo, googleLogo } from "../resources/imageObj";
import PhoneDimensions from "../resources/layout";
import { ButtonStrings, LoginRegisterScreenStrings } from "../resources/strings";
import { checkMarkSize } from "./FoodMoodScreen";
import Ionicons from '@expo/vector-icons/Ionicons'
import store from "../redux.store/configureStore";
import auth from '@react-native-firebase/auth'
import { useToast } from "react-native-fast-toast";
import { deleteStorageData, getStorageData, LOGIN_INFO, storeJSON } from "../dao/internalStorage";
import { loginWithEmailAndPassword, signInWithOAuthCredential } from "../dao/userDAO";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import EmptyDialog from "../components/EmptyDialog";
import { ErrorWarning } from "../components/ErrorWarning";
import * as Crypto from 'expo-crypto';
import report from "../components/CrashReport";
import UserModel from "../models/UserModel";
import database from '@react-native-firebase/database'
import { getFormattedDate } from "../resources/common";
export const LOGO_SIZE = PhoneDimensions.window.width * 0.3;
export const GOOGLE_LOGIN = 'google';
export const APPLE_LOGIN = 'apple';
export const FB_LOGIN = 'facebook';
export const INSTA_LOGIN = 'instagram';


export const LoginScreen = ({ navigation }: any) => {


    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [passwordHidden, setPasswordHidden] = useState(true);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isDataLoading, setIsDataLoading] = useState(store.getState().general.isDataLoading);
    const [showResetPasssword, setShowResetPassword] = useState(false);

    useEffect(() => {
        const unsubscribe = store.subscribe(() => setIsDataLoading(store.getState().general.isDataLoading));
        return unsubscribe;
    }, [])

    useEffect(() => {
        getStorageData(LOGIN_INFO)
            .then(val => {
                if (val != null) {
                    let loginInfo = JSON.parse(val)
                    setEmail(loginInfo.email)
                    setRememberMe(true)
                }
            })
    }, [])



    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        androidClientId: GoogleWebClient,
        expoClientId: ExpoClientID,
        iosClientId: IOSClientId,
        scopes: [
            'profile',
            'email',
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',

        ],
    });

    const toast = useToast()
    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }



    const onPressLogin = () => {
        if (email === '' || password === '') {
            alert('Please enter valid email and password')
            return;
        }

        setIsDataLoading(true);
        loginWithEmailAndPassword(email, password, () => {
            if (rememberMe) {
                const loginInfo = { email: email, password: '' }
                storeJSON(LOGIN_INFO, loginInfo)
            }
            else {
                deleteStorageData(LOGIN_INFO)
            }
            navigation.navigate('Welcome');
        }, showToast);
    }

    const onPressNewUser = () => {
        navigation.navigate('RegisterScreen');
    }


    async function onAppleButtonPress() {

        //Firebase Service ID:
        // host.exp.Exponent
        const nonce = Math.random().toString(36).substring(2, 10);

        Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce)
            .then((hashedNonce) => {

                setIsDataLoading(true);
                return AppleAuthentication.signInAsync({
                    requestedScopes: [
                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                        AppleAuthentication.AppleAuthenticationScope.EMAIL
                    ],
                    nonce: hashedNonce
                })
            })
            .then((appleCredential) => {
                const { identityToken } = appleCredential;

                const liveCredential = auth.AppleAuthProvider.credential(identityToken!, nonce);
                signInWithOAuthCredential(liveCredential, () => {
                    navigation.navigate('Welcome')
                    setIsDataLoading(false);
                }, showToast)
            })
            .catch((error) => {
                report.log('Error signing in with apple id: ' + JSON.stringify(error))
                alert('Error signing in with apple id: ' + JSON.stringify(error));
            })
            .finally(() => setIsDataLoading(false));

    }

    async function onGoogleButtonPress() {

        // Check if your device supports Google Play
        setIsDataLoading(true);
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        GoogleSignin.signIn().
            then(res => {
                let token = res.idToken
                let credential = auth.GoogleAuthProvider.credential(token);
                signInWithOAuthCredential(credential, () => {
                    navigation.navigate('Welcome')
                    setIsDataLoading(false);
                }, showToast)
            })
            .catch(err => report.recordError(err));
    }

    const testCreateAccount = () => {
        let email = 'gsjsud@yahoo.com.br'
        let password1 = '@Araras911'
        let yearOfBirth = '1980'
        let userName = 'Thads'
        auth().createUserWithEmailAndPassword(email, password1)
        .then(() => {
            let currentUser = auth().currentUser;
            let newUser = new UserModel(currentUser?.uid, userName, email, yearOfBirth, getFormattedDate(new Date()), '', '');
            currentUser?.sendEmailVerification();
            //Add new user to database
            database().ref('Users/'+ currentUser?.uid).set(newUser);
            // database().ref(JOURNAL_REF).set(currentUser?.uid);
            Alert.alert(
                'Confirmation',
                'User created! Please verify your email to finish the registration proccess.',
                [
                    {
                        text: 'OK',
                        style: 'default',
                        // onPress: () => {
                        //     auth().signOut();
                        //     navigation.pop();
                        // }
                    }
                ])
        })
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                showToast('Email address is already in use.');
            }

            if (error.code === 'auth/invalid-email') {
                showToast('Email address is invalid!');
            }

        });
    }


    const ResetPasswordDialog = (props: any) => {


        const [newEmail, setNewEmail] = useState<string>('');
        const [error, setError] = useState(false);
        const buttonWidth = PhoneDimensions.window.width * 0.32;

        const onSave = () => {

            setError(false);

            if (newEmail === '') {
                setError(true);
                return;
            }

            auth().sendPasswordResetEmail(newEmail)
                .then(() => {
                    alert('Reset password instructions sent to the email provided.');
                })
                .catch(err => alert(err))
                .finally(() => setShowResetPassword(false))


        }

        return (
            <EmptyDialog
                showModal={props.showResetPasssword}
                dialogWidth={'90%'}
                content={
                    <View style={{ paddingVertical: PhoneDimensions.window.height * 0.02, paddingHorizontal: DefaultPadding }}>

                        <View style={{ flexDirection: 'column', marginBottom: 20, alignItems: 'center' }}>
                            <Text style={[GeneralTextStyle]}>{'Please confirm your email to reset your password.'}</Text>

                        </View>

                        <View style={{ flexDirection: 'row', }}>
                            <TextInput
                                style={[dialogStyle.textInput, { marginBottom: PhoneDimensions.window.width * 0.04, }]}
                                onChangeText={(value) => setNewEmail(value.trim())}
                                value={newEmail}
                            />
                            {error && <ErrorWarning text={'Email cannot be empty'} />}
                        </View>


                        <View style={{
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'space-around',
                            marginTop: 30,
                        }}>
                            <CustomButton label={ButtonStrings.sendButton} roundCorners={true} onPress={onSave} width={buttonWidth} />
                            <CustomButton label={ButtonStrings.cancelButton} roundCorners={true} onPress={() => setShowResetPassword(false)} width={buttonWidth} />
                        </View>

                    </View>
                }
            />
        )
    }

    const dialogStyle = StyleSheet.create({

        labels: {
            fontFamily: FontFamilies.Poppins,
            fontSize: FontSizes.small_2 * 0.9,
            color: Colors.mediumGray,
        },

        textInput: {
            width: '100%',
            borderBottomWidth: 1.5,
            borderBottomColor: Colors.darkGray,
            paddingHorizontal: 8,
            fontFamily: FontFamilies.Poppins,
            fontSize: FontSizes.small_2 * 0.9,
            color: Colors.fontColor,
        },

    })

    return (
        <SafeAreaView style={{ flex: 1 }} >
            <ScrollView style={styles.container}>

                <ResetPasswordDialog showResetPasssword={showResetPasssword} />
                <View style={styles.titleView}>
                    <Text
                        style={styles.titleText}
                    >
                        {LoginRegisterScreenStrings.title}
                    </Text>
                </View>

                <View style={styles.logoView}>
                    <Image source={FF_logo} style={styles.logoStyle} />
                </View>

                <View style={styles.inputView}>
                    <TextInput
                        style={styles.textInput}
                        placeholder={LoginRegisterScreenStrings.email}
                        onChangeText={(value) => setEmail(value.trim())}
                        value={email}
                    />
                    <View style={{ flexDirection: 'row', }}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={LoginRegisterScreenStrings.password}
                            secureTextEntry={passwordHidden}
                            onChangeText={(value) => setPassword(value.trim())}
                            value={password}
                        />
                        <Pressable onPress={() => setPasswordHidden(!passwordHidden)} style={{ padding: 6, position: "absolute", right: 15, top: Platform.OS == "ios" ? -14 : -6 }}>
                            <Ionicons name={passwordHidden ? "eye" : "eye-off"} size={25} color={Colors.darkGray} />
                        </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <RoundCheckbox
                            isChecked={rememberMe}
                            onPress={setRememberMe}
                            size={checkMarkSize * 0.9}
                        />
                        <Text style={GeneralTextStyle}>{LoginRegisterScreenStrings.rememberMe}</Text>
                    </View>
                    <Pressable
                        style={{ marginTop: 15 }}
                        onPress={() => setShowResetPassword(true)}
                    >
                        <Text style={[GeneralTextStyle, { color: Colors.primaryColor }]}>{LoginRegisterScreenStrings.forgotPassword}</Text>
                    </Pressable>
                </View>

                <View style={styles.buttonsView}>
                    <View style={{ flex: 1 }} />
                    <CustomButton
                        onPress={onPressLogin}
                        label={LoginRegisterScreenStrings.loginButton}
                        roundCorners={true}
                        width={PhoneDimensions.window.width * 0.5}
                        showProgress={isDataLoading}
                    />
                    <View style={{ flex: 1 }} />
                    <CustomButton
                        onPress={onPressNewUser}
                        label={LoginRegisterScreenStrings.newUser}
                        roundCorners={true}
                        width={PhoneDimensions.window.width * 0.5}
                    />
                    <View style={{ flex: 1 }} />
                </View>

                <View style={styles.otherOptionsView}>
                    <Text style={GeneralTextStyle}>{LoginRegisterScreenStrings.alternativeLoginText}</Text>

                    {Platform.OS === 'ios' ?
                        <AppleAuthentication.AppleAuthenticationButton
                            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                            cornerRadius={5}
                            style={styles.appleSignInButton}
                            onPress={() => onAppleButtonPress()}
                        />
                        :

                        <TouchableOpacity
                            style={[styles.googleSignInButton]}
                            onPress={() => onGoogleButtonPress()}
                        >
                            <Image source={googleLogo} style={styles.socialMediaLogo} />
                            <Text style={[GeneralTextStyle, { marginLeft: 10 }]}>Google</Text>
                        </TouchableOpacity>

                    }


                </View>
            </ScrollView>
        </SafeAreaView>
    )
}


export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: DefaultPadding,
    },

    titleView: {
        width: '100%',
        height: PhoneDimensions.window.height * 0.12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    titleText: {
        color: Colors.primaryColor,
        fontSize: FontSizes.large_2,
        fontFamily: FontFamilies.Poppins,
        textAlign: 'center',
    },

    logoView: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',

    },

    logoStyle: {
        width: LOGO_SIZE,
        height: LOGO_SIZE * 1.1,
    },

    inputView: {
        width: '100%',
        height: PhoneDimensions.window.height * 0.25,
        justifyContent: 'center',
        marginVertical: PhoneDimensions.window.width * 0.04,
    },

    textInput: {
        width: '100%',
        borderBottomWidth: 1.5,
        borderBottomColor: Colors.darkGray,
        paddingHorizontal: 8,
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2,
        color: Colors.fontColor,
        marginBottom: PhoneDimensions.window.width * 0.04,
    },

    buttonsView: {
        width: '100%',
        height: PhoneDimensions.window.height * 0.17,
        alignItems: 'center',
        justifyContent: 'center',
    },

    otherOptionsView: {
        width: '100%',
        alignItems: 'center',
        marginTop: PhoneDimensions.window.width * 0.05,
    },

    googleSignInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginVertical: PhoneDimensions.window.width * 0.02,
        backgroundColor: Colors.opaqueWhite,
        minWidth: PhoneDimensions.window.width * 0.5,
    },

    appleSignInButton: {
        width: PhoneDimensions.window.width * 0.5,
        height: PhoneDimensions.window.width * 0.12,
        marginVertical: PhoneDimensions.window.width * 0.02,
    },

    socialMediaLogo: {
        width: LOGO_SIZE * 0.3,
        height: LOGO_SIZE * 0.3,
    }
})