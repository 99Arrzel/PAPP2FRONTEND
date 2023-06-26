import { create } from 'zustand';
import { DatosLocalType } from './home/datos-local';
import { MarkerPressEvent, Region } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';


export const getLocationFromCoordinates = (latitude: number, longitude: number): DatosLocalType => {
  let locationSelected = null;
  for (let i in useHomeStore.getState().locations) {

    if (useHomeStore.getState().locations[i].latitude == latitude && useHomeStore.getState().locations[i].longitude == longitude) {
      locationSelected = {
        id: useHomeStore.getState().locations[i].id || null,
        nombre: useHomeStore.getState().locations[i].nombre || null,
        direccion: useHomeStore.getState().locations[i].direccion || null,
      } as DatosLocalType;
      break;
    }
  }
  return locationSelected;
};

//npm install @react-native-async-storage/async-storage

type RegionExtended = Region & {
  foto?: string;
  nombre?: string;
  direccion?: string;
  id?: number;
};

type HomeStoreType = {
  locations: RegionExtended[];
  setLocations: (location: RegionExtended[]) => void;
  selectedLocal: DatosLocalType | null;
  setSelectedLocal: (selectedLocal: DatosLocalType | null) => void;

  setSelectedWithLocation: (location: MarkerPressEvent) => void;
  setSelectedWithId: (id: number) => void;
  isFirstTime: boolean;
  setIsFirstTime: (isFirstTime: boolean) => void;
};
type UsuarioType = {
  id: number;
  email: string;
  nombre?: string;
  estado_perfil?: string;
  estado_usuario: boolean;
  foto_perfil?: string;
  created_at?: Date;
  updated_at?: Date;
  tipo: 'admin' | 'usuario';
} | null;
export const useHomeStore = create<HomeStoreType>((set) => ({
  locations: [] as RegionExtended[],
  setLocations: (locations: RegionExtended[]) => set((state) => ({ locations: locations })),

  selectedLocal: {} as DatosLocalType | null,
  setSelectedLocal: (selectedLocal: DatosLocalType | null) => set((state) => ({ selectedLocal: selectedLocal })),
  setSelectedWithId: (id: number) => set((state) => {
    let locationSelected = null;
    for (let i in state.locations) {
      if (state.locations[i].id == id) {
        locationSelected = {
          id: state.locations[i].id || null,
          nombre: state.locations[i].nombre || null,
          direccion: state.locations[i].direccion || null,
        } as DatosLocalType;
        break;
      }
    }
    console.log(state.locations, "locations");
    console.log(locationSelected, "locationSelected");
    return { selectedLocal: locationSelected };
  }),

  setSelectedWithLocation: (location: MarkerPressEvent) => set((state) => {
    let locationSelected = getLocationFromCoordinates(
      location.nativeEvent.coordinate.latitude,
      location.nativeEvent.coordinate.longitude
    ) ?? null;
    console.log(locationSelected, "locationSelected");
    return { selectedLocal: locationSelected };
  }),

  //buscar en locations que está arriba

  isFirstTime: true,
  setIsFirstTime: (isFirstTime: boolean) => set((state) => ({ isFirstTime: isFirstTime })),

}));

type CredentiaslType = {
  /* Is logged in */
  /* User any */
  /* last login */

  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;

  user: UsuarioType;
  setUser: (user: UsuarioType) => void;

  lastLogin: Date | null;
  setLastLogin: (lastLogin: Date) => void;


  token: TokenType;
  setToken: (token: TokenType) => void;
};

type TokenType = {
  token: string;
  type: string;
} | null;
export const useAuthStore = create<CredentiaslType>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      setIsLoggedIn: (isLoggedIn: boolean) => set((state) => ({ isLoggedIn: isLoggedIn })),
      user: null as UsuarioType,
      setUser: (user: UsuarioType) => set((state) => ({ user: user })),
      lastLogin: null,
      setLastLogin: (lastLogin: Date) => set((state) => ({ lastLogin: lastLogin })),

      token: null as TokenType,
      setToken: (token: TokenType) => set((state) => ({ token: token })),
    }),
    {
      name: 'auth-storage',

      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
