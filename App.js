import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Colors } from './resources/colors';
import { Provider } from 'react-redux';
import store from './redux.store/configureStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/root';
import { ToastProvider } from "react-native-fast-toast";
import auth from '@react-native-firebase/auth'
import { LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from "expo-notifications";
import 'expo-dev-client';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { initializeAppData } from './dao/userDAO';
import { GoogleWebClient } from './resources/constants';
import report from './components/CrashReport';
import { setSocialAuthentication } from './redux.store/actions/userActions/creators';
import * as Device from "expo-device";
import report from "../components/CrashReport";
import MyNotification from "../models/NotificationModel";
import { saveNotification } from "../dao/notificationsDAO";
import { setNewMessageStatus } from "../redux.store/actions/generalActions/creators";
import * as TaskManager from 'expo-task-manager';
import { AlertDialogStrings } from './resources/strings';
import { PUSH_TOKEN, storeString } from './dao/internalStorage';


LogBox.ignoreLogs(['Setting a timer', 'AsyncStorage']);
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});


export default function App() {

  GoogleSignin.configure({
    webClientId: GoogleWebClient,
  });

  const [isReady, setIsReady] = useState(false);
  const [firstScreen, setScreen] = useState('');
  const [fontIsLoaded] = useFonts({
    Montserrat_Extra_Light: require('./assets/fonts/montserrat_extralight.ttf'),
    Poppins_Medium: require('./assets/fonts/poppins_medium.ttf'),
    Verdana: require('./assets/fonts/verdana.ttf'),
  });


  const LoginScreen = 'LoginScreen';
  const WelcomeScreen = 'Welcome';

  function setFirstScreen(screen) {
    setScreen(screen);
    setIsReady(true);
    SplashScreen.hideAsync();
  }

  useEffect(() => {


    // Get user's permission for push notifications
    const getPermission = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('Login screen - Notifications.PermissionStatus = ' + existingStatus);
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert(AlertDialogStrings.notificationsPermissions);
          deleteStorageData(PUSH_TOKEN)
          return;
        }
        
        const token = (await Notifications.getExpoPushTokenAsync({ experienceId: '@gsjardim83/foodFreedomApp' })).data;
        storeString(PUSH_TOKEN, token)
        saveUserPushtoken(token);
      } else {
        alert('Must use physical device for Push Notifications');
      }

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',

        });
      }
    }

    getPermission()
      .catch(error => report.recordError(error));


    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received - ' + notification.request.content.title)
      const newNotification = new MyNotification(
        getFormattedDate(new Date(notification.date)),
        notification.request.content.title || 'Title',
        notification.request.content.body || 'Message'
      )
      if (newNotification.title !== NotificationsStrings.mealReminderTitle && newNotification.content !== NotificationsStrings.mealReminder)
        saveNotification(newNotification).then(() => store.dispatch(setNewMessageStatus(true))).catch(err => console.log('Error saving notification ' + err));
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(JSON.stringify(response))
    });


    const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
      //Do something with data
      console.log('Received data in the background: ' + JSON.stringify(data))

    });

    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };

  }, []);


  useEffect(() => {

    try {


      const subscribe = auth().onAuthStateChanged((user) => {

        if (user == null) {

          setFirstScreen(LoginScreen)
        }
        else {

          let providerData = user.providerData;
          let hasPasswordAuth = false;
          for (let obj of providerData) {
            if (obj.providerId === 'password') hasPasswordAuth = true;
            console.log('App.js loaded; User has password - ' + JSON.stringify(user))
          }
          if (!hasPasswordAuth) store.dispatch(setSocialAuthentication(true))
          initializeAppData(user, () => setFirstScreen(WelcomeScreen));
        }

      })
      return subscribe;
    }
    catch (error) {
      report.recordError(error)
    }
  }, [])



  if (!isReady || !fontIsLoaded) {
    return null;
  }

  try {
    return (
      <Provider store={store}>

        <SafeAreaProvider>
          <ToastProvider>
            <RootNavigator start={firstScreen} />
            <StatusBar
              animated={true}
              backgroundColor={Colors.primaryColor}
            />
          </ToastProvider>
        </SafeAreaProvider>

      </Provider>
    );
  }
  catch (error) {
    report.recordError('Error at the App.js root level')
    report.recordError(error)
  }
}