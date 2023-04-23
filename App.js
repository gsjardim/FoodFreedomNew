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
// import * as BackgroundFetch from 'expo-background-fetch';
import {registerTaskAsync, BackgroundFetchResult} from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { queryJournalEntriesByDateInterval } from './dao/journalEntryDAO';
import { dateToKeyDate } from './resources/common';
import { NotificationsStrings } from './resources/strings';

// const BACKGROUND_FETCH_TASK = 'background-fetch';

// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
//   let now = new Date();
//   queryJournalEntriesByDateInterval(dateToKeyDate(now), dateToKeyDate(now), (entries) => {
//     if (entries != null && entries[0].waterRecord.quantity <= 8) {
//       Notifications.scheduleNotificationAsync({
//         content: {
//           title: NotificationsStrings.mealReminderTitle,
//           body: NotificationsStrings.waterReminder,
//         },
//         trigger: {
//           channelId: 'Default',
//           seconds: 1,
//         }
//       })
//     }
//   })

//   return BackgroundFetchResult.NewData;
// });

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
    report.recordError(error)
  }
}