import { Button, Text } from "react-native-paper";
import { useAuthStore, useHomeStore } from "../store";
import { Alert, I18nManager, PermissionsAndroid, ToastAndroid } from "react-native";
import { TextInput } from 'react-native-paper';
import { useEffect, useState } from "react";
import { View } from "react-native";
import StarRating from 'react-native-star-rating-widget';
import { baseurl } from "../auth/login";

import * as DocumentPicker from 'expo-document-picker';
import { Image } from "react-native";
import { fetchLocalesActivos } from "./detalles-local";

export const urlBucketServer = "https://miniopollosapp-api.ricky.siael.com";
export const urlBucket = "https://miniopollosapp-api.ricky.siael.com/api/v1/upload";
export async function getUrlUpload(nombre: string) {
  return await fetch(baseurl + "/api/v1/get_url_upload", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: "Bearer " + useAuthStore.getState().token?.token
    },
    body: JSON.stringify({
      nombre: nombre,
    })
  }).then((response) => {
    return response.json();
  }).then((json) => {
    if (json.url) {
      return json.url;
    } else {
      throw new Error("Error al obtener url");
    }
  }).catch((error) => {
    console.log(error);
    ToastAndroid.show(`Error al sugerir ${error}`, ToastAndroid.SHORT);
  });

}
export async function fetchLocationsAndUpdateSelected() {
  const locales = await fetchLocalesActivos();
  //Update selected
  const selected = useHomeStore.getState().selectedLocal;
  if (selected != null) {
    const selectedUpdated = locales.find((local) => local.id == selected.id);
    if (selectedUpdated != null) {
      useHomeStore.setState({ selectedLocal: selectedUpdated });
    }
  }

}



export default function NuevaReview({ navigation }: { navigation: any; }) {


  if (useAuthStore.getState().user == null) {
    navigation.navigate('Login');
    ToastAndroid.show("Inicia sesión para poder comentar", ToastAndroid.SHORT);
  }
  const selected = useHomeStore((state) => state.selectedLocal);
  const [review, setReview] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [urlUpload, setUrlUpload] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [singleFile, setSingleFile] = useState<any>(null);

  const commitReview = async () => {
    if (rating < 0.5) {
      ToastAndroid.show(`Califica con al menos media estrella`, ToastAndroid.SHORT);
      return;
    }
    if (review.trim().length < 1) {
      ToastAndroid.show(`Escribe una review`, ToastAndroid.SHORT);
      return;
    }
    let image_url = null;
    if (singleFile != null) {
      setUploading(true);
      const url = await uploadImage();
      if (url == null) {
        ToastAndroid.show(`Error al cargar imagen `, ToastAndroid.SHORT);
        return;
      }
      setUploading(false);
      console.log(url, "url imagen cargada");
      ToastAndroid.show(`Imagen cargada `, ToastAndroid.SHORT);
      image_url = url;
    }

    //Commit review
    const response = await fetch(baseurl + "/api/v1/crear_review", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: "Bearer " + useAuthStore.getState().token?.token
      },
      body: JSON.stringify({
        id_local: selected?.id,
        comentario: review,
        puntaje: rating,
        imagen: image_url
      })
    });
    const json = await response.json();
    console.log(json);
    if (json.errors) {
      for (let i in json.errors) {
        ToastAndroid.show(`${json.errors[i].field ?? "Error:"} ${json.errors[i].message}`, ToastAndroid.SHORT);
      }
      return;
    }
    if (json.review) {
      ToastAndroid.show(`Review creada`, ToastAndroid.SHORT);
      fetchLocationsAndUpdateSelected();
      navigation.navigate('DetallesLocal');
      return;
    }
  };
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

  const uploadImage = async () => {
    let res = "";
    // Check if any file is selected or not
    if (singleFile != null) {
      // If file selected then create FormData

      const url = await getUrlUpload(singleFile.name);
      console.log(url, "url upload");
      const response = await fetch(url, {
        method: 'PUT',
        body: singleFile,
        headers: {
          'Content-Type': 'image/' + singleFile.name.split(".")[1],

        }

      });
      const json = await response;
      res = json.url;
      //Remove the signature url, everything after the ?
      res = res.split("?")[0];
      return res;
    } else {
      // If no file selected the show alert
      Alert.alert('Selecciona un archivo primero');
    }
  };

  async function selectFile() {
    try {
      const result = await checkPermissions();

      if (result) {
        const result = await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: false,
          type: 'image/*',
        });

        if (result.type === 'success') {
          // Printing the log realted to the file
          console.log('res : ' + JSON.stringify(result));
          // Setting the state to show single file attributes
          setSingleFile(result);
        }
      }
    } catch (err) {
      setSingleFile(null);
      console.warn(err);
      return false;
    }
  }


  return (<>
    <View className="mt-10 flex justify-center items-center">
      {/* Interfaz de una review */}
      <Text>Califica a <Text className=" font-bold">{selected?.nombre}</Text></Text>
      <StarRating
        rating={rating}
        onChange={(e) => {
          console.log(e);
          setRating(e);
        }}
      />
      <TextInput
        className="w-full mt-4"
        label="Escribe tu review"
        value={review}
        onChangeText={text => setReview(text)}
      >

      </TextInput>
      {/* Opcionalmente seleccionar una imagen */}

      <Button
        onPress={selectFile}
        disabled={uploading}
      >Subir imagen(Opcional)</Button>
      {/* {singleFile != null ? (
        <Text >
          File Name: {singleFile.name ? singleFile.name : ''}
          {'\n'}
          Type: {singleFile.type ? singleFile.type : ''}
          {'\n'}
          File Size: {singleFile.size ? singleFile.size : ''}
          {'\n'}
          URI: {singleFile.uri ? singleFile.uri : ''}
          {'\n'}
        </Text>
      ) : null} */}

      {/* Visualizar la imagen en vez de los datos */}
      {singleFile != null && <Image
        source={{ uri: singleFile.uri as string }}
        style={{ width: 200, height: 200 }}
      />

      }

      <Button className="mt-4 " onPress={
        () => {
          if (uploading) {
            ToastAndroid.show(`Espera a que termine de subir la imagen`, ToastAndroid.SHORT);
            return;
          }
          commitReview();
        }
      }>Calificar</Button>
      {uploading && <Text>Cargando...</Text>}


    </View>
  </>);
};