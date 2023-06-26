import { baseurl } from "../auth/login";
import GoBackButton from "../gobackbutton";
import { useHomeStore } from "../store";
import { ToastAndroid } from "react-native/Libraries/Components/ToastAndroid/ToastAndroid";
import { Avatar, Button, Card, PaperProvider, Portal, Text } from 'react-native-paper';
import { List } from 'react-native-paper';
import { View } from "react-native";
import StarRating from "react-native-star-rating-widget";
import { Modal } from 'react-native-paper';
import { useState } from "react";
import { Image } from "react-native";
import { TouchableHighlight } from "react-native";
import { ScrollView } from "react-native";
import { SliderBox } from "react-native-image-slider-box";
import { Chip } from 'react-native-paper';
export async function fetchLocalesActivos() {
  let locales: any[] = [];
  await fetch(baseurl + "/api/v1/locales_activos", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    return response.json();
  }).then((json) => {
    console.log(json, "locales");
    if (json.errors) {
      for (let i in json.errors) {
        ToastAndroid.show(`${json.errors[i].field ?? "Error:"} ${json.errors[i].message}`, ToastAndroid.SHORT);
      }
      return;
    }
    if (json.locales) {

      locales = json.locales;
    }
  }).catch((error) => {
    console.log(error);
    ToastAndroid.show(`Error al sugerir ${error}`, ToastAndroid.SHORT);
  });
  return locales;
}



export default function DetallesLocal({ navigation }: { navigation: any; }) {

  const GoBack = (props: any) => <GoBackButton navigation={navigation} />;
  const local = useHomeStore((state) => state.selectedLocal);
  console.log(local?.imagenes, "imagenes");
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  return (<>
    <PaperProvider>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={{ backgroundColor: 'transparent' }}>
          <Image className="w-full h-2/3" source={{ uri: selected?.imagen }} />
        </Modal>
      </Portal>
      <Card className="mt-10">
        <Card.Title title={local?.nombre} subtitle={local?.ubicacion ?? "xdasd"} left={GoBack}
          /* Right estrellas promedio */
          right={
            () => <View className="flex justify-center">
              <Text className="m-2">Promedio:{local?.reviews && local?.reviews?.length > 0 ? ((local?.reviews?.reduce((a, b) => a + b.puntaje, 0) / local?.reviews?.length) / 2).toFixed(1) : "0.0"}</Text></View>
          } />
        <Card.Content>
          <Text variant="bodySmall">{local?.categorias?.map((c) => c.nombre).join(", ")}</Text>
        </Card.Content>
        {local?.imagenes && local?.imagenes?.length > 0 && <SliderBox images={local?.imagenes.map((val) => {
          return val.url.split("?")[0];
        })} /> || <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />}

        <Card.Actions>
          <Button
            onPress={() => {

              navigation.navigate("NuevaReview");
            }}
          >Haz una Review</Button>
          <Button className="bg-primary"

            onPress={() => {
              navigation.navigate("Menu");
            }}
          >Ver Menú</Button>
        </Card.Actions>

      </Card>

      <ScrollView className="flex gap-1 flex-col">
        {local?.reviews?.length == 0 && <Text>Aún no hay reviews</Text>}


        {local?.reviews?.map((review) => {

          const image = review?.usuario?.foto_perfil ? { uri: review?.usuario?.foto_perfil } : require("../../assets/default-user-icon.jpg");
          const imageReview = review.imagen ? { uri: review.imagen } : null;
          console.log(review, "review");
          console.log(review.usuario, "usuario");
          return <List.Item
            className="bg-gray-300"
            title={<>
              <View className="flex justify-center">
                <Text className="ml-2">{review?.usuario?.nombre || "Anónimo"}</Text>
                <StarRating rating={(review?.puntaje / 2)} onChange={() => { }} starSize={25} />
              </View>
            </>}
            /* Limit 50 letras de comentario */
            //description={review?.comentario}
            description={review?.comentario?.length > 50 ? review?.comentario?.substring(0, 50) + "..." : review?.comentario}
            left={() => <Avatar.Image size={50} source={image} />}
            /* Imagen si está disponible a la derecha */
            right={() => imageReview &&
              <TouchableHighlight
                onPress={() => {
                  setSelected(review);
                  showModal();
                }}
                activeOpacity={0.1}
                underlayColor="#DDDDDD"
                className="h-fit"
              >
                <Avatar.Image
                  size={50} source={imageReview} /></TouchableHighlight>}
          />;
        }
        )}
      </ScrollView>

    </PaperProvider>
  </>);
}