import { useEffect, useState } from "react";
import React from 'react'
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import { Colors } from '../resources/colors';
import { DefaultPadding, emailValidationRegex, FontFamilies, FontSizes, GeneralTextStyle, PencilIconSize, ToastDuration, validationRegex } from "../resources/constants";
import Ionicons from '@expo/vector-icons/Ionicons'
import PhoneDimensions from "../resources/layout";
import { ActivitiesStrings, ButtonStrings, LoginRegisterScreenStrings, ProfileScreenStrings } from "../resources/strings";
import { ScrollView, TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import OverlayTextInput from "../components/OverlayTextInput";
import * as ImagePicker from 'expo-image-picker';
import store from "../redux.store/configureStore";
import UserModel from "../models/UserModel";
import ImageResizer from 'react-native-image-resizer';
import { downloadImageFromStorage, uploadImageToStorage } from "../dao/storageDAO";
import { updateUserEmail, updateUserName, updateUserPictureUrl } from "../dao/userDAO";
import { updatePhotoUrl } from "../redux.store/actions/userActions/creators";
import { keyDateToStringDate } from "../resources/common";
import { PencilIcon } from "../components/Pencil_Icon";
import ActivityIndicatorOverlay from "../components/OverlayActivityIndicator";
import EmptyDialog from "../components/EmptyDialog";
import database from '@react-native-firebase/database'
import storage from '@react-native-firebase/storage'
import auth from '@react-native-firebase/auth'
import { ErrorWarning } from "../components/ErrorWarning";
import { useToast } from "react-native-fast-toast";
import report from "../components/CrashReport";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";



// import ImagePicker from 'react-native-image-crop-picker';
//Important: read additional setup to be done at https://www.npmjs.com/package/react-native-image-crop-picker


export const PictureSize = PhoneDimensions.window.width * 0.35;

const UserInfoLine = (props: any) => {

    let extraStyle = props.labelText.includes('name') || props.labelText.includes('assword') ? { marginBottom: 0 } : {}
    return (
        <View style={[styles.infoView, extraStyle]}>
            <Text style={styles.labels}>{props.labelText}</Text>
            <Text style={styles.text}>{props.text}</Text>
        </View>
    )
}

export const ProfileScreen = ({ navigation }: any) => {


    let currentUser: UserModel = store.getState().users.currentUser;

    const [isLoading, setIsLoading] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const toast = useToast()

    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }

    const [userName, setUserName] = useState(currentUser.name);
    const [userEmail, setUserEmail] = useState(currentUser.email);
    const [lastJournalEntry, setLastJournalEntry] = useState(currentUser.lastJournalEntry);
    const [pictureUrl, setPictureUrl] = useState(currentUser.pictureUrl);

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            if (store.getState().users.currentUser != null) {
                setLastJournalEntry(store.getState().users.currentUser.lastJournalEntry)
                setPictureUrl(store.getState().users.currentUser.pictureUrl)
            }

        })
        return unsubscribe;
    }, [])

    const [editName, setEditName] = useState(false);

    const setNewUserName = (value: string) => {
        setEditName(false);
        if (value !== '') {
            setUserName(value);
            updateUserName(value);
        }
    }

    const ChangePasswordDialog = (props: any) => {

        const [oldPassword, setOldPassword] = useState<string>('');
        const [newPassword1, setNewPassword1] = useState<string>('');
        const [newPassword2, setNewPassword2] = useState<string>('');
        const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
        const [error, setError] = useState(false);
        const buttonWidth = PhoneDimensions.window.width * 0.32;

        const onSave = () => {

            setError(false);

            if (newPassword1 != newPassword2) {
                setError(true);
                return;
            }
            if (!newPassword1.match(validationRegex)) {
                alert(LoginRegisterScreenStrings.wrongPasswordFormat);
                return;
            }

            let email = store.getState().users.currentUser?.email;
            let credentials = auth.EmailAuthProvider.credential(email, oldPassword)
            auth().currentUser?.reauthenticateWithCredential(credentials)
                .then(() => {
                    auth().currentUser?.updatePassword(newPassword1)
                        .then(() => showToast('Password updated.'))
                })
                .catch(_err => alert('The current password entered is not correct.'))
                .finally(() => setShowChangePassword(false))
        }

        return (
            <EmptyDialog
                showModal={props.showChangePassword}
                content={
                    <View style={{ paddingVertical: PhoneDimensions.window.height * 0.02 }}>

                        <View style={{ flexDirection: 'row', }}>
                            <TextInput
                                style={[dialogStyle.textInput, { marginBottom: PhoneDimensions.window.width * 0.04, }]}
                                placeholder={ProfileScreenStrings.oldPassword}
                                secureTextEntry={passwordHidden}
                                onChangeText={(value) => setOldPassword(value.trim())}
                                value={oldPassword}
                            />

                        </View>

                        <View style={{ flexDirection: 'row', }}>
                            <TextInput
                                style={[dialogStyle.textInput, { marginBottom: PhoneDimensions.window.width * 0.04, }]}
                                placeholder={ProfileScreenStrings.newPassword}
                                secureTextEntry={passwordHidden}
                                onChangeText={(value) => setNewPassword1(value.trim())}
                                value={newPassword1}
                            />
                            <Pressable onPress={() => setPasswordHidden(!passwordHidden)} style={{ padding: 6, position: "absolute", right: 15, top: -6 }}>
                                <Ionicons name={passwordHidden ? "eye" : "eye-off"} size={25} color={Colors.darkGray} />
                            </Pressable>
                        </View>

                        <View style={{ flexDirection: 'column', }}>
                            <TextInput
                                style={[dialogStyle.textInput, { marginBottom: PhoneDimensions.window.width * 0.04, }]}
                                placeholder={ProfileScreenStrings.confirmPassword}
                                secureTextEntry={passwordHidden}
                                onChangeText={(value) => setNewPassword2(value.trim())}
                                value={newPassword2}
                            />
                            {error && <ErrorWarning text={'Passwords dont match'} />}
                        </View>


                        <View style={{
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'space-around',
                            marginTop: 30,
                        }}>
                            <CustomButton label={ButtonStrings.saveButton} roundCorners={true} onPress={onSave} width={buttonWidth} />
                            <CustomButton label={ButtonStrings.cancelButton} roundCorners={true} onPress={() => setShowChangePassword(false)} width={buttonWidth} />
                        </View>

                    </View>
                }
            />
        )
    }

    const ChangeEmailDialog = (props: any) => {


        const [newEmail, setNewEmail] = useState<string>('');
        const [newEmail2, setNewEmail2] = useState<string>('');
        const [error, setError] = useState(false);
        const buttonWidth = PhoneDimensions.window.width * 0.32;

        const onSave = () => {

            setError(false);

            if (newEmail != newEmail2) {
                setError(true);
                return;
            }

            auth().currentUser?.verifyBeforeUpdateEmail(newEmail)
                // auth().currentUser?.updateEmail(newEmail)
                .then(() => {
                    setUserEmail(newEmail);
                    updateUserEmail(newEmail);
                    showToast('Please check and verify your new email.')
                })
                .catch(err => alert(err))
                .finally(() => setShowChangeEmail(false))


        }

        return (
            <EmptyDialog
                showModal={props.showChangeEmail}
                content={
                    <View style={{ paddingVertical: PhoneDimensions.window.height * 0.02 }}>

                        <View style={{ flexDirection: 'column', marginBottom: 20, alignItems: 'center' }}>
                            <Text style={[GeneralTextStyle, { fontSize: FontSizes.small_2 * 1.1 }]}>{ProfileScreenStrings.currentEmail}</Text>
                            <Text style={[GeneralTextStyle]}>{currentUser.email}</Text>

                        </View>

                        <View style={{ flexDirection: 'row', }}>
                            <TextInput
                                style={[dialogStyle.textInput, { marginBottom: PhoneDimensions.window.width * 0.04, }]}
                                placeholder={ProfileScreenStrings.newEmail}
                                onChangeText={(value) => setNewEmail(value.trim())}
                                value={newEmail}
                            />
                        </View>

                        <View style={{ flexDirection: 'column', }}>
                            <TextInput
                                style={[dialogStyle.textInput, { marginBottom: PhoneDimensions.window.width * 0.04, }]}
                                placeholder={ProfileScreenStrings.confirmEmail}
                                onChangeText={(value) => setNewEmail2(value.trim())}
                                value={newEmail2}
                            />
                            {error && <ErrorWarning text={'Emails don\'t match'} />}
                        </View>


                        <View style={{
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'space-around',
                            marginTop: 30,
                        }}>
                            <CustomButton label={ButtonStrings.saveButton} roundCorners={true} onPress={onSave} width={buttonWidth} />
                            <CustomButton label={ButtonStrings.cancelButton} roundCorners={true} onPress={() => setShowChangeEmail(false)} width={buttonWidth} />
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

    const selectAndSetPicture = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 4],
                quality: 1,
            });


            if (!result.canceled) {
                // setUserInfo({ ...userInfo, pictureUrl: result.uri });
                setIsLoading(true);
                let storageReference = '/images/' + currentUser?.id + '/profilePhoto.jpeg'
                uploadImageToStorage(result.assets[0].uri, storageReference, (url: any) => {
                    updateUserPictureUrl(url)
                    store.dispatch(updatePhotoUrl(url))
                    setIsLoading(false)
                })
            }
        }
        catch (error) {
            report.recordError(error)
        }

    }

    const onCloseProfileScreen = () => {
        navigation.goBack()
    }


    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.container}>

            <ChangePasswordDialog
                showChangePassword={showChangePassword}
            />
            <ChangeEmailDialog
                showChangeEmail={showChangeEmail}
            />
            <Text style={styles.screenTitle}>{ProfileScreenStrings.title}</Text>
            <View style={styles.profilePictureView}>
                <TouchableOpacity
                    onPress={() => selectAndSetPicture()}
                >
                    {(pictureUrl == null || pictureUrl === '') ?
                        <View style={[styles.profilePicture, styles.emptyPicture]}>
                            <Ionicons name='person-outline' size={PictureSize / 3} color={Colors.darkGray} />
                        </View>
                        :
                        isLoading ? <ActivityIndicator size={'large'} color={Colors.primaryColor} />
                            :
                            <Image source={{ uri: pictureUrl }} style={styles.profilePicture} />
                    }
                </TouchableOpacity>
                <Text style={[styles.text, { fontSize: FontSizes.small_1 }]}>{ProfileScreenStrings.changePicture}</Text>
            </View>


            <View style={{ width: '100%', flex: 10, justifyContent: 'center' }}>

                <OverlayTextInput
                    placeHolder="Enter user name"
                    showModal={editName}
                    onClose={setNewUserName}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 7, }}>

                    <UserInfoLine labelText={ProfileScreenStrings.userNameLabel} text={userName} />
                    <Pressable onPress={() => { setEditName(true) }}
                        style={{ marginLeft: 20, flex: 1 }}
                    >
                        <PencilIcon width={PencilIconSize} height={PencilIconSize} />
                    </Pressable>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 7, }}>

                    <UserInfoLine labelText={ProfileScreenStrings.changePasswordButton} text={'***********'} />
                    <Pressable
                        style={{ marginLeft: 20, flex: 1 }}
                        onPress={() => {
                            if (store.getState().users.isLoggedInWithSocialAuth) alert(ProfileScreenStrings.alertForSocialSignin)
                            else setShowChangePassword(true)

                        }}>
                        <PencilIcon width={PencilIconSize} height={PencilIconSize} />
                    </Pressable>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 7, }}>
                    <UserInfoLine labelText={ProfileScreenStrings.emailLabel} text={userEmail} />
                    <Pressable
                        style={{ marginLeft: 20, flex: 1 }}
                        onPress={() => {

                            if (store.getState().users.isLoggedInWithSocialAuth) alert(ProfileScreenStrings.alertForSocialSignin)
                            else setShowChangeEmail(true)


                        }}>
                        <PencilIcon width={PencilIconSize} height={PencilIconSize} />
                    </Pressable>
                </View>
                {(currentUser.yearOfBirth !== '') && <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 7, }}>
                    <UserInfoLine labelText={ProfileScreenStrings.dateOfBirth} text={currentUser.yearOfBirth} />
                </View>}
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 7, }}>
                    <UserInfoLine labelText={ProfileScreenStrings.userSinceLabel} text={currentUser.createdDate} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 7, }}>
                    <UserInfoLine labelText={ProfileScreenStrings.lastJournalEntry} text={lastJournalEntry && keyDateToStringDate(lastJournalEntry)} />
                </View>






            </View>

            <View style={{ width: '100%' }}>
                <CustomButton
                    label={ActivitiesStrings.closeButton}
                    roundCorners={true}
                    onPress={onCloseProfileScreen}
                />
            </View>


        </KeyboardAwareScrollView>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: DefaultPadding,
        paddingTop: PhoneDimensions.window.width * 0.15,
        alignItems: 'center',
        backgroundColor: Colors.white,
    },

    screenTitle: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.large_1,
        color: Colors.fontColor,
        marginBottom: PhoneDimensions.window.width * 0.05,
    },

    profilePictureView: {
        width: '100%',
        alignItems: 'center',
    },

    profilePicture: {
        width: PictureSize,
        height: PictureSize,
        borderRadius: PictureSize / 2,
        marginBottom: PhoneDimensions.window.width * 0.02,
    },

    emptyPicture: {
        borderColor: Colors.darkGray,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },

    infoView: {
        flex: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },

    labels: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2 * 0.9,
        color: Colors.primaryColor,
    },

    text: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2 * 0.9,
        color: Colors.fontColor,
        flexShrink: 1,
    }
})