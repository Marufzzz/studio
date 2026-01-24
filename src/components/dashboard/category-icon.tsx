import { Utensils, Car, Home, Handshake, MoreHorizontal, ShoppingCart, Fuel, Shirt, Gift, Film, Landmark, HelpingHand } from 'lucide-react';
import * as React from 'react';

const categoryIcons: { [key: string]: React.ElementType } = {
  food: Utensils,
  transportation: Car,
  rent: Home,
  'given loan': HelpingHand,
  'taken loan': Landmark,
  shopping: ShoppingCart,
  utilities: Fuel,
  clothing: Shirt,
  gifts: Gift,
  entertainment: Film,
  other: MoreHorizontal,
};

interface CategoryIconProps {
  category: string;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = categoryIcons[category.toLowerCase()] || MoreHorizontal;
  return <Icon className={`h-4 w-4 ${className}`} />;
}
