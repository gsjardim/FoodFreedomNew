import { Image, Text, View, StyleSheet, Pressable, Platform, Alert, Modal, LogBox } from "react-native";
import React from 'react';
import { useEffect, useState } from "react";
import { CustomButton } from "../components/CustomButton";
import { Colors } from "../resources/colors";
import { DefaultPadding, FontFamilies, FontSizes, StatusBarHeight, DefaultShadow, ToastDuration, MEAL_REMINDER_THRESHOLD, DEFAULT_TIMER } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { ActivitiesStrings, NotificationsStrings } from "../resources/strings";
import { FlatList, ScrollView, TextInput, TouchableOpacity } from "react-native-gesture-handler";
import Ionicons from '@expo/vector-icons/Ionicons'
import CustomDropDown from "../components/CustomDropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sadFaceSelected, fairFaceSelected, happyFaceSelected, minusButton, plusButton } from "../resources/imageObj";
import { RoundCheckbox } from "../components/RoundCheckbox";
import { compareDates, get12hourFormatTime, keyDateToDate, keyDateToStringDate, stringDateToKeyDate, stringTimeToKeyTime, stringToDate, stringToTime } from "../resources/common";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { physicalFeelings, mentalFeelings } from "../resources/constants";
import { FoodMoodJournal } from "../models/JournalEntryModel";
import { PHYSICAL_BEFORE, PHYSICAL_AFTER, MENTAL_BEFORE, MENTAL_AFTER, EMONTIONAL_BEFORE, EMOTIONAL_AFTER, neutralMenuOption } from "../resources/constants";
import FeelingsWheel from "../components/FeelingsWheel";
import FaceSelector from "../components/FaceSelector";
import store from "../redux.store/configureStore";
import { JournalEntry } from "../models/JournalEntryModel";
import { getJournalEntryByDate, saveJournalEntry, setJournalEntryPictureUrl } from "../dao/journalEntryDAO";
import { useToast } from "react-native-fast-toast";
import { deleteImageFromStorageByUrl, downloadImageFromStorage, uploadImageToStorage } from "../dao/storageDAO";
import UserModel from "../models/UserModel";
import { JOURNAL_REF } from "../dao/databaseCommon";
import { updateHistoryJournalEntries } from "../redux.store/actions/journalActions/creators";
import * as Notifications from "expo-notifications";
import { getStorageData, SETTINGS } from "../dao/internalStorage";
import EmptyDialog from "../components/EmptyDialog";
import { getNotificationsPermissionCurrentStatus, requestNotificationsPermissionsAndSavePushToken } from "../resources/notificationHelper";
import report from "../components/CrashReport";

//Here is the intended flow:

/**
 * 1 - User clicks on add new and fills out the form. Mandatory fields are "description" and "This meal made me feel" face grade (Only if meal is in the past).
 * 1.1 - If meal time is within the last 5 minutes, the section "How I felt after my meal" will be hidden / disabled. If earlier than 5 minutes
 * The section will be available to be completed.
 * 2 - When user clicks Add, the record with all its information is saved in the element's state (array) temporarily.
 * 3 - The new items will show on the flatlist, where they can be edited / deleted if desired.
 * 4 - When the user presses the screen's "Save" button, if there are any pictures, those are uploaded to the storage first,
 * the file path is retrived and stored with the record, all records in the array are saved to the database, for that date. If the record
 * already has a picture linked, it will be replaced by the new one, or deleted if there is no picture.
 * 4.1 - If the record was added in the last 5 minutes, the app will prompt the user to set a reminder for after the meal. The reminder will
 * be a notification for the user to complete his feelings after the meal. * 
 * 5 - When the screen loads, it will load all records for the specific date, downloading any pictures linked to each record.
 * 
 */

//Control constants
export const checkMarkSize = PhoneDimensions.window.width / 13;
const ADD_FROM_GALLERY = 1;
const CAMERA = 2;
const EMPTY_FLAG = 'empty';
const PLUS_BUTTON_SIZE = PhoneDimensions.window.width * 0.08;

/**
 * Organization of this file:
 * 1. FoodMoodScreen - Main parent component
 * 2. FoodMoodJournal Card - Component that holds information for each meal added to the array
 * 3. FMJournalForm - Form where user inputs the information for each meal.
 */

/**
 * ***********************************************************************************************************
 * 1 - FoodMoodScreen - Main parent component
 * ***********************************************************************************************************
 */
const FoodMoodScreen = ({ route, navigation }: any) => {



    let insets = useSafeAreaInsets()
    let currentDate = route.params.currentDate;
    let journalEntry = route.params.entry;
    if (journalEntry == null) journalEntry = getJournalEntryByDate(currentDate);
    let fmRecords = journalEntry?.foodMoodRecords || []


    const [addMode, setAddMode] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [fmjArray, setFmjArray] = useState<FoodMoodJournal[]>(fmRecords);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [deleteImages, setDeletedImages] = useState<string[]>([])
    const [showMealReminderDialog, setShowMealReminderDialog] = useState(false);
    const [mealReminderTimer, setMealReminderTimer] = useState(0);

    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
        async function getTimer() {
            return await getStorageData(SETTINGS).then(value => { if (value != null) { return parseInt(JSON.parse(value).mealReminder) } else return DEFAULT_TIMER });
        }
        getTimer().then(value => setMealReminderTimer(value))
    }, [])

    const handleAddEntry = (fmjObj: FoodMoodJournal) => {
        setSelectedIndex(-1);
        let newArray;
        if (editMode) {
            newArray = [...fmjArray]
            newArray[selectedIndex] = fmjObj;
            setEditMode(false);
        }
        else {
            fmjObj.date = currentDate;
            newArray = [...fmjArray, fmjObj]
            setAddMode(false);
        }
        newArray.sort((a, b) => stringToTime(a.time, currentDate).getTime() - stringToTime(b.time, currentDate).getTime());
        setFmjArray(newArray);
    }

    const onSelectCard = (index: number) => {
        setSelectedIndex(index);
    }

    const onPressEditCard = () => {
        setEditMode(true);
    }

    const onPressDeleteCard = () => {
        Alert.alert("Confirmation", "Are you sure you want to delete this record?", [
            {
                text: 'Yes',
                style: 'default',
                onPress: () => {
                    let newItems = [...fmjArray]
                    let deletedItem = newItems.splice(selectedIndex, 1);
                    let deletedImage = deletedItem[0].pictureUri !== '' ? deletedItem[0].pictureUri : EMPTY_FLAG
                    let deletedImages = [...deleteImages, deletedImage]

                    setDeletedImages(deletedImages)
                    setFmjArray(newItems);
                    setSelectedIndex(-1);
                }
            },
            {
                text: 'Cancel',
                style: 'cancel'
            }
        ])
    }

    const onCancelForm = () => {
        setAddMode(false);
        setEditMode(false);
        setSelectedIndex(-1);
    }

    const onDeleteExistingPicture = (imageUrl: string) => {
        let deletedImageArr = [...deleteImages, imageUrl]
        setDeletedImages(deletedImageArr)
    }

    const toast = useToast()
    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }

    const onPressSave = async () => {

        if (fmjArray.length == 0 && deleteImages.length == 0) {
            navigation.pop()
            return;
        }

        //If there are any pictures on the screen, they have to be uploaded first to generate a url, and then save that with the food mood record
        //While uploading the pictures, show an activity bar on the screen
        let currentUser: UserModel = store.getState().users.currentUser;
        let storageReference = '/images/' + currentUser?.id + '/';
        let dbDate = currentDate
        let targetEntry: any = null
        // let exists = false

        if (journalEntry != null) {
            targetEntry = journalEntry;
            targetEntry.setFoodMoodRecords(fmjArray)
        }
        //save new entry if not found
        else {
            targetEntry = new JournalEntry(dbDate, fmjArray)
        }

        //This is only when the entry is a history entry
        if (route.params.entry != null) store.dispatch(updateHistoryJournalEntries(targetEntry))

        saveJournalEntry(targetEntry, () => {

            for (let fmj of fmjArray) {
                if (fmj.pictureUri !== '' && !fmj.pictureUri?.includes('http')) {
                    console.log('FoodMoodScreen - Saving image to storage')
                    let dbTime = stringTimeToKeyTime(fmj.time, fmj.date)
                    let imageStoragePath = storageReference + dbDate + '_' + dbTime + '.jpeg'
                    const ref = JOURNAL_REF + '/' + currentUser.id + '/' + dbDate + '/foodMoodRecords/' + fmjArray.indexOf(fmj).toString() + '/pictureUri';
                    uploadImageToStorage(fmj.pictureUri, imageStoragePath, (url: string) => setJournalEntryPictureUrl(ref, url))
                }
            }

        })

        for (let img of deleteImages) {
            if (img.includes('http')) {
                console.log('Deleting image from storage: ' + img)
                deleteImageFromStorageByUrl(img)
            }
        }

        //check if there is a meal now, so that the reminder is triggered
        let isThereMealNow = false;

        if (route.params.entry == null) { //Only when not editing a history entry

            for (let fmj of fmjArray) {
                if (stringToTime(fmj.time, currentDate).getTime() > (new Date().getTime() - (MEAL_REMINDER_THRESHOLD * 60 * 1000))) {
                    isThereMealNow = true;
                }
            }
            if (isThereMealNow) {
                //Open accept reminder dialog
                setShowMealReminderDialog(true)
            }
        }

        !isThereMealNow && showToastAndClose()


    }

    const showToastAndClose = () => {
        showToast('Record updated successfully')
        setShowMealReminderDialog(false)
        navigation.pop()
    }

    return (

        // <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView contentContainerStyle={[styles.container, { paddingBottom: Platform.OS === 'ios' ? insets.bottom + DefaultPadding : DefaultPadding }]} scrollEnabled={false} >

            {/* This is the meal reminder dialog displayed when user presses Save (depending on meal time) */}
            <EmptyDialog
                showModal={showMealReminderDialog}
                dialogWidth={'85%'}
                content={
                    <View >
                        <Text style={[styles.generalText, { alignSelf: 'center', marginBottom: 10, fontSize: FontSizes.medium_1, color: Colors.primaryColor }]}>
                            {ActivitiesStrings.mealReminderTitle}
                        </Text>
                        <Text style={[styles.generalText, { flexShrink: 1 }]}>
                            {ActivitiesStrings.mealReminderText}
                        </Text>

                        <View style={{ flexDirection: 'row', width: '100%', marginVertical: 20, alignItems: 'center', justifyContent: 'center' }}>
                            <Pressable onPress={() => {
                                if (mealReminderTimer > 1) setMealReminderTimer(mealReminderTimer - 1)
                            }}>
                                <Image source={minusButton} style={{ width: PLUS_BUTTON_SIZE, height: PLUS_BUTTON_SIZE }} />
                            </Pressable>
                            <Text style={{
                                marginHorizontal: PhoneDimensions.window.width * 0.07,
                                fontFamily: FontFamilies.Poppins,
                                fontSize: FontSizes.medium_1
                            }}>{mealReminderTimer + ' minutes'}
                            </Text>
                            <Pressable onPress={() => setMealReminderTimer(mealReminderTimer + 1)}>
                                <Image source={plusButton} style={{ width: PLUS_BUTTON_SIZE, height: PLUS_BUTTON_SIZE }} />
                            </Pressable>
                        </View>

                        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            <Pressable
                                style={[styles.dialogButton, { marginRight: 12 }]}
                                onPress={() => {

                                    Notifications.scheduleNotificationAsync({
                                        content: {
                                            title: NotificationsStrings.mealReminderTitle,
                                            body: NotificationsStrings.mealReminder,
                                        },
                                        trigger: {
                                            channelId: 'Default',
                                            seconds: 60 * mealReminderTimer,
                                        }
                                    })
                                    showToastAndClose()
                                }}
                            >
                                <Text style={[styles.generalText, { flexShrink: 1, textAlign: 'center', fontWeight: 'bold' }]}>{ActivitiesStrings.buttonAccept}</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => showToastAndClose()}
                                style={styles.dialogButton}
                            >
                                <Text style={[styles.generalText, { flexShrink: 1, textAlign: 'center', fontWeight: 'bold' }]}>{ActivitiesStrings.buttonDecline}</Text>
                            </Pressable>
                        </View>
                    </View>
                }
            />


            <Text style={styles.screenTitle}>{ActivitiesStrings.fmTitle}</Text>
            <Text style={styles.currentDateText}>{keyDateToStringDate(currentDate)}</Text>
            {addMode || editMode ?
                <FMJournalForm
                    onPressAdd={handleAddEntry}
                    onCancel={onCancelForm}
                    data={selectedIndex > -1 ? fmjArray[selectedIndex] : null}
                    currentDate={currentDate}
                    onDeletePicture={(url: string) => onDeleteExistingPicture(url)}
                />
                :
                <View style={{ flex: 1 }}>
                    <CustomButton
                        label={ActivitiesStrings.fmAddNewLabel}
                        roundCorners={true}
                        onPress={() => setAddMode(!addMode)}
                        width={PhoneDimensions.window.width - 2 * DefaultPadding}
                    />

                    <FlatList
                        data={fmjArray}
                        keyExtractor={(_item, index) => index.toString()}
                        style={{ marginVertical: 20, }}
                        renderItem={(obj) => <FoodMoodJournalCard item={obj} onSelect={onSelectCard} onEdit={onPressEditCard} onDelete={onPressDeleteCard} isPressed={selectedIndex == obj.index} />}
                        contentContainerStyle={{ paddingHorizontal: shadowOffset.width + 2, paddingVertical: shadowOffset.height + 2 }}
                    />

                    <View style={{ width: '100%', flex: 1 }} />
                    <View style={[styles.buttonsView, {}]}>
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
            }
        </KeyboardAwareScrollView>
    )
}

export default FoodMoodScreen;

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
        marginBottom: PhoneDimensions.window.width * 0.04,
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

        width: PhoneDimensions.window.width - (2 * DefaultPadding),
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },

    dialogButton: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        paddingHorizontal: 5,
        paddingVertical: 7,
        borderRadius: 3
    }

});
//****************************************************************************************************************************
//****************************************************************************************************************************


/**
 * **************************************************************************************************************************
 * 2 - FoodMoodJournal Card - Component that holds information for each meal added to the array
 * **************************************************************************************************************************
 */
const { elevation, shadowOpacity, shadowColor, shadowOffset } = DefaultShadow;

export const FoodMoodJournalCard = (props: any) => {

    const isPressed = props.isPressed;

    const item = props.item.item
    const index = props.item.index
    const onEdit = props.onEdit
    const onDelete = props.onDelete

    const [picture, setPicture] = useState(item.pictureUri);

    const onSelect = () => {

        if (!isPressed) {
            props.onSelect(index);

        }
        else {
            props.onSelect(-1);
        }

    }

    return (
        <View style={{
            width: '100%',
            paddingVertical: 7,
            paddingHorizontal: 10,
            marginBottom: 10,
            borderRadius: 10,
            shadowColor: shadowColor,
            shadowOpacity: shadowOpacity,
            shadowOffset: shadowOffset,
            elevation: elevation,
            backgroundColor: Colors.opaqueWhite,
            borderWidth: isPressed ? 2 : 0,
            borderColor: Colors.exerciseCircle,
        }}>
            <Pressable onPress={() => onSelect()}>
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={[styles.generalText, { color: Colors.deepBlue }]}>Time: {item.time}</Text>
                </View>
                <View style={{ flexDirection: 'row', width: '100%', marginVertical: 10, alignItems: 'center' }}>
                    <Text style={[styles.generalText, { flexShrink: 1, flex: 1 }]}>Description: {item.description}</Text>
                    {(picture !== '') && <Image source={{ uri: picture }} style={{ width: PhoneDimensions.window.width / 4, height: PhoneDimensions.window.width / 4, marginLeft: 8, borderRadius: PhoneDimensions.window.width * 0.03 }} />}
                </View>

                {(item.physicalBefore !== neutralMenuOption || item.mentalBefore !== neutralMenuOption || item.emotionBefore !== neutralMenuOption) &&
                    <View>
                        <Text style={[styles.generalText, { color: Colors.deepBlue }]}>How I felt before my meal:</Text>
                        {(item.physicalBefore !== neutralMenuOption) && <Text style={styles.generalText}>Physically: {item.physicalBefore}</Text>}
                        {(item.mentalBefore !== neutralMenuOption) && <Text style={styles.generalText}>Mentally: {item.mentalBefore}</Text>}
                        {(item.emotionBefore !== neutralMenuOption) && <Text style={styles.generalText}>Emotionally: {item.emotionBefore}</Text>}
                    </View>}

                {(item.physicalAfter !== neutralMenuOption || item.mentalAfter !== neutralMenuOption || item.emotionAfter !== neutralMenuOption) &&
                    <View style={{ width: '100%', marginTop: 8, marginBottom: 10 }}>
                        <Text style={[styles.generalText, { color: Colors.deepBlue }]}>How I felt after my meal:</Text>
                        {(item.physicalAfter !== neutralMenuOption) && <Text style={styles.generalText}>Physically: {item.physicalAfter}</Text>}
                        {(item.mentalAfter !== neutralMenuOption) && <Text style={styles.generalText}>Mentally: {item.mentalAfter}</Text>}
                        {(item.emotionAfter !== neutralMenuOption) && <Text style={styles.generalText}>Emotionally: {item.emotionAfter}</Text>}
                    </View>}

                {(item.rate !== '') && <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                    <Text style={styles.generalText}>This meal made me feel:</Text>
                    <Image source={item.rate === 'happy' ? happyFaceSelected : item.rate === 'fair' ? fairFaceSelected : sadFaceSelected}
                        style={{ width: PhoneDimensions.window.width * 0.06, height: PhoneDimensions.window.width * 0.06, marginLeft: 15 }}
                    />
                </View>}

                {(item.comments !== '') && <View>
                    <Text style={styles.generalText}>Comments: {item.comments}</Text>
                </View>}

            </Pressable>

            {isPressed &&
                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginTop: 7 }}>
                    <Pressable
                        onPress={() => onEdit(true)}
                        style={{ marginRight: 5, flex: 1, paddingVertical: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.deepBlue }}>
                        <Text style={[styles.generalText, { color: Colors.white }]}>{ActivitiesStrings.editButton}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => onDelete()}
                        style={{ flex: 1, paddingVertical: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.deepBlue }}>
                        <Text style={[styles.generalText, { color: Colors.white }]}>{ActivitiesStrings.deleteButton}</Text>
                    </Pressable>
                </View>}
        </View>
    )
}


//****************************************************************************************************************************
// ***************************************************************************************************************************
//****************************************************************************************************************************




/**
 * 3 - FMJournalForm - Form where user inputs the information for each meal.
 */
export const FMJournalForm = (props: any) => {

    const data: FoodMoodJournal = props.data;
    const currentDate = props.currentDate;
    const onDeletePicture = props.onDeletePicture
    const hasFeelingsBefore = (data != null) && ((data.physicalBefore !== neutralMenuOption) || (data.mentalBefore !== neutralMenuOption) || (data.emotionBefore !== neutralMenuOption))
    const hasComments = (data != null) && (data.comments !== '')
    const [pictBtnPressed, setPictBtnPressed] = useState(false);
    const [status, requestPermission] = ImagePicker.useCameraPermissions();
    const [showPictureWindow, setShowPictureWindow] = useState(false);
    const [showFeelingsBefore, setShowFeelingsBefore] = useState(hasFeelingsBefore);
    const [showCommentsInput, setShowCommentsInput] = useState(hasComments);
    const [descriptionFocused, setDescriptionFocused] = useState(false);
    const [commentsFocused, setCommentsFocused] = useState(false);
    const [isPickerShow, setIsPickerShow] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showWheel, setShowWheel] = useState(false);
    const [modalData, setModalData] = useState<string[]>([]);
    const [currentModalOption, setCurrentModalOption] = useState(0);
    //Food Mood Journal object values

    const [foodDescription, setFoodDescription] = useState(data != null ? data.description : '');
    const [comments, setComments] = useState(data != null ? data.comments : '');
    const [selectedFace, setSelectedFace] = useState(data != null ? data.rate : '');
    const [mealTime, setMealTime] = useState(data != null ? stringToTime(data.time, data.date) : keyDateToDate(currentDate));
    const [pictureUri, setPictureUri] = useState(data != null ? data.pictureUri : '');
    const [pb, setPb] = useState(data != null ? data.physicalBefore : neutralMenuOption);
    const [mb, setMb] = useState(data != null ? data.mentalBefore : neutralMenuOption);
    const [eb, setEb] = useState(data != null ? data.emotionBefore : neutralMenuOption);
    const [pa, setPa] = useState(data != null ? data.physicalAfter : neutralMenuOption);
    const [ma, setMa] = useState(data != null ? data.mentalAfter : neutralMenuOption);
    const [ea, setEa] = useState(data != null ? data.emotionAfter : neutralMenuOption);

    let isMealNow = mealTime.getTime() > (new Date().getTime() - (MEAL_REMINDER_THRESHOLD * 60 * 1000))
    const onClosePictureWindow = () => setShowPictureWindow(false);

    const addFoodMoodJournalObject = () => {
        let validInfo = (isMealNow && foodDescription?.trim() !== '') || (!isMealNow && foodDescription?.trim() !== '' && selectedFace !== '')
        if (validInfo) {

            let fmjObj = new FoodMoodJournal(
                data != null ? data.date : '',
                get12hourFormatTime(mealTime),
                pb, mb, eb, pa, ma, ea,
                foodDescription,
                pictureUri,
                selectedFace,
                comments
            );
            props.onPressAdd(fmjObj);
        }
        else {
            Alert.alert('Message:',
                ActivitiesStrings.minimumInfo);
        }
    }

    const FeelingSelectorBox = (props: any) => {
        const data = props.data;
        const mode = props.mode;
        let selected = props.label !== ActivitiesStrings.fmPhysicallyLabel && props.label !== ActivitiesStrings.fmMentallyLabel && props.label !== ActivitiesStrings.fmEmtionallyLabel;
        return (
            <TouchableOpacity
                style={[formStyle.feelingSelector, { backgroundColor: selected ? Colors.lightGreen : '#fff' }]}
                onPress={() => props.onPress(mode, data)}
            >
                <Text style={[formStyle.labels, { flexShrink: 1, textAlign: 'justify', fontSize: FontSizes.small_1 }]}>{props.label}</Text>
            </TouchableOpacity>
        )
    }

    const onChangeTime = (event: any, date?: any) => {
        if (Platform.OS === 'android') {
            setIsPickerShow(false);
        }
        if (date != null) {
            if (compareDates(date, new Date()) > 0) {
                Alert.alert('Warning', 'Meal time cannot be greater than the current time.');
            }
            else {
                setMealTime(date);
            }

        }

    };

    const handleOnSelectFeeling = (value: string) => {
        if (value === '') value = neutralMenuOption;
        switch (currentModalOption) {
            case PHYSICAL_BEFORE: setPb(value); break;
            case MENTAL_BEFORE: setMb(value); break;
            case EMONTIONAL_BEFORE: setEb(value); break;
            case PHYSICAL_AFTER: setPa(value); break;
            case MENTAL_AFTER: setMa(value); break;
            case EMOTIONAL_AFTER: setEa(value); break;
        }
        setShowModal(false);
        setShowWheel(false);
    }

    const onCallDropdown = (mode: any, data: any) => {
        setModalData(data);
        setCurrentModalOption(mode);
        setShowModal(true);
    }


    const confirmDeletePicture = () => {
        Alert.alert("Confirmation:", "Do you want really to delete this picture?", [
            {
                text: 'Yes',
                style: 'default',
                onPress: () => {
                    onDeletePicture(pictureUri)
                    setPictureUri('');
                    setPictBtnPressed(false);
                }
            },
            {
                text: 'No',
                style: 'cancel',
            }
        ]);

    }

    const takeAndSetPicture = async (mode?: number) => {


        let result: ImagePicker.ImagePickerResult;
        try {
            if (mode === ADD_FROM_GALLERY) {

                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 4],
                    quality: 1,
                });

            }
            else {
                if (status?.granted) {
                    result = await ImagePicker.launchCameraAsync({

                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [4, 4],
                        quality: 1,
                    });
                }
                else {
                    let permission = await requestPermission();
                    permission.granted ?
                        result = await ImagePicker.launchCameraAsync({

                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [4, 4],
                            quality: 1,
                        })
                        :
                        result = null;

                }

            }
            if (result != null && result !== undefined && !result.canceled) {
                setPictureUri(result.assets[0].uri);
            }
        }
        catch (error) {
            report.recordError(error)
        }
        setPictBtnPressed(false);
    }

    const openWheel = (mode: any) => {
        setCurrentModalOption(mode);
        setShowWheel(true)
    }




    return (
        <ScrollView style={formStyle.formWrapper} showsVerticalScrollIndicator={false}  >

            <CustomDropDown
                data={modalData}
                showModal={showModal}
                onSelect={handleOnSelectFeeling}
            />

            <FeelingsWheel
                showModal={showWheel}
                onSelect={handleOnSelectFeeling}
                onCancel={() => { setShowWheel(false) }}

            />

            <View style={formStyle.timeView}>
                <TouchableOpacity onPress={() => setIsPickerShow(!isPickerShow)} style={{ flexDirection: 'row' }}>
                    <Text style={[styles.currentDateText, { color: Colors.deepBlue, fontSize: FontSizes.medium_1 }]}>{ActivitiesStrings.fmTimeLabel} {get12hourFormatTime(mealTime)}</Text>
                    <Ionicons name='pencil' size={25} color={Colors.darkGray} style={{ marginLeft: 20 }} />
                </TouchableOpacity>
            </View>

            {isPickerShow && (
                <DateTimePicker
                    testID="dateTimePickerSettings"
                    value={mealTime}
                    mode={'time'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={false}
                    onChange={onChangeTime}
                    style={{ backgroundColor: '#fff', width: PhoneDimensions.window.width * 0.9, marginBottom: Platform.OS === 'ios' ? 25 : 0 }}
                    textColor={Colors.fontColor}
                    locale="en-CAN"
                />
            )}

            <View style={formStyle.feelingsQuestionView}>
                <RoundCheckbox
                    onPress={setShowFeelingsBefore}
                    isChecked={

                        showFeelingsBefore
                    }
                    size={checkMarkSize}
                />

                <Text style={[formStyle.labels, { flexShrink: 1 }]}>{ActivitiesStrings.fmHowIfeelBeforeOption}</Text>
            </View>

            {showFeelingsBefore &&
                <View style={formStyle.feelingSelectorsView}>
                    <FeelingSelectorBox label={pb === neutralMenuOption ? ActivitiesStrings.fmPhysicallyLabel : pb} onPress={onCallDropdown} data={store.getState().general.physicalFeelingsArray} mode={PHYSICAL_BEFORE} />
                    <FeelingSelectorBox label={mb === neutralMenuOption ? ActivitiesStrings.fmMentallyLabel : mb} onPress={onCallDropdown} data={store.getState().general.mentalFeelingsArray} mode={MENTAL_BEFORE} />
                    <FeelingSelectorBox label={eb === neutralMenuOption ? ActivitiesStrings.fmEmtionallyLabel : eb} onPress={openWheel} mode={EMONTIONAL_BEFORE} />
                </View>}

            <View style={formStyle.foodDescriptionView}>
                <Text style={formStyle.labels}>{ActivitiesStrings.fmFoodDrinkDescription}</Text>
                <TextInput
                    style={[formStyle.foodDescriptionInput, { borderColor: descriptionFocused ? Colors.exerciseCircle : Colors.darkGray }]}
                    multiline={true}
                    scrollEnabled={true}
                    placeholder={"Description..."}
                    textAlignVertical={"top"}
                    onFocus={() => setDescriptionFocused(true)}
                    onBlur={() => setDescriptionFocused(false)}
                    onChangeText={(value) => setFoodDescription(value)}
                    value={foodDescription}
                />
            </View>

            {!pictBtnPressed ?
                <TouchableOpacity style={[formStyle.addPictureButton, { marginBottom: pictureUri !== '' ? 15 : 35 }]} onPress={() => setPictBtnPressed(true)}>
                    <Text style={[formStyle.labels, { color: Colors.darkGray }]}>{pictureUri !== '' ? ActivitiesStrings.fmEditPicture : ActivitiesStrings.fmAddPicture}</Text>
                    <Ionicons name="camera-outline" size={30} color={Colors.primaryColor} style={{ marginLeft: PhoneDimensions.window.width * 0.1, }} />
                </TouchableOpacity> :
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: pictureUri !== '' ? 15 : 35, }}>
                    <Pressable style={formStyle.optionsPictureButton} onPress={() => takeAndSetPicture(ADD_FROM_GALLERY)}>
                        <Text style={[formStyle.labels, { color: Colors.darkGray }]}>{ActivitiesStrings.fmGalleryBtn}</Text>
                    </Pressable >
                    <Pressable style={[formStyle.optionsPictureButton, { marginHorizontal: 5 }]} onPress={() => takeAndSetPicture(CAMERA)}>
                        <Text style={[formStyle.labels, { color: Colors.darkGray }]}>{ActivitiesStrings.fmCameraBtn}</Text>
                    </Pressable>
                    {(pictureUri !== '') &&
                        <Pressable style={[formStyle.optionsPictureButton, { marginRight: 5 }]} onPress={() => confirmDeletePicture()}>
                            <Text style={[formStyle.labels, { color: Colors.darkGray }]}>{ActivitiesStrings.deleteButton}</Text>
                        </Pressable>}

                    <Pressable style={[formStyle.optionsPictureButton, { flex: 1 }]} onPress={() => setPictBtnPressed(false)}>
                        <Text style={[formStyle.labels, { color: 'red' }]}>X</Text>
                    </Pressable>
                </View>}

            {(pictureUri !== '') &&
                <Pressable style={{ width: '100%', alignItems: 'center', marginBottom: 35, }} onPress={() => setShowPictureWindow(true)}>
                    <Image style={formStyle.picture} source={{ uri: pictureUri }} />
                </Pressable>}

            <PictureWindow
                showWindow={showPictureWindow}
                source={{ uri: pictureUri }}
                onPressClose={onClosePictureWindow}
            />

            {/** This section below will show dependent on the time */}
            {!isMealNow && <View>


                <View style={formStyle.feelingsQuestionView}>
                    <Text style={[formStyle.labels, { flexShrink: 1 }]}>{ActivitiesStrings.fmHowIfeelAfter}</Text>
                </View>

                <View style={formStyle.feelingSelectorsView}>
                    <FeelingSelectorBox label={pa === neutralMenuOption ? ActivitiesStrings.fmPhysicallyLabel : pa} onPress={onCallDropdown} data={store.getState().general.physicalFeelingsArray} mode={PHYSICAL_AFTER} />
                    <FeelingSelectorBox label={ma === neutralMenuOption ? ActivitiesStrings.fmMentallyLabel : ma} onPress={onCallDropdown} data={store.getState().general.mentalFeelingsArray} mode={MENTAL_AFTER} />
                    <FeelingSelectorBox label={ea === neutralMenuOption ? ActivitiesStrings.fmEmtionallyLabel : ea} onPress={openWheel} mode={EMOTIONAL_AFTER} />
                </View>

                <View style={formStyle.mealRateView}>
                    <Text style={formStyle.labels}>{ActivitiesStrings.fmMealRateLabel}</Text>
                    <FaceSelector selectedFace={selectedFace} onSelect={setSelectedFace} />
                </View>

                <View style={[formStyle.feelingsQuestionView, { marginTop: 35 }]}>
                    <RoundCheckbox
                        onPress={setShowCommentsInput}
                        isChecked={showCommentsInput}
                        size={checkMarkSize}
                    />
                    <Text style={[formStyle.labels, { flexShrink: 1 }]}>{ActivitiesStrings.fmOtherCommentsLabel}</Text>
                </View>

                {
                    showCommentsInput &&
                    <TextInput
                        style={[formStyle.foodDescriptionInput, { borderColor: commentsFocused ? Colors.exerciseCircle : Colors.darkGray }]}
                        multiline={true}
                        scrollEnabled={true}
                        placeholder={"Enter your comments..."}
                        textAlignVertical={"top"}
                        onFocus={() => setCommentsFocused(true)}
                        onBlur={() => setCommentsFocused(false)}
                        onChangeText={(value) => setComments(value)}
                        value={comments}
                    />}

            </View>}

            <View style={formStyle.actionButtonsView}>
                <CustomButton
                    label={data == null ? ActivitiesStrings.addButton : ActivitiesStrings.saveButton}
                    roundCorners={true}
                    onPress={() => addFoodMoodJournalObject()}
                    width={PhoneDimensions.window.width * 0.35}
                />
                <CustomButton
                    label={ActivitiesStrings.cancelButton}
                    roundCorners={true}
                    onPress={() => props.onCancel()}
                    width={PhoneDimensions.window.width * 0.35}
                />
            </View>


        </ScrollView>
    )
}

/**
 * Renders meal picture in full screen.
 * @param props 
 * @returns 
 */
const PictureWindow = (props: any) => {

    return (
        <Modal
            visible={props.showWindow}
            transparent={true}
            animationType="fade"
        >
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <Image source={props.source} style={{ width: PhoneDimensions.window.width, height: PhoneDimensions.window.width }} />

                <Pressable
                    style={{ marginTop: 40, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => props.onPressClose()}
                >
                    <Ionicons name="close-circle" size={40} color={Colors.white} />
                    {/* <Text style={{fontFamily: FontFamilies.Poppins, fontSize: FontSizes.large_2, color: Colors.white}}>X</Text> */}
                </Pressable>
            </View>
        </Modal>
    )
}



const formStyle = StyleSheet.create({

    formWrapper: {
        width: '100%',
        flex: 1,
    },

    timeView: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 10
    },

    checkMarkPressable: {
        width: (checkMarkSize + 4),
        height: (checkMarkSize + 4),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6
    },

    feelingsQuestionView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },

    labels: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2 * 0.93,
        color: Colors.fontColor,
    },

    feelingSelector: {
        width: (PhoneDimensions.window.width - (2 * DefaultPadding)) / 3.1,
        paddingVertical: PhoneDimensions.window.width * 0.02,
        borderColor: Colors.primaryColor,
        borderRadius: 5,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    feelingSelectorsView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },

    foodDescriptionView: {
        marginTop: 20,
        width: '100%',
    },

    foodDescriptionInput: {
        marginTop: 5,
        width: '100%',
        height: PhoneDimensions.window.height * 0.12,
        borderColor: Colors.darkGray,
        borderWidth: 1.5,
        paddingHorizontal: 7,
        paddingVertical: 10,
        fontFamily: FontFamilies.Verdana,
        fontSize: FontSizes.small_2,
    },

    addPictureButton: {
        flexDirection: 'row',
        width: '100%',
        height: PhoneDimensions.window.width * 0.12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 35,
        backgroundColor: Colors.lightGray,
    },

    optionsPictureButton: {
        flex: 3,
        height: PhoneDimensions.window.width * 0.12,
        backgroundColor: Colors.opaqueWhite,
        alignItems: 'center',
        justifyContent: 'center',
    },

    picture: {
        width: PhoneDimensions.window.width / 2,
        height: PhoneDimensions.window.width / 2,
    },

    mealRateView: {
        marginTop: 25,
        width: '100%',
    },

    commentsView: {

    },

    commentsInput: {

    },

    actionButtonsView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 40,
    }
});

//****************************************************************************************************************************
// ***************************************************************************************************************************

