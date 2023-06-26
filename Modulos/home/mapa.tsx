import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Image, TouchableOpacity, View } from 'react-native';
import { NativeWindStyleSheet } from 'nativewind';

import * as Location from 'expo-location';
import BotonesHome from './botones';
import DatosLocal from './datos-local';
import { useAuthStore, useHomeStore } from '../store';
import DetallesLocalBoton from './detalles';
import { baseurl } from '../auth/login';
import { fetchLocalesActivos } from '../detalles_local/detalles-local';
import { ToastAndroid } from 'react-native/Libraries/Components/ToastAndroid/ToastAndroid';


NativeWindStyleSheet.setOutput({
  default: "native",
});



export const defaultRegion = { latitude: -16.506069986249265, longitude: -68.13255896700846, latitudeDelta: 0.0110, longitudeDelta: 0.0110 };

export async function apiGetLogedUser() {
  let user: any | null = null;
  let token = "";
  const url = `${baseurl}/api/v1/login`;
  console.log(url);
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
  }).then((response) => {
    return response.json();
  }).then((json) => {
    if (json.user) {
      useAuthStore.setState({ user: json.user, isLoggedIn: true, lastLogin: new Date() });
    } else {
      useAuthStore.setState({ isLoggedIn: false, user: null, lastLogin: new Date() });

    }
  });

}



export default function Mapa({ navigation }: { navigation: any; }) {
  const setSelectedLocal = useHomeStore((state) => state.setSelectedLocal);

  const [locations, setLocations] = useState<any[]>([]);
  //useeffect once
  useEffect(() => {
    (async () => {
      setLocations(await fetchLocalesActivos());
      apiGetLogedUser();
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        ToastAndroid.show('Permiso de ubicación denegado', ToastAndroid.SHORT);
        return;
      }
    }
    )();
  }, []);


  const mapRef = useRef<MapView | null>(null);
  return (
    <>
      <View className='h-[60%]'>
        <MapView
          region={defaultRegion}
          showsMyLocationButton={true}
          mapPadding={{ top: 40, right: 0, bottom: 0, left: 0 }}
          ref={mapRef}
          initialRegion={{ latitude: -16.506069986249265, longitude: -68.13255896700846, latitudeDelta: 0.0110, longitudeDelta: 0.0110 }}
          showsUserLocation={true}
          followsUserLocation={true}
          className='h-full w-full'
          onPress={(e) => {
            setSelectedLocal(null);
          }}
        >
          {locations.map((location, index) =>
            <Marker
              //Save location on touch
              key={index}
              onPress={(e) => {
                console.log("Marked press", e.nativeEvent.id);
                setSelectedLocal(
                  locations.find((location) => location.id == e.nativeEvent.id)
                );
              }}
              id={String(location.id)}
              identifier={String(location.id)}
              //Set null on deselect
              description={location.direccion}
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title={location.nombre} >
              <Image
                className='w-10 h-10 rounded-full'
                source={location.foto ?? require('../../assets/cropped-placeholder.jpg')}
              ></Image>
            </Marker>

          )}

          {/* Geo Json */}
        </MapView>
        {/* Re fetch button */}
        <View className='absolute bottom-16 right-0'>
          <TouchableOpacity
            onPress={async () => {
              setLocations(await fetchLocalesActivos());
            }
            }
          >
            <Image
              className='w-10 h-10 rounded-full'
              source={require('../../assets/refresh.png')}

            ></Image>
          </TouchableOpacity>
        </View>
      </View >
      <DatosLocal />
      <BotonesHome navigation={navigation} />
      <DetallesLocalBoton navigation={navigation} />
    </>
  );
}
