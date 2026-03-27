export type NivelGusto = 'Sobresaliente' | 'Notable' | 'Bien' | 'Suspenso' | 'Sin probar' | '';

export interface Recipe {
  id: string;
  nombre: string;
  categoria: string[];
  favorito: boolean;
  ingredientes: string;
  instrucciones: string;
  fotos: string[];
  link: string;
  nivelIvan: NivelGusto;
  nivelVero: NivelGusto;
  observaciones: string;
  tiempoPreparacion: number | null;
  tipo: string[];
}

export interface PlannedRecipe {
  id: string;
  nombre: string;
  categoria: string[];
  fotos: string[];
  ingredientes: string;
  instrucciones: string;
  link: string;
  observaciones: string;
  tipo: string[];
}

export interface WeeklyPlan {
  [day: string]: {
    comida?: string; // recipe id
    cena?: string;   // recipe id
  };
}

export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
}

export const CATEGORIAS = [
  'Airfryer',
  'Vitrocerámica',
  'Olla GM',
  'Mambo',
  'Sin cocinar',
] as const;

export const NIVELES_GUSTO = [
  'Sobresaliente',
  'Notable',
  'Bien',
  'Suspenso',
  'Sin probar',
] as const;

export const TIPOS = [
  'Arroz', 'Bebida', 'Caldo', 'Canapé', 'Carne/Pollo', 'Croquetas',
  'Embutido', 'Empanadas', 'Fruta', 'Frutos secos', 'Hamburguesas',
  'Huevos', 'Lácteos', 'Legumbres', 'Marisco', 'Pasta', 'Pastel salado',
  'Patatas', 'Pescado', 'Pizza', 'Puré', 'Queso', 'Salsa', 'Setas',
  'Sopas/Cremas', 'Tortilla', 'Tortitas', 'Verdura', 'Yogurt',
] as const;
