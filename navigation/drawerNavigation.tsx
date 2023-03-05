import React from 'react';
import { Image, StyleSheet, View, Text, Platform, StatusBar } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, } from '@react-navigation/drawer';
import { FontFamilies, TERMS_URL, PRIVACY_URL, FontSizes, StatusBarHeight, Activities, GoogleWebClient } from '../resources/constants';
import PhoneDimensions from '../resources/layout';
import { Colors } from '../resources/colors';
import BottomTabNavigator from './bottomTabNavigation';
import { notificationIcon, freeResIcon, aboutIcon, termsIcon, contactIcon, signoutIcon, FF_logo, FF_whiteLogo, logoBanner, diary, profile } from '../resources/imageObj';
import { openUrlInBrowser } from '../resources/common';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FreeResourcesScreen } from '../screens/FreeResourcesScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { ContactScreen } from '../screens/ContactScreen';
import { Diary } from '../screens/DiaryScreen';
import database from '@react-native-firebase/database'
import storage from '@react-native-firebase/storage'
import auth from '@react-native-firebase/auth'
import store from '../redux.store/configureStore';
import { logoutUser, setSocialAuthentication } from '../redux.store/actions/userActions/creators';
import * as AuthSession from 'expo-auth-session';
import { APPLE_TOKEN, deleteStorageData, FB_TOKEN, getStorageData, GOOGLE_EMAIL, GOOGLE_TOKEN, LOGIN_INFO, OAUTH_TOKEN, storeJSON, storeString } from '../dao/internalStorage';
import { discovery } from 'expo-auth-session/providers/google';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';


const Drawer = createDrawerNavigator();
const drawerIconSize = PhoneDimensions.window.width / 18;
const drawerLogoWidth = PhoneDimensions.window.width / 6;
const drawerLabels = {
    profile: 'Profile',
    notifications: 'Notifications',
    freeRes: 'Free resources',
    about: 'About',
    termsAndCond: 'Terms and conditions',
    privacyPolicy: 'Privacy policy',
    contactUs: 'Contact us',
    signOut: 'Sign out',
}


const getIcon = (label: string) => {

    let sourceFile;

    switch (label) {
        case drawerLabels.profile: sourceFile = profile; break;
        case drawerLabels.notifications: sourceFile = notificationIcon; break;
        case drawerLabels.freeRes: sourceFile = freeResIcon; break;
        case drawerLabels.about: sourceFile = aboutIcon; break;
        case drawerLabels.termsAndCond: sourceFile = termsIcon; break;
        case drawerLabels.privacyPolicy: sourceFile = termsIcon; break;
        case drawerLabels.contactUs: sourceFile = contactIcon; break;
        case drawerLabels.signOut: sourceFile = signoutIcon; break;
    }
    return (
        <Image source={sourceFile} style={[styles.itemIconStyle,]} />
    )
}



const CustomDrawerContent = (props: any) => {

   
    const handleSignOut = async () => {
        auth().signOut()
            .then(() => store.dispatch(logoutUser()));

        deleteStorageData(FB_TOKEN)

        store.dispatch(setSocialAuthentication(false));
        // const token = await getStorageData(OAUTH_TOKEN) || '';
        // console.log('Handle logout oauth credentials - ' + token)
        // if (token !== '') {
        //     try {
        //         let success = await AuthSession.revokeAsync({ token: token }, discovery);
        //         console.log('DrawerNavigation handle apple logout ' + success)
        //         deleteStorageData(OAUTH_TOKEN);
        //     } catch (e: any) {
        //         console.log(`Failed to revoke token: ${e.message}`);
        //     }
        // }
    };

    const handlePressDrawerItem = (label: string) => {
        switch (label) {
            case drawerLabels.profile:
                props.navigation.navigate('ProfileScreen')
                break;
            case drawerLabels.notifications:
                props.navigation.navigate('Settings')
                break;
            case drawerLabels.freeRes:
                props.navigation.navigate('FreeResources')
                break;
            case drawerLabels.about:
                props.navigation.navigate('About')
                break;
            case drawerLabels.termsAndCond:
                openUrlInBrowser(TERMS_URL)
                break;
            case drawerLabels.privacyPolicy:
                openUrlInBrowser(PRIVACY_URL)
                break;
            case drawerLabels.contactUs:
                props.navigation.navigate('Contact')
                break;
            case drawerLabels.signOut:

                handleSignOut();
                

                props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'LoginScreen' }],
                });
                break;
        }

    }

    const labelsArray = Object.values(drawerLabels);


    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }} >
            {/* <DrawerItemList  {...props} /> */}

            {/**Header */}
            <View style={styles.drawerHeader}>
                <Image source={FF_whiteLogo} style={styles.drawerHeaderLogo} />
                <Text style={styles.drawerHeaderText}>Food Freedom</Text>
            </View>

            {/**Items in the drawer list comes crom the labelsArray array */}
            <View style={{ flex: 75, backgroundColor: '#fff', paddingVertical: PhoneDimensions.window.width * 0.1 }}>
                {labelsArray.map((label, ind) => {
                    return (
                        <DrawerItem
                            key={ind.toString()}
                            label={({ focused, color }) => <Text style={[styles.itemLabelStyle, { color: focused ? Colors.primaryColor : color }]}>{label}</Text>}
                            style={styles.itemStyle}
                            onPress={() => handlePressDrawerItem(label)}
                            icon={() => getIcon(label)}
                        />
                    )
                })}
            </View >

        </DrawerContentScrollView>
    )
}

const renderDrawerHeader = () => {

    return (
        <View style={styles.navigatorHeader}>
            <Image source={logoBanner} style={styles.navigationHeaderBanner} />
        </View>
    )
}

const DrawerNavigator = () => {
    //const insets = useSafeAreaInsets()
    return (
        <Drawer.Navigator
            initialRouteName='FoodFreedom'
            drawerContent={(props) => CustomDrawerContent(props)}
            defaultStatus='closed'
            backBehavior='history'
            screenOptions={{
                drawerStyle: {
                    width: PhoneDimensions.window.width * 0.85,
                },
                drawerContentContainerStyle: {
                    borderColor: 'black',
                    borderWidth: 1,
                },
                drawerActiveTintColor: 'red',
                drawerActiveBackgroundColor: 'red',
                headerShown: true,
                headerBackground: () => renderDrawerHeader(),
                headerTitle: '',


            }}

        >
            <Drawer.Screen name='FoodFreedom' component={BottomTabNavigator} />
            <Drawer.Screen name='Diary' component={Diary} options={{ unmountOnBlur: true }} />
            <Drawer.Screen name='Settings' component={SettingsScreen} options={{ unmountOnBlur: true }} />
            <Drawer.Screen name='FreeResources' component={FreeResourcesScreen} options={{ unmountOnBlur: true }} />
            <Drawer.Screen name='About' component={AboutScreen} options={{ unmountOnBlur: true }} />
            <Drawer.Screen name='Contact' component={ContactScreen} options={{ unmountOnBlur: true }} />
        </Drawer.Navigator>
    )
}

export default DrawerNavigator;
const statusBarHeight = StatusBar.currentHeight !== undefined ? StatusBar.currentHeight * 1.1 : undefined;

const styles = StyleSheet.create({

    navigatorHeader: {
        width: PhoneDimensions.window.width,
        height: '100%',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: StatusBarHeight,
    },

    navigationHeaderBanner: {
        maxWidth: '70%',
        height: '100%',
        resizeMode: 'contain'
    },

    drawerHeader: {
        backgroundColor: Colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 25,
        paddingLeft: 15
    },

    drawerHeaderText: {
        fontFamily: FontFamilies.Poppins,
        fontSize: PhoneDimensions.window.width / 15,
        color: '#000'
    },

    drawerHeaderLogo: {
        width: drawerLogoWidth,
        height: drawerLogoWidth * 1.15,
        marginRight: 10
    },

    itemStyle: {

    },

    itemLabelStyle: {
        fontSize: FontSizes.small_2,
        fontFamily: FontFamilies.Verdana
    },

    itemIconStyle: {
        width: drawerIconSize,
        height: drawerIconSize,
    }
})