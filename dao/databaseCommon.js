import database from '@react-native-firebase/database'
import report from '../components/CrashReport';
export const USERS_REF = 'Users';
export const QUOTES_REF = 'Quotes';
export const JOURNAL_REF = 'Journal';
export const LAST_ENTRY = 'lastJournalEntry';
export const MENTAL_FEELINGS_REF = 'Feelings/MENTAL';
export const PHYSICAL_FEELINGS_REF = 'Feelings/PHYSICAL';
export const FEELINGS_REF = 'Feelings';
export const VIDEOS_REF = 'Videos';

export const setValueToDatabase = async (reference, value, callback) => {


    database().ref(reference).set(value, () => {
        
        if(callback != null){
            callback()
        }
    })
    .catch((error) => report.recordError(error))
}

export const getValueFromDatabase = async (ref) => {
    return database().ref(ref).once('value')
}

