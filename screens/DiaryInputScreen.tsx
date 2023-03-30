import { useState } from "react";
import React from 'react';
import { Keyboard, View, Text, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { useToast } from "react-native-fast-toast";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import { getDiaryEntryByDate, saveJournalEntry } from "../dao/journalEntryDAO";
import { DiaryRecord, JournalEntry } from "../models/JournalEntryModel";
import store from "../redux.store/configureStore";
import { Colors } from '../resources/colors';
import { keyDateToStringDate } from "../resources/common";
import { DefaultPadding, FontFamilies, FontSizes, ToastDuration } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { ActivitiesStrings } from "../resources/strings";
import { setDiaryJournalEntries, updateDiaryJournalEntry, updateHistoryJournalEntries } from '../redux.store/actions/journalActions/creators';

/**
 * This screen is accessed from the DiaryScreen, and is where the user can actually type a diary record.
 */
export const DiaryInputScreen = ({ route, navigation }: any) => {

    const toast = useToast()
    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }

    let currentDate = route.params.currentDate;
    let journalEntry = route.params.entry;
    if (journalEntry == null) journalEntry = getDiaryEntryByDate(currentDate);
    let initialText = journalEntry?.diaryRecord?.text || "";
    const [diaryText, setDiaryText] = useState(initialText);
    const [isInputFocused, setInputFocused] = useState(false)


    const onSave = () => {
        //If there is no change it simply closes the screen.
        if (initialText === diaryText) {
            navigation.pop()
            return;
        }

        let dbDate = currentDate
        let targetEntry: any = null

        let diaryRecord = new DiaryRecord(diaryText)

        //If there is an existing journal entry for the given date, simply update the diary record.
        if (journalEntry != null) {
            targetEntry = journalEntry;
            targetEntry.setDiaryRecord(diaryRecord)
            store.dispatch(updateDiaryJournalEntry(targetEntry))
        }

        //save new entry if not found
        else {
            console.log('Saving new diary entry...')
            targetEntry = new JournalEntry(dbDate)
            targetEntry.setDiaryRecord(diaryRecord);
            let diaryEntries = [...store.getState().journalEntries.diaryEntries, targetEntry];
            store.dispatch(setDiaryJournalEntries(diaryEntries))
        }


        //This line below will only run if editing an entry passed from the history screen
        if (route.params.entry != null) {
            store.dispatch(updateHistoryJournalEntries(targetEntry))
        }


        saveJournalEntry(targetEntry, () => showToast('Diary updated successfully'))
        navigation.pop()
    }

    if (Platform.OS === 'ios' && !isInputFocused) Keyboard.dismiss()

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.headerView}>
                        <Text style={styles.headerText}>My Diary</Text>
                        <Text style={styles.date}>{keyDateToStringDate(currentDate)}</Text>
                    </View>

                    <View style={{ flex: 1 }} />

                    <TextInput
                        onTouchEnd={() => { if (Platform.OS === 'ios') setInputFocused(!isInputFocused) }}
                        style={styles.input}
                        multiline={true}
                        scrollEnabled={true}
                        placeholder={"Dear diary..."}
                        numberOfLines={200}
                        textAlignVertical={"top"}
                        onChangeText={(value) => { setDiaryText(value) }}
                        value={diaryText}
                    />

                    <View style={{ flex: 1 }} />

                    <CustomButton
                        label={ActivitiesStrings.saveButton}
                        roundCorners={true}
                        onPress={onSave}
                        width={PhoneDimensions.window.width - (2 * DefaultPadding)}
                    />
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: DefaultPadding,
        alignItems: 'center',

    },

    headerView: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    headerText: {
        color: Colors.primaryColor,
        fontSize: FontSizes.medium_2,
        fontFamily: FontFamilies.Poppins,
        textAlign: 'center',
        marginBottom: PhoneDimensions.window.width * 0.12,
    },

    date: {
        color: Colors.fontColor,
        fontSize: FontSizes.medium_1,
        fontFamily: FontFamilies.Poppins,
        textAlign: 'center',
    },

    input: {
        width: '100%',
        backgroundColor: Colors.opaqueWhite,
        flex: 10,
        marginBottom: PhoneDimensions.window.width * 0.1,
        borderColor: Colors.darkGray,
        borderWidth: 1.5,
        borderRadius: 4,
        padding: 15,
        fontSize: FontSizes.small_2,
        color: Colors.darkGray,
        fontFamily: FontFamilies.Verdana,
        minHeight: PhoneDimensions.window.height * 0.4
    }
})