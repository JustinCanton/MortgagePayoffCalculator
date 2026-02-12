export type PaymentFrequency = 
  | 'monthly'
  | 'semi-monthly'
  | 'bi-weekly'
  | 'accelerated-bi-weekly'
  | 'weekly'
  | 'accelerated-weekly';

export type CompoundingMethod = 'semi-annual' | 'monthly';
export type YearlyPaymentTiming = 'start' | 'middle' | 'end';
export type ActiveTab = 'summary' | 'schedule' | 'graph';
export type ScheduleView = 'annual' | 'payment';
export type ExtraPaymentType = 'none' | 'perPayment' | 'yearly' | 'oneTime';

export interface MortgageResult {
  regularPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalPaid: number;
  payoffMonths: number;
  termInterest: number;
  termPrincipal: number;
  balanceAtTermEnd: number;
}

export interface AmortizationEntry {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface MortgageCalculationOptions {
  principal: number;
  annualRate: number;
  years: number;
  frequency: PaymentFrequency;
  extraPayment?: number;
  extraYearly?: number;
  oneTime?: number;
  yearlyTiming?: YearlyPaymentTiming;
}
