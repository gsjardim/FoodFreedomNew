import { Action } from 'redux';
import { getStorageData, LAST_NEW_VIDEO } from '../../../dao/internalStorage';
import { MyVideo } from '../../../models/VideoModel';
import { compareDates, keyDateToDate } from '../../../resources/common';
import {GET, UPDATE, LOGIN_NOT_READY, LOGIN_READY, SET_FEELINGS, SET_VIDEOS, SET_IS_DATA_LOADING} from './types';
import report from '../../../components/CrashReport';



export const getQuotes = (quotes: any) => {   
    return {
        type: GET,
        payload: quotes
    }

}

export const setLoginReady = () => {

    return {
        type: LOGIN_READY,
    }

}

export const setLoginNotReady = () => {

    return {
        type: LOGIN_NOT_READY,
    }

}

export const setIsDataLoading = (state: boolean) => {
    return {
        type: SET_IS_DATA_LOADING,
        payload: state,
    }
}

export const setFeelings= (snapshot: any) => {

    let mentalFeelings : string []= [];
    let physicalFeelings : string [] = [];

    if(snapshot != null){
        let mentalObj = snapshot.MENTAL;
        let physicalObj = snapshot.PHYSICAL;
        for(let key in mentalObj) {
            mentalObj[key] && mentalFeelings.push(mentalObj[key])
        }
        for(let key in physicalObj){
            physicalObj[key] && physicalFeelings.push(physicalObj[key])
        } 
        mentalFeelings.sort(compareStrings)
        physicalFeelings.sort(compareStrings)
    }

    return {
        type: SET_FEELINGS,
        payload: {
            mental: mentalFeelings,
            physical: physicalFeelings,
        },
    }
}

export const setVideos = (snapshot: any) => {

    let videos : MyVideo [] = [];
    if(snapshot != null){
        
        getStorageData(LAST_NEW_VIDEO).then(lastNewVideoDate => {
            
            for(let obj of snapshot){
                if (obj != null ){
                    let isNewVideo = (lastNewVideoDate == null) || compareDates(keyDateToDate(lastNewVideoDate), keyDateToDate(obj.dateCreated)) < 0
                    videos.push({
                        dateCreated: obj.dateCreated,
                        description: obj.description,
                        url: obj.url,
                        thumbnail: obj.thumbnail,
                        isNew: isNewVideo,
                    })
                }
                
            }

        })
        .catch(error => {
            report.log('Creators - Set videos: error setting up videos - ' + error)
        })
      
    }

    return {
        type: SET_VIDEOS,
        payload: videos,
    }
}

const compareStrings = (string1: string, string2: string) => {
    return string1.toLowerCase().localeCompare(string2.toLowerCase())
}

