import { type ClassValue, clsx } from 'clsx';
import { tv, type VariantProps } from 'tailwind-variants';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export { tv, type VariantProps };

// Utility type for components that expose a ref
export type WithElementRef<T, El extends HTMLElement = HTMLElement> = T & {
  ref?: El | null;
};

// Utility type for removing children/child props
export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>;

// Utility type for removing child prop only
export type WithoutChild<T> = Omit<T, 'child'>;
