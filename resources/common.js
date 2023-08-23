import * as Linking  from "expo-linking";
// import { Linking } from "react-native";
import report from "../components/CrashReport";


const openUrlInBrowser = (url) => {

    Linking.canOpenURL(url).then(supported => {
        if (supported) {
            Linking.openURL(url);
        } else {
            report.log("Don't know how to open URI: " + url);
        }
    });
}


const SendEmail = (email) => Linking.openURL(`mailto:${email}`)

//returns format yyyy-mm-dd
const getStandardFormatDate = (date) => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return year + '-' + month + '-' + day;
}

//Returns true if leap year
//Source: https://stackoverflow.com/questions/16353211/check-if-year-is-leap-year-in-javascript
function isLeapYear(year) {
    if (year == null) return false;
    try {
        return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    }
    catch (err) {
        return false;
    }
}

//returns format MMM dd yyyy
const getFormattedDate = (date) => {
    return date.toDateString().slice(4)
}

//Returns time in hh:mm p.m. format
const get12hourFormatTime = (date) => {

    let hour = date.getHours();
    let min = date.getMinutes();
    let ap = hour >= 12 ? 'p.m.' : 'a.m.';
    if (hour > 12) hour = hour - 12;
    let minStr = min >= 10 ? min.toString() : '0' + min.toString();
    return hour + ':' + minStr + ' ' + ap;

}

//Converts time string to Date object
const stringToTime = (timeStr, keyDate) => {

    let convertedTime = keyDate != null ? new Date(keyDateToDate(keyDate)) : new Date();
    let timeArray = timeStr.split(" ");
    let min = parseInt(timeArray[0].split(":")[1])
    let hours = parseInt(timeArray[0].split(":")[0])
    if (timeArray[1].includes('p') && hours != 12) hours = hours + 12;
    convertedTime.setMinutes(min);
    convertedTime.setHours(hours);

    return convertedTime;

}

//Converts database data (yyyymmdd) to Date object
const keyDateToDate = (keyDate) => {
    return stringToDate(keyDateToStringDate(keyDate))

}

//converts date string (MMM dd yyyy) to a date object
const stringToDate = (dateStr) => {
    let convertedDate = new Date();
    let dateArray = dateStr.split(' ');
    let year = parseInt(dateArray[2]);
    let day = parseInt(dateArray[1]);
    let month = getMonthNumber(dateArray[0]);
    convertedDate.setFullYear(year);
    convertedDate.setMonth(month);
    convertedDate.setDate(day);
    return convertedDate;
}

//Converts date obj to key Date string
const dateToKeyDate = (date) => {
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    let d = date.getDate()
    return `${y}${m < 10 ? '0' + m : m}${d < 10 ? '0' + d : d}`;
}


const keyDateToStringDate = (keyDate) => {
    let year, month, day;
    year = keyDate.substring(0, 4)
    month = keyDate.substring(4, 6)
    day = keyDate.substring(6)


    return getMonthString(parseInt(month) - 1) + ' ' + day + ' ' + year
}

//Returns string date as yyyyMMdd
const stringDateToKeyDate = (dateStr) => {
    let dateArray = dateStr.split(' ');
    let year = dateArray[2];
    let day = dateArray[1];
    let month = getMonthNumber(dateArray[0]) + 1;
    month = (month < 10 ? '0' + month : month).toString()
    return year + month + day
}

const stringTimeToKeyTime = (timeStr, keyDate) => {
    let time = stringToTime(timeStr, keyDate)
    return time.getHours() + '_' + time.getMinutes()
}

//Returns time stamp as yyyyMMdd_hhMM (24 hours)
const getTimeStamp = (dateObj) => {

    return getStandardFormatDate(dateObj).replace('-', '') + '_' + dateObj.getHours() + dateObj.getMinutes()
}

const getMonthNumber = (monthStr) => {

    switch (monthStr) {
        case 'Jan': return 0;
        case 'Feb': return 1;
        case 'Mar': return 2;
        case 'Apr': return 3;
        case 'May': return 4;
        case 'Jun': return 5;
        case 'Jul': return 6;
        case 'Aug': return 7;
        case 'Sep': return 8;
        case 'Oct': return 9;
        case 'Nov': return 10;
        case 'Dec': return 11;
    }
}

const getMonthString = (monthNumber) => {
    switch (monthNumber) {
        case 0: return 'Jan';
        case 1: return 'Feb';
        case 2: return 'Mar';
        case 3: return 'Apr';
        case 4: return 'May';
        case 5: return 'Jun';
        case 6: return 'Jul';
        case 7: return 'Aug';
        case 8: return 'Sep';
        case 9: return 'Oct';
        case 10: return 'Nov';
        case 11: return 'Dec';
        default: 0;
    }
    return 0;
}

const compareDates = (d1, d2) => {
    let copyD1 = new Date(d1)
    let copyD2 = new Date(d2)
    copyD1.setHours(0, 0, 0, 0)
    copyD2.setHours(0, 0, 0, 0)
    let dif = copyD1.valueOf() - copyD2.valueOf();
    return dif;
}

export {
    openUrlInBrowser,
    getStandardFormatDate,
    getFormattedDate,
    get12hourFormatTime,
    SendEmail,
    stringToTime,
    stringToDate,
    compareDates,
    getMonthString,
    getMonthNumber,
    stringDateToKeyDate,
    getTimeStamp,
    stringTimeToKeyTime,
    keyDateToStringDate,
    dateToKeyDate,
    keyDateToDate,
    isLeapYear,
};