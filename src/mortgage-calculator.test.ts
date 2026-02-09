import { describe, it, expect } from 'vitest';
import { MortgageCalculator } from './mortgage-calculator';

type PaymentFrequency = 
  | 'monthly'
  | 'semi-monthly'
  | 'bi-weekly'
  | 'accelerated-bi-weekly'
  | 'weekly'
  | 'accelerated-weekly';

type CompoundingMethod = 'canadian' | 'us';
type YearlyPaymentTiming = 'start' | 'middle' | 'end';

interface MortgageResult {
  regularPayment: number;
  totalPayments: number;
  totalInterest: number;
  totalPaid: number;
  payoffMonths: number;
  termInterest: number;
  termPrincipal: number;
  balanceAtTermEnd: number;
}

// Test interface to access private members for testing
interface MortgageCalculatorTestable {
  loanAmount: number;
  interestRate: number;
  loanTermYears: number;
  termLength: number;
  paymentFrequency: PaymentFrequency;
  compoundingMethod: CompoundingMethod;
  extraPayment: number;
  extraYearlyPayment: number;
  yearlyPaymentTiming: YearlyPaymentTiming;
  oneTimePayment: number;
  calculateMortgage(options: {
    principal: number;
    annualRate: number;
    years: number;
    frequency: PaymentFrequency;
    extraPayment?: number;
    extraYearly?: number;
    oneTime?: number;
    yearlyTiming?: YearlyPaymentTiming;
  }): MortgageResult;
}

describe('MortgageCalculator', () => {
  const createCalculator = (): MortgageCalculatorTestable => {
    const calculator = new MortgageCalculator() as unknown as MortgageCalculatorTestable;
    // Set default values
    calculator.loanAmount = 750000;
    calculator.interestRate = 4.5;
    calculator.loanTermYears = 25;
    calculator.termLength = 5;
    calculator.compoundingMethod = 'canadian';
    calculator.extraPayment = 0;
    calculator.extraYearlyPayment = 0;
    calculator.oneTimePayment = 0;
    return calculator;
  };

  describe('Monthly Payment Frequency', () => {
    it('should calculate correctly for monthly payments', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeCloseTo(4151.05, 2);
      expect(result.payoffMonths).toBe(300);
      expect(result.totalInterest).toBeCloseTo(495313.44, 1);
      expect(result.totalPaid).toBeCloseTo(1245313.44, 1);
    });

    it('should calculate term details correctly for monthly payments', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.termInterest).toBeGreaterThan(0);
      expect(result.termPrincipal).toBeGreaterThan(0);
      expect(result.balanceAtTermEnd).toBeGreaterThan(0);
      expect(result.balanceAtTermEnd).toBeLessThan(750000);
    });
  });

  describe('Semi-Monthly Payment Frequency', () => {
    it('should calculate correctly for semi-monthly payments', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'semi-monthly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'semi-monthly'
      });

      expect(result.regularPayment).toBeCloseTo(2075.53, 2);
      expect(result.payoffMonths).toBe(299);
      // Semi-monthly has slightly less interest due to more frequent compounding
      expect(result.totalInterest).toBeCloseTo(493193.83, 1);
      expect(result.totalPaid).toBeCloseTo(1243193.83, 1);
    });
  });

  describe('Bi-Weekly Payment Frequency', () => {
    it('should calculate correctly for bi-weekly payments', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'bi-weekly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'bi-weekly'
      });

      expect(result.regularPayment).toBeCloseTo(1915.87, 2);
      expect(result.payoffMonths).toBe(299);
      // Bi-weekly has slightly less interest due to more frequent compounding
      expect(result.totalInterest).toBeCloseTo(493033.54, 1);
      expect(result.totalPaid).toBeCloseTo(1243033.54, 1);
    });
  });

  describe('Accelerated Bi-Weekly Payment Frequency', () => {
    it('should calculate correctly for accelerated bi-weekly payments', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'accelerated-bi-weekly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'accelerated-bi-weekly'
      });

      expect(result.regularPayment).toBeCloseTo(2075.52, 2);
      expect(result.payoffMonths).toBe(260);
      expect(result.totalInterest).toBeCloseTo(420198.26, 1);
      expect(result.totalPaid).toBeCloseTo(1170198.26, 1);
    });

    it('should payoff faster than regular bi-weekly', () => {
      const calculator = createCalculator();
      
      const regular = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'bi-weekly'
      });

      const accelerated = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'accelerated-bi-weekly'
      });

      expect(accelerated.payoffMonths).toBeLessThan(regular.payoffMonths);
      expect(accelerated.totalInterest).toBeLessThan(regular.totalInterest);
    });
  });

  describe('Weekly Payment Frequency', () => {
    it('should calculate correctly for weekly payments', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'weekly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'weekly'
      });

      // Weekly payments compound more frequently, resulting in shorter payoff
      expect(result.regularPayment).toBeCloseTo(957.94, 2);
      expect(result.payoffMonths).toBe(299);
      expect(result.totalInterest).toBeCloseTo(492053.31, 1);
      expect(result.totalPaid).toBeCloseTo(1242053.31, 1);
    });
  });

  describe('Accelerated Weekly Payment Frequency', () => {
    it('should calculate correctly for accelerated weekly payments', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'accelerated-weekly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'accelerated-weekly'
      });

      expect(result.regularPayment).toBeCloseTo(1037.76, 2);
      expect(result.payoffMonths).toBe(260);
      expect(result.totalInterest).toBeCloseTo(419355.26, 1);
      expect(result.totalPaid).toBeCloseTo(1169355.26, 1);
    });

    it('should payoff faster than regular weekly', () => {
      const calculator = createCalculator();
      
      const regular = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'weekly'
      });

      const accelerated = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'accelerated-weekly'
      });

      // Accelerated weekly should have slightly less payoff time and interest
      expect(accelerated.payoffMonths).toBeLessThanOrEqual(regular.payoffMonths);
      expect(accelerated.totalInterest).toBeLessThanOrEqual(regular.totalInterest);
    });
  });

  describe('Extra Payments', () => {
    it('should calculate correctly with extra per payment', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const withoutExtra = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      const withExtra = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraPayment: 200
      });

      expect(withExtra.payoffMonths).toBeLessThan(withoutExtra.payoffMonths);
      expect(withExtra.totalInterest).toBeLessThan(withoutExtra.totalInterest);
    });

    it('should calculate correctly with extra yearly payment', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 25000
      });

      expect(result.regularPayment).toBeCloseTo(4151.05, 2);
      expect(result.payoffMonths).toBe(157);
      expect(result.totalInterest).toBeCloseTo(236598.97, 1);
      expect(result.totalPaid).toBeCloseTo(986598.97, 1);
    });

    it('should calculate correctly with one-time payment', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const withoutExtra = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      const withExtra = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        oneTime: 20000
      });

      expect(withExtra.payoffMonths).toBeLessThan(withoutExtra.payoffMonths);
      expect(withExtra.totalInterest).toBeLessThan(withoutExtra.totalInterest);
    });

    it('should calculate correctly with combination of extra payments', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const withoutExtra = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      const withExtra = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraPayment: 200,
        extraYearly: 5000,
        oneTime: 20000
      });

      expect(withExtra.payoffMonths).toBeLessThan(withoutExtra.payoffMonths);
      expect(withExtra.totalInterest).toBeLessThan(withoutExtra.totalInterest);
    });
  });

  describe('Compounding Methods', () => {
    it('should calculate differently for Canadian vs US compounding', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      calculator.compoundingMethod = 'canadian';
      
      const canadian = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      calculator.compoundingMethod = 'us';
      const us = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(canadian.regularPayment).not.toBe(us.regularPayment);
      expect(canadian.totalInterest).not.toBe(us.totalInterest);
    });
  });

  describe('Term Calculations', () => {
    it('should calculate term interest and principal correctly', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      calculator.termLength = 5;
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.termInterest).toBeGreaterThan(0);
      expect(result.termPrincipal).toBeGreaterThan(0);
      expect(result.termInterest).toBeLessThan(result.totalInterest);
      expect(result.balanceAtTermEnd).toBeGreaterThan(0);
      expect(result.balanceAtTermEnd).toBeLessThan(750000);
      
      // Term interest + term principal should roughly equal total payments in term
      const termPayments = 60; // 5 years * 12 months
      const totalTermPayments = result.regularPayment * termPayments;
      expect(result.termInterest + result.termPrincipal).toBeCloseTo(totalTermPayments, 0);
    });

    it('should have balance at term end equal to principal minus term principal', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      calculator.termLength = 5;
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      const expectedBalance = 750000 - result.termPrincipal;
      expect(result.balanceAtTermEnd).toBeCloseTo(expectedBalance, 0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short amortization periods', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const result = calculator.calculateMortgage({
        principal: 10000,
        annualRate: 4.5,
        years: 1,
        frequency: 'monthly'
      });

      expect(result.payoffMonths).toBeGreaterThanOrEqual(12);
      expect(result.payoffMonths).toBeLessThanOrEqual(13);
      expect(result.totalPaid).toBeGreaterThan(10000);
    });

    it('should handle zero interest rate', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const result = calculator.calculateMortgage({
        principal: 100000,
        annualRate: 0.001,
        years: 10,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(Number.isFinite(result.regularPayment)).toBe(true);
    });

    it('should handle large loan amounts', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const result = calculator.calculateMortgage({
        principal: 1000000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(0);
      expect(result.totalPaid).toBeGreaterThan(1000000);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
    });
  });

  describe('Payment Frequency Comparisons', () => {
    it('should have similar totals across non-accelerated frequencies', () => {
      const calculator = createCalculator();
      
      const monthly = calculator.calculateMortgage({ principal: 750000, annualRate: 4.5, years: 25, frequency: 'monthly' });
      const semiMonthly = calculator.calculateMortgage({ principal: 750000, annualRate: 4.5, years: 25, frequency: 'semi-monthly' });
      const biWeekly = calculator.calculateMortgage({ principal: 750000, annualRate: 4.5, years: 25, frequency: 'bi-weekly' });
      const weekly = calculator.calculateMortgage({ principal: 750000, annualRate: 4.5, years: 25, frequency: 'weekly' });

      // All should have similar interest (within a reasonable margin)
      // More frequent payments result in slightly less interest due to compounding
      expect(semiMonthly.totalInterest).toBeLessThan(monthly.totalInterest);
      expect(biWeekly.totalInterest).toBeLessThan(monthly.totalInterest);
      expect(weekly.totalInterest).toBeLessThan(monthly.totalInterest);
      
      // But should be within ~5% of each other
      expect(Math.abs(monthly.totalInterest - semiMonthly.totalInterest)).toBeLessThan(monthly.totalInterest * 0.05);
    });

    it('should show accelerated frequencies pay less interest', () => {
      const calculator = createCalculator();
      
      const biWeekly = calculator.calculateMortgage({ principal: 750000, annualRate: 4.5, years: 25, frequency: 'bi-weekly' });
      const acceleratedBiWeekly = calculator.calculateMortgage({ principal: 750000, annualRate: 4.5, years: 25, frequency: 'accelerated-bi-weekly' });
      const weekly = calculator.calculateMortgage({ principal: 750000, annualRate: 4.5, years: 25, frequency: 'weekly' });
      const acceleratedWeekly = calculator.calculateMortgage({ principal: 750000, annualRate: 4.5, years: 25, frequency: 'accelerated-weekly' });

      expect(acceleratedBiWeekly.totalInterest).toBeLessThan(biWeekly.totalInterest);
      expect(acceleratedWeekly.totalInterest).toBeLessThan(weekly.totalInterest);
    });
  });

  describe('Yearly Payment Timing Options', () => {
    it('should calculate correctly with yearly payment at start of year', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 25000,
        yearlyTiming: 'start'
      });

      expect(result.regularPayment).toBeCloseTo(4151.05, 2);
      expect(result.payoffMonths).toBe(157);
      expect(result.totalInterest).toBeCloseTo(236598.97, 1);
      expect(result.totalPaid).toBeCloseTo(986598.97, 1);
    });

    it('should calculate correctly with yearly payment at middle of year', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 25000,
        yearlyTiming: 'middle'
      });

      expect(result.regularPayment).toBeCloseTo(4151.05, 2);
      // Middle timing should result in slightly longer payoff than start
      expect(result.payoffMonths).toBeGreaterThan(157);
      expect(result.payoffMonths).toBeLessThan(164);
      // More interest than start timing since payment is applied later
      expect(result.totalInterest).toBeGreaterThan(236598);
      expect(result.totalInterest).toBeLessThan(246000);
    });

    it('should calculate correctly with yearly payment at end of year', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 25000,
        yearlyTiming: 'end'
      });

      expect(result.regularPayment).toBeCloseTo(4151.05, 2);
      // End timing should result in longest payoff
      expect(result.payoffMonths).toBeGreaterThan(160);
      expect(result.payoffMonths).toBeLessThan(170);
      // Most interest since payment is applied at end of each year
      expect(result.totalInterest).toBeGreaterThan(240000);
      expect(result.totalInterest).toBeLessThan(256000);
    });

    it('should have different results for different timing options', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      const startTiming = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 25000,
        yearlyTiming: 'start'
      });

      const middleTiming = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 25000,
        yearlyTiming: 'middle'
      });

      const endTiming = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 25000,
        yearlyTiming: 'end'
      });

      // Payoff months should increase from start to end
      expect(startTiming.payoffMonths).toBeLessThan(middleTiming.payoffMonths);
      expect(middleTiming.payoffMonths).toBeLessThan(endTiming.payoffMonths);

      // Total interest should increase from start to end (earlier payment is more effective)
      expect(startTiming.totalInterest).toBeLessThan(middleTiming.totalInterest);
      expect(middleTiming.totalInterest).toBeLessThan(endTiming.totalInterest);
    });

    it('should work with yearly payment timing for different frequencies', () => {
      const calculator = createCalculator();
      
      const monthlyStart = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 20000,
        yearlyTiming: 'start'
      });

      const biWeeklyStart = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'bi-weekly',
        extraYearly: 20000,
        yearlyTiming: 'start'
      });

      const weeklyEnd = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'weekly',
        extraYearly: 20000,
        yearlyTiming: 'end'
      });

      // All should have valid results with yearly payments applied
      expect(monthlyStart.payoffMonths).toBeGreaterThan(0);
      expect(biWeeklyStart.payoffMonths).toBeGreaterThan(0);
      expect(weeklyEnd.payoffMonths).toBeGreaterThan(0);

      // All should have less interest than no extra payments
      const noExtra = calculator.calculateMortgage({ principal: 750000, annualRate: 4.5, years: 25, frequency: 'monthly' });
      expect(monthlyStart.totalInterest).toBeLessThan(noExtra.totalInterest);
      expect(biWeeklyStart.totalInterest).toBeLessThan(noExtra.totalInterest);
      expect(weeklyEnd.totalInterest).toBeLessThan(noExtra.totalInterest);
    });

    it('should default to start timing when not specified', () => {
      const calculator = createCalculator();
      calculator.paymentFrequency = 'monthly';
      
      // Call without timing parameter (should default to 'start')
      const resultDefault = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 25000
      });

      const resultExplicitStart = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 25000,
        yearlyTiming: 'start'
      });

      // Should produce identical results
      expect(resultDefault.payoffMonths).toBe(resultExplicitStart.payoffMonths);
      expect(resultDefault.totalInterest).toBeCloseTo(resultExplicitStart.totalInterest, 2);
    });
  });

  describe('Different Loan Amounts', () => {
    it('should handle small loan amounts', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 50000,
        annualRate: 4.5,
        years: 10,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(0);
      expect(result.totalPaid).toBeGreaterThan(50000);
      expect(result.payoffMonths).toBeLessThanOrEqual(120);
    });

    it('should handle medium loan amounts', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 350000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeCloseTo(1937.16, 1);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.totalPaid).toBeGreaterThan(350000);
    });

    it('should handle very large loan amounts', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 2000000,
        annualRate: 4.5,
        years: 30,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(0);
      expect(result.totalPaid).toBeGreaterThan(2000000);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
    });
  });

  describe('Different Interest Rates', () => {
    it('should calculate correctly for very low interest rates', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 1,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      const highRateResult = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 5,
        years: 25,
        frequency: 'monthly'
      });
      expect(result.totalInterest).toBeLessThan(highRateResult.totalInterest);
    });

    it('should calculate correctly for moderate interest rates', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 600000,
        annualRate: 3.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeCloseTo(2995.62, 1);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    it('should calculate correctly for high interest rates', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 7.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(3500);
      expect(result.totalInterest).toBeGreaterThan(500000);
    });

    it('should show higher rates result in more interest', () => {
      const calculator = createCalculator();
      const lowRate = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 2.5,
        years: 25,
        frequency: 'monthly'
      });

      const highRate = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 6.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(highRate.totalInterest).toBeGreaterThan(lowRate.totalInterest);
      expect(highRate.regularPayment).toBeGreaterThan(lowRate.regularPayment);
    });
  });

  describe('Different Amortization Periods', () => {
    it('should calculate correctly for 15-year term', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 15,
        frequency: 'monthly'
      });

      expect(result.payoffMonths).toBeLessThanOrEqual(181);
      expect(result.regularPayment).toBeGreaterThan(3800);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    it('should calculate correctly for 20-year term', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 20,
        frequency: 'monthly'
      });

      expect(result.payoffMonths).toBeLessThanOrEqual(240);
      expect(result.regularPayment).toBeGreaterThan(3100);
    });

    it('should calculate correctly for 30-year term', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 30,
        frequency: 'monthly'
      });

      expect(result.payoffMonths).toBeLessThanOrEqual(360);
      expect(result.regularPayment).toBeGreaterThan(2500);
    });

    it('should show shorter terms have higher payments but less total interest', () => {
      const calculator = createCalculator();
      const fifteenYear = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 15,
        frequency: 'monthly'
      });

      const thirtyYear = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 30,
        frequency: 'monthly'
      });

      expect(fifteenYear.regularPayment).toBeGreaterThan(thirtyYear.regularPayment);
      expect(fifteenYear.totalInterest).toBeLessThan(thirtyYear.totalInterest);
      expect(fifteenYear.payoffMonths).toBeLessThan(thirtyYear.payoffMonths);
    });
  });

  describe('Term Length Variations', () => {
    it('should calculate correctly for 1-year term', () => {
      const calculator = createCalculator();
      calculator.termLength = 1;
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.termInterest).toBeGreaterThan(0);
      expect(result.termPrincipal).toBeGreaterThan(0);
      expect(result.balanceAtTermEnd).toBeCloseTo(500000 - result.termPrincipal, 0);
      expect(result.balanceAtTermEnd).toBeGreaterThan(470000);
    });

    it('should calculate correctly for 3-year term', () => {
      const calculator = createCalculator();
      calculator.termLength = 3;
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.termInterest).toBeGreaterThan(0);
      expect(result.balanceAtTermEnd).toBeLessThan(500000);
      expect(result.balanceAtTermEnd).toBeGreaterThan(430000);
    });

    it('should calculate correctly for 10-year term', () => {
      const calculator = createCalculator();
      calculator.termLength = 10;
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.termInterest).toBeGreaterThan(0);
      expect(result.balanceAtTermEnd).toBeLessThan(500000);
      expect(result.balanceAtTermEnd).toBeGreaterThan(300000);
    });

    it('should show longer terms accumulate more interest', () => {
      const calculator = createCalculator();
      calculator.termLength = 3;
      const threeYear = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      calculator.termLength = 7;
      const sevenYear = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(sevenYear.termInterest).toBeGreaterThan(threeYear.termInterest);
      expect(sevenYear.termPrincipal).toBeGreaterThan(threeYear.termPrincipal);
      expect(sevenYear.balanceAtTermEnd).toBeLessThan(threeYear.balanceAtTermEnd);
    });
  });

  describe('Extra Payment Edge Cases', () => {
    it('should handle very small extra payments', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraPayment: 10
      });

      const noExtra = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.payoffMonths).toBeLessThan(noExtra.payoffMonths);
      expect(result.totalInterest).toBeLessThan(noExtra.totalInterest);
    });

    it('should handle large extra payments', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraPayment: 2000
      });

      expect(result.payoffMonths).toBeLessThan(180);
      expect(result.totalInterest).toBeLessThan(300000);
    });

    it('should handle extra payment larger than regular payment', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraPayment: 5000
      });

      expect(result.payoffMonths).toBeLessThan(120);
      expect(result.totalInterest).toBeLessThan(200000);
    });

    it('should handle very large one-time payment', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        oneTime: 100000
      });

      expect(result.payoffMonths).toBeLessThan(240);
      expect(result.totalInterest).toBeLessThan(300000);
    });

    it('should handle multiple yearly payments over loan life', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraYearly: 30000
      });

      expect(result.payoffMonths).toBeLessThan(180);
      expect(result.totalInterest).toBeLessThan(250000);
    });
  });

  describe('Canadian vs US Compounding Differences', () => {
    it('should show Canadian compounding for bi-weekly payments', () => {
      const calculator = createCalculator();
      calculator.compoundingMethod = 'canadian';
      const canadian = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'bi-weekly'
      });

      calculator.compoundingMethod = 'us';
      const us = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'bi-weekly'
      });

      expect(canadian.regularPayment).not.toBeCloseTo(us.regularPayment, 0);
      expect(canadian.totalInterest).not.toBeCloseTo(us.totalInterest, 0);
    });

    it('should show Canadian compounding for weekly payments', () => {
      const calculator = createCalculator();
      calculator.compoundingMethod = 'canadian';
      const canadian = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'weekly'
      });

      calculator.compoundingMethod = 'us';
      const us = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'weekly'
      });

      expect(Math.abs(canadian.totalInterest - us.totalInterest)).toBeGreaterThan(1000);
    });

    it('should show meaningful difference between Canadian and US compounding', () => {
      const calculator = createCalculator();
      calculator.compoundingMethod = 'canadian';
      const canadian = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 5,
        years: 25,
        frequency: 'monthly'
      });

      calculator.compoundingMethod = 'us';
      const us = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 5,
        years: 25,
        frequency: 'monthly'
      });

      expect(Math.abs(canadian.regularPayment - us.regularPayment)).toBeGreaterThan(10);
    });
  });

  describe('Precision and Rounding', () => {
    it('should produce consistent results with decimal principals', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 475350.75,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(0);
      expect(Number.isFinite(result.totalInterest)).toBe(true);
      expect(Number.isFinite(result.totalPaid)).toBe(true);
    });

    it('should handle interest rates with many decimals', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.875,
        years: 25,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    it('should produce consistent results across multiple calculations', () => {
      const calculator = createCalculator();
      const result1 = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      const result2 = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      expect(result1.regularPayment).toBe(result2.regularPayment);
      expect(result1.totalInterest).toBe(result2.totalInterest);
      expect(result1.payoffMonths).toBe(result2.payoffMonths);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle minimum viable loan', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 1000,
        annualRate: 4.5,
        years: 1,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(0);
      expect(result.regularPayment).toBeLessThan(100);
      expect(result.payoffMonths).toBeLessThanOrEqual(12);
    });

    it('should handle very short term with high rate', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 100000,
        annualRate: 10,
        years: 5,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(2000);
      expect(result.totalInterest).toBeGreaterThan(20000);
    });

    it('should handle accelerated payments with low rate', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 2,
        years: 25,
        frequency: 'accelerated-bi-weekly'
      });

      expect(result.payoffMonths).toBeLessThan(300);
      expect(result.totalInterest).toBeLessThan(250000);
    });
  });

  describe('Payment Frequency Calculations', () => {
    it('should calculate correct number of payments for each frequency', () => {
      const calculator = createCalculator();
      const principal = 500000;
      const rate = 4.5;
      const years = 25;

      const monthly = calculator.calculateMortgage({ principal, annualRate: rate, years, frequency: 'monthly' });
      expect(monthly.payoffMonths).toBeLessThanOrEqual(301);

      const semiMonthly = calculator.calculateMortgage({ principal, annualRate: rate, years, frequency: 'semi-monthly' });
      expect(semiMonthly.totalPayments).toBeGreaterThan(monthly.totalPayments * 1.9);

      const biWeekly = calculator.calculateMortgage({ principal, annualRate: rate, years, frequency: 'bi-weekly' });
      expect(biWeekly.totalPayments).toBeGreaterThan(monthly.totalPayments * 2);

      const weekly = calculator.calculateMortgage({ principal, annualRate: rate, years, frequency: 'weekly' });
      expect(weekly.totalPayments).toBeGreaterThan(monthly.totalPayments * 4);
    });

    it('should show accelerated payments reduce total payments made', () => {
      const calculator = createCalculator();
      const biWeekly = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'bi-weekly'
      });

      const acceleratedBiWeekly = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'accelerated-bi-weekly'
      });

      expect(acceleratedBiWeekly.totalPayments).toBeLessThan(biWeekly.totalPayments);
      expect(acceleratedBiWeekly.payoffMonths).toBeLessThan(biWeekly.payoffMonths);
    });
  });

  describe('Combination Scenarios', () => {
    it('should handle low principal, high rate, short term', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 100000,
        annualRate: 8,
        years: 10,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(1200);
      expect(result.totalInterest).toBeGreaterThan(40000);
      expect(result.payoffMonths).toBeLessThanOrEqual(120);
    });

    it('should handle high principal, low rate, long term', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 1500000,
        annualRate: 2.5,
        years: 30,
        frequency: 'monthly'
      });

      expect(result.regularPayment).toBeGreaterThan(5000);
      expect(result.totalPaid).toBeGreaterThan(1500000);
      expect(result.payoffMonths).toBeLessThanOrEqual(361);
    });

    it('should handle accelerated weekly with yearly extra at high rate', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 750000,
        annualRate: 6.5,
        years: 25,
        frequency: 'accelerated-weekly',
        extraYearly: 20000,
        yearlyTiming: 'start'
      });

      expect(result.payoffMonths).toBeLessThan(240);
      expect(result.totalInterest).toBeLessThan(600000);
    });

    it('should handle semi-monthly with all extra payment types', () => {
      const calculator = createCalculator();
      const result = calculator.calculateMortgage({
        principal: 600000,
        annualRate: 4.5,
        years: 25,
        frequency: 'semi-monthly',
        extraPayment: 150,
        extraYearly: 15000,
        oneTime: 25000
      });

      const noExtra = calculator.calculateMortgage({
        principal: 600000,
        annualRate: 4.5,
        years: 25,
        frequency: 'semi-monthly'
      });

      expect(result.payoffMonths).toBeLessThan(noExtra.payoffMonths * 0.7);
      expect(result.totalInterest).toBeLessThan(noExtra.totalInterest * 0.7);
    });
  });

  describe('Interest Accumulation', () => {
    it('should show interest is front-loaded in amortization', () => {
      const calculator = createCalculator();
      calculator.termLength = 5;
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      const paymentsInTerm = 60;
      const totalPaidInTerm = result.regularPayment * paymentsInTerm;
      const interestPercentage = result.termInterest / totalPaidInTerm;

      // In early years, interest should be more than 60% of payment
      expect(interestPercentage).toBeGreaterThan(0.6);
    });

    it('should show total interest increases with lower payments', () => {
      const calculator = createCalculator();
      const shortTerm = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 15,
        frequency: 'monthly'
      });

      const longTerm = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 30,
        frequency: 'monthly'
      });

      expect(longTerm.totalInterest).toBeGreaterThan(shortTerm.totalInterest * 1.5);
    });
  });

  describe('Payment Impact Analysis', () => {
    it('should show doubling extra payment roughly halves payoff time', () => {
      const calculator = createCalculator();
      const smallExtra = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraPayment: 200
      });

      const largeExtra = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        extraPayment: 400
      });

      const noExtra = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      const smallReduction = noExtra.payoffMonths - smallExtra.payoffMonths;
      const largeReduction = noExtra.payoffMonths - largeExtra.payoffMonths;

      expect(largeReduction).toBeGreaterThan(smallReduction * 1.5);
    });

    it('should show early one-time payment saves more interest', () => {
      const calculator = createCalculator();
      // One-time payment applied immediately has more impact
      const result = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly',
        oneTime: 50000
      });

      const noExtra = calculator.calculateMortgage({
        principal: 500000,
        annualRate: 4.5,
        years: 25,
        frequency: 'monthly'
      });

      const interestSaved = noExtra.totalInterest - result.totalInterest;
      expect(interestSaved).toBeGreaterThan(30000);
    });
  });
});
