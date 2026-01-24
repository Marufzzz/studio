import { Utensils, Car, Home, HelpingHand, Landmark, MoreHorizontal, ShoppingCart, Fuel, Shirt, Gift, Film, GlassWater, Cookie, HeartPulse, GraduationCap } from 'lucide-react';
import * as React from 'react';

const categoryIcons: { [key: string]: React.ElementType } = {
  food: Utensils,
  beverage: GlassWater,
  snacks: Cookie,
  transportation: Car,
  rent: Home,
  utilities: Fuel,
  shopping: ShoppingCart,
  clothing: Shirt,
  entertainment: Film,
  health: HeartPulse,
  education: GraduationCap,
  gift: Gift,
  'given loan': HelpingHand,
  'taken loan': Landmark,
  given: HelpingHand, // for new loan type
  taken: Landmark,   // for new loan type
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
