export default class MyNotification {

    date: string;
    title: string;
    content: string;

    constructor(date: string, title: string, content: string){
       this.date = date;
       this.title = title;
       this.content = content;
    }

    toString(){
        
        return `Date: ${this.date}\nTitle: ${this.title}\nContent: ${this.content}`
    }
   
}