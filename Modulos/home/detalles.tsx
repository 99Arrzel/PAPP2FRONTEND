import { Text, TouchableOpacity, View } from "react-native";
import { useAuthStore, useHomeStore } from "../store";
import { ToastAndroid } from "react-native";
export default function DetallesLocalBoton({ navigation }: { navigation: any; }) {

  const usuario = useAuthStore((state) => state.user);
  const selectedLocal = useHomeStore((state) => state.selectedLocal);

  return (<>
    <View className='flex justify-center items-center mx-4 mt-2 gap-1'>
      {usuario?.tipo == "admin" &&
        /* 2 botones, uno de ver detalles y el otro de ver sugerencias */
        <TouchableOpacity className="bg-secondary  p-2 w-[60%] rounded-lg"
          onPress={() => {
            navigation.navigate('NuevosLocalesAdmin');
          }
          }
          activeOpacity={0.5}
        >
          <Text className="text-white text-center  text-xs ">Ver Nuevos</Text>
        </TouchableOpacity>

      }
      <TouchableOpacity
        onPress={() => {
          if ((selectedLocal != null && Object.keys(selectedLocal).length > 0)) {
            console.log("xd");
            navigation.navigate('DetallesLocal');
          }
          else {
            ToastAndroid.show("Selecciona un local", ToastAndroid.SHORT);
          }
        }
        }
        className={`${(selectedLocal != null && Object.keys(selectedLocal).length > 0) ? 'bg-primary' : 'bg-gray-400'}   p-2 w-[60%] rounded-lg disabled:bg-gray-400`}
        activeOpacity={0.5}
      >
        <Text className="text-white text-center  text-xs ">Ver Detalles</Text>
      </TouchableOpacity>
    </View >
  </>);
}