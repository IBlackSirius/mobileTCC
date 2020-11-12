import { View, Text, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react'
import { Table, Row, TableWrapper, Cell } from 'react-native-table-component';
import { useNavigation } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';


import { Logo, tableStyles } from './styles'
import logoImg from '../../assets/LogoTCC.jpg'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AntDesign } from '@expo/vector-icons';



const OfflineProducts: React.FC = (props: any) => {
    const [tableBoxes, setTableBoxes] = useState([])
    const navigation = useNavigation();
    const [displayCamera, setDisplayCamera] = useState(false)
    const [isAtive, setIsAtive] = useState({
        status: '',
        index: -1
    })
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);


    useEffect(() => {
        (async () => {

            const boxes = await returnHistory()

            const stringProducts = boxes[props.route.params.indexofBox].products
            const products = JSON.parse(stringProducts)


            const datafilter = products.map((el: { barcode: any; type: any; name: any; status: any; }) => {
                return [el.barcode, el.type, el.name, el.status]
            })
            setIsAtive({ status: datafilter[0][3], index: 0 })

            setTableBoxes(datafilter)
        })()

    }, [])
    const returnHistory = async () => {
        const history = await AsyncStorage.getItem('HistoryDraftFire')
        if (history) {

            let { boxes } = JSON.parse(history)

            boxes = JSON.parse(boxes)
            return boxes
        }

    }

    const SaveStorage = async () => {
        let updateBoxes = await returnHistory()//

        updateBoxes[props.route.params.indexofBox].products = JSON.stringify(BuildProductsToSave())

        const stringHistory = await AsyncStorage.getItem('HistoryDraftFire')

        if (stringHistory) {
            let history = JSON.parse(stringHistory)
            if (history) {
                history.boxes = JSON.stringify(updateBoxes)
            }
            await AsyncStorage.setItem('HistoryDraftFire', JSON.stringify(history)).then(() => {
                navigation.goBack()
            })
        }
    }


    const BuildProductsToSave = () => {

        const arrAuxTableBoxes = [...tableBoxes]
        const buildProducts: { barcode: never; type: never; name: never; status: never; }[] = []
        arrAuxTableBoxes.map(arr => {
            buildProducts.push({ barcode: arr[0], type: arr[1], name: arr[2], status: arr[3] })
        })
        return buildProducts
    }


    const handleBarCodeScanned = ({ type, data }) => {
        setDisplayCamera(false)
        setScanned(true);
        findProducts(data)
    };

    const findProducts = async (barcode: any) => {
        const boxes = await returnHistory()
        const stringProducts = boxes[props.route.params.indexofBox].products
        const products = JSON.parse(stringProducts)

        let index;
        for (let i = 0; i < products.length; i++) {
            const element = products[i];
            if (element.barcode === barcode) {
                index = i
            }
        }

        if (index !== undefined) {

            setIsAtive({ status: tableBoxes[index][3], index: index })

        } else {
            Alert.alert('Erro', 'Produto não encontrado')
        }

    }

    return (
        <>
            <View style={{
                display: !displayCamera ? 'flex' : 'none'
            }}>
                <View style={tableStyles.container}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Button onPress={() => navigation.goBack()} title="X" color={'#ca3a18'} />
                        <Logo source={logoImg} />
                        <Text>Produtos Dentro da Caixa</Text>
                        <TouchableOpacity style={{
                            paddingLeft: 60
                        }} onPress={() => {
                            setDisplayCamera(true)
                            setScanned(false)
                        }}><AntDesign name="camera" size={24} color="black" /></TouchableOpacity>
                    </View>
                    <View>
                        <Table borderStyle={{ borderColor: 'transparent' }}>
                            <Row data={['Barcode', 'Tipo', 'Nome', 'Status']} style={tableStyles.head} textStyle={tableStyles.text} />
                            <ScrollView>
                                {
                                    tableBoxes.map((data: [], index) => {
                                        if (Array.isArray(data)) {
                                            return (
                                                <TouchableOpacity key={index} onPress={() => {
                                                    setIsAtive({ status: tableBoxes[index][3], index: index })
                                                }} >
                                                    <TableWrapper style={tableStyles.row}>
                                                        {
                                                            data.map((cellData: any, cellIndex: string | number | null | undefined) => (
                                                                <Cell key={cellIndex} data={cellData} textStyle={tableStyles.text} />
                                                            ))
                                                        }
                                                    </TableWrapper>
                                                </TouchableOpacity>
                                            )
                                        }
                                    })
                                }
                            </ScrollView>
                        </Table>
                    </View>
                </View>
            </View>
            <View style={{
                display: !displayCamera ? 'flex' : 'none'
            }}>
                <Text>Selecione o Status do Produto da linha {isAtive.index + 1}</Text>
                <Picker

                    selectedValue={isAtive.status}
                    onValueChange={(itemValue, itemIndex) => {

                        let arrAuxtableBoxes = [...tableBoxes]
                        arrAuxtableBoxes[isAtive.index][3] = itemValue

                        setTableBoxes(arrAuxtableBoxes)

                        if (typeof itemValue === 'string') {
                            setIsAtive({ status: itemValue, index: isAtive.index })
                        }
                    }}>
                    <Picker.Item label='Com Defeito' value='descartado' />
                    <Picker.Item label='Usado' value='usado' />
                    <Picker.Item label='Lacrado' value='lacrado' />


                </Picker>

            </View>
            <View style={{ paddingTop: 10, display: !displayCamera ? 'flex' : 'none' }}>
                <Button color={'#ca3a18'} onPress={async () => await SaveStorage()} title="Salvar Plano de fogo" />
            </View>
            <View
                style={{
                    display: displayCamera ? 'flex' : 'none',
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                }}>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
                <Button color={'#ca3a18'} title={'Voltar'} onPress={() => setDisplayCamera(false)} />
            </View>
        </>
    );
}

export default OfflineProducts