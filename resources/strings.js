import store from "../redux.store/configureStore";

export const ButtonStrings = {
    saveButton: 'Save',
    cancelButton: 'Cancel',
    closeButton: 'Close',
    saveAndCloseButton: 'Save and close',
    deleteButton: 'Delete',
    editButton: 'Edit',
    yesButton: 'Yes',
    noButton: 'No',
    sendButton: 'Send',
}

export const AboutStrings = {
    sarahName: 'Sarah Roberts',
    certCoach: 'Certified Health Coach',
    aboutSummary: "For over 20 years, I've been searching for the tool that would help people 'uncomplicate' their relationship with food and their bodies in order to free them from diet culture and the emotional roller coaster that comes with it.\n\nThis FOOD FREEDOM app allows you to track the way your food and lifestyle choices affect the way you FEEL.\n\nWith raised awareness around how your choices impact your emotions, and vice versa, you'll gain valuable insight into what drives your behavior. When you begin to connect your food with your mood, you naturally gravitate towards the things that make feel good--mentally, emotionally and physically, without having to use willpower. This will help you to make positive changes automatically and lead you to a life of freedom.",
    aboutSummary2: "To learn more about the FOOD FREEDOM app and receive free recipes and trainings on how to break free from diet culture forever in order to cultivate greater self-confidence and body love, please visit",
    backButtonLabel: 'Back to home page',
}

export const ContactUsStrings = {
    title: 'We want to hear from you!',
    mainText: 'If you have any questions or comments and want to reach out to Sarah or other members of our team, please send an email to:',
    contactEmail: 'Hello@FoodFreedomApp.com',
};

export const HomeScreenStrings = {
    foodMoodJournal: 'Food Mood\nJournal',
    waterTracker: 'Water\nTracker',
    exerciseTracker: 'Movement\nTracker',
    sleepTracker: 'Sleep\nTracker',
    pastDateAlert: 'You are creating/editing a record for a past date. Continue?',
};

export const HistoryScreenStrings = {
   
    onEditTitle: 'Edit entry',
    onEditMessage: 'What would you like to do?',
    onDeleteMessage: 'Record deleted successfully'
};

export const BottomTabLabels = {
    home: 'Home',
    diary: 'Diary',
    history: 'History',
    resources: 'Resources',
    profile: 'Profile',
};

export const SettingsScreenStrings = {
    title: 'Notifications',
    turnOffSettings: 'To turn notifications ON / OFF please open your device\'s settings',
    mealReminder: 'Show after meal reminder in:',
    waterReminder: 'Remind me to drink water at:',
    dailyReminder: 'Notify me to open my journal at:',
    saveClose: 'Save and close',
    saveConfirmation: 'Settings saved',
};

export const ResourcesScreenStrings = {
    videoTab: 'Videos',
    messageTab: 'Messages',
    dateLabel: 'Date',
    newLabel: 'New'
};

export const ActivitiesStrings = {
    saveButton: ButtonStrings.saveButton,
    cancelButton: ButtonStrings.cancelButton,
    closeButton: ButtonStrings.closeButton,
    saveAndCloseButton: ButtonStrings.saveAndCloseButton,
    deleteButton: ButtonStrings.deleteButton,
    editButton: 'Edit',
    addButton: 'Add',
    goBackButton: 'Go back',

    //Food mood journal
    fmTitle: 'Food Mood Journal',
    fmTimeLabel: 'Start time:',
    fmHowIfeelBeforeOption: 'How I feel before my meal (optional)',
    fmFoodDrinkDescription: 'Food / Drink',
    fmDescriptionPlaceholder: 'Description',
    fmHowIfeelAfter: 'How I feel after my meal',
    fmPhysicallyLabel: 'Physically',
    fmMentallyLabel: 'Mentally',
    fmEmtionallyLabel: 'Emotionally',
    fmMealRateLabel: 'This meal made me feel...',
    fmOtherCommentsLabel: 'Other comments (optional)',
    fmAddNewLabel: 'Add new',
    fmAddPicture: 'Add picture',
    fmEditPicture: 'Edit picture',
    fmCameraBtn: 'Camera',
    fmGalleryBtn: 'Gallery',
    wheelQuestion: 'How do I feel now?',
    wheelSelected: 'You selected: ',
    mealReminderTitle: 'Enjoy your meal!',
    mealReminderText: 'You will be reminded to finish entering information about your meal and feelings in:',
    buttonAccept: 'Accept and save',
    buttonDecline: 'Decline and save',
    minimumInfo: 'You must enter at least a "Food / Drink" description and select one "emotion face" before you can save.',

    //water tracker
    waterTrackerQuestion: 'Glasses of water today:',
    waterTrackerTitle: 'Water Tracker',    

    //sleep tracker
    sleepTrackerTitle: 'Sleep Tracker',
    sleepTrackerQuestion: 'How I slept last night...',
    sleepTrackerDuration: 'Duration of sleep:',
    sleepTrackerPlaceholder: 'Dreams, thoughts and ideas...',
    sleepRecMinimumInfo: 'You must at least select one "emotion face" before you can save.',

    //exercise tracker
    exerciseTrackerTitle: 'Movement Tracker',
    exerciseAddButton: 'Add movement',
    exerciseDoneAdding: 'Done',
    exerciseDescription: 'Movement: ',
    exerciseComments: 'How did it feel?',
    exerciseDescPlaceholder: 'Movement description',
    exerciseCommentPlaceholder: 'How did today\'s movement feel?',
}

export const ProfileScreenStrings = {
    title: 'My Profile',
    changePicture: 'Tap image to add/change picture',
    emailLabel: 'Email address: ',
    changePasswordButton: 'Password: ',
    userNameLabel: 'User name: ',
    dateOfBirth: 'Year of birth: ',
    userSinceLabel: 'User since: ',
    lastJournalEntry: 'Last journal entry: ',
    saveAndClose: 'Save and close',
    oldPassword: 'Enter your old password',
    newPassword: 'Enter your new password',
    confirmPassword: 'Confirm your new password',
    currentEmail: 'Current email address:',
    newEmail: 'Enter your new email',
    confirmEmail: 'Confirm your new email',
    invalidEmail: 'Please enter a valid email address',
    alertForSocialSignin: 'Email and password change not available when using Google or Apple sign in.',
}

export const LoginRegisterScreenStrings = {
    title: 'FOOD FREEDOM',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember me',
    loginButton: 'Login',
    forgotPassword: 'Forgot password?',
    newUser: 'New user',
    userName: 'User name',
    confirmPassword: 'Confirm password',
    selectYearOfBirth: 'Year of birth',
    selectGender: 'Gender',
    registerButton: 'Register',
    cancelButton: 'Cancel',
    enterYourEmail: 'Enter your email address',
    alternativeLoginText: 'Or log in using:',
    wrongPasswordFormat: 'Password must have between 7 and 15 characters, contain at least one number and one special character.',
    minimumAgeAlert: 'You must be at least 16 years old to be able to register.',
    termsAndConditionsRequired: 'You have to agree with the Terms and Conditions and Privacy Policy before you can register.',
    
}

export const WelcomeScreenStrings = {
    welcomeText: 'Hello,',
    startButton: 'Welcome to your journal'
}

export const AlertDialogStrings = {
    messageLabel: 'Message',
    newVideosDialog: 'New videos available in Resources!',
    notificationsPermissions: 'Enable push notifications to use the app!',
}

export const NotificationsStrings = {
    dailyReminder: "Have you recorded your journal entries today?",
    mealReminder: 'Finish entering your meal record.',
    mealReminderTitle: 'Reminder',
    waterReminder: `Hi ${store.getState().users.currentUser?.name},\nThis is your friendly reminder to drink water!`,
}






