import { View, Text, Button, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react'

import { Table, Row, TableWrapper, Cell } from 'react-native-table-component';
import { useNavigation } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler';

import { Logo, tableStyles } from './styles'
import logoImg from '../../assets/LogoTCC.jpg'


export default function ProdutosModal(props: any) {
    const [tableBoxes, setTableBoxes] = useState([])
    const navigation = useNavigation();


    useEffect(() => {

        const stringProducts = props.route.params.products
        const products = JSON.parse(stringProducts)
        const datafilter = products.map(el => {
            return [el.barcode, el.type, el.name, el.status]
        })
        setTableBoxes(datafilter)
    }, [])

    return (
        <>
            <View style={tableStyles.container}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Button onPress={() => navigation.goBack()} title="X" color={'#ca3a18'} />
                    <Logo source={logoImg} />
                    <Text>Produtos Dentro da Caixa</Text>
                </View>
                <View>
                    <Table borderStyle={{ borderColor: 'transparent' }}>
                        <Row data={['Barcode', 'Tipo', 'Nome', 'Status']} style={tableStyles.head} textStyle={tableStyles.text} />
                        <ScrollView>
                            {
                                tableBoxes.map((data, index) => {
                                    if (Array.isArray(data)) {
                                        return (
                                            <TableWrapper key={index} style={tableStyles.row}>
                                                {
                                                    data.map((cellData, cellIndex) => (
                                                        <Cell key={cellIndex} data={cellData} textStyle={tableStyles.text} />
                                                    ))
                                                }
                                            </TableWrapper>
                                        )
                                    }
                                })
                            }
                        </ScrollView>
                    </Table>
                </View>
            </View>
        </>
    );
}

