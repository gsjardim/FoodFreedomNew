
import React from 'react'
import { Image, Text, View, StyleSheet, Platform } from "react-native";
import { useState } from "react";
import { CustomButton } from "../components/CustomButton";
import { Colors } from "../resources/colors";
import { DefaultPadding, FontFamilies, FontSizes, StatusBarHeight, ToastDuration } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { ActivitiesStrings } from "../resources/strings";
import { TouchableOpacity } from "react-native-gesture-handler";
import { minusButton, plusButton, glassWater } from "../resources/imageObj";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { keyDateToStringDate} from "../resources/common";
import store from "../redux.store/configureStore";
import { JournalEntry, WaterRecord } from "../models/JournalEntryModel";
import { getJournalEntryByDate, saveJournalEntry } from "../dao/journalEntryDAO";
import { useToast } from "react-native-fast-toast";
import { updateHistoryJournalEntries } from '../redux.store/actions/journalActions/creators';

const glassesAreaHeight = PhoneDimensions.window.height * 0.3;
const glassesImgHeight = (PhoneDimensions.window.width / 6) * 0.88;

const WaterScreen = ({ route, navigation }: any) => {

    //Insets for IOS
    let insets = useSafeAreaInsets()

    let currentDate = route.params.currentDate;
    let journalEntry = route.params.entry;
    if (journalEntry == null) journalEntry = getJournalEntryByDate(currentDate);
    let waterQuantity = journalEntry?.waterRecord?.quantity || 0;
    const [numberOfGlasses, setNumberOfGlasses] = useState(waterQuantity);

    const toast = useToast()
    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }

    const setQuantity = (mode: string) => {
        let qty: number = 0;
        if (mode === 'add') {
            qty = numberOfGlasses + 1;
        }
        else {
            if (numberOfGlasses > 0)
                qty = numberOfGlasses - 1;
        }
        setNumberOfGlasses(qty)
    }

    const waterGlassesArray = () => {


        let limit: number = 0;
        let numRows = Math.ceil(numberOfGlasses / 6);
        let fullView: any;
        let rows : Array<any>= [];

        for (let row = 0; row < numRows; row++) {
            let rowView: any;
            let rowImages : Array<any>= [];
            let rowLimit = 0;
            while (rowLimit < 6) {
                if (limit < numberOfGlasses) {
                    rowImages.push(
                        <Image source={glassWater} style={styles.waterGlassesImage} key={limit.toString()} />
                    )
                }
                else {
                    break;
                }
                limit++;
                rowLimit++;

            }
            rowView = <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} key={row.toString()}>{rowImages}</View>

            if (limit <= 18) rows.push(rowView);
        }



        fullView = <View style={{ flex: 1, justifyContent: 'center' }}>{rows}</View>
        return fullView;

    }

    const onPressSave = () => {
        let dbDate = currentDate
        let targetEntry : any = null
        if (journalEntry != null) {
            targetEntry = journalEntry;
            targetEntry.setWaterQuantity(numberOfGlasses);
        }

        // save new entry if not found
        else {
            targetEntry = new JournalEntry(dbDate)
            targetEntry.waterRecord = new WaterRecord(numberOfGlasses)
        }

        //Save entry and close
        if(route.params.entry != null) store.dispatch(updateHistoryJournalEntries(targetEntry))
        saveJournalEntry(targetEntry, () => showToast('Record updated successfully'))
        navigation.pop()

    }

    return (
        <View style={styles.container}>

            <Text style={styles.screenTitle}>{ActivitiesStrings.waterTrackerTitle}</Text>

            <Text style={styles.currentDateText}>{keyDateToStringDate(currentDate)}</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.userInquiryText}>{ActivitiesStrings.waterTrackerQuestion}</Text>
            <View style={{ flex: 1 }} />
            <View style={styles.setQuantityView}>
                <TouchableOpacity onPress={() => setQuantity('minus')}>
                    <Image source={minusButton} style={styles.plusMinusButton} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{numberOfGlasses}</Text>
                <TouchableOpacity onPress={() => setQuantity('add')}>
                    <Image source={plusButton} style={styles.plusMinusButton} />
                </TouchableOpacity>
            </View>

            <View style={styles.waterGlassesArea}>
                {waterGlassesArray()}
            </View>

            <View style={[styles.buttonsView, { paddingBottom: Platform.OS === 'ios' ? insets.bottom + DefaultPadding : DefaultPadding }]}>
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

        </View>
    )
}

export default WaterScreen;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: DefaultPadding,
        paddingTop: DefaultPadding + StatusBarHeight,
        alignItems: 'center'
    },

    screenTitle: {
        fontFamily: FontFamilies.Verdana,
        fontSize: FontSizes.large_1,
        color: Colors.fontColor,
        marginBottom: PhoneDimensions.window.width * 0.06,
    },

    currentDateText: {
        color: Colors.primaryColor,
        fontFamily: FontFamilies.Verdana,
        fontSize: FontSizes.medium_2,
    },

    userInquiryText: {
        color: Colors.darkGray,
        fontFamily: FontFamilies.Verdana,
        fontSize: FontSizes.medium_2,
    },

    setQuantityView: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    quantityText: {
        fontSize: PhoneDimensions.window.width * 0.13,
        color: Colors.fontColor,
        marginHorizontal: PhoneDimensions.window.width * 0.1,
    },

    plusMinusButton: {
        height: PhoneDimensions.window.width * 0.1,
        resizeMode: 'contain',
    },

    waterGlassesArea: {
        height: glassesAreaHeight,
        width: '100%',
        marginVertical: 20,
    },

    waterGlassesImage: {
        height: glassesImgHeight,
        width: glassesImgHeight,
        minHeight: 25,
        minWidth: 25,
    },

    buttonsView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }

});