
import { stringToDate, stringToTime } from "../resources/common";

class FoodMoodJournal {

    date: string
    time: string
    physicalBefore: string
    mentalBefore: string
    emotionBefore: string
    physicalAfter: string
    mentalAfter: string
    emotionAfter: string
    description: string
    pictureUri: string
    rate: string
    comments: string

    constructor(
        date: string,
        time: string,
        physicalBefore: string,
        mentalBefore: string,
        emotionBefore: string,
        physicalAfter: string,
        mentalAfter: string,
        emotionAfter: string,
        description: string,
        pictureUri: string,
        rate: string,
        comments: string
    ) {
        this.date = date;
        this.time = time;
        this.physicalBefore = physicalBefore;
        this.mentalBefore = mentalBefore;
        this.emotionBefore = emotionBefore;
        this.physicalAfter = physicalAfter;
        this.mentalAfter = mentalAfter;
        this.emotionAfter = emotionAfter;
        this.description = description;
        this.pictureUri = pictureUri;
        this.rate = rate;
        this.comments = comments;
    }

    compareTime(fmRecord: FoodMoodJournal) {
        return stringToTime(this.time).valueOf() - stringToTime(fmRecord.time).valueOf()
    }

    print(){
        return `Time: ${this.time}, Description: ${this.description}, Rate: ${this.rate}\n`
    }

}

class WaterRecord {
    quantity: number
    constructor(quantity: number){
        this.quantity = quantity;
    }
}

class ExerciseRecord {

    description: string;
    comments: string;
    constructor(description: string, comments: string){
        this.description = description;
        this.comments = comments;
    }

    print(){
        return `Description: ${this.description}, Comments: ${this.comments}\n`
    }
}

class SleepRecord {
    hours: number;
    grade: string;
    comments: string;
    constructor(hours: number, grade: string, comments: string){
        this.hours = hours;
        this.grade = grade;
        this.comments = comments;
    }

}

class DiaryRecord{
    text: string
    constructor(text: string){
        this.text = text;
    }
}

class JournalEntry {
    date: string;
    foodMoodRecords: FoodMoodJournal [] | null;
    exerciseRecords: ExerciseRecord [] | null;
    sleepRecord: SleepRecord | null;
    waterRecord: WaterRecord | null;
    diaryRecord: DiaryRecord | null;

    constructor(date: string, foodMoodRecords?: FoodMoodJournal [], exerciseRecords?: ExerciseRecord [], sleepRecord?: SleepRecord, waterRecord?: WaterRecord, diaryRecord?: DiaryRecord){
        this.date = date;
        this.foodMoodRecords = foodMoodRecords ?? null;
        this.exerciseRecords = exerciseRecords ?? null;
        this.sleepRecord = sleepRecord ?? null;
        this.waterRecord = waterRecord ?? null;
        this.diaryRecord = diaryRecord ?? null;
    }

    isEmpty(){
        return (this.foodMoodRecords == null || this.foodMoodRecords.length == 0) && (this.exerciseRecords == null || this.exerciseRecords.length == 0) && this.waterRecord == null && this.sleepRecord == null && this.diaryRecord == null;
    }

    setWaterQuantity(quantity: number){
        this.waterRecord = new WaterRecord(quantity)
    }

    setExerciseRecords(records: ExerciseRecord[] ){
        this.exerciseRecords = [...records]
    }

    setFoodMoodRecords(records: FoodMoodJournal[]){
        this.foodMoodRecords = [...records]
    }

    setSleepRecord(record: SleepRecord){
        this.sleepRecord = record
    }

    setDiaryRecord(record: DiaryRecord){
        this.diaryRecord = record
    }

    print(){
        let fmString: string = '', exString: string = ''
        if(this.foodMoodRecords != null)
            for(let fm of this.foodMoodRecords){
                fmString += fm.print()
            }
        
        if(this.exerciseRecords != null)
            for(let ex of this.exerciseRecords){
                exString += ex.print()
            }
        return `Date: ${this.date}\nFood mood records: ${fmString}\nExercise records: ${exString}\nSleep record: ${this.sleepRecord?.hours + ', ' + this.sleepRecord?.grade + ', ' + this.sleepRecord?.comments}\nWater record: ${this.waterRecord?.quantity}\nDiary: ${this.diaryRecord?.text}\n\n`
    }
}

export { FoodMoodJournal, WaterRecord, ExerciseRecord, SleepRecord, DiaryRecord, JournalEntry }