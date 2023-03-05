
import { GET, UPDATE, LOGIN_READY, LOGIN_NOT_READY, SET_FEELINGS, SET_VIDEOS, SET_IS_DATA_LOADING, NEW_MESSAGE } from '../actions/generalActions/types';


const initialState = {

    quotesArray: [],
    mentalFeelingsArray: [],
    physicalFeelingsArray: [],
    videosArray: [],
    isLoginScreenReady: false,
    isDataLoading: false,
    isThereNewMessage: false,
}

const generalParamsReducer = (state: any = initialState, action: any) => {
    switch (action.type) {

        case GET:
            return { ...state, quotesArray: action.payload }
        case LOGIN_READY:
            return { ...state, isLoginScreenReady: true }
        case LOGIN_NOT_READY:
            return { ...state, isLoginScreenReady: false }
        case SET_FEELINGS:
            return { ...state, mentalFeelingsArray: action.payload.mental, physicalFeelingsArray: action.payload.physical }
        case SET_VIDEOS:
            return { ...state, videosArray: action.payload }
        case SET_IS_DATA_LOADING:
            return { ...state, isDataLoading: action.payload }
        case NEW_MESSAGE:
            return { ...state, isThereNewMessage: action.payload }
        default:
            return state;
    }
}


export default generalParamsReducer;