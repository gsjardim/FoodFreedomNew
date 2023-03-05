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
import crashlytics from '@react-native-firebase/crashlytics';
import { GoogleSignin} from '@react-native-google-signin/google-signin';
import { initializeAppData } from './dao/userDAO';
import { GoogleWebClient } from './resources/constants';


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

export const report = crashlytics()

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