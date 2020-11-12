import React, { useEffect, useState } from 'react'
import { Table, Row, TableWrapper, Cell } from 'react-native-table-component';
import { tableStyles } from './styles';
import { View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import api from '../../services/api';
import { Logo } from './styles'
import logoImg from '../../assets/LogoTCC.jpg'
import { ScrollView } from 'react-native-gesture-handler';
import data from '../../assets/data.json'


const getApiData = () => {
    return data
}


export default function Operacao() {
    const [tableOperacao, setTableOperacao] = useState([])
    const [ArrOperacao, setArrOperacao] = useState([])
    const [tableHead,] = useState(['Nome da Compania', 'Endereço da Mina', 'Status'])
    const navigation = useNavigation();



    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', () => { return true });
        (async () => {


            const { data } = await api.get('/operations') //getApiData()             
            const datafilter = data.map(el => {
                return [el.mining_company.name, el.mining_field.plus_code, el.status]
            })
            setArrOperacao(data)
            setTableOperacao(datafilter)

        })()
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', () => { return true });
        }
    }, [])

    return (
        <View style={tableStyles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Logo source={logoImg} />
                <Text>Selectione uma Operação</Text>
            </View>
            <View>
                <Table borderStyle={{ borderColor: 'transparent' }}>
                    <Row data={tableHead} style={tableStyles.head} textStyle={tableStyles.text} />
                    <ScrollView>
                        {
                            tableOperacao.map((data, index) => {
                                if (Array.isArray(data)) {
                                    return (

                                        <TouchableOpacity key={index} onPress={() => {
                                            navigation.navigate('OperacaoModal', {
                                                operacao: ArrOperacao[index]
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
    )

}