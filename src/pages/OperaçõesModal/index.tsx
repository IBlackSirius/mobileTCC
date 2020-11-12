import { View, Text, TouchableOpacity, Button, Alert } from 'react-native';
import React, { useEffect, useState } from 'react'
import { Checkbox } from 'react-native-paper'
import { Table, Row, TableWrapper, Cell } from 'react-native-table-component';
import { useNavigation } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler';


import api from '../../services/api';
import { Logo, tableStyles } from './styles'
import logoImg from '../../assets/LogoTCC.jpg'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OperationModal(props: any) {
  const [tableBoxes, setTableBoxes] = useState([])
  const [BoxesData, setBoxesData] = useState([])
  const navigation = useNavigation();
  const [BoxesSelect, setBoxesSelect] = useState([])
  const [checked, setChecked] = useState([]);



  const ChangeBox = (box: { barcode: any; } | undefined) => {
    if (BoxesSelect.length === 0) {
      setBoxesSelect([box])
    } else {
      const auxiliar = [...BoxesSelect]

      if (auxiliar.findIndex(el => el.barcode === box.barcode) >= 0) {

        auxiliar.splice(auxiliar.findIndex(el => el.barcode === box.barcode), 1)
      } else {

        auxiliar.push(box)
      }
      BoxesSelect.length !== 0 ? setBoxesSelect(auxiliar) : setBoxesSelect([])
    }
  }

  const Check = (index: number) => {
    const check = [...checked]
    check[index] = !check[index]
    setChecked(check)
  }

  const SaveStorage = async () => {

    if (BoxesSelect.length !== 0) {

      const blaster_id = await AsyncStorage.getItem('blaster_id')
      const { data } = await api.post('/drafts', { "blaster_id": blaster_id })
      const StringBoxesSelected = JSON.stringify(BoxesSelect)

      const history = {
        boxes: StringBoxesSelected,
        id_draft: data.id,
        id_opera: props.route.params.operacao.id
      }
      await AsyncStorage.setItem('HistoryDraftFire', JSON.stringify(history))

      await AlterBoxInAPI()

      const promises = BoxesSelect.map(async (box: { id: any; }) => {
        return await api.post('/operations_draftfires', {
          operation_id: props.route.params.operacao.id,
          draftfires_id: data.id,
          boxes_id: box.id
        })
      })

      await Promise.all(promises)

      navigation.navigate('offlineDraftFire')
    } else {
      Alert.alert(
        'Problemas para Finalizar',
        'Precisa selecionar no mínimo 1 Caixa'
      );
    }
  }
  const checkResponse = (promises: string | any[]): boolean => {
    for (let index = 0; index < promises.length; index++) {
      const element = promises[index];
      if (element._W.data.message) {
        return false
      }
    }
    return true

  }

  const AlterBoxInAPI = async () => {
    const boxes = BoxesSelect.map(el => {
      return { id: el.id, status: 'InDraft' }
    })

    const promises = BoxesSelect.map(async (el) => {
      await api.put('/storagestocks', { boxes })
    })


    await Promise.all(promises)
  }




  useEffect(() => {
    (async () => {
      const { data } = await api.get('/storagestocks') //getApiData()             
      const listchecked: ((prevState: never[]) => never[]) | boolean[] = []
      const datafilter = data.map((el: { barcode: any; quantity_products: any; status: any; }) => {
        listchecked.push(false)
        return ['', el.barcode, el.quantity_products, el.status]
      })

      setChecked(listchecked)
      setTableBoxes(datafilter)
      setBoxesData(data)

    })()
  }, [])



  return (
    <>
      <View style={tableStyles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button onPress={() => navigation.goBack()} title="X" color={'#ca3a18'} />
          <Logo source={logoImg} />
        </View>
        <View>
          <Text style={{ paddingTop: 10, alignSelf: 'center', fontFamily: 'Roboto', fontSize: 16 }}>Selectione as Caixas para o Plano de Fogo</Text>
        </View>
        <View style={{ maxHeight: 350, paddingTop: 15 }}>
          <Table borderStyle={{ borderColor: 'transparent' }}>
            <Row data={['Selecione', 'Barcode', 'Qtd Produtos', 'Status']} style={tableStyles.head} textStyle={tableStyles.text} />
            <ScrollView>
              {
                tableBoxes.map((data, index) => {
                  if (Array.isArray(data)) {
                    return (

                      <TouchableOpacity onPress={() => {
                        navigation.navigate('ModalProdutos', {
                          products: BoxesData[index].products
                        })
                      }} key={index}>
                        <TableWrapper style={tableStyles.row}>
                          {
                            data.map((cellData: any, cellIndex: string | number | null | undefined) => (

                              <Cell key={cellIndex} data={cellIndex === 0 ? <Checkbox
                                status={checked[index] ? 'checked' : 'unchecked'}
                                onPress={() => {

                                  Check(index)
                                  ChangeBox(BoxesData.find(el => el.barcode === data[1]))
                                }}
                              /> : cellData} textStyle={tableStyles.text} />
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
        <View style={{ paddingTop: 10 }}>
          <Button color={'#ca3a18'} onPress={async () => await SaveStorage()} title="Criar Plano de fogo" />
        </View>
      </View>

    </>
  );
}

