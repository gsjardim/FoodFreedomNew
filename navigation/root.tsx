import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './drawerNavigation';
import { HomeStackNavigator } from './stackNavigation';



const RootNavigator = (props: any) => {

    return (
        <NavigationContainer>
            <HomeStackNavigator start={props.start}/>
        </NavigationContainer>

    )
}

export default RootNavigator;