
import { JournalEntry,} from '../../../models/JournalEntryModel';
import UserModel from '../../../models/UserModel';
import store from '../../configureStore';
import {GET_JOURNAL, UPDATE, SET_HISTORY_JOURNAL, UPDATE_HISTORY, SET_DIARY_JOURNAL, UPDATE_DIARY } from './types';


export const getJournalEntries = (entries: JournalEntry[]) => {      
    return {
        type: GET_JOURNAL,
        payload: entries
    }
}

export const setHistoryJournalEntries = (entries: JournalEntry []) => {
    return {
        type: SET_HISTORY_JOURNAL,
        payload: entries
    }
}

export const updateHistoryJournalEntries = (entry: JournalEntry) => {
    return {
        type: UPDATE_HISTORY,
        payload: entry
    }
}

export const setDiaryJournalEntries = (entries: JournalEntry[]) => {
    return {
        type: SET_DIARY_JOURNAL,
        payload: entries
    }
}

export const updateDiaryJournalEntry = (entry: JournalEntry) => {
    return {
        type: UPDATE_DIARY,
        payload: entry
    }
}
