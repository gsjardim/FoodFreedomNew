
import { LOGIN, REGISTER, LOGOUT, UPDATE_USER, UPDATE_PHOTO_URL, UPDATE_NAME, UPDATE_EMAIL, SOCIAL_AUTH } from "../actions/userActions/types";


const initialState = {

    currentUser: null,
    isLoggedInWithSocialAuth: false,

}

const usersReducer = (state: any = initialState, action: any) => {
    switch (action.type) {

        case LOGIN:
            return { ...state, currentUser: action.payload }
        case LOGOUT:
            return { ...state, currentUser: null }
        case UPDATE_USER:
            return { ...state, currentUser: action.payload }
            break
        case UPDATE_PHOTO_URL:
            let newState = { ...state }
            newState.currentUser.pictureUrl = action.payload;
            return newState;
            break
        case UPDATE_NAME:
            let updatedState = { ...state }
            updatedState.currentUser.name = action.payload;
            return updatedState;
        case UPDATE_EMAIL:
            let updated = { ...state }
            updated.currentUser.email = action.payload;
            return updated;
            break;
        case SOCIAL_AUTH:
            return { ...state, isLoggedInWithSocialAuth: action.payload }
        default:
            return state;
    }
}

export default usersReducer;