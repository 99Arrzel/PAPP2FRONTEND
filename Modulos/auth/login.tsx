
import { View, Text, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import GoBackButton from '../gobackbutton';
import { useState } from 'react';
import { useAuthStore } from '../store';
export const baseurl = "https://pollos.arrzel.com";
export async function apiGetTokenLogin(correo: string, contraseña: string) {

  let token = "";
  const url = `${baseurl}/api/v1/login`;
  console.log(url);
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: correo,
      password: contraseña
    })
  }).then((response) => {
    return response.json();
  }).then((json) => {
    console.log(json);

    if (json.errors) {
      for (let i in json.errors) {
        ToastAndroid.show(`${json.errors[i].field ?? "Error:"} ${json.errors[i].message}`, ToastAndroid.SHORT);
      }
      return;
    }
    if (json.error) {
      ToastAndroid.show(`${json.error}`, ToastAndroid.SHORT);
      return;
    }

    if (json.token) {
      useAuthStore.setState({ isLoggedIn: true, token: json.token });
      ToastAndroid.show("Bienvenido", ToastAndroid.SHORT);
      token = json.token;
    }
    if (json.user) {
      useAuthStore.setState({ user: json.user });
    }
  }).catch((error) => {
    ToastAndroid.show(`Error al registrar ${error}`, ToastAndroid.SHORT);
    if (error.message == "Error al registrar") {
      ToastAndroid.show(`Error al registrar ${error.message}`, ToastAndroid.SHORT);
    }
    if (error.errors) {
      for (let i in error.errors) {
        ToastAndroid.show(`${error.errors[i]}`, ToastAndroid.SHORT);
      }
    }

    console.error(error);
  });
  return token;
}
export default function Login({ navigation }: { navigation: any; }) {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (isLoggedIn) {
    navigation.navigate('Home');
  }
  return (<>
    <View className="flex ">
      <GoBackButton navigation={navigation} />
      <Text className="text-center text-2xl">Login</Text>
      {/* Correo y contraseña input text */}
      <TextInput
        className="border-2 border-gray-300 rounded-lg w-11/12 mx-auto my-2 p-2"
        onChangeText={(text) => {
          setCorreo(text);
        }
        }

        value={correo}

        placeholder="Correo" />
      <TextInput
        onChangeText={(text) => {
          setContraseña(text);
        }
        }
        secureTextEntry={true}
        value={contraseña}
        className="border-2 border-gray-300 rounded-lg w-11/12 mx-auto my-2 p-2"
        placeholder="Contraseña" />
      {/* Boton de login */}
      <View className="flex justify-center items-center mx-4 mt-2">
        <TouchableOpacity
          onPress={async () => {
            await apiGetTokenLogin(correo, contraseña);
          }}
          className="bg-primary  p-2 w-full rounded-lg"
          activeOpacity={0.5}
        >
          <Text className="text-white text-center  text-xs ">Login</Text>
        </TouchableOpacity>
        {/* Button para registrar */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Register');
          }
          }
          className="bg-secondary  p-2 w-full rounded-lg mt-2"
          activeOpacity={0.5}
        >
          <Text className="text-white text-center  text-xs ">Registrarse</Text>
        </TouchableOpacity>
      </View>



    </View>
  </>);
};