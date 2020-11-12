import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import OperationModal from '../pages/OperaçõesModal'
import Login from '../pages/Login';
import Operacao from '../pages/Operações';
import ProdutosModal from '../pages/ProdutosModal'
import OfflineDraftFire from '../pages/OfflineDraftFire'
import OfflineProducts from '../pages/OfflineProducts'


const Auth = createStackNavigator();
const OperationStack = createStackNavigator();


const AuthRoutes: React.FC = () => (
    <Auth.Navigator
        screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'white' }
        }}
    >
        <Auth.Screen name='Login' component={Login} />
        <Auth.Screen name='Operacao' component={Operacao} />
        <Auth.Screen name='OperacaoModal' component={OperationModal} />
        <Auth.Screen name='ModalProdutos' component={ProdutosModal} />
        <Auth.Screen name='offlineDraftFire' component={OfflineDraftFire} />
        <Auth.Screen name='OfflineProducts' component={OfflineProducts} />

    </Auth.Navigator>

);

// const Logged: React.FC = () => (
//     <OperationStack.Navigator
//         screenOptions={{
//             headerShown: false,
//             cardStyle: { backgroundColor: 'white' }
//         }}
//         initialRouteName="Operacao"
//     >
//         <OperationStack.Screen name='Operacao' component={Operacao} />
//         <OperationStack.Screen name='OperacaoModal' component={OperationModal} />
//         <OperationStack.Screen name='ModalProdutos' component={ProdutosModal} />
//         <OperationStack.Screen name='OfflineDraftFire' component={OfflineDraftFire} />
//         <OperationStack.Screen name='OfflineProducts' component={OfflineProducts} />


//     </OperationStack.Navigator>

// );


export default AuthRoutes;