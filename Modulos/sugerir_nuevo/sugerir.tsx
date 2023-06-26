import { View, Text, ToastAndroid, TouchableOpacity, ScrollView, PermissionsAndroid, Image } from "react-native";
import { TextInput } from "react-native";
import MapView, { Region } from "react-native-maps";
import { useState, useEffect } from "react";
import * as Location from 'expo-location';
import GoBackButton from "../gobackbutton";
import { baseurl } from "../auth/login";
import { useAuthStore } from "../store";
import * as DocumentPicker from 'expo-document-picker';
import { Camera, CameraType } from 'expo-camera';
import { PaperProvider, Portal, Modal, Checkbox } from "react-native-paper";
import { DataTable } from 'react-native-paper';
import { getUrlUpload } from "../detalles_local/nueva-review";
import * as ImagePicker from 'expo-image-picker';
import { Buffer } from "buffer";
export const apiPostSugerir = async (nombre: String, direccion: String, latitude: number, longitude: number, categorias: number[], imagenes: string[], menu: { nombre: string, precio: string; }[]) => {
  console.log(useAuthStore.getState().token?.token);
  const data = JSON.stringify({
    nombre: nombre,
    ubicacion: direccion,
    latitude: latitude,
    longitude: longitude,
    categorias: categorias,
    imagenes: imagenes,
    menu: menu,
  });
  return await fetch(baseurl + "/api/v1/sugerir", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: "Bearer " + useAuthStore.getState().token?.token
    },
    body: data,
  }).then((response) => {
    return response.json();
  }).then((json) => {
    console.log(json, "Respuesta sugerir");
    if (json.errors) {
      for (let i in json.errors) {
        ToastAndroid.show(`${json.errors[i].field ?? "Error:"} ${json.errors[i].message}`, ToastAndroid.SHORT);
      }
      return;
    }
    if (json.local) {
      ToastAndroid.show("Local sugerido", ToastAndroid.SHORT);
      return json.local;

    }
  }).catch((error) => {
    console.log(error, "El error");
    ToastAndroid.show(`Error al sugerir ${error}`, ToastAndroid.SHORT);

  });
};
type CategoriaType = {
  id: number,
  nombre: string,
};
export async function fetchCategorias() {
  let categorias: CategoriaType[] = [];
  await fetch(baseurl + "/api/v1/categorias", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: "Bearer " + useAuthStore.getState().token?.token
    },
  }).then((response) => {
    return response.json();
  }).then((json) => {
    console.log(json, "categorias");
    if (json.errors) {
      for (let i in json.errors) {
        ToastAndroid.show(`${json.errors[i].field ?? "Error:"} ${json.errors[i].message}`, ToastAndroid.SHORT);
      }
      return;
    }
    if (json.categorias) {
      categorias = json.categorias;
    }
  }).catch((error) => {
    console.log(error);
    ToastAndroid.show(`Error al sugerir ${error}`, ToastAndroid.SHORT);
  });
  return categorias;
}


export default function Sugerir({ navigation }: { navigation: any; }) {
  //obtener ubicación actual
  const [location, setLocation] = useState<null | Region>(null);
  const [nombreLocal, setNombreLocal] = useState<String>("");
  const [direccionLocal, setDireccionLocal] = useState<String>("");
  const [categorias, setCategorias] = useState<CategoriaType[]>([]);


  useEffect(() => {
    (async () => {
      setCategorias(await fetchCategorias());
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        ToastAndroid.show('Permiso de ubicación fue denegado', ToastAndroid.SHORT);
        navigation.navigate('Home');
        return;
      }
      let loc = await Location.getCurrentPositionAsync();
      setLocation({
        latitudeDelta: 0.0110, longitudeDelta: 0.0110,
        latitude: loc.coords.latitude, longitude: loc.coords.longitude
      });
      console.log(loc, "Location");
    }
    )();
  }, []);


  const sugerir = async () => {

    //validar nombre
    if (nombreLocal.trim() == "") {
      ToastAndroid.show("Ingresa el nombre del local", ToastAndroid.SHORT);
      return;
    }
    //validar dirección
    if (direccionLocal.trim() == "") {
      ToastAndroid.show("Ingresa la dirección del local", ToastAndroid.SHORT);
      return;
    }
    //validar ubicación
    if (location == null) {
      ToastAndroid.show("No se pudo obtener tu ubicación", ToastAndroid.SHORT);
      return;
    }
    if (selectedCategorias.length == 0) {
      ToastAndroid.show("Selecciona al menos una categoría", ToastAndroid.SHORT);
      return;
    }
    const imagenes = await uploadImages() ?? [];
    //enviar datos
    return await apiPostSugerir(nombreLocal, direccionLocal, location.latitude, location.longitude, selectedCategorias, imagenes, menu);
  };
  const [selectedCategorias, setSelectedCategorias] = useState<any>([]);

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }
  //Acá se va a hacer "Sugerecias" de locales nuevos
  //Se va a hacer un formulario con los datos del local, que primero incluyen la ubicación del local que es la ubicación actual
  //También se pone el nombre de la dirección, el nombre del local

  const [visibleCategorias, setVisibleCategorias] = useState(false);
  const showModalCategorias = () => setVisibleCategorias(true);
  const hideModalCategorias = () => setVisibleCategorias(false);
  const [visibleMenu, setVisibleMenu] = useState(false);
  const showModalMenu = () => setVisibleMenu(true);
  const hideModalMenu = () => setVisibleMenu(false);
  const [precio, setPrecio] = useState("");
  const [nombre, setNombre] = useState("");
  const [menu, setMenu] = useState<any>([]);
  /* Upload de imagenes */
  const checkPermissions = async () => {
    try {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );

      if (!result) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title:
              'You need to give storage permission to download and save the file',
            message: 'App needs access to your camera ',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
          return true;
        } else {
          console.log('Camera permission denied');
          return false;
        }
      } else {
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const [files, setFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const uploadImages = async () => {
    let res = [];
    // Check if any file is selected or not
    try {
      if (files.length > 0) {
        const values = await Promise.all(files.map(async (file) => {

          /* Select the uri and upload this shit */
          //Get name from uri
          const name = file.uri.split("/").at(-1);
          const getUrl = await getUrlUpload(name ?? "NONAME");
          console.log("=============");
          console.log(file.uri.split(".").at(-1));
          console.log("=============");
          console.log(getUrl, "Url para minio");
          //Base64 a imagen
          const file64 = file.base64 ?? "";
          const base64Data = Buffer.from(file64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
          const request = await fetch(getUrl, {
            method: 'PUT',
            body: base64Data,
            headers: {
              //'data:image/jpeg;base64,'
              'Content-Type': 'image/' + (file.uri?.split(".").at(-1) ?? "jpg"),
            }
          });
          return await request.url;
        }));
        res = values;

        return res;
      } else {
        // If no file selected the show alert
        ToastAndroid.show("Selecciona al menos un archivo de imagen", 1000);
      }
    } catch (e) {
      console.log(e, "Error");
    }
  };


  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    if (!result.canceled) {
      setFiles(result.assets);
    }
  };
  return (
    <>
      <PaperProvider>
        <Portal>
          {/* Primero categorias */}
          <Modal visible={visibleCategorias} onDismiss={hideModalCategorias}>
            <ScrollView className="bg-white flex flex-col p-2 ">
              <Text className="text-center font-bold">Selecciona las categorias</Text>
              {categorias.map((categoria: any) => {
                return (
                  <View className="flex flex-row mx-auto">
                    <Text>{categoria.nombre}</Text>
                    <Checkbox
                      status={selectedCategorias.includes(categoria.id) ? 'checked' : 'unchecked'}
                      onPress={() => {
                        if (selectedCategorias.includes(categoria.id)) {
                          setSelectedCategorias(selectedCategorias.filter((id: any) => id != categoria.id));
                        } else {
                          setSelectedCategorias([...selectedCategorias, categoria.id]);
                        }
                      }}
                      key={categoria.id}
                      color="blue"
                      uncheckedColor="gray"
                    />
                  </View>

                );
              })}
            </ScrollView>
          </Modal>
        </Portal>
        <Portal>
          <Modal visible={visibleMenu} onDismiss={hideModalMenu}>
            <ScrollView className="bg-white flex flex-col p-2 ">
              <Text className="text-center font-bold">Crea un menú</Text>
              <Text className="text-center text-xs text-gray-500">Es para tener una idea de lo que se vende</Text>
              {/* Input text de un nombre y un precio */}
              <View className="flex flex-row gap-2 items-center">
                <TextInput
                  className="border-2 border-gray-300 rounded-lg  mx-auto my-2 p-2"
                  placeholder="Nombre del producto"
                  value={nombre}
                  onChangeText={(text) => {
                    setNombre(text);
                  }}
                />
                <TextInput
                  className="border-2 border-gray-300 rounded-lg  mx-auto my-2 p-2"
                  placeholder="Precio"
                  keyboardType="numeric"

                  value={precio.toString()}
                  onChangeText={(text) => {
                    setPrecio(text);
                  }}
                />
                <TouchableOpacity onPress={() => {
                  if (nombre?.trim() == "") {
                    ToastAndroid.show("Ingresa el nombre del producto", ToastAndroid.SHORT);
                    return;
                  }
                  if (precio?.trim() == "" && precio != "0") {
                    ToastAndroid.show("Ingresa el precio del producto", ToastAndroid.SHORT);
                    return;
                  }

                  setMenu([...menu, { nombre: nombre, precio: precio }]);
                  setNombre("");
                  setPrecio("0");
                }}
                  className="bg-primary  p-1 w-10 rounded-lg"
                  activeOpacity={0.5}
                >
                  <Text className="text-white text-center  m-2.5 text-xs ">+</Text>
                </TouchableOpacity>
              </View>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Nombre</DataTable.Title>
                  <DataTable.Title numeric>Precio</DataTable.Title>
                </DataTable.Header>
                {menu.map((item: any) => {
                  return (
                    <DataTable.Row>
                      <DataTable.Cell>{item.nombre}</DataTable.Cell>
                      <DataTable.Cell numeric>{item.precio}</DataTable.Cell>
                    </DataTable.Row>
                  );
                })}


              </DataTable>

            </ScrollView>
          </Modal >
        </Portal >

        <View className="mt-10">
          <GoBackButton

            navigation={navigation} />


          <MapView
            className="h-[40%] w-full "
            initialRegion={{
              latitude: -16.506069986249265,
              longitude: -68.13255896700846,
              latitudeDelta: 0.0110,
              longitudeDelta: 0.0110,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
          />
          <View className="mx-4">
            <Text className="text-center text-[10px] text-gray-500  ">Para sugerir un nuevo lugar debes estar ahí</Text>
          </View>

          <View className="flex flex-col mx-4">
            <Text className="text-center">Nombre del lugar</Text>
            <TextInput
              onChangeText={(text) => {
                setNombreLocal(text);
              }}
              className="border-2 border-gray-300 rounded-lg w-full mx-auto my-2 p-2"
              placeholder="La case" />
            <Text className="text-center">Detalles para encontrarlo</Text>
            <TextInput
              onChangeText={(text) => {
                setDireccionLocal(text);
              }}
              className="border-2 border-gray-300 rounded-lg w-full mx-auto my-2 p-2"
              placeholder="Ej. Detrás de la facultad" />
            <View className="flex flex-row gap-2 justify-center flex-wrap">
              <TouchableOpacity
                onPress={showModalCategorias}
                className="bg-primary  p-2  w-40 rounded-lg"
                activeOpacity={0.5}
              >
                <Text className="text-white text-center  text-xs ">Categorias</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={showModalMenu}
                className="bg-secondary  p-2 w-40 rounded-lg"
                activeOpacity={0.5}
              >
                <Text className="text-white text-center  text-xs ">Menú</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  pickImage();

                }}
                className="bg-secondary  p-2 w-40 rounded-lg"
                activeOpacity={0.5}
              >
                <Text className="text-white text-center  text-xs ">Fotos</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Imagenes */}
          {files.length > 0 && (
            <View className="flex flex-row gap-2 m-2">
              {files.map((file) => {
                return (
                  <View className="flex flex-col ">
                    <Image source={{ uri: file.uri }} className="h-20 w-20" />
                  </View>
                );
              })}
            </View>
          )
          }
          <View className="flex justify-center items-center mx-4 mt-auto">
            <TouchableOpacity
              onPress={async () => {
                const check = await sugerir();
                if (check) {
                  navigation.navigate('Home');
                } else {
                  ToastAndroid.show("Error al sugerir", ToastAndroid.SHORT);
                }
              }}
              className="bg-primary  p-2 w-full rounded-lg"
              activeOpacity={0.5}
            >
              <Text className="text-white text-center  text-xs ">Sugerir!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PaperProvider >
    </>
  );
};