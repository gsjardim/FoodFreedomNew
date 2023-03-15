import PhoneDimensions from "./layout";
import Constants from 'expo-constants';
import { Colors } from "./colors";

export const GoogleWebClient = '63507067124-eor8866k87b4oii8h8jgiat095pakn6f.apps.googleusercontent.com';
export const ExpoClientID = '63507067124-le5osiec1tpc34bab4uaafebd08d1mu0.apps.googleusercontent.com';
export const IOSClientId = '63507067124-k44v7hto7ise0gb5j03o7co66dl0fmst.apps.googleusercontent.com';
export const appleKey = 'VB94QUXJAU';

//test border: borderColor: 'black', borderWidth: 1,
export const FontFamilies = {
    Montserrat: 'Montserrat_Extra_Light',
    Poppins: 'Poppins_Medium',
    Verdana: 'Verdana',
}

//Minimum age to register as a user
export const MINIMUM_AGE = 16;
export const validationRegex = '^^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$';
export const emailValidationRegex = "/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/";

export const ToastDuration = 2000;
export const PencilIconSize = PhoneDimensions.window.width * 0.07;

export const FontSizes = {
    small_1: PhoneDimensions.window.width * 0.03,
    small_2: PhoneDimensions.window.width * 0.04,
    medium_1: PhoneDimensions.window.width * 0.05,
    medium_2: PhoneDimensions.window.width * 0.06,
    large_1: PhoneDimensions.window.width * 0.07,
    large_2: PhoneDimensions.window.width * 0.08,
}

export const DefaultShadow = {
    elevation: 7,
    shadowOpacity: 0.4,
    shadowColor: 'black',
    shadowOffset: {
        width: 3,
        height: 1
    },
};

export const GeneralTextStyle =  {
    fontFamily: FontFamilies.Poppins,
    fontSize: FontSizes.small_1 * 1.2,
    color: Colors.fontColor,
};
export const neutralMenuOption = 'Select one...';
export const Genders = [neutralMenuOption, 'Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];


export const TERMS_URL = "https://www.privacypolicies.com/live/8bebec72-7f0a-4a4f-a0f0-c404ee6a1c99";
export const PRIVACY_URL = "https://www.privacypolicies.com/live/a49faedc-f2b2-44a9-8595-540e0e59fceb";
export const FF_APP_URL = "http://foodfreedomapp.com/";

export const DefaultPadding = PhoneDimensions.window.width * 0.06;
export const StatusBarHeight = Constants.statusBarHeight;


export const PHYSICAL_BEFORE = 1;
export const MENTAL_BEFORE = 2;
export const EMONTIONAL_BEFORE = 3;
export const PHYSICAL_AFTER = 4;
export const MENTAL_AFTER = 5;
export const EMOTIONAL_AFTER = 6;

export const RATE_HAPPY = 'happy';
export const RATE_FAIR = 'fair';
export const RATE_SAD = 'sad';

export const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//How many minutes after current time is the meal considered 'Now'. If a meal is considered 'now', the 'Finish meal reminder' will be triggered.
export const MEAL_REMINDER_THRESHOLD = 5;
//How many minutes after starting a food mood record the user will get a reminder to finish it. If not changed in the settings screen, this is the default value in minutes
export const DEFAULT_TIMER = 20;
export const DEFAULT_DAILY_REMINDER = {hour: 20, minutes: 20}

export const Activities = {
    water: 'WaterScreen',
    food: 'FoodMoodScreen',
    sleep: 'SleepScreen',
    exercise: 'ExerciseScreen',
    diary: 'Diary',
    diaryInput: 'DiaryInputScreen',
}

//Sentry config
// export const sentry = {
//     token: 'b432a7b4e87c4a678642472c42d0b39b6d358be1389142b89f1b2fcb0a6b1f9d',
//     orgName: 'gsjardim',
//     projectName: 'food-freedom',
//     DSN: 'https://bda520e9ec524930a22c8d051071cf6e@o4504738816065536.ingest.sentry.io/4504738833563648'
// }


//Temporary - for test purposes only, these data will come from database.
export const physicalFeelings = [
    neutralMenuOption,
    'Achy',
    'Bloated',
    'Blocked',
    'Breathless',
    'Bubbly',
    'Burning',
    'Bursting',
    'Butterflies',
    'Buzzy',
    'Calm',
    'Clenched',
    'Closed',
    'Cloudy',
    'Cold',
    'Comfortable',
    'Congested',
    'Constricted',
    'Cool',
    'Dark',
    'Dehydrated',
    'Disconnected',
    'Dizzy',
    'Drained',
    'Dry-mouthed',
    'Dull',
    'Empty',
    'Energetic',
    'Energized',
    'Exhausted',
    'Expansive',
    'Faint',
    'Fluttery',
    'Full',
    'Giddy',
    'Grounded',
    'Headache',
    'Heavy',
    'Hollow',
    'Hot',
    'Hungry',
    'Hurting',
    'Itchy',
    'Jabbing',
    'Jittery',
    'Jumpy',
    'Light',
    'Lightheaded',
    'Limp',
    'Nauseous',
    'Nervy',
    'Numb',
    'Parched',
    'Pounding',
    'Pressure',
    'Pulsing',
    'Queasy',
    'Ravenous',
    'Raw',
    'Relaxed',
    'Rigid',
    'Satiated',
    'Satisfied',
    'Sensitive',
    'Shaky',
    'Shivery',
    'Short of breath',
    'Sick',
    'Sore',
    'Spacey',
    'Stabbing',
    'Stinging',
    'Stuffed',
    'Suffocated',
    'Sweaty',
    'Tearful',
    'Tense',
    'Throbbing',
    'Tingling',
    'Tired',
    'Twitchy',
    'Uncomfortable',
    'Warm',
    'Wobbly',
    'Woozy'    
];

export const mentalFeelings = [
    
    neutralMenuOption,
    'Alert',
    'Anxious',
    'Awake',
    'Brain fog',
    'Clear',
    'Confused',
    'Drained',
    'Forgetful',
    'Inability to focus',
    'Mentally stressed'    
];

export const videosArray = [
    {
        dateCreated: 'Apr 01 2021',
        description: 'Welcome to FOOD FREEDOM',
        url: 'https://firebasestorage.googleapis.com/v0/b/ac-21w-team-8.appspot.com/o/videos%2FWelcome%20to%20the%20FF%20app.mp4?alt=media&token=24aa863f-dd1e-49ba-9cc6-d44a35908cf4',
        thumbnail: require('../assets/images/Selection_012.png')
    },
    {
        dateCreated: 'May 01 2021',
        description: 'This video explains how to use the app. Enjoy!',
        url: 'https://firebasestorage.googleapis.com/v0/b/ac-21w-team-8.appspot.com/o/videos%2FFF%20App%20Tutorial%20small.mp4?alt=media&token=83d64075-92e9-4860-ba56-f7ceff29c4ac',
        thumbnail: require('../assets/images/Selection_013.png')
    },
]

export const messagesArray = [
    {
        date: '2022-02-05',
        message: 'Welcome to the app!'
    },
    {
        date: '2022-02-10',
        message: 'New video available. Check out the resources screen'
    },
    {
        date: '2022-03-10',
        message: 'We haven\'t seen you in a while... Don\'t forget to keep your journal!'
    },
    {
        date: '2022-03-20',
        message: 'Did you know that drinking enough water can prevent many health issues?'
    },
   
]
