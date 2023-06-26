import { Text, View } from "react-native";

import { useState } from "react";
import { useHomeStore } from "../store";
import { useEffect } from "react";

export type DatosLocalType = {
  id?: number;
  nombre?: string;
  ubicacion?: string;
  latitude?: number;
  longitude?: number;
  estado?: boolean;
  id_usuario_creador?: number;
  id_usuario_autorizador?: number;
  tipo?: 'sugerencia' | 'real';
  created_at?: string;
  menus?: {
    id: number,
    titulo: string,
    descripcion: string,
    precio: number,
  }[];
  imagenes?: {
    id: number,
    url: string,
    alt: string,
  }[];
  reviews?: {
    id: number,
    puntaje: number,
    comentario: string,
    imagen?: string,
    usuario: {
      id: number,
      email: string,
      nombre?: string,
      estado_perfil?: string,
      estado_usuario: boolean,
      foto_perfil?: string,
      created_at?: Date,
      updated_at?: Date,
      tipo: 'admin' | 'usuario',
    },
  }[],
  categorias?: {
    id: number,
    nombre: string,
  }[],
  updated_at?: string;
  fotos?: string[];
  foto_principal?: string;
} | null;

export default function DatosLocal() {

  const local = useHomeStore((state) => state.selectedLocal);



  return (<>
    <View className='mt-2 mx-4'>

      <Text className='text-xl'>{local?.nombre ?? "Selecciona un local"}</Text>
      <Text className='text-xs text-gray-400 mb-2'>Ubicación</Text>
      <Text className='text-xs'>{local?.ubicacion ?? "Selecciona un local"}</Text>
      {/* Una linea tipo HR */}
      <View className='border-b-2 border-gray-200 my-2'></View>
    </View>
  </>
  );
};