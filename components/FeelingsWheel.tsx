import { Text, View, StyleSheet, Pressable, Modal } from "react-native";
import React from 'react';
import { Colors } from "../resources/colors";
import PhoneDimensions from "../resources/layout";
import { CustomButton } from "./CustomButton";
import { VictoryPie } from 'victory-native';
import { useState } from "react";
import { DefaultPadding, FontSizes, GeneralTextStyle } from "../resources/constants";
import { ActivitiesStrings } from "../resources/strings";
import Ionicons from '@expo/vector-icons/Ionicons'

interface WheelProps {
    showModal: boolean,
    onSelect: (value: any) => void,
    onCancel: (value: boolean) => void,
    selectedFeeling?: string
}

const defaultGraphicData = [
    { y: 1, label: 'Sad' },
    { y: 1, label: 'Bad' },
    { y: 1, label: 'Happy' },
    { y: 1, label: 'Angry' },
    { y: 1, label: 'Disgusted' },
    { y: 1, label: 'Fearful' },
    { y: 1, label: 'Surprised' }
];


let graphicColor = [
    Colors.feelingsWheel.sadColor,
    Colors.feelingsWheel.badColor,
    Colors.feelingsWheel.happyColor,
    Colors.feelingsWheel.angryColor,
    Colors.feelingsWheel.disgustedColor,
    Colors.feelingsWheel.fearfulColor,
    Colors.feelingsWheel.surprisedColor
];

const wheelSize = PhoneDimensions.window.width * 0.9;
const ButtonsWidth = (PhoneDimensions.window.width - (2 * DefaultPadding)) / 3.1;

const FeelingsWheel = ({ showModal, onSelect, onCancel, selectedFeeling }: WheelProps) => {


    const handleOnPressFeeling = (feeling: string) => {
        let newGraphicData: any = []

        setSelection(feeling)
        setCurrentLevel(currentLevel + 1);
        if (currentLevel == 3) {
            setLevel4Selection(feeling)
            return;
        } 
        

        for (let obj of dataArray) {

            if (obj.name === feeling && obj.children !== null) {
                    for (let item of obj.children) newGraphicData.push({ y: 1, label: item.name })
                    setGraphicData(newGraphicData)
                    setDataArray([...obj.children]);
                    
                    if (currentLevel < 3) {
                        let newParentFeeling = [...parentFeeling]
                        if(newParentFeeling.length > 1) newParentFeeling.pop();
                        newParentFeeling.push(feeling)
                        setParentFeeling(newParentFeeling);
                    }
                    if(currentLevel == 1){
                        setGraphicColorArray([obj.color]);
                    }
                    break;
              
            }
        }


    }


    const [selection, setSelection] = useState(selectedFeeling != null ? selectedFeeling : '');
    const [level4Selection, setLevel4Selection] = useState('');
    const [graphicData, setGraphicData] = useState(defaultGraphicData);
    const [graphicColorArray, setGraphicColorArray] = useState(graphicColor);
    const [dataArray, setDataArray] = useState<any>(FeelingsMap);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [parentFeeling, setParentFeeling] = useState<string[]>([]);

    const saveSelection = () => {
        onSelect(selection);
       resetAll()
    }

    const onPressCancel = () => {
        onCancel(false);
        resetAll();
    }

    const resetAll = () => {
        setGraphicData(defaultGraphicData);
        setDataArray(FeelingsMap);
        setGraphicColorArray(graphicColor);
        // setSelection('');
        setCurrentLevel(1);
        setParentFeeling([]);
    }

    const onGoUpLevel = () => {
        if(currentLevel == 1){
            setSelection('');
        }
        else if (currentLevel == 2) {
            setGraphicColorArray(graphicColor);
            setGraphicData(defaultGraphicData)
            setDataArray(FeelingsMap);
            setCurrentLevel(1);
            setParentFeeling([]);
        }
        else if (currentLevel > 2) {
            let map = currentLevel == 3 ? FeelingsMap : dataArray;
            let parent = parentFeeling[currentLevel - 3];
            for (let obj of map) {
                if (obj.name === parent) {
                    let newGraphicData : Array<any> = []
                    for (let child of obj.children) newGraphicData.push({ y: 1, label: child.name })
                    setGraphicData(newGraphicData);
                    setDataArray(obj.children);
                    break;
                }
            }
           
            setCurrentLevel(currentLevel - 1);
        }
        
        
    }

    return (

        <Modal
            visible={showModal}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.wrapper}>

                <View style={styles.selectionView}>
                    <Text style={[GeneralTextStyle, { fontSize: FontSizes.medium_1 }]}>{ActivitiesStrings.wheelQuestion}</Text>
                    {(selection !== '') &&
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <Text
                                style={[GeneralTextStyle, { fontSize: FontSizes.medium_1, color: Colors.primaryColor }]}>
                                {ActivitiesStrings.wheelSelected + selection}
                            </Text>
                            {/* <Pressable onPress={() => setSelection('')}>
                                <Ionicons name="close-circle-outline" size={PhoneDimensions.window.width / 15} color={Colors.exerciseCircle} style={{ marginLeft: 10 }} />
                            </Pressable> */}
                        </View>}
                </View>

                <View style={{ flex: 1 }} />

                {currentLevel == 4 ? 
                    <View style={[styles.fullCircle, {backgroundColor: graphicColorArray[0]}]}>
                        <Text style={{fontSize: FontSizes.medium_2, color: Colors.fontColor}}>{level4Selection}</Text>
                    </View>
                :
                <VictoryPie
                    animate={{ easing: 'expIn', duration: 300 }}
                    data={graphicData}
                    width={wheelSize}
                    height={wheelSize}
                    colorScale={graphicColorArray}
                    innerRadius={0}
                    labelPlacement={"perpendicular"}
                    padAngle={2}
                    style={{
                        labels: {
                            fontSize: FontSizes.medium_1
                        },
                    }}

                    events={[{
                        target: 'data',
                        eventHandlers: {

                            onPressIn: () => {
                                return [
                                    {
                                        target: 'data',
                                        mutation: props => {
                                            handleOnPressFeeling(props.datum.label)
                                        }

                                    }
                                ]
                            }


                        }


                    }]}
                />}

                <View style={{ flex: 1 }} />

                <View style={styles.buttonsView}>
                    <CustomButton
                        label={ActivitiesStrings.saveButton}
                        roundCorners={true}
                        onPress={saveSelection}
                        width={ButtonsWidth}
                        labelSize={FontSizes.small_2 * 0.9}
                    />
                    <CustomButton
                        label={ActivitiesStrings.goBackButton}
                        roundCorners={true}
                        onPress={onGoUpLevel}
                        width={ButtonsWidth}
                        labelSize={FontSizes.small_2 * 0.9}
                    />
                    <CustomButton
                        label={ActivitiesStrings.cancelButton}
                        roundCorners={true}
                        onPress={() => onPressCancel()}
                        width={ButtonsWidth}
                        labelSize={FontSizes.small_2 * 0.9}
                    />
                </View>
            </View>
        </Modal>

    )
}



const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: PhoneDimensions.window.height * 0.05,
        paddingHorizontal: DefaultPadding,
    },

    selectionView: {
        width: '100%',
        alignItems: 'center',
        marginTop: PhoneDimensions.window.height * 0.04
    },

    buttonsView: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    fullCircle:{
        width: wheelSize * 0.75,
        height: wheelSize * 0.75,
        borderRadius: wheelSize * 0.75 / 2,
        justifyContent: 'center',
        alignItems: 'center'
    }


})

export default FeelingsWheel;

//This is the map holding the hierarchy according to www.feelingswheel.com
const FeelingsMap = [
    {
        id: 'e11',
        name: 'Angry',
        color: Colors.feelingsWheel.angryColor,
        children: [
            {
                id: 'e201',
                name: 'Let down',
                children: [
                    {
                        id: 'e301',
                        name: 'Betrayed',
                    },
                    {
                        id: 'e302',
                        name: 'Resentful'
                    }
                ]
            },
            {
                id: 'e202',
                name: 'Humiliated',
                children: [
                    {
                        id: 'e303',
                        name: 'Disrespected'
                    },
                    {
                        id: 'e304',
                        name: 'Ridiculed'
                    },
                ]
            },
            {
                id: 'e203',
                name: 'Bitter',
                children: [
                    {
                        id: 'e305',
                        name: 'Indignant'
                    },
                    {
                        id: 'e306',
                        name: 'Violated'
                    },
                ]
            },
            {
                id: 'e204',
                name: 'Mad',
                children: [
                    {
                        id: 'e307',
                        name: 'Furious'
                    },
                    {
                        id: 'e308',
                        name: 'Jealous'
                    },
                ]
            },
            {
                id: 'e205',
                name: 'Aggressive',
                children: [
                    {
                        id: 'e309',
                        name: 'Provoked'
                    },
                    {
                        id: 'e310',
                        name: 'Hostile'
                    },
                ]
            },
            {
                id: 'e206',
                name: 'Frustrated',
                children: [
                    {
                        id: 'e311',
                        name: 'Infuriated'
                    },
                    {
                        id: 'e312',
                        name: 'Annoyed'
                    },
                ]
            },
            {
                id: 'e207',
                name: 'Distant',
                children: [
                    {
                        id: 'e313',
                        name: 'Withdrawn'
                    },
                    {
                        id: 'e314',
                        name: 'Numb'
                    },
                ]
            },
            {
                id: 'e208',
                name: 'Critical',
                children: [
                    {
                        id: 'e315',
                        name: 'Skeptical'
                    },
                    {
                        id: 'e316',
                        name: 'Dismissive'
                    },
                ]
            },
        ]
    },
    {
        id: 'e12',
        name: 'Disgusted',
        color: Colors.feelingsWheel.disgustedColor,
        children: [
            {
                id: 'e209',
                name: 'Disapproving',
                children: [
                    {
                        id: 'e317',
                        name: 'Judgmental'
                    },
                    {
                        id: 'e318',
                        name: 'Embarassed'
                    },
                ]
            },
            {
                id: 'e210',
                name: 'Disappointed',
                children: [
                    {
                        id: 'e319',
                        name: 'Revolted'
                    },
                    {
                        id: 'e320',
                        name: 'Appalled'
                    },
                ]
            },
            {
                id: 'e211',
                name: 'Awful',
                children: [
                    {
                        id: 'e321',
                        name: 'Detestable'
                    },
                    {
                        id: 'e322',
                        name: 'Nauseated'
                    },
                ]
            },
            {
                id: 'e212',
                name: 'Repelled',
                children: [
                    {
                        id: 'e323',
                        name: 'Hesitant'
                    },
                    {
                        id: 'e324',
                        name: 'Horrified'
                    },
                ]
            },
        ]
    },
    {
        id: 'e13',
        name: 'Sad',
        color: Colors.feelingsWheel.sadColor,
        children: [
            {
                id: 'e213',
                name: 'Hurt',
                children: [
                    {
                        id: 'e325',
                        name: 'Embarrassed'
                    },
                    {
                        id: 'e326',
                        name: 'Disappointed'
                    },
                ]
            },
            {
                id: 'e214',
                name: 'Depressed',
                children: [
                    {
                        id: 'e327',
                        name: 'Inferior'
                    },
                    {
                        id: 'e328',
                        name: 'Empty'
                    },
                ]
            },
            {
                id: 'e215',
                name: 'Guilty',
                children: [
                    {
                        id: 'e329',
                        name: 'Ashamed'
                    },
                    {
                        id: 'e330',
                        name: 'Remorseful'
                    },
                ]
            },
            {
                id: 'e216',
                name: 'Despair',
                children: [
                    {
                        id: 'e331',
                        name: 'Grief'
                    },
                    {
                        id: 'e332',
                        name: 'Powerless'
                    },
                ]
            },
            {
                id: 'e217',
                name: 'Vulnerable',
                children: [
                    {
                        id: 'e333',
                        name: 'Victimized'
                    },
                    {
                        id: 'e334',
                        name: 'Fragile'
                    },
                ]
            },
            {
                id: 'e218',
                name: 'Lonely',
                children: [
                    {
                        id: 'e335',
                        name: 'Isolated'
                    },
                    {
                        id: 'e336',
                        name: 'Abandoned'
                    },
                ]
            },
        ]
    },
    {
        id: 'e14',
        name: 'Happy',
        color: Colors.feelingsWheel.happyColor,
        children: [
            {
                id: 'e219',
                name: 'Optimistic',
                children: [
                    {
                        id: 'e337',
                        name: 'Hopeful'
                    },
                    {
                        id: 'e338',
                        name: 'Inspired'
                    },
                ]
            },
            {
                id: 'e220',
                name: 'Trusting',
                children: [
                    {
                        id: 'e339',
                        name: 'Sensitive'
                    },
                    {
                        id: 'e340',
                        name: 'Intimate'
                    },
                ]
            },
            {
                id: 'e221',
                name: 'Peaceful',
                children: [
                    {
                        id: 'e341',
                        name: 'Loving'
                    },
                    {
                        id: 'e342',
                        name: 'Thankful'
                    },
                ]
            },
            {
                id: 'e222',
                name: 'Powerful',
                children: [
                    {
                        id: 'e343',
                        name: 'Courageous'
                    },
                    {
                        id: 'e344',
                        name: 'Creative'
                    },
                ]
            },
            {
                id: 'e223',
                name: 'Accepted',
                children: [
                    {
                        id: 'e345',
                        name: 'Respected'
                    },
                    {
                        id: 'e346',
                        name: 'Valued'
                    },
                ]
            },
            {
                id: 'e224',
                name: 'Proud',
                children: [
                    {
                        id: 'e347',
                        name: 'Successful'
                    },
                    {
                        id: 'e348',
                        name: 'Confident'
                    },
                ]
            },
            {
                id: 'e225',
                name: 'Interested',
                children: [
                    {
                        id: 'e349',
                        name: 'Curious'
                    },
                    {
                        id: 'e350',
                        name: 'Inquisitive'
                    },
                ]
            },
            {
                id: 'e226',
                name: 'Content',
                children: [
                    {
                        id: 'e351',
                        name: 'Free'
                    },
                    {
                        id: 'e352',
                        name: 'Joyful'
                    },
                ]
            },
            {
                id: 'e227',
                name: 'Playful',
                children: [
                    {
                        id: 'e353',
                        name: 'Aroused'
                    },
                    {
                        id: 'e354',
                        name: 'Cheeky'
                    },
                ]
            },
        ]
    },
    {
        id: 'e15',
        name: 'Surprised',
        color: Colors.feelingsWheel.surprisedColor,
        children: [
            {
                id: 'e228',
                name: 'Excited',
                children: [
                    {
                        id: 'e355',
                        name: 'Eager'
                    },
                    {
                        id: 'e356',
                        name: 'Energetic'
                    },
                ]
            },
            {
                id: 'e229',
                name: 'Amazed',
                children: [
                    {
                        id: 'e357',
                        name: 'Astonished'
                    },
                    {
                        id: 'e358',
                        name: 'Awe'
                    },
                ]
            },
            {
                id: 'e230',
                name: 'Confused',
                children: [
                    {
                        id: 'e359',
                        name: 'Disillusioned'
                    },
                    {
                        id: 'e360',
                        name: 'Perplexed'
                    },
                ]
            },
            {
                id: 'e231',
                name: 'Startled',
                children: [
                    {
                        id: 'e361',
                        name: 'Shocked'
                    },
                    {
                        id: 'e362',
                        name: 'Dismayed'
                    },
                ]
            },
        ]
    },
    {
        id: 'e16',
        name: 'Bad',
        color: Colors.feelingsWheel.badColor,
        children: [
            {
                id: 'e232',
                name: 'Tired',
                children: [
                    {
                        id: 'e363',
                        name: 'Sleepy'
                    },
                    {
                        id: 'e364',
                        name: 'Unfocused'
                    },
                ]
            },
            {
                id: 'e233',
                name: 'Stressed',
                children: [
                    {
                        id: 'e365',
                        name: 'Overwhelmed'
                    },
                    {
                        id: 'e366',
                        name: 'Out of control'
                    },
                ]
            },
            {
                id: 'e234',
                name: 'Busy',
                children: [
                    {
                        id: 'e367',
                        name: 'Pressured'
                    },
                    {
                        id: 'e368',
                        name: 'Rushed'
                    },
                ]
            },
            {
                id: 'e235',
                name: 'Bored',
                children: [
                    {
                        id: 'e369',
                        name: 'Indiferent'
                    },
                    {
                        id: 'e370',
                        name: 'Apathetic'
                    },
                ]
            },
        ]
    },
    {
        id: 'e17',
        name: 'Fearful',
        color: Colors.feelingsWheel.fearfulColor,
        children: [
            {
                id: 'e236',
                name: 'Scared',
                children: [
                    {
                        id: 'e371',
                        name: 'Helpless'
                    },
                    {
                        id: 'e372',
                        name: 'Frightened'
                    },
                ]
            },
            {
                id: 'e237',
                name: 'Anxious',
                children: [
                    {
                        id: 'e373',
                        name: 'Overwhelmed'
                    },
                    {
                        id: 'e374',
                        name: 'Worried'
                    },
                ]
            },
            {
                id: 'e238',
                name: 'Insecure',
                children: [
                    {
                        id: 'e375',
                        name: 'Inadequate'
                    },
                    {
                        id: 'e376',
                        name: 'Inferior'
                    },
                ]
            },
            {
                id: 'e239',
                name: 'Weak',
                children: [
                    {
                        id: 'e377',
                        name: 'Worthless'
                    },
                    {
                        id: 'e378',
                        name: 'Insignificant'
                    },
                ]
            },
            {
                id: 'e240',
                name: 'Rejected',
                children: [
                    {
                        id: 'e379',
                        name: 'Excluded'
                    },
                    {
                        id: 'e380',
                        name: 'Persecuted'
                    },
                ]
            },
            {
                id: 'e241',
                name: 'Threatened',
                children: [
                    {
                        id: 'e381',
                        name: 'Nervous'
                    },
                    {
                        id: 'e382',
                        name: 'Exposed'
                    },
                ]
            },
        ]
    },
]