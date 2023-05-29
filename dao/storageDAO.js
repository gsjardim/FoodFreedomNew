import ImageResizer from 'react-native-image-resizer';
import { Platform } from 'react-native';
import storage from '@react-native-firebase/storage'
import { manipulateAsync, FlipType, SaveFormat, ActionResize } from 'expo-image-manipulator';
import report from '../components/CrashReport';

//Adapted from https://medium.com/@sultanbutt820/react-native-image-upload-retrieve-delete-from-firebase-cloud-storage-ios-android-e05c7cdbf1d2
const uploadImageToStorage = async (imageUri, storageRef, callback) => {
    console.log('Upload image to storage - raw uri: ' + imageUri)
    const manipResult = await manipulateAsync(
        imageUri,
        [
            { resize: { width: 400, height: 400 } }
        ],
        { compress: 1, format: SaveFormat.PNG }
    );


    let uri = manipResult.uri;
    let uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    console.log('Upload URI: ' + uploadUri)
    const img = await fetch(uploadUri)
    const bytes = await img.blob();
    console.log('Image decoded.')
    const imageRef = storage().ref(storageRef)
    await imageRef.put(bytes).catch((err) => report.log('There was an error uploading the image to Storage: ' + err));
    const url = await imageRef.getDownloadURL().catch((err) => report.log('There was an error getting the image URL: ' + err))
    callback(url)


}

const downloadImageFromStorage = async (storageRef) => {

    const url = await storage().ref(storageRef).getDownloadURL()
    return url;

}

const deleteImageFromStorageByUrl = async (url) => {
    storage().refFromURL(url).delete()
        .catch((error) => report.log('Storage DAO - error deleting image' + error));
}

export { uploadImageToStorage, downloadImageFromStorage, deleteImageFromStorageByUrl }