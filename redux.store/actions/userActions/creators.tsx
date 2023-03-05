//Redux action creators

import { LOGIN, LOGOUT, REGISTER, UPDATE_USER, UPDATE_PHOTO_URL, UPDATE_NAME, UPDATE_EMAIL, SOCIAL_AUTH } from "./types";
import UserModel from "../../../models/UserModel";

export const setSocialAuthentication = (isLoggedIn : boolean) => {
    return {
        type: SOCIAL_AUTH,
        payload: isLoggedIn,
    }
}

export const updatePhotoUrl = (url: string) => {
    return {
        type: UPDATE_PHOTO_URL,
        payload: url
    }
}

export const loginUser = (snapshot : any) => {

    const user = getUserFromSnapshot(snapshot)
    return {
        type: LOGIN,
        payload: user
    }
}

export const logoutUser = () => {
    return {
        type: LOGOUT,
    }
}

export const updateUser = (snapshot : any) => {

    const user = getUserFromSnapshot(snapshot)
    
    return {
        type: UPDATE_USER,
        payload: user
    }
}

export const updateStoreUserName = (name: string) => {
    return {
        type: UPDATE_NAME,
        payload: name
    }
}

export const updateStoreUserEmail = (email: string) => {
    return {
        type: UPDATE_EMAIL,
        payload: email
    }
}

function getUserFromSnapshot(snapshot: any){
    let createdDate = snapshot.child('createdDate').val();
    let email = snapshot.child('email').val();
    let id = snapshot.key
    let name = snapshot.child('name').val();
    let lastEntry = snapshot.child('lastJournalEntry').val();
    let yearOfBirth = snapshot.child('yearOfBirth').val();
    let pictureUrl = snapshot.child('pictureUrl').val();
    let user = new UserModel(id, name, email, yearOfBirth, createdDate, lastEntry, pictureUrl);
   
    return user
}