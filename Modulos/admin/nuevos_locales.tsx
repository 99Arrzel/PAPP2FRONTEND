import { View, Text, TextInput } from "react-native";
import { baseurl } from "../auth/login";
import { useAuthStore, useHomeStore } from "../store";

import { ToastAndroid } from "react-native";
import { useEffect, useState } from "react";
import GoBackButton from "../gobackbutton";
import { ScrollView, TouchableOpacity } from "react-native";

import { Modal, Portal, Button, PaperProvider } from 'react-native-paper';
import { ImageGallery, ImageObject } from '@georstat/react-native-image-gallery';

import { Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
export const getDataLocalesPorAceptar = async () => {
  let locales: LocalesPorAceptarType[] = [];
  await fetch(baseurl + "/api/v1/locales_por_aceptar", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: "Bearer " + useAuthStore.getState().token?.token
    },
  }).then((response) => {
    return response.json();
  }).then((json) => {
    console.log(json, "locales por aceptar");
    if (json.errors) {
      for (let i in json.errors) {
        ToastAndroid.show(`${json.errors[i].field ?? "Error:"} ${json.errors[i].message}`, ToastAndroid.SHORT);
      }
      return;
    }
    if (json.locales) {
      locales = json.locales;
      useHomeStore.setState({ locations: json.locales });
    }
  }).catch((error) => {
    console.log(error);
    ToastAndroid.show(`Error al sugerir ${error}`, ToastAndroid.SHORT);
  });
  return locales;
};
type LocalesPorAceptarType = {
  id: number,
  nombre: string,
  ubicacion: string,
  latitude: number,
  longitude: number,
  estado: boolean,
  id_usuario_creador: number,
  id_usuario_autorizador: number,
  tipo: 'sugerencia' | 'real',
  created_at: string,
  updated_at: string,
  imagenes: {
    id: number,
    url: string,
    alt: string,
  }[];
  categorias: {
    id: number,
    nombre: string,
  }[];
  usuario_creador: {
    id: number,
    nombre: string,
    email: string,
  };
  menus: {
    id: number,
    titulo: string,
    precio: number,
  }[];
};
//const [filtro, setFiltro] = useState("");



export default function NuevosLocalesAdmin({ navigation }: { navigation: any; }) {
  const test: ImageObject[] = [];
  const [filtro, setFiltro] = useState("");
  const [selected, setSelected] = useState<LocalesPorAceptarType | null>(null);
  const [visibleAccept, setVisibleAccept] = useState(false);
  const [visibleReject, setVisibleReject] = useState(false);
  const [visibleImages, setVIsibleImages] = useState(false);
  const [visibleMap, setVisibleMap] = useState(false);
  const [locales, setLocales] = useState<LocalesPorAceptarType[]>([]);
  useEffect(() => {
    getDataLocalesPorAceptar().then((locales) => {
      setLocales(locales);
    });
  }, []);
  return (<>
    <View className="mt-10">
      <GoBackButton navigation={navigation} />
      <Text className="text-center font-bold">Locales por aceptar</Text>

      <ScrollView className="flex gap-2 m-1  ">
        <PaperProvider>
          <Portal>
            <Modal visible={visibleAccept} onDismiss={() => {
              setVisibleAccept(false);
            }}
              contentContainerStyle={{
                backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10
              }}>
              <Text className="text-center">¿Está seguro de aceptar el local {selected?.nombre}?</Text>
              <View className="flex items-center">
                <TouchableOpacity
                  onPress={async () => {
                    /* Mandar aceptar a la db y luego ocultar */
                    await fetch(baseurl + "/api/v1/aceptar_local", {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        /* Token */
                        Authorization: "Bearer " + useAuthStore.getState().token?.token
                      },
                      body: JSON.stringify({
                        id: selected?.id,
                      })
                    }).then((response) => {
                      return response.json();
                    }).then((json) => {
                      console.log(json, "locales por aceptar");
                      if (json.error) {
                        for (let i in json.errors) {
                          ToastAndroid.show(`${json.errors[i].field ?? "Error:"} ${json.errors[i].message}`, ToastAndroid.SHORT);
                        }
                        return;
                      }
                      if (json.local) {
                        //Respondio bien, solo removemos de la lista
                        ToastAndroid.show(`Local aceptado`, ToastAndroid.SHORT);
                        setVisibleAccept(false);
                        setLocales(locales.filter((val) => {
                          return val.id != selected?.id;
                        }));
                      }
                    }).catch((error) => {
                      console.log(error);
                      ToastAndroid.show(`Error al sugerir ${error}`, ToastAndroid.SHORT);
                    });
                  }}
                  className="bg-green-500 rounded-lg p-1"
                ><Text className="text-white">Aceptar</Text></TouchableOpacity>
              </View>
            </Modal>
          </Portal>
          <Portal>
            <Modal visible={visibleReject} onDismiss={() => {
              setVisibleReject(false);
            }}
              contentContainerStyle={{
                backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10
              }}>
              <Text className="text-center">¿Está seguro de DENEGAR el local {selected?.nombre}?</Text>
              <View className="flex items-center">
                <TouchableOpacity
                  onPress={async () => {
                    /* Mandar aceptar a la db y luego ocultar */
                    await fetch(baseurl + "/api/v1/rechazar_local", {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        /* Token */
                        Authorization: "Bearer " + useAuthStore.getState().token?.token
                      },
                      body: JSON.stringify({
                        id: selected?.id,
                      })
                    }).then((response) => {
                      return response.json();
                    }).then((json) => {
                      console.log(json, "locales por aceptar");
                      if (json.error) {
                        for (let i in json.errors) {
                          ToastAndroid.show(`${json.errors[i].field ?? "Error:"} ${json.errors[i].message}`, ToastAndroid.SHORT);
                        }
                        return;
                      }
                      if (json.local) {
                        //Respondio bien, solo removemos de la lista
                        ToastAndroid.show(`Local denegado`, ToastAndroid.SHORT);
                        /* hide */
                        setVisibleReject(false);
                        setLocales(locales.filter((val) => {
                          return val.id != selected?.id;
                        }));
                      }
                    }).catch((error) => {
                      console.log(error);
                      ToastAndroid.show(`Error al sugerir ${error}`, ToastAndroid.SHORT);
                    });
                  }}
                  className="bg-red-500 rounded-lg p-1"
                ><Text className="text-white">Denegar</Text></TouchableOpacity>
              </View>
            </Modal>
          </Portal>
          <Portal>
            <Modal visible={visibleMap} onDismiss={() => {
              setVisibleMap(false);
            }}
              contentContainerStyle={{
                backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10
              }}>
              <MapView
                region={{ latitude: (selected?.latitude ?? 0), longitude: (selected?.longitude ?? 0), latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
                showsMyLocationButton={true}
                showsUserLocation={true}

                mapPadding={{ top: 40, right: 0, bottom: 0, left: 0 }}
                className='h-full w-full'
              >
                <Marker
                  key={selected?.id}
                  description={selected?.nombre ?? ""}
                  coordinate={{ latitude: selected?.latitude || 0, longitude: selected?.longitude || 0 }}
                ></Marker>
              </MapView>
            </Modal>
          </Portal>
          <View>
            <ImageGallery
              renderHeaderComponent={() => {
                /* Boton para cerrar */
                return (
                  <View className="flex flex-row justify-end">
                    <TouchableOpacity
                      onPress={() => {
                        setVIsibleImages(false);
                      }}
                      className="bg-red-500 rounded-lg p-1"
                    ><Text className="text-white">Cerrar</Text></TouchableOpacity>
                  </View>
                );
              }}
              close={() => { setVIsibleImages(false); }} isOpen={visibleImages} images={selected?.imagenes.map((val) => {
                return {
                  id: val.id,
                  url: val.url.split("?")[0],
                };
              }) || [] as ImageObject[]} />
          </View>




          <TextInput className="p-2 border-2 border-gray-200" placeholder="Buscar"
            onChangeText={(text) => {
              setFiltro(text);
            }}
            value={filtro}
          />
          {locales.filter((val) => {
            return val.nombre.toLowerCase().includes(filtro.toLowerCase());
          }).map((local) => {

            return (
              <View key={local.id} className="bg-gray-200 flex flex-row my-0.5">
                <View className="w-2/3">
                  <Text><Text className="font-bold">Nombre:</Text>{local.nombre}</Text>
                  <Text><Text className="font-bold">Indicaciones:</Text>{local.ubicacion}</Text>
                  <Text><Text className="font-bold">Correo:</Text>{local.usuario_creador.email}</Text>
                  <Text><Text className="font-bold">Tipo:</Text>{local.tipo}</Text>
                  <Text><Text className="font-bold">Fecha:</Text>{(new Date(local.created_at)).toLocaleDateString()}:{new Date(local.created_at).toLocaleTimeString()}</Text>
                  {/* Menu */}
                  <View className="flex flex-row gap-1">
                    {local.menus?.map((val) => {
                      return (
                        <View key={val.id} className="bg-gray-300 p-1 rounded-lg">
                          <Text>{val.titulo}</Text>
                          <Text>{val.precio}</Text>
                        </View>
                      );
                    })}
                  </View>


                  {/* Boton para aceptar o denegar */}
                </View >
                <View className="flex flex-row w-1/3 bg-gray-400 flex-wrap ">
                  <View className="flex w-full gap-1">
                    <TouchableOpacity onPress={() => {
                      setSelected(local);
                      setVisibleAccept(true);
                    }}
                      className="bg-green-500 rounded-lg mx-auto py-1 w-full items-center "
                    >
                      <Text className="text-white">Aceptar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      setVisibleReject(true);
                      setSelected(local);
                    }}
                      className="bg-red-500 rounded-lg mx-auto py-1 w-full items-center "
                    >
                      <Text className="text-white">Denegar</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex w-full gap-1 mt-0.5">
                    <TouchableOpacity onPress={() => {
                      console.log("==========================================================");
                      console.log(local, "IMAGENES");
                      setSelected(local);
                      setVIsibleImages(true);
                    }}
                      className="bg-yellow-500 rounded-lg mx-auto py-1 w-full items-center "
                    >
                      <Text className="text-white">Imagenes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      setSelected(local);
                      setVisibleMap(true);
                    }}
                      className="bg-purple-500 rounded-lg mx-auto py-1 w-full items-center "
                    >
                      <Text className="text-white">Ubicación</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View >
            );
          })}
          <View className="mb-4"><Text>Fin de resultados</Text></View>
          <View className="mb-4"><Text>Fin de resultados</Text></View>

        </PaperProvider >
      </ScrollView >
    </View >
  </>
  );

};;;;;