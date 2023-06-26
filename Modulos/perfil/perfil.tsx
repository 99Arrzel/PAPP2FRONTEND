import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store';
import { Image } from 'react-native';
import { Avatar, Modal, PaperProvider, Portal } from 'react-native-paper';
import { useState } from 'react';
import { TextInput } from 'react-native';
import { baseurl } from '../auth/login';

import { ToastAndroid } from 'react-native';
import GoBackButton from '../gobackbutton';
import * as ImagePicker from 'expo-image-picker';
import { Buffer } from 'buffer';
export default function Profile({ navigation }: { navigation: any; }) {
  /* Datos de usuario  */
  const user = useAuthStore((state) => state.user);
  console.log(user);
  const [visibleChangeName, setVisibleChangeName] = useState(false);

  const [nombre, setNombre] = useState(user?.nombre ?? "Anonimo");
  const guardarNombre = async () => {
    const response = await fetch(`${baseurl}/api/v1/editar_nombre`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${useAuthStore.getState().token?.token}`
      },
      body: JSON.stringify({
        nombre: nombre,
      })
    });
    if (response.ok) {
      const json = await response.json();
      console.log(json, "json");
      useAuthStore.setState({ user: json.user });
      ToastAndroid.show("Nombre cambiado", ToastAndroid.SHORT);
      return;
    }
    //error nomas
    ToastAndroid.show("Error al cambiar nombre", ToastAndroid.SHORT);
  };
  const [files, setFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      base64: true,
      aspect: [4, 3],
      quality: 1,
    });


    if (!result.canceled) {
      setFiles(result.assets);
      //console.log(result.assets[0].base64, "Asset");
      //subir imagen a minio y de ah
      //get url upload de minio
      //Nombre es el ury, ultimo /
      const nombre = result.assets[0].uri.split('/').pop();
      const response = await fetch(`${baseurl}/api/v1/get_url_upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token?.token}`
        },
        body: JSON.stringify({
          nombre: nombre ?? "image",
        })
      });
      if (response.ok) {
        const json = await response.json();
        console.log("json", JSON.stringify(json));
        //Convertimos base64 a blob
        const file64 = result.assets[0].base64 ?? "";
        const base64Data = Buffer.from(file64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        //subir imagen a json.url
        const response2 = await fetch(json.url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'image/' + nombre?.split('.').pop() ?? 'jpg',
          },
          body: base64Data,
        });
        if (response2.ok) {
          //Grabar a la DB
          const response3 = await fetch(`${baseurl}/api/v1/editar_foto_perfil`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${useAuthStore.getState().token?.token}`
            },
            body: JSON.stringify({
              foto_perfil: json.url.split('?')[0],
            })
          });
          if (response3.ok) {
            //Finalmente todo OK
            const json = await response3.json();
            console.log(json, "json");
            useAuthStore.setState({ user: json.user });
            ToastAndroid.show("Foto de perfil cambiada", ToastAndroid.SHORT);
            return;
          } else {
            ToastAndroid.show("Error al cambiar foto de perfil", ToastAndroid.SHORT);
          }
        } else {
          ToastAndroid.show("Error al subir imagen", ToastAndroid.SHORT);
        }
      } else {
        ToastAndroid.show("Error al obtener url upload", ToastAndroid.SHORT);
      }
    }
  };

  return <>
    {/* Float position */}

    <PaperProvider>
      <Portal>
        <Modal

          visible={visibleChangeName} onDismiss={() => {
            setVisibleChangeName(false);
          }}>
          <View className='flex flex-col items-center justify-center bg-white m-4'>
            <Text className='text-2xl text-center text-black mb-4'>Cambiar nombre</Text>
            <View className='flex flex-row items-center'>
              <Text className=' text-center text-black mb-4'>Nombre: </Text>
              <TextInput className='text-black border-2 border-gray-200 rounded-lg px-3 py-2 w-[70%]' placeholder='Pon tu nuevo nombre aquí'
                onChangeText={
                  (text) => {
                    setNombre(text);
                  }
                }
              >
              </TextInput>
            </View>
            <TouchableOpacity
              onPress={() => {
                guardarNombre();
                setVisibleChangeName(false);
              }
              }
              activeOpacity={0.8}
              className='bg-blue-500 w-fit m-4 over:bg-blue-700  rounded-lg py-2 px-4 flex justify-center items-center'
            >
              <Text className=' text-white text-center'>Guardar</Text>
            </TouchableOpacity>
          </View>


        </Modal>
      </Portal>


      <View className='bg-primary h-[25%] ' />
      <View className='-translate-y-40 fixed bg-white rounded-tr-lg rounded-br-lg w-12 p-2'>
        <GoBackButton navigation={navigation} />
      </View>

      <View className='flex items-center justify-center -translate-y-44'>
        <View className='flex flex-row'>
          <Text className='text-2xl text-center text-white mb-4'>{user?.nombre ?? "Anonimo"}</Text>
          {/* Boton icono para cambiar de nombre */}
          <TouchableOpacity
            onPress={() => {
              setVisibleChangeName(true);
            }}
          >
            <Image className='m-2 w-8 h-8 ' source={require('../../assets/edit-icon.png')} />
          </TouchableOpacity>

        </View>
        <TouchableOpacity
          onPress={() => {
            pickImage();
          }}

        >
          <Avatar.Image className='' size={150} source={{ uri: user?.foto_perfil }} />
        </TouchableOpacity>
      </View>
    </PaperProvider>

  </>;

};