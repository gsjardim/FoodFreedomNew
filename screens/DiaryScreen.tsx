import { Text, View, StyleSheet, Pressable, Modal } from "react-native";
import React from 'react';
import { useEffect, useState } from "react";
import { Colors } from "../resources/colors";
import { FontFamilies, FontSizes, GeneralTextStyle } from "../resources/constants";
import Ionicons from '@expo/vector-icons/Ionicons'
import PhoneDimensions from "../resources/layout";
import { compareDates, dateToKeyDate, getMonthString } from "../resources/common";
import { JournalEntry } from "../models/JournalEntryModel";
import store from "../redux.store/configureStore";
import { getDataFromDbAndSetDiaryEntries } from "../dao/journalEntryDAO";

/**
 * This screen is divided into two main components:
 * CalendarPicker: Renders the interactive calendar only.
 * Diary: Renders the main part of the screen, which holds the CalendarPicker.
 */

interface CalendarProps {
    onPressDate: (dateStr: string) => void,
}

const CalendarPicker = (props: CalendarProps) => {

    const [displayDate, setDisplayDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [data, setData] = useState<JournalEntry[]>(store.getState().journalEntries.diaryEntries);


    useEffect(() => {

        const unsubscribe = store.subscribe(() => {
            setData(store.getState().journalEntries.diaryEntries)
        });
        return unsubscribe;
    }, [])

  

    const updateDate = (add: number) => {
        //This line will exit the function if the date displayed has already reached the current month, so it cannot go any further. No displaying future dates
        if (add > 0 && displayDate.getMonth() == new Date().getMonth() && displayDate.getFullYear() == new Date().getFullYear()) return;

        let month = displayDate.getMonth() + add;

        let newDate = new Date(displayDate);
        newDate.setMonth(month);
        getDataFromDbAndSetDiaryEntries(newDate)
        setDisplayDate(newDate);
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const getWeekDayNumber = (weekDay: string) => {
        switch (weekDay) {
            case 'Sun': return 0;
            case 'Mon': return 1;
            case 'Tue': return 2;
            case 'Wed': return 3;
            case 'Thu': return 4;
            case 'Fri': return 5;
            case 'Sat': return 6;
            default: return 0;
        }
    }

    /**
     * Renders one single circle with the day of the month inside. Green background means there is a record for that date.
     * Gray background is empty.
     * @param date the day of the month
     * @returns single date component
     */
    const DateView = ({ date }: any) => {
        let today = new Date();
        let isToday = today.getMonth() == displayDate.getMonth() && date == today.getDate() && today.getFullYear() == displayDate.getFullYear();


        function getDateBackground() {
            let currentDate = new Date(displayDate);
            currentDate.setDate(date);
            for (let entry of data) {
                if (dateToKeyDate(currentDate) === entry.date && entry.diaryRecord != null && entry.diaryRecord?.text !== '') {
                    return Colors.primaryColor;
                }
            }
            if(compareDates(currentDate, today) > 0) return Colors.white;

            return Colors.lightGray;
        }

        function onPressDate() {
            let currentDate = new Date(displayDate);
            currentDate.setDate(date);
            if(compareDates(currentDate, today) <= 0)  props.onPressDate(dateToKeyDate(currentDate))
        }

        return (
            <Pressable
                onPress={() => onPressDate()}
                style={[{ marginVertical: 7, width: 35, height: 35, justifyContent: 'center', alignItems: 'center', borderRadius: 17.5, }, (date !== 0) && { backgroundColor: getDateBackground() }, isToday && { borderColor: Colors.deepBlue, borderWidth: 2.5 }]}>
                <Text style={GeneralTextStyle}>{(date !== 0) && date}</Text>
            </Pressable>
        )
    }

    //Renders the day of the week on top of each column
    const Header = ({ text }: any) => {
        return (
            <View style={{ marginVertical: 6, justifyContent: 'center', alignItems: 'center', }}>
                <Text style={GeneralTextStyle}>{text}</Text>
            </View>
        )
    }

    const getDatesArray = () => {

        let dates: any = [];
        let currentDate = new Date(displayDate);
        currentDate.setDate(1);
        let currentMonth = currentDate.getMonth();
        let position = 0;
        while (currentDate.getMonth() == currentMonth) {
            let weekDay = currentDate.toString().split(" ")[0];
            let weekDayNum = getWeekDayNumber(weekDay);
            dates.push({ day: weekDayNum > position ? 0 : currentDate.getDate(), position: position })

            if (weekDayNum <= position) {
                let newDay = currentDate.getDate() + 1;
                currentDate.setDate(newDay);
            }
            position++;

        }

        const allDaysView =
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                {weekDays.map((weekDay, index) => {
                    let posArray: number[] = [index, index + 7, index + 14, index + 21, index + 28, index + 35]
                    return (
                        <View style={calStyles.column} key={index.toString()}>
                            <Header text={weekDay} />
                            {dates.map((value: any, ind: number) => {
                                if (posArray.includes(value.position)) {
                                    return <DateView date={value.day} key={ind.toString()} />
                                }
                            })}
                        </View>
                    )
                })}
            </View>

        return allDaysView;
    }

    const openDatePicker = (onSetDate: any, initialDate: Date) => {

        const [selectedDate, setSelectedDate] = useState(initialDate)

        const Picker = () => {

            const setMonth = (increment: number) => {
                let newDate = new Date(selectedDate)
                newDate.setMonth(selectedDate.getMonth() + increment)
                setSelectedDate(newDate)
            }

            const setYear = (increment: number) => {
                let newDate = new Date(selectedDate)
                newDate.setFullYear(selectedDate.getFullYear() + increment)
                setSelectedDate(newDate)
            }

            return (
                <View style={{ flexDirection: 'row', width: '100%', paddingHorizontal: '20%', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                        {/**Month selector */}
                        <Pressable onPress={() => setMonth(1)} style={{ padding: 8 }}>
                            <Ionicons name="chevron-up" size={22} color={Colors.darkGray} />
                        </Pressable>
                        <Text style={[GeneralTextStyle, { marginVertical: 15, fontSize: FontSizes.medium_2 }]}>{getMonthString(selectedDate.getMonth())}</Text>
                        <Pressable onPress={() => setMonth(-1)} style={{ padding: 8 }}>
                            <Ionicons name="chevron-down" size={22} color={Colors.darkGray} />
                        </Pressable>
                    </View>

                    <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                        {/**Year selector */}
                        <Pressable onPress={() => setYear(1)} style={{ padding: 8 }}>
                            <Ionicons name="chevron-up" size={22} color={Colors.darkGray} />
                        </Pressable>
                        <Text style={[GeneralTextStyle, { marginVertical: 15, fontSize: FontSizes.medium_2 }]}>{selectedDate.getFullYear()}</Text>
                        <Pressable onPress={() => setYear(-1)} style={{ padding: 8 }}>
                            <Ionicons name="chevron-down" size={22} color={Colors.darkGray} />
                        </Pressable>
                    </View>
                </View>
            )
        }


        return (
            <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(60, 60, 60, 0.4)', alignItems: 'center', justifyContent: 'center', }}>
                    <View style={{ width: PhoneDimensions.window.width * 0.8, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 }}>
                        <Picker />
                        <Pressable style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }} onPress={() => onSetDate(selectedDate)}>
                            <Text style={[GeneralTextStyle, { color: Colors.deepBlue, fontSize: FontSizes.medium_1 }]}>Set date</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        )

    }

    const setDateCallBack = (desiredDate: Date) => {


        if (compareDates(desiredDate, new Date()) > 0) {
            alert('The selected date cannot be after the current date.')
        }

        else {
            getDataFromDbAndSetDiaryEntries(desiredDate);
            setDisplayDate(desiredDate);
            setShowDatePicker(false);
        }
    }

    //This renders the overall calendar picker
    return (
        <View style={calStyles.calendarContainer}>
            <View style={calStyles.monthDisplayView}>

                {openDatePicker(setDateCallBack, displayDate)}

                <Pressable onPress={() => updateDate(-1)} style={calStyles.chevron}><Ionicons name="chevron-back" size={30} color={Colors.deepBlue} /></Pressable>
                <Pressable style={calStyles.monthSelectorPressable} onPress={() => setShowDatePicker(true)}>
                    <Text style={[GeneralTextStyle, calStyles.monthDisplayText]}>{displayDate.toDateString().split(' ')[1].trim()}</Text>
                    <Text style={[GeneralTextStyle, calStyles.monthDisplayText]}>{displayDate.getFullYear()}</Text>
                </Pressable>
                <Pressable onPress={() => updateDate(1)}><Ionicons name="chevron-forward" size={30} color={Colors.deepBlue} /></Pressable>
            </View>
            {getDatesArray()}
        </View>
    )
}

const calStyles = StyleSheet.create({

    calendarContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: PhoneDimensions.window.height * 0.08,
    },

    monthDisplayView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: PhoneDimensions.window.width * 0.06,
    },

    monthSelectorPressable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        backgroundColor: Colors.opaqueWhite
    },

    monthDisplayText: {
        marginRight: PhoneDimensions.window.width * 0.04,
        fontSize: FontSizes.medium_1,
        fontFamily: FontFamilies.Poppins,
    },

    chevron: {
        padding: 10
    },

    rows: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 6,
    },

    column: {
        alignItems: 'center',
        flexDirection: 'column'
    }

})


export const Diary = ({ navigation }: any) => {


    const openDiaryInputScreen = (dateStr: string) => {
        navigation.navigate('DiaryInputScreen', { currentDate: dateStr })
    }


    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>My Diary</Text>

            <CalendarPicker
                onPressDate={openDiaryInputScreen}
            />

            <View style={{ flex: 6 }} />


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: '4%',
        paddingTop: 25,
    },

    headerText: {
        color: Colors.primaryColor,
        fontSize: FontSizes.medium_2,
        fontFamily: FontFamilies.Poppins,
        textAlign: 'center',
    },

})