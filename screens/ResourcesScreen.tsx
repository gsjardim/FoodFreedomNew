import React from 'react'
import { useEffect,  useState } from "react";
import { Image, View, Text, StyleSheet, FlatList } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Colors } from '../resources/colors';
import {  GeneralTextStyle, DefaultShadow } from "../resources/constants";
import PhoneDimensions from "../resources/layout";
import { MyVideo } from "../models/VideoModel";
import store from "../redux.store/configureStore";
import { compareDates, keyDateToDate, keyDateToStringDate} from "../resources/common";


const ThumbnailWidth = PhoneDimensions.window.width * 0.3;
const { elevation, shadowOpacity, shadowColor, shadowOffset } = DefaultShadow;

export const ResourcesScreen = ({ navigation }: any) => {

    const [videosArray, setVideosArray] = useState<MyVideo[]>(store.getState().general.videosArray)

    useEffect(() => {

        const unsubscribe = store.subscribe(() => {
            let videos = store.getState().general.videosArray
            setVideosArray(videos);
        })
        return unsubscribe;
    }, [])



    return (
        <View style={styles.container}>
           <FlatList
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
            />
           
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: Colors.white
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