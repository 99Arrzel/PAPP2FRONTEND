import { View, Text } from 'react-native';
import { useHomeStore } from '../../store';
import GoBackButton from '../../gobackbutton';

export default function MenuLocal({ navigation }: { navigation: any; }) {
  const selected = useHomeStore((state) => state.selectedLocal);
  console.log("selected");
  console.log(useHomeStore((state) => state.selectedLocal?.menus));
  return (
    <View className='mt-10'>
      <GoBackButton navigation={navigation} />
      <Text className='text-center' >Menu de {selected?.nombre}</Text>
      <View className='flex flex-col gap-2 mt-2'>
        {selected?.menus?.map((menu: { titulo: string, precio: number; }) => {
          return (
            <View className='flex flex-col gap-2 bg-gray-200'>
              <Text className='text-center text-lg'>Plato: {menu.titulo}</Text>
              <Text className='text-center text-lg'>Precio: {menu.precio}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
