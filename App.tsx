import { StatusBar } from 'expo-status-bar';

import { Text, View } from 'react-native';
import Mapa from './Modulos/home/mapa';
import { NativeWindStyleSheet } from 'nativewind';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetallesLocal from './Modulos/detalles_local/detalles-local';
import Login from './Modulos/auth/login';
import Register from './Modulos/auth/register';
import Sugerir from './Modulos/sugerir_nuevo/sugerir';
import NuevosLocalesAdmin from './Modulos/admin/nuevos_locales';
import { AppRegistry } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import nuevaReview from './Modulos/detalles_local/nueva-review';
import NuevaReview from './Modulos/detalles_local/nueva-review';
import MenuLocal from './Modulos/detalles_local/menu/menu';
import Profile from './Modulos/perfil/perfil';

NativeWindStyleSheet.setOutput({
  default: "native",
});
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false
            }}
          >
            <Stack.Screen
              name="Home"
              component={Mapa}
            />
            <Stack.Screen name="DetallesLocal" component={DetallesLocal} />
            <Stack.Screen
              name="Login"
              component={Login}
            />
            <Stack.Screen
              name="Register"
              component={Register}
            />
            <Stack.Screen
              name="Suggestions"
              component={Sugerir}
            />
            <Stack.Screen
              name="NuevosLocalesAdmin"
              component={NuevosLocalesAdmin}
            />
            <Stack.Screen
              name="NuevaReview"
              component={NuevaReview}
            />
            <Stack.Screen
              name="Menu"
              component={MenuLocal}
            />
            <Stack.Screen
              name='Profile'
              component={Profile}
            />


          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </>
  );
}

AppRegistry.registerComponent('App', () => App);