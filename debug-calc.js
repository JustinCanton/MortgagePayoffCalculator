// Debug script to understand the calculation differences

const principal = 750000;
const annualRate = 4.5;
const years = 25;

// Canadian semi-annual compounding
const semiAnnualRate = annualRate / 100 / 2;
const monthlyRate = Math.pow(1 + semiAnnualRate, 1/6) - 1;

console.log('Monthly Rate:', monthlyRate);
console.log('Semi-Annual Rate:', semiAnnualRate);

// Calculate monthly payment
const numberOfMonths = years * 12;
const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / 
                      (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

console.log('\nMonthly Payment (before rounding):', monthlyPayment);
console.log('Monthly Payment (rounded):', Math.round(monthlyPayment * 100) / 100);

// Test different rounding for semi-monthly
const semiMonthly = monthlyPayment / 2;
console.log('\nSemi-Monthly (before rounding):', semiMonthly);
console.log('Semi-Monthly (Math.round):', Math.round(semiMonthly * 100) / 100);
console.log('Semi-Monthly (Math.ceil):', Math.ceil(semiMonthly * 100) / 100);

// RBC expected values
console.log('\n=== RBC Expected ===');
console.log('Monthly: $4,151.05');
console.log('Semi-Monthly: $2,075.53');
console.log('Bi-Weekly (299 months): $1,915.87, Interest: $489,496.83');
console.log('Accelerated Bi-Weekly (260 months): $2,075.52, Interest: $417,460.03');
console.log('Weekly (298 months): $957.94 Interest: $488,526.85');
console.log('Accelerated Weekly (260 months): $1,037.76, Interest: $416,620.59');
