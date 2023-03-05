import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image} from 'react-native';
import { createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { ResourcesScreen } from '../screens/ResourcesScreen';
import PhoneDimensions from '../resources/layout';
import { Colors } from '../resources/colors';
import { FontFamilies } from '../resources/constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import { dark_diary,  diaryGreen,report, reportGreen, resGreen, resources } from '../resources/imageObj';
import { BottomTabLabels } from '../resources/strings';
import { HomeScreen } from '../screens/HomeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { Diary } from '../screens/DiaryScreen';

const Tab = createBottomTabNavigator()
const iconSetSize = PhoneDimensions.window.width / 14
const labelSize = PhoneDimensions.window.width / 28
const tabHeight = iconSetSize + labelSize + 30

const TabIcon = ({ imagePath, labelText }: any) => {

    return (
     
        <Image
            source={imagePath}
            style={{
                width: iconSetSize,
                height: iconSetSize,
                resizeMode: 'contain',
                maxWidth: 40,
                position: 'absolute',
                bottom: 0,
                flex: 1,
            }}
        />      
    )
}

const renderTabIcons = (route: any, focused?: boolean, color?: string, size?: number) => {
    let imagePath: any

    switch (route.name) {
        case 'Home': {
            return <Ionicons name={'home'} color={color} size={iconSetSize <= 37 ? iconSetSize : 37} style={{ position: 'absolute', bottom: 0 }} />
        }
        case 'Diary': {
            imagePath = focused ? diaryGreen : dark_diary
            break;
        }
        case 'History': {
            imagePath = focused ? reportGreen : report
            break;
        }
        case 'Resources': {
            imagePath = focused ? resGreen : resources
            break;
        }
        
    }
    return <TabIcon imagePath={imagePath} label={route.name} />
}



const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();
    return (

        <Tab.Navigator
            initialRouteName={BottomTabLabels.home}
            backBehavior='history'

            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => renderTabIcons(route, focused, color, size),
                tabBarActiveTintColor: Colors.primaryColor,
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: {
                    fontSize: labelSize,
                    fontFamily: FontFamilies.Poppins,
                },
                headerShown: false,
                tabBarStyle: {
                    height: tabHeight + insets.bottom,
                    borderTopColor: Colors.lightGray,
                    borderTopWidth: 0.5,
                },
                tabBarItemStyle: {
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: 8,

                }
            })}

        >
            <Tab.Screen name={BottomTabLabels.home} component={HomeScreen} /> 
            <Tab.Screen name={BottomTabLabels.diary} component={Diary} />
            <Tab.Screen name={BottomTabLabels.history} component={HistoryScreen} />
            <Tab.Screen name={BottomTabLabels.resources} component={ResourcesScreen} />
            

        </Tab.Navigator>
    )
}

export default BottomTabNavigator;