import type {
  PaymentFrequency,
  CompoundingMethod,
  YearlyPaymentTiming,
  MortgageResult,
  AmortizationEntry,
  MortgageCalculationOptions,
} from './types';

export function getPaymentsPerYear(frequency: PaymentFrequency): number {
  switch (frequency) {
    case 'monthly': return 12;
    case 'semi-monthly': return 24;
    case 'bi-weekly': return 26;
    case 'accelerated-bi-weekly': return 26;
    case 'weekly': return 52;
    case 'accelerated-weekly': return 52;
  }
}

export function getFrequencyLabel(frequency: PaymentFrequency): string {
  switch (frequency) {
    case 'monthly': return 'Monthly';
    case 'semi-monthly': return 'Semi-Monthly';
    case 'bi-weekly': return 'Bi-Weekly';
    case 'accelerated-bi-weekly': return 'Accelerated Bi-Weekly';
    case 'weekly': return 'Weekly';
    case 'accelerated-weekly': return 'Accelerated Weekly';
  }
}

export function calculateMonthlyRate(annualRate: number, compoundingMethod: CompoundingMethod): number {
  if (compoundingMethod === 'semi-annual') {
    // Semi-annual compounding
    const semiAnnualRate = annualRate / 100 / 2;
    return Math.pow(1 + semiAnnualRate, 1/6) - 1;
  } else {
    // Monthly compounding
    return annualRate / 100 / 12;
  }
}

export function calculateRegularPayment(
  monthlyPayment: number,
  frequency: PaymentFrequency
): number {
  let payment: number;
  
  if (frequency === 'monthly') {
    payment = monthlyPayment;
  } else if (frequency === 'semi-monthly') {
    payment = monthlyPayment / 2;
  } else if (frequency === 'bi-weekly') {
    payment = (monthlyPayment * 12) / 26;
  } else if (frequency === 'weekly') {
    payment = (monthlyPayment * 12) / 52;
  } else if (frequency === 'accelerated-bi-weekly') {
    payment = monthlyPayment / 2;
  } else {
    payment = monthlyPayment / 4;
  }

  // Use ceiling for semi-monthly and weekly to match RBC's rounding
  if (frequency === 'semi-monthly' || frequency === 'weekly') {
    return Math.ceil(payment * 100) / 100;
  } else {
    return Math.round(payment * 100) / 100;
  }
}

export function shouldAddYearlyPayment(
  currentMonths: number,
  previousMonths: number,
  yearlyPayment: number,
  timing: YearlyPaymentTiming
): boolean {
  if (yearlyPayment <= 0) return false;
  
  // Determine the target month within each year based on timing
  let targetMonth: number;
  if (timing === 'start') {
    targetMonth = 1; // First month of each year (13, 25, 37...)
  } else if (timing === 'middle') {
    targetMonth = 6; // Middle of each year (6, 18, 30...)
  } else {
    targetMonth = 12; // End of each year (12, 24, 36...)
  }
  
  // Check if we just crossed the target month in any year
  for (let year = 0; year <= 50; year++) {
    const targetMonthAbsolute = year * 12 + targetMonth;
    if (previousMonths < targetMonthAbsolute && currentMonths >= targetMonthAbsolute) {
      return true;
    }
  }
  
  return false;
}

export function calculateMortgage(
  options: MortgageCalculationOptions,
  compoundingMethod: CompoundingMethod,
  termLength: number
): MortgageResult {
  const {
    principal,
    annualRate,
    years,
    frequency,
    extraPayment = 0,
    extraYearly = 0,
    oneTime = 0,
    yearlyTiming = 'start',
  } = options;
  
  const monthlyRate = calculateMonthlyRate(annualRate, compoundingMethod);
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const paymentPeriodMonths = 12 / paymentsPerYear;
  
  // Calculate the effective interest rate for the payment period
  const periodRate = Math.pow(1 + monthlyRate, paymentPeriodMonths) - 1;

  // Calculate the base monthly payment first
  const numberOfMonthlyPayments = years * 12;
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonthlyPayments)) /
    (Math.pow(1 + monthlyRate, numberOfMonthlyPayments) - 1);

  const regularPayment = calculateRegularPayment(monthlyPayment, frequency);

  let balance = principal - oneTime;
  let totalInterest = 0;
  let termInterest = 0;
  let termPrincipal = 0;
  let balanceAtTermEnd = 0;
  let paymentsMade = 0;
  const totalPayments = years * paymentsPerYear;
  const maxPayments = totalPayments * 3; // Safety limit
  
  const termMonths = termLength * 12;
  
  let cumulativeMonths = 0;

  for (let payment = 1; payment <= maxPayments; payment++) {
    if (balance <= 0) break;

    cumulativeMonths += paymentPeriodMonths;
    // Calculate interest based on the payment period using the period rate
    const interestPayment = balance * periodRate;
    totalInterest += interestPayment;
    
    // Track interest during the term period
    if (cumulativeMonths <= termMonths) {
      termInterest += interestPayment;
    }

    let principalPayment = regularPayment - interestPayment + extraPayment;

    // Add extra yearly payment at the end of each year
    if (shouldAddYearlyPayment(cumulativeMonths, cumulativeMonths - paymentPeriodMonths, extraYearly, yearlyTiming)) {
      principalPayment += extraYearly;
    }

    balance -= principalPayment;
    paymentsMade++;
    
    // Track principal paid during the term period
    if (cumulativeMonths <= termMonths) {
      termPrincipal += principalPayment;
    }
    
    // Capture balance at end of term
    if (cumulativeMonths >= termMonths && balanceAtTermEnd === 0) {
      balanceAtTermEnd = Math.max(0, balance);
    }

    if (balance <= 0) {
      break;
    }
  }

  const totalPaid = principal + totalInterest;
  // For payoff months, check if we're very close to the next month boundary
  const exactMonths = cumulativeMonths;
  const payoffMonths = (exactMonths  - Math.floor(exactMonths) > 0.99) ? 
                      Math.ceil(exactMonths) : Math.floor(exactMonths);

  return {
    regularPayment,
    totalPayments: paymentsMade,
    totalInterest,
    totalPaid,
    payoffMonths,
    termInterest,
    termPrincipal,
    balanceAtTermEnd,
  };
}

export function generateAmortizationSchedule(
  options: MortgageCalculationOptions,
  compoundingMethod: CompoundingMethod
): AmortizationEntry[] {
  const {
    principal,
    annualRate,
    years,
    frequency,
    extraPayment = 0,
    extraYearly = 0,
    oneTime = 0,
    yearlyTiming = 'start',
  } = options;
  
  const monthlyRate = calculateMonthlyRate(annualRate, compoundingMethod);
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const paymentPeriodMonths = 12 / paymentsPerYear;
  const periodRate = Math.pow(1 + monthlyRate, paymentPeriodMonths) - 1;

  const numberOfMonthlyPayments = years * 12;
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonthlyPayments)) /
    (Math.pow(1 + monthlyRate, numberOfMonthlyPayments) - 1);

  const regularPayment = calculateRegularPayment(monthlyPayment, frequency);

  let balance = principal - oneTime;
  let cumulativeInterest = 0;
  let cumulativePrincipal = oneTime;
  let cumulativeMonths = 0;
  const schedule: AmortizationEntry[] = [];
  const maxPayments = years * paymentsPerYear * 3;

  for (let payment = 1; payment <= maxPayments; payment++) {
    if (balance <= 0) break;

    cumulativeMonths += paymentPeriodMonths;
    const interestPayment = balance * periodRate;
    cumulativeInterest += interestPayment;

    let principalPayment = regularPayment - interestPayment + extraPayment;

    if (shouldAddYearlyPayment(cumulativeMonths, cumulativeMonths - paymentPeriodMonths, extraYearly, yearlyTiming)) {
      principalPayment += extraYearly;
    }

    const totalPayment = interestPayment + principalPayment;
    balance -= principalPayment;
    cumulativePrincipal += principalPayment;

    if (balance < 0) {
      principalPayment += balance;
      cumulativePrincipal += balance;
      balance = 0;
    }

    schedule.push({
      paymentNumber: payment,
      payment: totalPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
      cumulativeInterest,
      cumulativePrincipal,
    });

    if (balance <= 0) break;
  }

  return schedule;
}

export function groupScheduleByYear(
  schedule: AmortizationEntry[],
  frequency: PaymentFrequency
): AmortizationEntry[] {
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const yearlySchedule: AmortizationEntry[] = [];
  
  for (let i = 0; i < schedule.length; i += paymentsPerYear) {
    const yearPayments = schedule.slice(i, i + paymentsPerYear);
    const totalPayment = yearPayments.reduce((sum, p) => sum + p.payment, 0);
    const totalPrincipal = yearPayments.reduce((sum, p) => sum + p.principal, 0);
    const totalInterest = yearPayments.reduce((sum, p) => sum + p.interest, 0);
    const endBalance = yearPayments.at(-1)?.balance || 0;
    
    yearlySchedule.push({
      paymentNumber: Math.floor(i / paymentsPerYear) + 1,
      payment: totalPayment,
      principal: totalPrincipal,
      interest: totalInterest,
      balance: endBalance,
      cumulativeInterest: yearPayments.at(-1)?.cumulativeInterest || 0,
      cumulativePrincipal: yearPayments.at(-1)?.cumulativePrincipal || 0,
    });
  }
  
  return yearlySchedule;
}
