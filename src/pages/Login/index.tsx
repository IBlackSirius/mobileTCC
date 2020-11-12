import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native'
import { Form } from '@unform/mobile'
import { FormHandles } from '@unform/core'
import { useNavigation } from '@react-navigation/native'
import NetInfo from "@react-native-community/netinfo";

import { Container, Logo } from './styles'
import logoImg from '../../assets/LogoTCC.jpg'
import Button from '../../components/Button';
import Input from '../../components/Input';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SignInFormData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const formRef = useRef<FormHandles>(null)
    const navigation = useNavigation();
    const [isOnline, setIsOnline] = useState(true)

    const handleSubmit = useCallback(
        async (data: SignInFormData) => {



            if (isOnline) {
                const res = await api.post('/sessions', data)

                if (res.data.token) {

                    if (res.data.user.type === "Blaster") {

                        const history = await AsyncStorage.getItem('HistoryDraftFire')

                        if (String(res.data.token)) {
                            await AsyncStorage.setItem('token', res.data.token)
                            await AsyncStorage.setItem('blaster_id', res.data.user.id)
                        }
                        if (history) {
                            navigation.navigate('offlineDraftFire')
                        } else {
                            navigation.navigate('Operacao')
                        }

                    } else {
                        Alert.alert(
                            'Erro na autenticação',
                            'Somente Blasters podem Conectar'
                        );
                    }


                } else {
                    Alert.alert('Erro na autenticação', 'Usuário não encontrado')
                }
            } else {
                const token = await AsyncStorage.getItem('token')
                const history = await AsyncStorage.getItem('HistoryDraftFire')

                //await AsyncStorage.removeItem('HistoryDraftFire')

                if (token !== null) {
                    if (history) {
                        navigation.navigate('offlineDraftFire')
                    } else {
                        Alert.alert(
                            'Sem Conexão',
                            'É necessário estar online para efetuar o Login.'
                        );
                    }

                } else {
                    Alert.alert(
                        'Sem Conexão',
                        'É necessário estar online para efetuar o Login.'
                    );
                }
            }
        }, []);


    useEffect(() => {

        (async () => {
            const token = await AsyncStorage.getItem('token')
            const history = await AsyncStorage.getItem('HistoryDraftFire')


            // await AsyncStorage.removeItem('HistoryDraftFire')
            // await AsyncStorage.removeItem('token')
            const unsubscribe = NetInfo.addEventListener(state => {
                setIsOnline(state.isConnected)
            });
            unsubscribe();


            if (token !== null) {
                if (history) {
                    navigation.navigate('offlineDraftFire')
                } else {
                    navigation.navigate('Operacao')
                }

            }
        })()
    }, [])
    return (
        <>
            <KeyboardAvoidingView
                keyboardVerticalOffset={40}
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flex: 1 }}>
                    <Container>
                        <Logo source={logoImg} />
                        <Form style={{ width: '100%' }} ref={formRef} onSubmit={handleSubmit}>
                            <Input
                                name="email"
                                placeholder="Email"
                                autoCapitalize='none'
                                autoCorrect={false}
                                keyboardType='email-address'
                                returnKeyType='next'
                            />
                            <Input
                                name="password"
                                placeholder="Senha"
                                secureTextEntry
                                returnKeyType='send'
                                onSubmitEditing={() => {
                                    formRef.current.submitForm()
                                    handleSubmit
                                }}
                            />

                            <Button onPress={() => {
                                formRef.current?.submitForm()
                                handleSubmit
                            }} >Entrar</Button>
                        </Form>
                    </Container>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

export default Login;