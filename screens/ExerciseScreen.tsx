import { Alert, Text, View, StyleSheet, FlatList, Pressable, } from "react-native";
import React from 'react';
import { useState } from "react";
import { CustomButton } from "../components/CustomButton";
import { Colors } from "../resources/colors";
import { DefaultPadding, FontFamilies, FontSizes, DefaultShadow, ToastDuration } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { ActivitiesStrings } from "../resources/strings";
import { TextInput} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { keyDateToStringDate } from "../resources/common";
import store from "../redux.store/configureStore";
import { getJournalEntryByDate, saveJournalEntry } from "../dao/journalEntryDAO";
import { ExerciseRecord, JournalEntry } from "../models/JournalEntryModel";
import { useToast } from "react-native-fast-toast";
import { updateHistoryJournalEntries } from '../redux.store/actions/journalActions/creators';


const { elevation, shadowOpacity, shadowColor, shadowOffset } = DefaultShadow;

interface ExerciseItem {
    key: string,
    description: string,
    comments: string,
}

export const ExerciseCard = (props: any) => {

    const item = props.item.item;
    const index = props.item.index;
    // let selectedIndex = props.selectedIndex;
    let isPressed  = props.isPressed;

    const onEdit = () => {
        props.onEdit(index);
    }
    const onDelete = props.onDelete;   

    const onSelect = () => {

        if (!isPressed) {
            props.onSelect(index);
        }
        else {
            props.onSelect(-1);
        }

    }

    return (
        <Pressable
            style={[styles.itemView, { borderColor: Colors.exerciseCircle, borderWidth: isPressed ? 2 : 0 }]}
            onPress={() => onSelect()}
            
        >
            <View style={styles.descriptionView}>
                <Text style={[styles.generalText, { color: Colors.deepBlue }]}>{ActivitiesStrings.exerciseDescription}</Text>
                <Text style={[styles.generalText, { flexShrink: 1 }]}>{item.description}</Text>
            </View>
            {item.comments !== '' && <View style={styles.commentsView}>
                <Text style={[styles.generalText, { color: Colors.deepBlue }]}>
                    {ActivitiesStrings.exerciseComments}
                </Text>
                <Text style={[styles.generalText, { flexShrink: 1 }]}>{item.comments}</Text>
            </View>}

            {isPressed &&
                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginTop: 7 }}>
                    <Pressable
                        onPress={() => onEdit()}
                        style={{ marginRight: 5, flex: 1, paddingVertical: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.deepBlue }}>
                        <Text style={[styles.generalText, { color: Colors.white }]}>{ActivitiesStrings.editButton}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => onDelete(index)}
                        style={{ flex: 1, paddingVertical: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.deepBlue }}>
                        <Text style={[styles.generalText, { color: Colors.white }]}>{ActivitiesStrings.deleteButton}</Text>
                    </Pressable>
                </View>}
        </Pressable>
    )
}

const ExerciseScreen = ({ route, navigation }: any) => {

    let currentDate = route.params.currentDate;
    let journalEntry = route.params.entry;
    if(journalEntry == null) journalEntry = getJournalEntryByDate(currentDate);
    let exerciseItems =  journalEntry?.exerciseRecords || []
    const [items, setItems] = useState<Array<ExerciseItem>>(exerciseItems);
    const [addNewMode, setAddNewMode] = useState<boolean>(false);
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(-1);

    const [description, setDescription] = useState('');
    const [comment, setComment] = useState<string>('');

    const toast = useToast()
    const showToast = (message: string) => {

        toast.show(message, {
            type: 'normal',
            placement: 'bottom',
            duration: ToastDuration,
            animationType: 'slide-in'
        })
    }


    const deleteItem = (index: number) =>
        Alert.alert(
            "Confirmation:",
            "Would you like to delete this entry?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK", onPress: () => {
                        let newItems = [...items]
                        newItems.splice(index, 1);

                        newItems.forEach((item, index) => item.key = index.toString());
                        setItems(newItems);
                        setEditIndex(-1);
                    }
                }
            ]
        );

    const handleAddExercise = (index?: number) => {

        if (index != undefined) {
            //Edit mode
            setEditIndex(index);
            if (!editMode) {
                setEditMode(true);
                let ex = items[index];
                setDescription(ex.description);
                setComment(ex.comments);
            }

        }
        else {

            if (editMode) {
                if (description.trim() !== '') {
                    //Save changes
                    let exerciseItem: ExerciseItem = {
                        key: items[editIndex].key,
                        description: description.trim(),
                        comments: comment.trim(),
                    }
                    let newItems = [...items];
                    newItems[editIndex] = exerciseItem;
                    setItems(newItems);
                    setDescription('');
                    setComment('');
                    setEditIndex(-1);
                    setEditMode(false);
                }
                else if (comment.trim() !== '') {
                    //typed comment without description
                    alert('You must enter a description');
                }
                else {
                    //No content
                    setDescription('');
                    setComment('');
                    setEditMode(false)
                }
            }
            //add mode
            else if (!addNewMode) {
                setAddNewMode(true);
                // return;
            }
            else {
                if (description.trim() !== '') {
                    //Add new exercise to the list
                    let exerciseItem: ExerciseItem = {
                        key: (items.length + 1).toString(),
                        description: description.trim(),
                        comments: comment.trim(),
                    }
                    let newItems = [...items, exerciseItem]
                    setItems(newItems);
                    setDescription('');
                    setComment('');
                    setAddNewMode(false);
                }
                else if (comment.trim() !== '') {
                    //typed comment without description
                    alert('You must enter a description');
                }
                else {
                    //No content
                    setDescription('');
                    setComment('');
                    setAddNewMode(false)
                }
            }


        }

    }

    const onSelectCard = (index: number) => {
        setEditIndex(index);
    }

    const onPressSave = () => {
        let dbDate = currentDate
        let targetEntry : any = null
        let exerciseRecords : ExerciseRecord[] = []
        for(let item of items){
            let rec = new ExerciseRecord(item.description, item.comments)
            exerciseRecords.push(rec)
        }

        if (journalEntry != null) {
            targetEntry = journalEntry;
            targetEntry?.setExerciseRecords(exerciseRecords)
        }
        //save new entry if not found
        else{        
            targetEntry = new JournalEntry(dbDate, [], exerciseRecords)            
        }

        
        if(route.params.entry != null) store.dispatch(updateHistoryJournalEntries(targetEntry))
        saveJournalEntry(targetEntry, () => showToast('Record updated successfully'))
        navigation.pop()
        
    }

    return (
        <SafeAreaView
            style={styles.container}
        >

            <Text style={styles.screenTitle}>{ActivitiesStrings.exerciseTrackerTitle}</Text>

            <Text style={styles.currentDateText}>{keyDateToStringDate(currentDate)}</Text>

            <View style={{ width: '100%', marginTop: PhoneDimensions.window.width * 0.06 }}>
                {(editMode || addNewMode) &&
                    <View style={styles.enterExerciseView}>
                        <TextInput
                            style={styles.descriptionInput}
                            value={description}
                            placeholder={ActivitiesStrings.exerciseDescPlaceholder}
                            onChangeText={(text) => setDescription(text)}
                        />
                        <TextInput
                            style={styles.commentInput}
                            value={comment}
                            placeholder={ActivitiesStrings.exerciseCommentPlaceholder}
                            onChangeText={(text) => setComment(text)}
                            multiline={true}
                            scrollEnabled={true}
                            textAlignVertical="top"
                        />
                    </View>
                }

                <CustomButton
                    label={(editMode || addNewMode) ? ActivitiesStrings.exerciseDoneAdding : ActivitiesStrings.exerciseAddButton}
                    roundCorners={true}
                    onPress={() => handleAddExercise()}
                    width={PhoneDimensions.window.width - 2 * DefaultPadding}
                />
            </View>
            <View style={{ width: '100%', flex: 1 }} />

            <View style={{ width: '100%', flex: 5, }}>
               { (!editMode) && <FlatList
                    data={items}
                    contentContainerStyle={{ paddingHorizontal: shadowOffset.width + 2, paddingVertical: shadowOffset.height + 2 }}
                    keyExtractor={(_item, index) => index.toString()}
                    renderItem={(item) => <ExerciseCard item={item} onSelect={onSelectCard} onEdit={handleAddExercise} onDelete={deleteItem} selectedIndex={editIndex} isPressed={item.index == editIndex}/>}
                />}
            </View>
            <View style={{ width: '100%', flex: 1 }} />
            <View style={styles.buttonsView}>
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
        </SafeAreaView>
    )
}

export default ExerciseScreen;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: DefaultPadding,
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

    enterExerciseView: {
        width: '100%',
        marginBottom: 40,
    },

    descriptionInput: {
        height: PhoneDimensions.window.width / 10,
        borderBottomColor: Colors.darkGray,
        borderBottomWidth: 1.5,
        marginBottom: PhoneDimensions.window.width * 0.04,
        fontFamily: FontFamilies.Verdana,
        fontSize: FontSizes.small_2,
        paddingHorizontal: 7,
    },

    commentInput: {
        backgroundColor: Colors.opaqueWhite,
        width: '100%',
        minHeight: PhoneDimensions.window.width / 4,
        maxHeight: PhoneDimensions.window.width / 2,
        borderWidth: 1.5,
        borderColor: Colors.darkGray,
        borderRadius: 5,
        paddingHorizontal: 7,
        paddingVertical: 7,
        fontFamily: FontFamilies.Verdana,
        fontSize: FontSizes.small_2,
    },

    itemView: {
        width: '100%',
        paddingVertical: 7,
        paddingHorizontal: 10,
        marginBottom: 7,
        borderRadius: 10,
        shadowColor: shadowColor,
        shadowOpacity: shadowOpacity,
        shadowOffset: shadowOffset,
        elevation: elevation,
        backgroundColor: Colors.opaqueWhite,
    },

    descriptionView: {
        flexDirection: 'column',
        // alignItems: 'center',
        width: '100%',
    },

    commentsView: {
        marginTop: 10,
        flexDirection: 'column',
    },

    generalText: {
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.small_2,
        color: Colors.fontColor,
    },



    buttonsView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
    }

});