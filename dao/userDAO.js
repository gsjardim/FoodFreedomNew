import { Alert } from "react-native";
import database from '@react-native-firebase/database'
import storage from '@react-native-firebase/storage'
import auth from '@react-native-firebase/auth'
import UserModel from "../models/UserModel";
import { loginUser, setSocialAuthentication, updateStoreUserEmail, updateStoreUserName } from "../redux.store/actions/userActions/creators";
import store from "../redux.store/configureStore";
import { FEELINGS_REF, QUOTES_REF, setValueToDatabase, USERS_REF, VIDEOS_REF } from "./databaseCommon";
import { setUpCachedJournalEntries } from "./journalEntryDAO";
import { getQuotes, setFeelings, setIsDataLoading, setVideos } from "../redux.store/actions/generalActions/creators";
import { getFormattedDate } from "../resources/common";
import report from "../components/CrashReport";
import { deleteStorageData } from "./internalStorage";

export const handleSignOut = async () => {
    auth().signOut()
        .then(() => store.dispatch(logoutUser()));

    deleteStorageData(FB_TOKEN)

    store.dispatch(setSocialAuthentication(false));
};

export const saveUserPushtoken = (token) => {
    const uid = store.getState().users.currentUser.id;
    const ref = USERS_REF + '/' + uid + '/pushToken';
    setValueToDatabase(ref, token, null);
}

export async function updateUserPictureUrl(pictureUrl) {

    const ref = USERS_REF + '/' + store.getState().users.currentUser.id + '/pictureUrl';
    setValueToDatabase(ref, pictureUrl, null);
}

export const getUserPhotoURL = async () => {

    const currentUser = store.getState().users.currentUser

    const url = await storage()
        .ref('/' + currentUser.pictureUrl)
        .getDownloadURL()
        .then((url) => {
            return url
        })
        .catch(error => {
            report.recordError(error)
            return ''
        })
    return url;
}

export const updateUserName = (name) => {
    const ref = USERS_REF + '/' + store.getState().users.currentUser.id + '/name';
    setValueToDatabase(ref, name, () => store.dispatch(updateStoreUserName(name)))

}

export const updateUserEmail = (email) => {
    const ref = USERS_REF + '/' + store.getState().users.currentUser.id + '/email';
    setValueToDatabase(ref, email, () => store.dispatch(updateStoreUserEmail(email)))
}

//Lines below under experiment - transplant from other files
export const loginWithEmailAndPassword = (email, password, onSuccessCallBack, onFailCallBack) => {

    auth().signInWithEmailAndPassword(email, password)
        .then(value => {
            let fbUser = value.user
            if (fbUser != null && fbUser.emailVerified) {
                initializeAppData(fbUser, onSuccessCallBack);

            }
            else {
                //ask to verify email
                store.dispatch(setIsDataLoading(false))
                Alert.alert(
                    'Alert',
                    'Your email address has not been verified yet.',
                    [
                        {
                            text: 'OK',
                            style: 'default'
                        },
                        {
                            text: 'Resend verification link',
                            style: 'default',
                            onPress: () => {
                                if (fbUser != null) {
                                    fbUser.sendEmailVerification();
                                    onFailCallBack('Verification link sent to ' + fbUser.email);
                                }
                            }
                        }
                    ]
                )
            }

        })
        .catch(error => { onFail(error, onFailCallBack) })

}



export const signInWithOAuthCredential = (credential, onSuccessCallBack, onFailCallBack) => {

    auth().signInWithCredential(credential)
        .then(res => {


            let fbUser = res.user;
            if (fbUser != null) {
                let uid = fbUser.uid;
                const ref = USERS_REF + '/' + uid;
                store.dispatch(setSocialAuthentication(true));
                database().ref(ref).once('value', value => {
                    if (value.val() != null) {
                        //user already exists
                        initializeAppData(fbUser, onSuccessCallBack);
                    }
                    else {
                        //create new user
                        let userName = fbUser.displayName || fbUser.email
                        if (userName.includes('@')) userName = userName.split('@')[0]
                        let newUser = new UserModel(uid, userName, fbUser.email, '', getFormattedDate(new Date()), '', fbUser.photoURL);
                        database().ref(ref).set(newUser)
                            .then(() => {
                                initializeAppData(fbUser, onSuccessCallBack);
                            })
                            .catch(error => onFail('Error creating new user from Google sign in: ' + error, onFailCallBack));
                    }
                })
                    .catch(err => {
                        onFailCallBack('Failed to login - ' + err)
                    })
            }
            else {
                onFail('Error creating new user from Google sign in: firebase user is null', onFailCallBack);
            }
        })
        .catch(error => {
            onFail(error, onFailCallBack);
        })
}


const onFail = (error, callback) => {
    alert('Login failed: ' + error.code)
    report.log('User DAO on Fail:' + error)
    store.dispatch(setIsDataLoading(false))
    if (callback != null && callback.name !== 'showToast') callback();
}


export const initializeAppData = (fbUser, callback) => {
    //Loads feelings from data base. They will be updated if the db changes.
    database().ref(FEELINGS_REF).on('value', snapshot => store.dispatch(setFeelings(snapshot.val())), error => console.log(error))
        
    //Loads user info and journal entries for the current user
    database().ref('Users/' + fbUser.uid).once('value', snapshot => store.dispatch(loginUser(snapshot)))
        .then(() => setUpCachedJournalEntries(fbUser));

    //Loads videos
    database().ref(VIDEOS_REF).on('value', snapshot => store.dispatch(setVideos(snapshot.val())), error => console.log('Error loading videos: ' + error))

    //Loads quotes and finally moves to Welcome screen
    database().ref(QUOTES_REF).once('value', snapshot => {
        store.dispatch(getQuotes(snapshot.val()))
    })
    .then(() => callback())
    .catch(error => {
        console.log('Loading quotes error: ' + error)
        store.dispatch(getQuotes([{ category: 'general', content: 'Welcome to the Food Freedom App!' }]))
    })

}




