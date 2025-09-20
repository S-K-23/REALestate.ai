import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatSquareFeet(sqft: number): string {
  return new Intl.NumberFormat('en-US').format(sqft) + ' sq ft'
}

export function calculateCapRate(monthlyRent: number, price: number): number {
  const annualRent = monthlyRent * 12
  return (annualRent / price) * 100
}
