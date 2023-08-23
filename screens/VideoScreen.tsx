import React from 'react'
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Colors } from '../resources/colors';
import { Video, Audio, ResizeMode } from 'expo-av';
import { useRef, useState, useEffect} from "react";
import PhoneDimensions from "../resources/layout";
import Ionicons from '@expo/vector-icons/Ionicons'
import { GeneralTextStyle } from "../resources/constants";
import report from '../components/CrashReport';

export const VideoScreen = ({ route, navigation }: any) => {

    let url = route.params.videoUrl;
    let description = route.params.videoDesc;
    const video = useRef<Video>(null);
    const [status, setStatus] = useState<any>({});

    useEffect(() => {
        if (status.isPlaying) triggerAudio(video);
      }, [video, status.isPlaying]);

    return (
        <View style={styles.container}>
            { <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 10,}}>
                <Pressable style={{ width: '10%', alignItems: 'center', marginRight: 10 }} onPress={() => {
                    if (video.current != null) video.current.stopAsync();
                    navigation.pop();
                }}>
                    <Ionicons name="arrow-back" size={30} color={Colors.white} />
                </Pressable>
                <Text style={[GeneralTextStyle, {color: Colors.white, flexShrink: 1}]}>{description}</Text>
            </View>}

            <Video
                ref={video}
                style={styles.video}
                source={{ uri: url }}
                isLooping={false}
                shouldPlay={true}
                useNativeControls={true}
                resizeMode={ResizeMode.CONTAIN}
                onPlaybackStatusUpdate={status => setStatus(status)}
                onError={(error) => report.log(error)}
                volume={0.9}
                isMuted={false}
            />


        </View>
    )
}

const triggerAudio = async (ref) => {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    ref.current.playAsync();
  };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000'
    },

    video: {
        width: PhoneDimensions.window.width,
        height: PhoneDimensions.window.height * 0.85,

    }
})