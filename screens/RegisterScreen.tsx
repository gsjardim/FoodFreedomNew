import { useState } from "react";
import React from 'react'
import { Image, View, Text, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import { RoundCheckbox } from "../components/RoundCheckbox";
import { Colors } from '../resources/colors';
import { FontFamilies, FontSizes, Genders, GeneralTextStyle, MINIMUM_AGE, neutralMenuOption, PRIVACY_URL, TERMS_URL, ToastDuration, validationRegex } from "../resources/constants";
import { FF_logo } from "../resources/imageObj";
import PhoneDimensions from "../resources/layout";
import { LoginRegisterScreenStrings } from "../resources/strings";
import { checkMarkSize } from "./FoodMoodScreen";
import Ionicons from '@expo/vector-icons/Ionicons'
import { styles as loginStyles } from "./LoginScreen";
import { getFormattedDate, openUrlInBrowser, } from "../resources/common";
import CustomDropDown from "../components/CustomDropdown";
import { useToast } from "react-native-fast-toast";
import database from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth'
import UserModel from "../models/UserModel";
import { ErrorWarning } from "../components/ErrorWarning";

const YEAR_MODE = 1;
const GENDER_MODE = 2;

export const RegisterScreen = ({ navigation }: any) => {



    const [userName, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password1, setPassword1] = useState<string>('');
    const [password2, setPassword2] = useState<string>('');
    const [passwordHidden, setPasswordHidden] = useState(true);
    const [yearOfBirth, setYearOfBirth] = useState<string>('');
    const [gender, setGender] = useState<string>(neutralMenuOption);
    const [agreed, setAgreed] = useState(false);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownMode, setDropdownMode] = useState(YEAR_MODE);
    const [nameError, setNameError] = useState(false)
    const [emailError, setEmailError] = useState(false);
    const [yearError, setYearError] = useState(false);
    const [genderError, setGenderError] = useState(false);
    const toast = useToast()

    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }

    const onPressCancel = () => {
        navigation.pop()
    }

    const onPressRegister = () => {
        // validation steps
        setNameError(userName === '')
        setEmailError(email === '');
        setYearError(yearOfBirth === '')
        setGenderError(gender === neutralMenuOption)



        if (password1 != password2) {
            alert('Passwords do not match.')
            return;
        }

        
        if (!password1.match(validationRegex)) {
            alert(LoginRegisterScreenStrings.wrongPasswordFormat);
            return;
        }

        if (parseInt(yearOfBirth) > (new Date().getFullYear() - MINIMUM_AGE)) {
            alert(LoginRegisterScreenStrings.minimumAgeAlert);
            return;
        }

        if (!agreed) {
            alert(LoginRegisterScreenStrings.termsAndConditionsRequired)
            return;
        }

        


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
                            onPress: () => {
                                auth().signOut();
                                navigation.pop();
                            }
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


    const onOpenDropdown = (mode: number) => {
        setDropdownMode(mode);
        setDropdownVisible(true);
    }

    const onSelectOption = (value: number | string) => {
        if (dropdownMode == YEAR_MODE) {
            setYearOfBirth(value.toString());
        }
        else {
            setGender(value.toString());
        }
        setDropdownVisible(false);
    }

    const getYearArray = () => {

        let years: number[] = [];
        let maxYear = new Date().getFullYear();
        do {
            years.push(maxYear);
            maxYear--;
        } while (maxYear > 1920)
        return years;
    }

   

    return (
        <SafeAreaView style={{ flex: 1 }} >
            <ScrollView style={styles.container}>

                {/**Year / Gender dropdown */}
                <CustomDropDown
                    showModal={isDropdownVisible}
                    onSelect={onSelectOption}
                    data={dropdownMode == YEAR_MODE ? getYearArray() : Genders}
                />

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
                    <View style={{ marginBottom: PhoneDimensions.window.width * 0.04, }}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={LoginRegisterScreenStrings.userName}
                            onChangeText={(value) => setUsername(value)}
                            value={userName}
                        />
                        {nameError && <ErrorWarning text={'User name is mandatory'} />}
                    </View>

                    <View style={{ marginBottom: PhoneDimensions.window.width * 0.04, }}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={LoginRegisterScreenStrings.email}
                            onChangeText={(value) => setEmail(value.trim())}
                            value={email}
                        />
                        {emailError && <ErrorWarning text={'Email is mandatory'} />}
                    </View>

                    <View style={{ flexDirection: 'row', }}>
                        <TextInput
                            style={[styles.textInput, { marginBottom: PhoneDimensions.window.width * 0.04, }]}
                            placeholder={LoginRegisterScreenStrings.password}
                            secureTextEntry={passwordHidden}
                            onChangeText={(value) => setPassword1(value.trim())}
                            value={password1}
                        />
                        <Pressable onPress={() => setPasswordHidden(!passwordHidden)} style={{ padding: 6, position: "absolute", right: 15, top: Platform.OS == "ios" ? -14 : -6 }}>
                            <Ionicons name={passwordHidden ? "eye" : "eye-off"} size={25} color={Colors.darkGray} />
                        </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', }}>
                        <TextInput
                            style={[styles.textInput, { marginBottom: PhoneDimensions.window.width * 0.04, }]}
                            placeholder={LoginRegisterScreenStrings.confirmPassword}
                            secureTextEntry={passwordHidden}
                            onChangeText={(value) => setPassword2(value.trim())}
                            value={password2}
                        />
                    </View>
                    <View style={{ marginBottom: PhoneDimensions.window.width * 0.04, }}>
                        <Pressable style={styles.selectorView} onPress={() => onOpenDropdown(YEAR_MODE)}>
                            <Text style={[GeneralTextStyle, { color: yearOfBirth !== '' ? Colors.fontColor : Colors.darkGray }]}>
                                {yearOfBirth !== '' ? yearOfBirth : LoginRegisterScreenStrings.selectYearOfBirth}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={Colors.darkGray} />
                        </Pressable>
                        {yearError && <ErrorWarning text={'Year is mandatory'} />}
                    </View>

                    <View style={{ marginBottom: PhoneDimensions.window.width * 0.04, }}>
                        <Pressable style={styles.selectorView} onPress={() => onOpenDropdown(GENDER_MODE)}>
                            <Text style={[GeneralTextStyle, { color: gender !== neutralMenuOption ? Colors.fontColor : Colors.darkGray }]}>{gender !== neutralMenuOption ? gender : LoginRegisterScreenStrings.selectGender}</Text>
                            <Ionicons name="chevron-down" size={20} color={Colors.darkGray} />
                        </Pressable>
                        {genderError && <ErrorWarning text={'Gender is mandatory'} />}
                    </View>
                </View>

                <View style={styles.agreementView}>
                    <RoundCheckbox
                        isChecked={agreed}
                        onPress={setAgreed}
                        size={checkMarkSize * 0.9}
                    />
                    <Text style={[GeneralTextStyle, { flexShrink: 1 }]}>
                        I agree with the{' '}
                        <Text
                            style={[GeneralTextStyle, { color: Colors.primaryColor }]}
                            onPress={() => openUrlInBrowser(TERMS_URL)}
                        >Terms and Conditions</Text>
                        {' '}and{' '}
                        <Text
                            style={[GeneralTextStyle, { color: Colors.primaryColor }]}
                            onPress={() => openUrlInBrowser(PRIVACY_URL)}
                        >Privacy policy</Text>
                    </Text>

                </View>

                <View style={styles.buttonsView}>

                    <CustomButton
                        onPress={onPressRegister}
                        label={LoginRegisterScreenStrings.registerButton}
                        roundCorners={true}
                        width={PhoneDimensions.window.width * 0.35}
                    />
                    <CustomButton
                        onPress={onPressCancel}
                        label={LoginRegisterScreenStrings.cancelButton}
                        roundCorners={true}
                        width={PhoneDimensions.window.width * 0.35}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}



const styles = StyleSheet.create({
    //These styles are the same as the ones in the Login screen
    container: loginStyles.container,

    titleView: loginStyles.titleView,

    titleText: loginStyles.titleText,

    logoView: loginStyles.logoView,

    logoStyle: loginStyles.logoStyle,

    inputView: {
        width: '100%',
        marginTop: PhoneDimensions.window.width * 0.1,
        marginBottom: PhoneDimensions.window.width * 0.05,
    },

    textInput: {
        width: '100%',
        borderBottomWidth: 1.5,
        borderBottomColor: Colors.darkGray,
        paddingHorizontal: 8,
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2,
        color: Colors.fontColor,
    },

    selectorView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },

    agreementView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    buttonsView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: PhoneDimensions.window.width * 0.06,
    }
})