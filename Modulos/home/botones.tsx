import { Button, FlatList, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore, useHomeStore } from "../store";


import { Share } from "react-native";


export default function BotonesHome({ navigation }: { navigation: any; }) {

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [buscarText, setBuscarText] = useState<String>('');
  const buttons: ButtonItemType[] = [
    {
      title: 'Calificar',
      procedure: () => {
        if (!isLoggedIn) {
          navigation.navigate('Login');
          ToastAndroid.show("Registrate para calificar", ToastAndroid.SHORT);
          return;
        }
        //if del selected local ir a crud de calificar
        const selected = useHomeStore.getState().selectedLocal;
        if (selected == null || Object.keys(selected).length === 0) {
          ToastAndroid.show("Selecciona un local para calificar", ToastAndroid.SHORT);
          return;
        }
        console.log(useHomeStore.getState().selectedLocal);
        navigation.navigate('NuevaReview');
        //else del selected local ir a crud de calificar
        console.log("xd");
      },
      //Star icon
      icon: 'star-outline',
    }, {
      title: 'Sugerir nuevo',
      procedure: () => {
        if (isLoggedIn == false) {
          navigation.navigate('Login');
          ToastAndroid.show("Registrate para sugerir", ToastAndroid.SHORT);
          return;
        }
        navigation.navigate('Suggestions');
      },
      icon: 'menu',
    }, {
      title: 'Compartir',
      procedure: () => {
        const selected = useHomeStore.getState().selectedLocal;
        console.log(selected);
        if (selected == null || Object.keys(selected).length === 0) {
          ToastAndroid.show("Debes seleccionar un local", ToastAndroid.SHORT);
          return;
        }
        Share.share({
          /* https://www.google.com/maps/dir//-16.5122171,-68.1264366/@-16.5120167,-68.1264243,18z?entry=ttu */
          message: "Hola! te comparto este lugar " + selected?.nombre + " https://www.google.com/maps/dir//" + selected?.latitude + "," + selected?.longitude + "/@" + selected?.latitude + "," + selected?.longitude + ",18z?entry=ttu",
          title: "Compartir local " + selected.nombre
        }, {
          dialogTitle: "Compartir local " + selected.nombre,
        });


      },
      icon: 'share',
    }, {
      title: 'Ver mi perfil',
      procedure: () => {
        if (!isLoggedIn) {
          navigation.navigate('Login');
          ToastAndroid.show("Registrate para ver tu perfil", ToastAndroid.SHORT);
          return;
        }
        navigation.navigate('Profile');
      },
      icon: 'person',
    }
  ];
  return (
    <>
      {/* <View className='flex flex-row pt-4 px-2 gap-2 justify-center'>
        <TextInput className='text-black border-2 border-gray-200 rounded-lg px-3 py-2 w-[70%]' placeholder='Buscar por nombre'
          onChangeText={
            (text) => {
              setBuscarText(text);
            }
          }
        >
        </TextInput>
        <TouchableOpacity
          onPress={() => { console.log("xd"); }
          }
          activeOpacity={0.8}
          className='bg-blue-500 w-[22%] over:bg-blue-700 ml-auto rounded-lg py-2 px-4 flex justify-center items-center'
        >
          <Text className=' text-white text-center'>Filtrar</Text>
        </TouchableOpacity>
      </View> */}
      <View className="mx-4 ">
        <Text className='text-xs text-gray-400 mb-2'>Acciones</Text>
        <View className="flex justify-center items-center ">

          <FlatList
            data={buttons}
            renderItem={ButtonItem}
            numColumns={2}
            keyExtractor={item => item.title}
            horizontal={false}
          />
        </View>
      </View>
    </>
  );
};
type ButtonItemType = {
  title: string;
  procedure: () => void;
  icon?: any;
};

const ButtonItem = ({ item }: { item: ButtonItemType; }) => {
  return (
    <View className=" flex flex-row  w-40  p-2 m-1  bg-gray-button border-white items-center ">
      <View className="bg-red-100 rounded-full flex items-center justify-center p-1 mr-2">
        <Ionicons name={item.icon} size={15} color="rgb(93, 176, 117)"
        />
      </View>
      <TouchableOpacity
        onPress={item.procedure
        }
        className="bg-gray-button"
        activeOpacity={0.5}
      >
        <Text className="text-gray-600 text-xs s">{item.title}</Text>
      </TouchableOpacity>
    </View >
  );
};