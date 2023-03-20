import { useEffect, useState } from "react";
import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Image, Platform, TouchableOpacity } from "react-native";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../components/CustomButton";
import { Colors } from '../resources/colors';
import { DefaultPadding, FontFamilies, FontSizes, RATE_FAIR, RATE_HAPPY, RATE_SAD } from "../resources/constants";
import Ionicons from '@expo/vector-icons/Ionicons'
import PhoneDimensions from "../resources/layout";
import { compareDates, dateToKeyDate, getFormattedDate, getStandardFormatDate, keyDateToDate, keyDateToStringDate } from "../resources/common";
import { RoundCheckbox } from "../components/RoundCheckbox";
import { diary, exerciseJournal, fairFace, fairFaceSelected, foodMoodJournal, happyFace, happyFaceSelected, sadFace, sadFaceSelected, sleepJournal, waterJournal } from "../resources/imageObj";
import DateTimePicker from '@react-native-community/datetimepicker';
import { FoodMoodJournal, JournalEntry } from "../models/JournalEntryModel";
import store from "../redux.store/configureStore";
import HistoryEntry from "../components/HistoryEntry";
import { queryJournalEntriesByDateInterval } from "../dao/journalEntryDAO";
import { getJournalEntries, setHistoryJournalEntries } from "../redux.store/actions/journalActions/creators";
import { useLinkProps } from "@react-navigation/native";
import { useFocusEffect } from '@react-navigation/native';
import { ButtonStrings } from "../resources/strings";

const IconSize = PhoneDimensions.window.width * 0.08;

interface ModalProps {
    showModal: boolean,
    onSearch: (data: Array<JournalEntry>, dates: {}) => void,
    startDate: Date,
    endDate: Date,
}




export const HistoryScreen = ({ navigation }: any) => {


    let startDate = new Date()
    startDate.setDate(startDate.getDate() - 30);
    const [showFilters, setShowFilters] = useState(true);
    const [data, setData] = useState<Array<JournalEntry>>([]);
    const [dateSpan, setDateSpan] = useState({
        startDate: startDate, endDate: new Date()
    })


    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setData(store.getState().journalEntries.historyEntries)
        });
        return unsubscribe;
    }, [])



    const NewSearchPressable = () => {

        return (
            <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => setShowFilters(true)}
            >
                <Text style={styles.generalText}>
                    New Search
                </Text>
                <Ionicons name={'search-sharp'} size={30} color={Colors.deepBlue} style={{ marginLeft: 15 }} />

            </Pressable>
        )
    }

    const onToggleShowFilters = (data: Array<JournalEntry>, dates: any) => {

        setShowFilters(false)
        setDateSpan(dates)
        store.dispatch(setHistoryJournalEntries(data))
    }

    //Search function
    const FilterModal = ({ showModal, onSearch, startDate, endDate }: ModalProps) => {

        //By default, will display last 30 days.
        const [isFromDatePicker, setFromDatePicker] = useState(false);
        const [isToDatePicker, setToDatePicker] = useState(false);
        const [fromDate, setFromDate] = useState(startDate)
        const [toDate, setToDate] = useState(endDate)
        const [goodChecked, setGoodChecked] = useState(true);
        const [neutralChecked, setNeutralChecked] = useState(true);
        const [badChecked, setBadChecked] = useState(true);


        const filterByDateAndRate = (entries: JournalEntry[]) => {

            let results = entries.filter((entry) => {
                return (
                    (compareDates(fromDate, keyDateToDate(entry.date)) <= 0) && (compareDates(toDate, keyDateToDate(entry.date)) >= 0) &&
                    (entry.sleepRecord == null && entry.foodMoodRecords == null) ||
                    ((goodChecked && ((entry.sleepRecord?.grade === RATE_HAPPY) || entry.foodMoodRecords?.find(item => item.rate === RATE_HAPPY) != undefined))
                        || (neutralChecked && ((entry.sleepRecord?.grade === RATE_FAIR) || entry.foodMoodRecords?.find(item => item.rate === RATE_FAIR) != undefined))
                        || (badChecked && ((entry.sleepRecord?.grade === RATE_SAD) || entry.foodMoodRecords?.find(item => item.rate === RATE_SAD) != undefined))) ||
                    (entry.foodMoodRecords != null && entry.foodMoodRecords?.find(item => item.rate === '') != undefined)
                )
            })

            return results;
        }

        const onPressSearchEntries = () => {

            const filterResults = (data: JournalEntry[]) => {
                onSearch(filterByDateAndRate(data), { startDate: fromDate, endDate: toDate })
            }
            console.log('From: ' + fromDate.toLocaleDateString() + ' to: ' + toDate.toLocaleDateString())
            queryJournalEntriesByDateInterval(dateToKeyDate(fromDate), dateToKeyDate(toDate), filterResults)

        }


        const CalendarIcon = () => {
            return (
                <Ionicons name={'calendar-outline'} size={PhoneDimensions.window.width * 0.05} color={Colors.darkGray} style={{ marginLeft: 15 }} />
            )
        }

        const CheckboxRow = ({ label, onCheck, isChecked }: any) => {

            const faceSize = PhoneDimensions.window.width * 0.1;


            const getLabelOrImage = (label: string) => {
                if (label === 'happy' || label === 'fair' || label === 'sad') {
                    let src: any = null;
                    if (label === 'happy') src = happyFaceSelected;
                    else if (label === 'fair') src = fairFaceSelected;
                    else if (label === 'sad') src = sadFaceSelected;


                    return (
                        <Image source={src} style={{ width: faceSize, height: faceSize }} />
                    )
                }
                return (
                    <Text style={modalStyle.labels}>{label}</Text>
                )
            }

            return (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <RoundCheckbox isChecked={isChecked} onPress={() => onCheck()} size={30} />
                    {getLabelOrImage(label)}
                </View>
            )
        }

        const onChangeFrom = (event: any, date?: any) => {
            if (Platform.OS === 'android') {
                setFromDatePicker(false);
            }
            if (date != null) {
                if (validateDateSelection(date, 'from'))
                    setFromDate(date);
            }
        };

        const onChangeTo = (event: any, date?: any) => {
            if (Platform.OS === 'android') {
                setToDatePicker(false);
            }
            if (date != null) {
                if (validateDateSelection(date, 'to'))
                    setToDate(date);
            }
        };

        const validateDateSelection = (date: Date, position: string) => {
            if (position === 'from') {
                if (compareDates(date, new Date()) >= 0) {
                    alert('"To" date must be earlier than current date')
                    return false;
                }
                if (compareDates(date, toDate) >= 0) {
                    alert('"From" date must be earlier than "To" date')
                    return false;
                }
                return true;
            }
            else if (position === 'to') {
                if (compareDates(date, new Date()) > 0) {
                    alert('"To" date must be earlier than or same as current date')
                    return false;
                }
                if (compareDates(date, fromDate) <= 0) {
                    alert('"To" date must be after "From" date')
                    return false;
                }
                return true;
            }
        }



        //Search dialog render
        return (
            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
            >
                <SafeAreaView style={modalStyle.wrapper}>
                    <View style={modalStyle.container}>

                        <Text style={modalStyle.title}>Search your journal</Text>

                        <View style={modalStyle.dateRowView}>
                            <Text style={modalStyle.labels}>
                                From:
                            </Text>
                            <Pressable
                                style={modalStyle.datePressable}
                                onPress={() => {
                                    setToDatePicker(false)
                                    setFromDatePicker(!isFromDatePicker)
                                }}
                            >

                                <Text style={modalStyle.labels}>
                                    {getFormattedDate(fromDate)}
                                </Text>
                                <CalendarIcon />
                            </Pressable>
                        </View>





                        <View style={modalStyle.dateRowView}>
                            <Text style={modalStyle.labels}>
                                To:
                            </Text>
                            <Pressable
                                style={modalStyle.datePressable}
                                onPress={() => {
                                    setFromDatePicker(false)
                                    setToDatePicker(!isToDatePicker)
                                }}
                            >

                                <Text style={modalStyle.labels}>
                                    {getFormattedDate(toDate)}
                                </Text>
                                <CalendarIcon />
                            </Pressable>
                        </View>

                        {(isFromDatePicker || isToDatePicker) && (
                            <DateTimePicker
                                testID="dateTimePickerSettings"
                                value={isFromDatePicker ? fromDate : toDate}
                                mode={'date'}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                is24Hour={true}
                                onChange={isFromDatePicker ? onChangeFrom : onChangeTo}
                                style={{ backgroundColor: '#fff', width: PhoneDimensions.window.width * 0.9 }}
                                textColor={Colors.fontColor}
                                locale="en-CAN"
                            />
                        )}

                        <View style={modalStyle.checkboxGroupView}>
                            <Text style={[modalStyle.labels, modalStyle.subTitle]}>How I felt:</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <CheckboxRow label={'happy'} isChecked={goodChecked} onCheck={() => { setGoodChecked(!goodChecked) }} />
                                <CheckboxRow label={'fair'} isChecked={neutralChecked} onCheck={() => { setNeutralChecked(!neutralChecked) }} />
                                <CheckboxRow label={'sad'} isChecked={badChecked} onCheck={() => { setBadChecked(!badChecked) }} />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>

                            <CustomButton
                                onPress={onPressSearchEntries}
                                label={'Search'}
                                roundCorners={true}
                                width={PhoneDimensions.window.width * 0.35}
                            />
                            <CustomButton
                                onPress={() => setShowFilters(false)}
                                label={ButtonStrings.cancelButton}
                                roundCorners={true}
                                width={PhoneDimensions.window.width * 0.35}
                            />
                        </View>

                    </View>

                </SafeAreaView>
            </Modal>
        )
    }

    //Actual History screen render
    return (
        <View style={styles.container}>

            <FilterModal
                showModal={showFilters}
                onSearch={onToggleShowFilters}
                startDate={dateSpan.startDate}
                endDate={dateSpan.endDate}
            />

            {(store.getState().journalEntries.historyEntries.length == 0) ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <NewSearchPressable />

                    <Text style={[styles.generalText, { fontSize: FontSizes.small_2, marginTop: 50 }]}>
                        No matching results.
                    </Text>
                </View>
                :
                <View style={{ flex: 1, }}>
                    <View style={{ width: '100%', paddingVertical: 15 }}>
                        <NewSearchPressable />
                    </View>
                    <FlatList
                        data={data.sort((h1, h2) => {
                            return compareDates(keyDateToDate(h2.date), keyDateToDate(h1.date))
                        })}
                        renderItem={(entry) =>
                            <HistoryEntry entry={entry.item} navigation={navigation} />
                        }
                        contentContainerStyle={{}}
                        keyExtractor={(_item, index) => index.toString()}
                    />
                </View>
            }



        </View>
    )
}


//This is the style sheet of the History screen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'flex-start',
        // alignItems: 'center',
        backgroundColor: Colors.white
    },

    generalText: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.medium_1,
        color: Colors.fontColor,
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
    }
})

/**
 * This is the style sheet of the date search dialog. (FilterModal)
 */
const modalStyle = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: 'rgba(60, 60, 60, 0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    container: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        padding: DefaultPadding,
        borderRadius: PhoneDimensions.window.width * 0.01
    },

    title: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.medium_1,
        width: '100%',
        textAlign: 'center',
        marginBottom: PhoneDimensions.window.width * 0.05,
        fontWeight: 'bold'
    },

    dateRowView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: PhoneDimensions.window.width * 0.05,
        marginBottom: PhoneDimensions.window.width * 0.02,
        width: '100%',
    },

    datePressable: {
        borderWidth: 1.3,
        borderRadius: 5,
        borderColor: Colors.waterCircle,
        paddingHorizontal: 6,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '70%'
    },

    labels: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2,
    },

    subTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },

    checkboxGroupView: {
        marginVertical: 15,
        width: '100%',
    }
})