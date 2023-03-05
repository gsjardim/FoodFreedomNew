import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
//Screens
import { HomeScreen } from '../screens/HomeScreen';
import FoodMoodScreen from '../screens/FoodMoodScreen';
import WaterScreen from '../screens/WaterScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import SleepScreen from '../screens/SleepScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import DrawerNavigator from './drawerNavigation';
import { VideoScreen } from '../screens/VideoScreen';
import { DiaryInputScreen } from '../screens/DiaryInputScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';


const Stack = createStackNavigator();

export const HomeStackNavigator = (props: any) => {


    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={props.start}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen name="FoodMoodScreen" component={FoodMoodScreen} />
            <Stack.Screen name="WaterScreen" component={WaterScreen} />
            <Stack.Screen name="ExerciseScreen" component={ExerciseScreen} />
            <Stack.Screen name="SleepScreen" component={SleepScreen} />
            <Stack.Screen name="VideoScreen" component={VideoScreen} />
            <Stack.Screen name="DiaryInputScreen" component={DiaryInputScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        </Stack.Navigator>
    )
}


export const HistoryStackNavigator = () => {

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName="HistoryScreen"
        >
            <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
            <Stack.Screen name="FoodMoodScreen" component={FoodMoodScreen} />
        </Stack.Navigator>
    )
}

