import { useState } from "react";
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, Alert } from "react-native";
import { CustomButton } from "../components/CustomButton";
import { Colors } from '../resources/colors';
import { Activities, FontFamilies, FontSizes, neutralMenuOption, PencilIconSize, RATE_FAIR, RATE_HAPPY, RATE_SAD, ToastDuration } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { dateToKeyDate, keyDateToStringDate } from "../resources/common";
import { diary, dark_diary, exerciseJournal, fairFace, fairFaceSelected, foodMoodJournal, happyFace, happyFaceSelected, sadFace, sadFaceSelected, sleepJournal, waterJournal, noFaceSelected } from "../resources/imageObj";
import { FoodMoodJournal, JournalEntry } from "../models/JournalEntryModel";
import Ionicons from '@expo/vector-icons/Ionicons'
import { ButtonStrings, HistoryScreenStrings } from "../resources/strings";
import { saveJournalEntry } from "../dao/journalEntryDAO";
import { useToast } from "react-native-fast-toast";
import store from "../redux.store/configureStore";
import { updateDiaryJournalEntry, updateHistoryJournalEntries } from "../redux.store/actions/journalActions/creators";
import { PencilIcon } from "./Pencil_Icon";

const IconSize = PhoneDimensions.window.width * 0.08;

const getRowIcons = (entry: JournalEntry) => {
    let icons : Array<any> = []

    let entryKeys = [
        { obj: entry.foodMoodRecords, src: foodMoodJournal, key: 'fm' },
        { obj: entry.waterRecord, src: waterJournal, key: 'wt' },
        { obj: entry.exerciseRecords, src: exerciseJournal, key: 'ex' },
        { obj: entry.sleepRecord, src: sleepJournal, key: 'sl' },
        { obj: entry.diaryRecord, src: dark_diary, key: 'dr' }
    ]

    for (let key of entryKeys) {
        if (key.obj != null) {
            icons.push(<Image source={key.src} style={[styles.icon, key.key == 'ex' && {width: IconSize * 1.5, height: IconSize * 1.5}]} key={key.key} />)
        }
        else {
            icons.push(<View style={styles.icon} key={key.key} />)
        }
    }

    return icons

}

interface EntryProps {
    entry: JournalEntry,
    navigation: any,
}

const HistoryEntry = (props: EntryProps) => {

    const PictureSize = PhoneDimensions.window.width * 0.19;
    let entry = props.entry
    const [isExpanded, setIsExpanded] = useState(false);
    const date = entry.date

    const toast = useToast()
    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }

    const onPressDeleteButton = (activity: string) => {
        Alert.alert(
            'Delete entry',
            'Are you sure you want to delete this entry? (This action cannot be undone)',
            [
                {
                    text: ButtonStrings.yesButton,
                    style: 'default',
                    onPress: () => {
                        switch (activity) {
                            case Activities.water:
                                entry.waterRecord = null;
                                break;
                            case Activities.food:
                                entry.foodMoodRecords = null;
                                break;
                            case Activities.exercise:
                                entry.exerciseRecords = null;
                                break;
                            case Activities.sleep:
                                entry.sleepRecord = null;
                                break;
                            case Activities.diaryInput:
                                entry.diaryRecord = null;
                                break;
                            default:
                                break;
                        }
                        store.dispatch(updateHistoryJournalEntries(entry));
                        store.dispatch(updateDiaryJournalEntry(entry));
                        saveJournalEntry(entry, () => showToast(HistoryScreenStrings.onDeleteMessage))
                    }
                },
                {
                    text: ButtonStrings.cancelButton,
                    style: 'default',
                },
            ]
        )
    }

    const onPressEditEntry = (entry: JournalEntry, activity: string) => {
        Alert.alert(
            'Edit entry',
            'What would you like to do?',
            [
                {
                    text: ButtonStrings.editButton,
                    style: 'default',
                    onPress: () => {
                        console.log('You pressed edit ' + activity)
                        props.navigation.navigate(activity, { currentDate: date, entry: entry })
                    }
                },
                {
                    text: ButtonStrings.deleteButton,
                    style: 'default',
                    onPress: () => {
                        onPressDeleteButton(activity)
                    }
                },
                {
                    text: ButtonStrings.cancelButton,
                    style: 'default',
                },
            ]
        )
    }


    return (
        <View>
            {!isExpanded ? <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    marginVertical: 5,
                    marginHorizontal: 15,
                    padding: 15,
                    backgroundColor: Colors.opaqueWhite,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    borderRadius: 5
                }}

                onPress={() => setIsExpanded(true)}
            >
                <Text style={[styles.generalText, { fontSize: FontSizes.small_2 * 0.85 }]}>{keyDateToStringDate(entry.date)}</Text>
                <View style={styles.rowIconsView}>
                    {
                        getRowIcons(entry)

                    }

                </View>
            </TouchableOpacity>
                :
                <View
                    style={{
                        flexDirection: 'column',
                        marginVertical: 5,
                        marginHorizontal: 15,
                        padding: 15,
                        backgroundColor: Colors.opaqueWhite,
                        justifyContent: 'flex-start',
                        // alignItems: 'center',
                        borderRadius: 5
                    }}
                >
                    <Text style={[styles.generalText, { fontSize: FontSizes.small_2, }]}>{keyDateToStringDate(entry.date)}</Text>

                    {(entry.waterRecord != null) &&
                        <View style={{ marginTop: PhoneDimensions.window.height * 0.02, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.subTitlesText}>Water intake: {entry.waterRecord.quantity}</Text>
                            <Pressable style={styles.editPressable} onPress={() => onPressEditEntry(entry, Activities.water)}>
                                {/* <Ionicons name={'pencil'} size={IconSize * 0.7} color={Colors.darkGray} /> */}
                                <PencilIcon width={PencilIconSize} height={PencilIconSize} />
                            </Pressable>
                        </View>}

                    {(entry.sleepRecord != null) &&
                        <View style={{ marginTop: PhoneDimensions.window.height * 0.02 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 7, justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                    <Text style={styles.generalText}>
                                        <Text style={styles.subTitlesText}>I slept: </Text>{entry.sleepRecord.hours} hours
                                    </Text>
                                    <Image
                                        source={entry.sleepRecord.grade === RATE_HAPPY ? happyFaceSelected : entry.sleepRecord.grade === RATE_FAIR ? fairFaceSelected : sadFaceSelected}
                                        style={{ width: IconSize, height: IconSize, marginLeft: 15 }}
                                    />
                                </View>
                                <Pressable
                                    style={styles.editPressable}
                                    onPress={() => onPressEditEntry(entry, Activities.sleep)}
                                >
                                    <PencilIcon width={PencilIconSize} height={PencilIconSize} />
                                </Pressable>
                            </View>
                            <Text style={styles.generalText}> {entry.sleepRecord.comments}</Text>
                        </View>}

                    {(entry.exerciseRecords != null) &&
                        <View style={{ marginTop: PhoneDimensions.window.height * 0.02 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.subTitlesText}>My exercise:</Text>
                                <Pressable style={styles.editPressable} onPress={() => onPressEditEntry(entry, Activities.exercise)}>
                                    <PencilIcon width={PencilIconSize} height={PencilIconSize} />
                                </Pressable>
                            </View>
                            {entry.exerciseRecords.map((record, index) => {
                                return (
                                    <Text key={index.toString()} style={[styles.generalText, { flexShrink: 1, marginTop: 7 }]}>{record.description} - {record.comments}</Text>
                                )
                            })}

                        </View>
                    }

                    {(entry.foodMoodRecords != null) &&
                        <View style={{ marginTop: PhoneDimensions.window.height * 0.02 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.subTitlesText}>My meals:</Text>
                                <Pressable style={styles.editPressable} onPress={() => onPressEditEntry(entry, Activities.food)}>
                                    <PencilIcon width={PencilIconSize} height={PencilIconSize} />
                                </Pressable>
                            </View>
                            {entry.foodMoodRecords.map((record, index) => {


                                let before = '', after = '';

                                if (record.physicalBefore !== neutralMenuOption) before += record.physicalBefore
                                if (record.mentalBefore !== neutralMenuOption) {
                                    if (before !== '') before += ', ';
                                    before += record.mentalBefore
                                }
                                if (record.emotionBefore !== neutralMenuOption) {
                                    if (before !== '') before += ', ';
                                    before += record.emotionBefore;
                                }

                                if (record.physicalAfter !== neutralMenuOption) after += record.physicalAfter
                                if (record.mentalAfter !== neutralMenuOption) {
                                    if (after !== '') after += ', ';
                                    after += record.mentalAfter
                                }
                                if (record.emotionAfter !== neutralMenuOption) {
                                    if (after !== '') after += ', ';
                                    after += record.emotionAfter;
                                }


                                return (

                                    <View style={{ width: '100%', marginTop: index == 0 ? 10 : 20 }} key={index.toString()}>

                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                            <View style={{ flex: 4, paddingRight: 5, }}>
                                                <Text style={[styles.generalText, { flexShrink: 1 }]}>{record.time} - {record.description}</Text>
                                                {(before !== '') && <Text style={[styles.generalText, { flexShrink: 1 }]}>How I felt before: {before}</Text>}
                                                {(after !== '') && <Text style={[styles.generalText, { flexShrink: 1 }]}>How I felt after: {after}</Text>}
                                                {(record.comments !== '') && <Text style={[styles.generalText, { flexShrink: 1 }]}>{record.comments}</Text>}
                                            </View>
                                            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', paddingLeft: 4 }}>
                                                <Image
                                                    source={record.rate === RATE_HAPPY ? happyFaceSelected : record.rate === RATE_FAIR ? fairFaceSelected : record.rate === RATE_SAD ? sadFaceSelected : noFaceSelected}
                                                    style={{ width: IconSize, height: IconSize, marginBottom: 15 }}
                                                />
                                                {(record.pictureUri !== '') && <Image source={{ uri: record.pictureUri }} style={{ width: PictureSize, height: PictureSize, borderRadius: 5 }} />}
                                            </View>


                                        </View>

                                    </View>
                                )
                            })}

                        </View>
                    }

                    {(entry.diaryRecord != null) &&
                        <View style={{ marginTop: PhoneDimensions.window.height * 0.02 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.subTitlesText}>My diary:</Text>
                                <Pressable style={styles.editPressable} onPress={() => onPressEditEntry(entry, Activities.diaryInput)}>
                                    <PencilIcon width={PencilIconSize} height={PencilIconSize} />
                                </Pressable>
                            </View>
                            <Text style={[styles.generalText, { flexShrink: 1, marginTop: 7 }]}>{entry.diaryRecord.text}</Text>

                        </View>

                    }
                    <View style={{ width: '100%', alignItems: 'center', marginTop: PhoneDimensions.window.height * 0.02 }}>
                        <CustomButton label={'Close'} roundCorners={true} onPress={() => { setIsExpanded(false); }} width={PhoneDimensions.window.width * 0.4} />
                    </View>
                </View>
            }
        </View>
    )

}

const styles = StyleSheet.create({

    generalText: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2 * 0.8,
        color: Colors.fontColor,
    },

    subTitlesText: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2,
        color: Colors.fontColor,
        fontWeight: 'bold'
    },

    rowIconsView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        marginLeft: 20
    },

    icon: {
        height: IconSize,
        width: IconSize
    },

    editPressable: {
        // borderColor: Colors.primaryColor,
        width: IconSize,
        height: IconSize,
        // borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})


export default HistoryEntry