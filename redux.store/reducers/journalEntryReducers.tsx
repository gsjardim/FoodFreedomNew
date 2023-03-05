
import { GET_JOURNAL, SET_DIARY_JOURNAL, SET_HISTORY_JOURNAL, UPDATE_DIARY, UPDATE_HISTORY } from "../actions/journalActions/types";


const initialState = {

    entries: [],
    historyEntries: [],
    diaryEntries: []

}

const journalReducer = (state: any = initialState, action: any) => {

    let newState;

    switch (action.type) {

        case GET_JOURNAL:
            newState = { ...state, entries: action.payload }
            return newState

        case SET_HISTORY_JOURNAL:
            newState = { ...state, historyEntries: action.payload }
            return newState

        case UPDATE_HISTORY:
            let newHistoryEntries = [...state.historyEntries]
            let updatedEntry = action.payload;
            for (let index = 0; index < newHistoryEntries.length; index++) {
                if (newHistoryEntries[index].date === updatedEntry.date) {
                    if (updatedEntry.isEmpty()) {
                        newHistoryEntries.splice(index, 1)
                    }
                    else newHistoryEntries[index] = updatedEntry;
                    break;
                }
            }
            return { ...state, historyEntries: newHistoryEntries }

        case SET_DIARY_JOURNAL:
            newState = { ...state, diaryEntries: action.payload }
            return newState

        case UPDATE_DIARY:
            let newDiaryEntries = [...state.diaryEntries]
            let entry = action.payload;
            // let exists = false;
            for (let index = 0; index < newDiaryEntries.length; index++) {
                if (newDiaryEntries[index].date === entry.date) {
                    // exists = true;
                    if (entry.isEmpty()) {
                        newDiaryEntries.splice(index, 1)
                    }
                    else newDiaryEntries[index] = entry;
                    break;
                }
            }
            return { ...state, diaryEntries: newDiaryEntries }

        default:
            return state;
    }
}

export default journalReducer;