import { TAX_RATE_WHOLESALE } from '../types'

export interface TaxCalc {
  subtotal:  number  // price × qty
  taxRate:   number  // 0.14 for wholesale, 0 for patient
  taxAmount: number  // total − subtotal
  total:     number  // nearest whole dollar
}

// Patient sales are tax-exempt (taxRate = 0).
// Wholesale sales are taxed at a flat 14%.
// Total is rounded to the nearest dollar so cash transactions never need coins.
export function calcTax(price: number, quantity: number, isWholesale: boolean): TaxCalc {
  const taxRate   = isWholesale ? TAX_RATE_WHOLESALE : 0
  const subtotal  = price * quantity
  const total     = Math.round(subtotal * (1 + taxRate))
  const taxAmount = total - subtotal
  return { subtotal, taxRate, taxAmount, total }
}
