import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { HomeStackNavigator } from './stackNavigation';



const RootNavigator = (props: any) => {

    return (
        <NavigationContainer>
            <HomeStackNavigator start={props.start}/>
        </NavigationContainer>

    )
}

export default RootNavigator;