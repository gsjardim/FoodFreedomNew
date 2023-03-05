export default class UserModel {

    constructor(id, name, email, yearOfBirth, createdDate, lastJournalEntry, pictureUrl){
        this.id = id;
        this.name = name;
        this.email = email;
        this.yearOfBirth = yearOfBirth;
        this.createdDate = createdDate;
        this.lastJournalEntry = lastJournalEntry;
        this.pictureUrl = pictureUrl;
    }

    toString(){
        
        console.log(`Id: ${this.id}\nName: ${this.name}\nEmail: ${this.email}\nDate of birth: ${this.yearOfBirth}\nCreated date: ${this.createdDate}\nLast Journal entry: ${this.lastJournalEntry}\nPicture url: ${this.pictureUrl}`)
    }
   
}