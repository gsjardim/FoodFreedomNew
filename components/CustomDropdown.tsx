import { Text, View, StyleSheet, Pressable, Modal, FlatList } from "react-native";
import React from 'react';
import { Colors } from "../resources/colors";
import PhoneDimensions from "../resources/layout";
import { ScrollView, } from "react-native-gesture-handler";
import Ionicons from '@expo/vector-icons/Ionicons'
import { neutralMenuOption } from "../resources/constants";

interface DropdownProps {
    showModal: boolean,
    onSelect: (value: any) => void,
    data: any[],
}

const CustomDropDown = ({ showModal, onSelect, data }: DropdownProps) => {


    return (

        <Modal
            visible={showModal}
            transparent={true}
            animationType="slide"
        >
            <View style={ModalStyle.wrapper}>
                {/** Cancel / Clear button */}
                <Pressable
                    style={{
                        alignSelf: 'flex-end',
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: Colors.white,
                        width: 35,
                        height: 35,
                    }}
                    onPress={() => onSelect(neutralMenuOption)}
                >
                    <Ionicons name="close" color={Colors.darkGray} size={35}/>
                </Pressable>
                <FlatList
                    style={ModalStyle.containerView}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    data={data}
                    keyExtractor={(item) => item}
                    renderItem={(value) =>
                        <Pressable
                            key={value.index.toString()}
                            style={ModalStyle.option}
                            onPress={() => onSelect(value.item)}
                        >
                            <Text style={ModalStyle.optionText}>{value.item}</Text>
                        </Pressable>
                    }
                    getItemLayout={(_data, index) => ({
                        length: 42,
                        offset: 42 * index,
                        index
                    })}

                />
            </View>
        </Modal>

    )
}



const ModalStyle = StyleSheet.create({
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(60, 60, 60, 0.4)',
        paddingVertical: PhoneDimensions.window.height * 0.2,
    },

    containerView: {
        backgroundColor: '#fff',
        minWidth: PhoneDimensions.window.width * 0.6,
        
    },

    option: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderColor: Colors.lightGray,
        borderBottomWidth: 2,
    },

    optionText: {
        fontSize: 20,
    }
})

export default CustomDropDown;