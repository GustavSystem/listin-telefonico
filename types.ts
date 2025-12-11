export interface Contact {
  id: string;
  centro: string;     // CENTRO
  edificio: string;   // EDIFICIO/ZONA
  planta: string;     // PLANTA
  servicio: string;   // SERVICIO
  interno: string;    // Tlf
  externo: string;    // Nº PÚBLICO
}

export enum ViewState {
  HOME = 'HOME',
  FAVORITES = 'FAVORITES',
  ADD = 'ADD',
  EDIT = 'EDIT'
}