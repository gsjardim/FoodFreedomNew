import database from '@react-native-firebase/database'
import store from "../redux.store/configureStore";
import { JOURNAL_REF, LAST_ENTRY, setValueToDatabase, USERS_REF } from "./databaseCommon";
import { getJournalEntries, setDiaryJournalEntries } from "../redux.store/actions/journalActions/creators";
import { compareDates, dateToKeyDate, keyDateToDate, isLeapYear } from "../resources/common";
import { DiaryRecord, ExerciseRecord, FoodMoodJournal, JournalEntry, SleepRecord, WaterRecord } from "../models/JournalEntryModel";
import auth from '@react-native-firebase/auth'

export const setUpCachedJournalEntries = (fbUser) => {

    //Loads journal entries into app
    let today = new Date();
    let priorDate = new Date(new Date().setDate(today.getDate() - 32));
    const startDate = dateToKeyDate(priorDate)
    database().ref(JOURNAL_REF + '/' + fbUser.uid).orderByKey().startAt(startDate).on('value', snapshot => {
        const entries = getJournalEntriesFromSnapshot(snapshot)
        store.dispatch(getJournalEntries(entries));
    })
    getDataFromDbAndSetDiaryEntries(today)
}

export const queryJournalEntriesByDateInterval = async (startDate, endDate, callback) => {
    let userId = auth().currentUser.uid
    database().ref(JOURNAL_REF + '/' + userId).orderByKey().startAt(startDate).endAt(endDate).once('value', snapshot => {
        let entries = getJournalEntriesFromSnapshot(snapshot)
        callback(entries)
    })

}
export const getDataFromDbAndSetDiaryEntries = (desiredDate) => {

    const setReduxStoreDiaryEntries = (data) => {
        store.dispatch(setDiaryJournalEntries(data))
    }

    let fromDate = new Date(desiredDate)
    let toDate = new Date(desiredDate)
    fromDate.setDate(1)
    let monthsWith31Days = [1, 3, 5, 7, 8, 10, 12]
    let monthsWith30Days = [4, 6, 9, 11]
    let lastDate = monthsWith30Days.includes(desiredDate.getMonth() + 1) ? 30 : monthsWith31Days.includes(desiredDate.getMonth() + 1) ? 31 : isLeapYear(desiredDate.getFullYear()) ? 29 : 28;
    toDate.setDate(lastDate)
    queryJournalEntriesByDateInterval(dateToKeyDate(fromDate), dateToKeyDate(toDate), setReduxStoreDiaryEntries);
}

export const saveJournalEntry = (entry, callback) => {

    const currentUser = store.getState().users.currentUser
    checkAndUpdateLastUserEntry(entry, currentUser)
    const ref = JOURNAL_REF + '/' + currentUser.id + '/' + entry.date;
    if (entry.isEmpty()) entry = null;
    setValueToDatabase(ref, entry, callback)
        .then(() => {
            if (store.getState().journalEntries.diaryEntries.length > 0 && entry != null) {
                let month = keyDateToDate(entry.date).getMonth();
                let monthD = keyDateToDate(store.getState().journalEntries.diaryEntries[0].date).getMonth();
                if (month == monthD) {
                    getDataFromDbAndSetDiaryEntries(keyDateToDate(entry.date))
                }
            }
        })
        .catch(err => console.error('save Journal Entry caught error: ' + err))
}

const checkAndUpdateLastUserEntry = (newEntry, currentUser) => {
    if (currentUser.lastJournalEntry === '' || compareDates(keyDateToDate(newEntry.date), keyDateToDate(currentUser.lastJournalEntry)) > 0) {
        const ref = USERS_REF + '/' + currentUser.id + '/' + LAST_ENTRY;
        setValueToDatabase(ref, newEntry.date, null);
    }
}

export const getJournalEntryByDate = (date) => {

    let entries = store.getState().journalEntries.entries
    if (entries.length > 0) {
        for (let entry of entries) {
            if (entry.date === date) {
                return entry;
            }
        }
    }

    return null;
}

export const getDiaryEntryByDate = (date) => {

    let entries = store.getState().journalEntries.diaryEntries
    if (entries.length > 0) {
        for (let entry of entries) {
            if (entry.date === date) {
                return entry;
            }
        }
    }

    return null;
}

export const setJournalEntryPictureUrl = (ref, url) => {
    setValueToDatabase(ref, url, () => { })
}


export const getJournalEntriesFromSnapshot = (snapshot) => {

    let entries = []
    let val = snapshot.val()
    //Convert the content of snapshot into an array of JournalEntry objects
    if (val != null) {
        for (let key in val) {

            entries.push(getEntryFromSnapshot(val[key]))
        }
    }

    return entries

}


function getEntryFromSnapshot(obj) {
    let newEntry = new JournalEntry(obj.date);

    if ("waterRecord" in obj) {
        newEntry.waterRecord = new WaterRecord(obj.waterRecord.quantity)
    }

    if ("exerciseRecords" in obj) {
        let records = []
        for (let rec of obj.exerciseRecords) records.push(new ExerciseRecord(rec.description, rec.comments))
        newEntry.exerciseRecords = records
    }

    if ("sleepRecord" in obj) {
        newEntry.sleepRecord = new SleepRecord(obj.sleepRecord.hours, obj.sleepRecord.grade, obj.sleepRecord.comments)
    }

    if ("foodMoodRecords" in obj) {
        let records = []
        for (let rec of obj.foodMoodRecords) records.push(
            new FoodMoodJournal(rec.date, rec.time, rec.physicalBefore, rec.mentalBefore, rec.emotionBefore, rec.physicalAfter, rec.mentalAfter, rec.emotionAfter, rec.description, rec.pictureUri, rec.rate, rec.comments)
        )
        newEntry.foodMoodRecords = records
    }

    if ("diaryRecord" in obj) {
        newEntry.diaryRecord = new DiaryRecord(obj.diaryRecord.text)
    }
    return newEntry
}


