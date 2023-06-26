import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
export default function GoBackButton({ navigation }: { navigation: any; }) {


  return (<>
    <View /* className='translate-y-10 z-50' */>
      <TouchableOpacity
        onPress={() => {
          console.log("xd");
          navigation.goBack();
        }
        }
        className=" rounded-full p-1 bg-gray-200 w-10 "
        activeOpacity={0.5}
      >
        <Ionicons name="chevron-back" size={30} color="rgb(93, 176, 117)"
        />
        {/* <Text className="text-white text-center  text-xs ">Volver</Text> */}
      </TouchableOpacity>
    </View>
  </>);
}