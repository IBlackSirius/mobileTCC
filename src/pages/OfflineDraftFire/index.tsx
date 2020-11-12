
import React, { useEffect, useState } from 'react'
import { Table, Row, TableWrapper, Cell } from 'react-native-table-component';
import { tableStyles } from './styles';
import { View, Text, TouchableOpacity, Button, Alert, LogBox, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AntDesign } from '@expo/vector-icons';

import { Logo } from './styles'
import logoImg from '../../assets/LogoTCC.jpg'
import { ScrollView } from 'react-native-gesture-handler';
import api from '../../services/api';



const OfflineDraftFire: React.FC = (props) => {
    const [displayCamera, setDisplayCamera] = useState(false)
    const [BoxesTable, setBoxesTable] = useState([])
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const navigation = useNavigation()
    let history = (async () => await AsyncStorage.getItem('HistoryDraftFire'))()
    const [isOnline, setIsOnline] = useState(false)
    LogBox.ignoreAllLogs()
    useEffect(() => {

        (async () => {
            // await AsyncStorage.removeItem('HistoryDraftFire')
            // await AsyncStorage.removeItem('token')

            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');

            UpdateIsOnline()
            let { boxes } = JSON.parse(await history)
            boxes = JSON.parse(boxes)
            setBoxesTable(boxes.map((el: { barcode: any; quantity_products: any; status: any; }) => {
                return [el.barcode, el.quantity_products, el.status]
            }))
        })()

    }, [])
    const UpdateIsOnline = () => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected)
        });
        unsubscribe();
    }

    const SyncronizeAPI = async () => {


        await UpdateHistory()
        UpdateIsOnline()
        if (isOnline) {
            await UpdateBoxes()

        } else {
            Alert.alert(
                'Sem Conexão',
                'É necessário estar online para Sincrozinar!'
            );
        }
    }

    const UpdateHistory = async () => {
        history = (async () => await AsyncStorage.getItem('HistoryDraftFire'))()
    }

    const UpdateBoxes = async () => {

        let { boxes, id_draft, id_opera } = JSON.parse(await history)
        boxes = JSON.parse(boxes)

        boxes.map((box: { products: string; quantity_products: number; status: string; }) => {

            const products = SpliceProductsUsed(JSON.parse(box.products))
            box.quantity_products = products.length
            box.products = JSON.stringify(products)
            if (box.quantity_products === 0) {
                box.status = 'usado'
            } else {
                box.status = 'lacrado'
            }

        })

        const stringBoxes = JSON.stringify(boxes)
        await AsyncStorage.setItem('HistoryDraftFire', JSON.stringify({ boxes: stringBoxes, id_draft, id_opera }))

        setBoxesTable(boxes.map((el: { barcode: any; quantity_products: any; status: any; }) => {
            return [el.barcode, el.quantity_products, el.status]
        }))


        await api.put('/storagestocks', {
            boxes: boxes
        })

        await AsyncStorage.removeItem('HistoryDraftFire')
        Alert.alert(
            'Sucesso!',
            'Seu Plano de Fogo foi Finalizado', [{
                text: 'Ok',
                onPress: () => navigation.navigate('Login')
            }]
        );



    }



    const SpliceProductsUsed = (products: any[]) => {
        const returnproducts = products.filter(el => {
            return el.status === 'lacrado'
        })
        return returnproducts
    }

    const handleBarCodeScanned = ({ type, data }) => {
        setDisplayCamera(false)
        setScanned(true);
        findBox(data)
    };




    const findBox = async (barcode: any) => {
        let { boxes } = JSON.parse(await history)
        boxes = JSON.parse(boxes)
        let index;
        for (let i = 0; i < boxes.length; i++) {
            const element = boxes[i];
            if (element.barcode === barcode) {
                index = i
            }
        }

        if (index !== undefined) {
            navigation.navigate('OfflineProducts', {
                indexofBox: index
            })

        } else {
            Alert.alert('Erro', 'Caixa não encontrada')
        }
    }
    return (
        <>
            <View
                style={{
                    display: !displayCamera ? 'flex' : 'none'
                }}
            >
                <View style={tableStyles.container}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Logo source={logoImg} />
                        <Text>Continuação da Operação</Text>
                        <TouchableOpacity style={{
                            paddingLeft: 85
                        }} onPress={() => {
                            setDisplayCamera(true)
                            setScanned(false)
                        }}><AntDesign name="camera" size={24} color="black" /></TouchableOpacity>
                    </View>
                    <View>
                        <Table borderStyle={{ borderColor: 'transparent' }}>
                            <Row data={['Barcode', 'Qtd Produtos', 'Status']} style={tableStyles.head} textStyle={tableStyles.text} />
                            <ScrollView>
                                {
                                    BoxesTable.map((data, index) => {
                                        if (Array.isArray(data)) {
                                            return (

                                                <TouchableOpacity key={index} onPress={() => {
                                                    navigation.navigate('OfflineProducts', {
                                                        indexofBox: index
                                                    })
                                                }
                                                }>
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

                </View >
            </View>
            <View
                style={{
                    display: !displayCamera ? 'flex' : 'none'
                }}
            >
                <Button color={'#ca3a18'} onPress={() => {
                    Alert.alert(
                        'Cuidado! ',
                        'Caso Sincronize não poderás alterar mais o Plano de fogo \nGostaria de Sincronizar?',
                        [
                            {
                                text: 'Cancelar',
                                onPress: () => false,
                                style: 'cancel'
                            },
                            { text: 'Sim', onPress: async () => await SyncronizeAPI() }
                        ],
                        { cancelable: false }
                    );

                }} title="Sincronizar" />
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
    )
}
export default OfflineDraftFire