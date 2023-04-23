import React from 'react'
import { Text, View, StyleSheet, Pressable,  Platform, } from "react-native";
import { useState } from "react";
import { CustomButton } from "../components/CustomButton";
import { Colors } from "../resources/colors";
import { DefaultPadding, FontFamilies, FontSizes, StatusBarHeight, ToastDuration } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { ActivitiesStrings } from "../resources/strings";
import {  TextInput } from "react-native-gesture-handler";
import Ionicons from '@expo/vector-icons/Ionicons'
import CustomDropDown from "../components/CustomDropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FaceSelector from "../components/FaceSelector";
import { getJournalEntryByDate, saveJournalEntry } from "../dao/journalEntryDAO";
import { keyDateToStringDate } from "../resources/common";
import { JournalEntry, SleepRecord } from "../models/JournalEntryModel";
import store from "../redux.store/configureStore";
import { useToast } from "react-native-fast-toast";
import { updateHistoryJournalEntries } from '../redux.store/actions/journalActions/creators';

const durationOfSleepOptions = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20];

const SleepScreen = ({ route, navigation }: any) => {

    const toast = useToast()
    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }

    //Insets for IOS
    let insets = useSafeAreaInsets()

    let currentDate = route.params.currentDate;
    let journalEntry = route.params.entry;
    if(journalEntry == null) journalEntry = getJournalEntryByDate(currentDate);
    let sleepGrade =  journalEntry?.sleepRecord?.grade || '';
    let sleepHours = journalEntry?.sleepRecord?.hours || 0;
    let sleepComments = journalEntry?.sleepRecord?.comments || '';

    const [selectedFace, setSelectedFace] = useState(sleepGrade);
    const [hoursOfSleep, setHoursOfSleep] = useState(sleepHours);
    const [comments, setComments] = useState(sleepComments);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false)

    const onSelectHoursOfSleep = (value: any) => {
        setHoursOfSleep(value)
        setIsDropdownVisible(false)
    }

    const onPressSave = () => {
        let dbDate = currentDate
        let targetEntry : any = null
        if(selectedFace === ''){
            alert(ActivitiesStrings.sleepRecMinimumInfo);
            return;
        }
        let newSleepRecord = new SleepRecord(hoursOfSleep, selectedFace, comments);       

        if (journalEntry != null) {
            targetEntry = journalEntry;
            targetEntry.setSleepRecord(newSleepRecord)
        }
        //save new entry if not found
        else{        
            targetEntry = new JournalEntry(dbDate, [], [], newSleepRecord)            
        }

        if(route.params.entry != null) store.dispatch(updateHistoryJournalEntries(targetEntry))
        saveJournalEntry(targetEntry, () => showToast('Record updated successfully'))
        navigation.pop()
        
    }

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={[styles.container,{paddingBottom: Platform.OS === 'ios' ? insets.bottom + DefaultPadding : DefaultPadding}]}
    
        >
            <CustomDropDown
                showModal={isDropdownVisible}
                onSelect={onSelectHoursOfSleep}
                data={durationOfSleepOptions}
            />


            <Text style={styles.screenTitle}>{ActivitiesStrings.sleepTrackerTitle}</Text>
            
            <Text style={styles.currentDateText}>{keyDateToStringDate( currentDate)}</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.userInquiryText}>{ActivitiesStrings.sleepTrackerQuestion}</Text>
            <View style={{ flex: 1 }} />
            <FaceSelector selectedFace={selectedFace} onSelect={setSelectedFace} />
            <View style={{ flex: 1 }} />

            {/**Number of hours of sleep selector*/}
            <View style={styles.hoursSelectorView}>
                <Text style={styles.generalText} >{ActivitiesStrings.sleepTrackerDuration}</Text>
                <Pressable style={styles.selectorPressable} onPress={() => setIsDropdownVisible(true)}>
                    <Text style={[styles.generalText, { marginRight: 15, }]} >{hoursOfSleep}</Text>
                    <Ionicons name='chevron-down' size={20} color={Colors.darkGray} />
                </Pressable>
                <Text style={styles.generalText} >hours</Text>
            </View>

            <View style={{ flex: 1 }} />

            <TextInput
                style={styles.textInput}
                placeholder={ActivitiesStrings.sleepTrackerPlaceholder}
                multiline={true}
                scrollEnabled={true}
                autoCorrect={false}
                value={comments}
                onChangeText={(text) => setComments(text)}
            />

            <View style={{ flex: 1 }} />

            <View style={[styles.buttonsView]}>
                <CustomButton
                    label={ActivitiesStrings.saveButton}
                    roundCorners={true}
                    onPress={onPressSave}
                    width={PhoneDimensions.window.width * 0.35}
                />
                <CustomButton
                    label={ActivitiesStrings.cancelButton}
                    roundCorners={true}
                    onPress={navigation.pop}
                    width={PhoneDimensions.window.width * 0.35}
                />
            </View>
        </KeyboardAwareScrollView>
    )
}

export default SleepScreen;

const styles = StyleSheet.create({

    

    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: DefaultPadding,
        paddingTop: DefaultPadding + StatusBarHeight,
        alignItems: 'center'
    },

    screenTitle: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.large_1,
        color: Colors.fontColor,
        marginBottom: PhoneDimensions.window.width * 0.05,
    },

    currentDateText: {
        color: Colors.primaryColor,
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.medium_2,
    },

    userInquiryText: {
        color: Colors.darkGray,
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.medium_2,
    },

    hoursSelectorView: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    selectorPressable: {
        flexDirection: 'row',
        marginHorizontal: 15,
        paddingHorizontal: 15,
        alignItems: 'center',
        backgroundColor: Colors.opaqueWhite
    },

    generalText: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2,
        color: Colors.fontColor,
    },

    textInput: {
        backgroundColor: Colors.opaqueWhite,
        width: '100%',
        minHeight: '15%',
        maxHeight: '20%',
        borderWidth: 1.5,
        borderColor: Colors.darkGray,
        borderRadius: 5,
        paddingHorizontal: 7,
        paddingVertical: 7,
        fontFamily: FontFamilies.Verdana,
        fontSize: FontSizes.small_2,
        textAlignVertical: "top",
    },

    buttonsView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }

});