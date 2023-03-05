import React from 'react'
import { useEffect, useRef, useState } from "react";
import { Animated, Image, View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useStore } from "react-redux";
import { Colors } from '../resources/colors';
import { DefaultPadding, FontFamilies, FontSizes, messagesArray, GeneralTextStyle, DefaultShadow } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { ResourcesScreenStrings } from "../resources/strings";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { MyVideo } from "../models/VideoModel";
import store from "../redux.store/configureStore";
import { compareDates, keyDateToDate, keyDateToStringDate, stringToDate } from "../resources/common";
import { getStorageData, LAST_NEW_VIDEO } from "../dao/internalStorage";
import MyNotification from "../models/NotificationModel";
import { getLocalNotifications, saveNotificationsArray } from "../dao/notificationsDAO";
import { setNewMessageStatus } from "../redux.store/actions/generalActions/creators";

const VideoTab = 1;
const MessageTab = 2;
const ThumbnailWidth = PhoneDimensions.window.width * 0.3;
const { elevation, shadowOpacity, shadowColor, shadowOffset } = DefaultShadow;

export const ResourcesScreen = ({ navigation }: any) => {

    const [selectedTab, setSelectedTab] = useState(VideoTab);
    const [messages, setMessages] = useState<MyNotification[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [videosArray, setVideosArray] = useState<MyVideo[]>(store.getState().general.videosArray)
    const swipable = useRef(null);
    let rows: Array<any> = [];
    
    useEffect(() => {

        const unsubscribe = store.subscribe(() => {
            let videos = store.getState().general.videosArray
            setVideosArray(videos);
            if(store.getState().general.isThereNewMessage) loadMessages()
        })
        return unsubscribe;
    }, [])


    const deleteMessage = () => {
        if (selectedIndex > -1) {
            let newArray = [...messages];
            newArray.splice(selectedIndex, 1);
            setMessages(newArray);
            saveNotificationsArray(newArray);
            rows.forEach((obj) => {
                if(obj) obj.close()
            })
        }
        setSelectedIndex(-1);

    }

    const loadMessages = () => {
        getLocalNotifications()
            .then(value => {
                if (value != null) {
                    let arr: MyNotification[] = [];
                    for (let obj of value) {
                        let not = new MyNotification(obj.date, obj.title, obj.content)
                        arr.push(not)
                    }
                    arr.sort((a,b) => {return compareDates(stringToDate(b.date), stringToDate(a.date))})
                    setMessages(arr);
                }

            })
            .then(() => store.dispatch(setNewMessageStatus(false)))
    }

    const renderLeftActions = (progress: any, dragX: any) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 50, 50],
            outputRange: [0, 0, 0, 1],
        });
        return (
            <Pressable
                style={{ backgroundColor: Colors.feelingsWheel.angryColor, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, }}
                onPress={() => deleteMessage()}
            >
                <Animated.Text style={[GeneralTextStyle, { transform: [{ translateX: trans }] }]} >Delete</Animated.Text>
            </Pressable>
        )
    }

    const selectRow = (index: number) => {
        rows.forEach((obj, ind) => {
            if(obj && ind != index) obj.close()
        })
        setSelectedIndex(index)
    }

    return (
        <View style={styles.container}>
            <View style={styles.tabsView}>
                <Pressable style={[styles.tabStyle, { marginRight: 1 }]} onPress={() => setSelectedTab(VideoTab)}>
                    <Text style={[styles.tabLabel, (selectedTab == VideoTab) && styles.selectedTabStyle]}>{ResourcesScreenStrings.videoTab}</Text>
                </Pressable>
                <Pressable style={[styles.tabStyle]} onPress={() => {
                    setSelectedTab(MessageTab)
                    loadMessages();
                }}>
                    <Text style={[styles.tabLabel, (selectedTab == MessageTab) && styles.selectedTabStyle]}>{ResourcesScreenStrings.messageTab}</Text>
                </Pressable>
            </View>
            {(selectedTab == VideoTab) && <FlatList
                data={videosArray.sort((v1, v2) => {return compareDates(keyDateToDate(v2.dateCreated), keyDateToDate(v1.dateCreated)) })}
                keyExtractor={(_item, index) => index.toString()}
                style={{ width: '100%', marginVertical: PhoneDimensions.window.width * 0.05 }}
                renderItem={(obj) =>
                    <TouchableOpacity
                        style={styles.videoCard}
                        onPress={() => navigation.navigate("VideoScreen", { videoDesc: obj.item.description, videoUrl: obj.item.url })}
                    >
                        <View style={{ flex: 2 }}>
                            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                                <Text style={GeneralTextStyle}>{keyDateToStringDate(obj.item.dateCreated)}</Text>
                                <Text style={[GeneralTextStyle, { color: Colors.exerciseCircle, marginLeft: 30 }]}>{obj.item.isNew ? 'New' : ''}</Text>
                            </View>
                            <Text style={GeneralTextStyle}>{obj.item.description}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={{ uri: obj.item.thumbnail }} style={styles.thumbnail} />
                        </View>
                    </TouchableOpacity>}
            />}

            {(selectedTab == MessageTab) && <FlatList
                data={messages}
                keyExtractor={(_item, index) => index.toString()}
                style={{ width: '100%', marginVertical: PhoneDimensions.window.width * 0.05 }}
                renderItem={(obj) =>
                    <Swipeable
                        ref={ref => rows.push(ref)}
                        containerStyle={[styles.videoCard, { justifyContent: 'center' }]}
                        onSwipeableOpen={() => selectRow(obj.index)}
                        renderLeftActions={renderLeftActions}

                    >
                        <View style={{ flex: 1, width: PhoneDimensions.window.width * 0.85, }}>
                            <Text style={[GeneralTextStyle, { flexShrink: 1, marginBottom: 8 }]}>{obj.item.date + ' - ' + obj.item.title}</Text>
                            <Text style={[GeneralTextStyle, { flexShrink: 1 }]}>{obj.item.content}</Text>
                        </View>

                    </Swipeable>}
            />}
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Colors.white
    },

    tabsView: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    tabStyle: {
        flex: 1,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        paddingVertical: PhoneDimensions.window.width * 0.04
    },

    selectedTabStyle: {
        borderBottomColor: '#fff',
        borderBottomWidth: 2
    },

    tabLabel: {
        color: Colors.white,
        fontFamily: FontFamilies.Poppins,
        fontSize: FontSizes.medium_1,

    },

    videoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: Colors.opaqueWhite,
        marginBottom: 10,
        borderRadius: 10,
        marginHorizontal: PhoneDimensions.window.width * 0.03,
        shadowColor: shadowColor,
        shadowOpacity: shadowOpacity,
        shadowOffset: shadowOffset,
        elevation: elevation,
    },



    thumbnail: {
        width: ThumbnailWidth,
        height: ThumbnailWidth * 0.75,
        // resizeMode: "contain",
    }
})