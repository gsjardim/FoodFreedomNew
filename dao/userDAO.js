import { Alert } from "react-native";
import database from '@react-native-firebase/database'
import storage from '@react-native-firebase/storage'
import auth from '@react-native-firebase/auth'
import { JournalEntry } from "../models/JournalEntryModel";
import UserModel from "../models/UserModel";
import { loginUser, setSocialAuthentication, updateStoreUserEmail, updateStoreUserName, updateUser } from "../redux.store/actions/userActions/creators";
import store from "../redux.store/configureStore";
import { FEELINGS_REF, getValueFromDatabase, JOURNAL_REF, QUOTES_REF, setValueToDatabase, TOKENS_REF, USERS_REF, VIDEOS_REF } from "./databaseCommon";
import { FB_TOKEN, OAUTH_TOKEN, storeJSON, storeString } from "./internalStorage";
import { setUpCachedJournalEntries } from "./journalEntryDAO";
import firebase from "firebase";
import { getQuotes, setFeelings, setIsDataLoading, setVideos } from "../redux.store/actions/generalActions/creators";
import { getFormattedDate } from "../resources/common";
import { report } from "../App";

export const saveUserPushtoken = (token) => {
    const uid = store.getState().users.currentUser.id;
    const ref = USERS_REF + '/' + uid + '/pushToken';
    setValueToDatabase(ref, token, null);
    database().ref(TOKENS_REF).get()
        .then(snapshot => {
            let tokens = snapshot.val()
            if (tokens != null) {
                let index = tokens.findIndex(obj => obj?.uid === uid)
                if (index > -1) {
                    tokens[index] = {
                        uid: uid,
                        token: token
                    }
                }
                else {
                    tokens.push({
                        uid: uid,
                        token: token
                    })
                }

            }
            else {
                tokens = new Array()
                tokens.push({
                    uid: uid,
                    token: token
                })
            }
            setValueToDatabase(TOKENS_REF, tokens)
        })
}

export async function updateUserPictureUrl(pictureUrl) {

    const ref = USERS_REF + '/' + store.getState().users.currentUser.id + '/pictureUrl';
    setValueToDatabase(ref, pictureUrl, null);
}

export const getUserPhotoURL = async () => {

    const currentUser = store.getState().users.currentUser

    console.log('Get user photo URL was called with: ' + currentUser.pictureUrl)
    const url = await storage()
        .ref('/' + currentUser.pictureUrl)
        .getDownloadURL()
        .then((url) => {
            console.log('getUserPhotoURL: ' + url)
            return url
        })
        .catch(error => { return '' })
    console.log('getUserPhotoURL - returned URL: ' + url)
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
                                    console.log('Verification link sent to ' + fbUser.email)
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

// export const loginWithGoogleToken = async (token, onSuccessCallBack, onFailCallBack) => {
//     let credential = firebase.auth.GoogleAuthProvider.credential(token);
//     signInWithOAuthCredential(credential, onSuccessCallBack, onFailCallBack);
// }

// export const loginWithAppleToken = async (credential, onSuccessCallBack, onFailCallBack) => {
   
//     const provider = new firebase.auth.OAuthProvider('apple.com');
//     const liveCredential = provider.credential({
//         idToken: credential.token,
//         rawNonce: credential.nonce
//     });
//     console.log('Login With apple token' + JSON.stringify(credential))
//     signInWithOAuthCredential(liveCredential, onSuccessCallBack, onFailCallBack)
// }

export const signInWithOAuthCredential = (credential, onSuccessCallBack, onFailCallBack) => {
   
    auth().signInWithCredential(credential)
        .then(res => {

            
            let fbUser = res.user;
            if (fbUser != null) {
                console.log('Authenticated user - ' + JSON.stringify(fbUser))
                let uid = fbUser.uid;
                const ref = USERS_REF + '/' + uid;
                store.dispatch(setSocialAuthentication(true));
                database().ref(ref).get()
                    .then(value => {
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
    //Finally, loads the user's info
    storeString(FB_TOKEN, fbUser.refreshToken)
    
    database().ref('Users/' + fbUser.uid).get()
        .then(snapshot => {
            store.dispatch(loginUser(snapshot));
            store.dispatch(setIsDataLoading(false))

        })
        .then(() => {
            //Loads quotes into app
            database().ref(QUOTES_REF).get()
                .then(snapshot => {
                    store.dispatch(getQuotes(snapshot.val()))
                })
                .catch(_error => {
                    store.dispatch(getQuotes([{ category: 'general', content: 'Welcome to the Food Freedom App!' }]))

                })
        })
        .then(() => {
            //Loads last 30 days of journal entries onto memory
            setUpCachedJournalEntries(fbUser)
        })
        .then(() => {
            //Loads videos
            database().ref(VIDEOS_REF).on('value', snapshot => {
                // console.log('Snapshot of videos in userDao - ' + JSON.stringify(snapshot.val()))
                store.dispatch(setVideos(snapshot.val()))
            })
        })
        .then(() => {
            //Loads feelings that can be selected in the food mood journal
            database().ref(FEELINGS_REF).on('value', snapshot => {
                
                store.dispatch(setFeelings(snapshot.val()))
            })
            callback(); //Calls the onSuccess callback function - Go to welcome screen
        })







}




