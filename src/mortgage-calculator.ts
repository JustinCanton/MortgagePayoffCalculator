import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type PaymentFrequency = 
  | 'monthly'
  | 'semi-monthly'
  | 'bi-weekly'
  | 'accelerated-bi-weekly'
  | 'weekly'
  | 'accelerated-weekly';

type CompoundingMethod = 'canadian' | 'us';
type YearlyPaymentTiming = 'start' | 'middle' | 'end';
type ActiveTab = 'summary' | 'schedule' | 'graph';
type ScheduleView = 'annual' | 'payment';
type ExtraPaymentType = 'none' | 'perPayment' | 'yearly' | 'oneTime';

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

interface AmortizationEntry {
  paymentNumber: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

interface MortgageCalculationOptions {
  principal: number;
  annualRate: number;
  years: number;
  frequency: PaymentFrequency;
  extraPayment?: number;
  extraYearly?: number;
  oneTime?: number;
  yearlyTiming?: YearlyPaymentTiming;
}

@customElement('mortgage-calculator')
export class MortgageCalculator extends LitElement {
  static readonly styles = css`
    :host {
      display: block;
      max-width: 800px;
      width: 100%;
    }

    .calculator-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 40px;
      border: 1px solid #e5e7eb;
    }

    h1 {
      color: #1e3a8a;
      margin-bottom: 10px;
      font-size: 1.75rem;
      text-align: center;
      font-weight: 700;
    }

    .subtitle {
      color: #64748b;
      text-align: center;
      margin-bottom: 30px;
      font-size: 0.95rem;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-header {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }

    .subsection {
      margin-bottom: 25px;
    }

    .subsection:last-child {
      margin-bottom: 0;
    }

    .subsection-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      padding-left: 8px;
      border-left: 3px solid #1e3a8a;
    }

    .input-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 8px;
      color: #555;
      font-weight: 600;
      font-size: 0.9rem;
    }

    input {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #2563eb;
    }

    select {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      background: white;
      cursor: pointer;
      transition: border-color 0.3s;
    }

    select:focus {
      outline: none;
      border-color: #2563eb;
    }

    input[type=\"radio\"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .button-container {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }

    button {
      flex: 1;
      padding: 15px;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .calculate-btn {
      background: #1e40af;
      color: white;
    }

    .calculate-btn:hover {
      background: #1e3a8a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
    }

    .reset-btn {
      background: #f5f5f5;
      color: #666;
    }

    .reset-btn:hover {
      background: #e0e0e0;
    }

    .results {
      margin-top: 20px;
    }

    .results-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .result-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #e5e7eb;
    }

    .result-section.with-extra {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
    }

    .result-section h3 {
      color: #333;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .result-subsection {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px dashed #e0e0e0;
    }

    .result-subsection-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .result-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .result-label {
      color: #555;
      font-size: 0.9rem;
    }

    .result-value {
      color: #333;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .savings-section {
      background: #f0fdf4;
      border-radius: 8px;
      border: 1px solid #bbf7d0;
      padding: 20px;
      margin-top: 20px;
    }

    .savings-section h3 {
      color: #1b5e20;
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 1.2rem;
      text-align: center;
    }

    .savings-highlight {
      background: white;
      border-radius: 6px;
      padding: 15px;
      margin-top: 10px;
      text-align: center;
    }

    .savings-value {
      color: #2e7d32;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .error {
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      text-align: center;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .tab {
      padding: 12px 24px;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      font-size: 1rem;
      font-weight: 600;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;
    }

    .tab:hover {
      color: #1e40af;
    }

    .tab.active {
      color: #1e40af;
      border-bottom-color: #1e40af;
    }

    .schedule-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .schedule-controls label {
      margin: 0;
    }

    .schedule-table-container {
      max-height: 500px;
      overflow-x: auto;
      overflow-y: auto;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 2px;
      background: white;
    }

    .schedule-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      font-size: 0.9rem;
      margin: 0;
    }

    .schedule-table thead {
      background: #1e3a8a;
      color: white;
    }

    .schedule-table th {
      padding: 12px;
      text-align: right;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .schedule-table th:first-child {
      text-align: left;
    }

    .schedule-table tbody tr {
      border-bottom: 1px solid #e0e0e0;
      transition: background 0.2s;
    }

    .schedule-table tbody tr:hover {
      background: #f8f9fa;
    }

    .schedule-table tbody tr:nth-child(even) {
      background: #fafafa;
    }

    .schedule-table tbody tr:nth-child(even):hover {
      background: #f0f0f0;
    }

    .schedule-table td {
      padding: 10px 12px;
      text-align: right;
    }

    .schedule-table td:first-child {
      text-align: left;
      font-weight: 600;
      color: #1e40af;
    }

    .schedule-empty {
      text-align: center;
      padding: 40px;
      color: #666;
      font-style: italic;
    }

    .graph-container {
      background: white;
      padding: 30px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .graph-header {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 25px;
      text-align: center;
    }

    .graph-canvas-wrapper {
      position: relative;
      width: 100%;
      height: 500px;
      margin-bottom: 20px;
      background: #fafafa;
      border-radius: 4px;
      padding: 10px;
    }

    canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
    }

    .graph-legend {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.95rem;
      font-weight: 500;
    }

    .legend-color {
      width: 40px;
      height: 4px;
      border-radius: 2px;
    }

    @media (max-width: 768px) {
      .calculator-container {
        padding: 25px;
      }

      h1 {
        font-size: 1.5rem;
      }

      .input-grid {
        grid-template-columns: 1fr;
      }

      .results-grid {
        grid-template-columns: 1fr;
      }

      .button-container {
        flex-direction: column;
      }
    }
  `;

  @state() private loanAmount = 750000;
  @state() private interestRate = 4.5;
  @state() private loanTermYears = 25;  @state() private termLength = 5;  @state() private paymentFrequency: PaymentFrequency = 'monthly';
  @state() private compoundingMethod: CompoundingMethod = 'canadian';
  @state() private extraPaymentType: ExtraPaymentType = 'none';
  @state() private extraPayment = 0;
  @state() private extraYearlyPayment = 0;
  @state() private yearlyPaymentTiming: YearlyPaymentTiming = 'start';
  @state() private oneTimePayment = 0;
  @state() private baseResult: MortgageResult | null = null;
  @state() private extraResult: MortgageResult | null = null;
  @state() private amortizationSchedule: AmortizationEntry[] = [];
  @state() private activeTab: ActiveTab = 'summary';
  @state() private scheduleView: ScheduleView = 'annual';
  @state() private error = '';

  private getPaymentsPerYear(frequency: PaymentFrequency): number {
    switch (frequency) {
      case 'monthly': return 12;
      case 'semi-monthly': return 24;
      case 'bi-weekly': return 26;
      case 'accelerated-bi-weekly': return 26;
      case 'weekly': return 52;
      case 'accelerated-weekly': return 52;
    }
  }

  private getFrequencyLabel(frequency: PaymentFrequency): string {
    switch (frequency) {
      case 'monthly': return 'Monthly';
      case 'semi-monthly': return 'Semi-Monthly';
      case 'bi-weekly': return 'Bi-Weekly';
      case 'accelerated-bi-weekly': return 'Accelerated Bi-Weekly';
      case 'weekly': return 'Weekly';
      case 'accelerated-weekly': return 'Accelerated Weekly';
    }
  }

  private calculateMonthlyRate(annualRate: number): number {
    if (this.compoundingMethod === 'canadian') {
      // Canadian mortgages use semi-annual compounding
      const semiAnnualRate = annualRate / 100 / 2;
      return Math.pow(1 + semiAnnualRate, 1/6) - 1;
    } else {
      // US mortgages use monthly compounding
      return annualRate / 100 / 12;
    }
  }

  private calculateRegularPayment(
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

  private shouldAddYearlyPayment(
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

  private calculateMortgage(options: MortgageCalculationOptions): MortgageResult {
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
    
    const monthlyRate = this.calculateMonthlyRate(annualRate);
    const paymentsPerYear = this.getPaymentsPerYear(frequency);
    const paymentPeriodMonths = 12 / paymentsPerYear;
    
    // Calculate the effective interest rate for the payment period
    const periodRate = Math.pow(1 + monthlyRate, paymentPeriodMonths) - 1;

    // Calculate the base monthly payment first
    const numberOfMonthlyPayments = years * 12;
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonthlyPayments)) /
      (Math.pow(1 + monthlyRate, numberOfMonthlyPayments) - 1);

    const regularPayment = this.calculateRegularPayment(monthlyPayment, frequency);

    let balance = principal - oneTime;
    let totalInterest = 0;
    let termInterest = 0;
    let termPrincipal = 0;
    let balanceAtTermEnd = 0;
    let paymentsMade = 0;
    const totalPayments = years * paymentsPerYear;
    const maxPayments = totalPayments * 3; // Safety limit
    
    const termMonths = this.termLength * 12;
    
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
      if (this.shouldAddYearlyPayment(cumulativeMonths, cumulativeMonths - paymentPeriodMonths, extraYearly, yearlyTiming)) {
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

  private generateAmortizationSchedule(options: MortgageCalculationOptions): AmortizationEntry[] {
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
    
    const monthlyRate = this.calculateMonthlyRate(annualRate);
    const paymentsPerYear = this.getPaymentsPerYear(frequency);
    const paymentPeriodMonths = 12 / paymentsPerYear;
    const periodRate = Math.pow(1 + monthlyRate, paymentPeriodMonths) - 1;

    const numberOfMonthlyPayments = years * 12;
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonthlyPayments)) /
      (Math.pow(1 + monthlyRate, numberOfMonthlyPayments) - 1);

    const regularPayment = this.calculateRegularPayment(monthlyPayment, frequency);

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

      if (this.shouldAddYearlyPayment(cumulativeMonths, cumulativeMonths - paymentPeriodMonths, extraYearly, yearlyTiming)) {
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

  private handleCalculate() {
    this.error = '';

    if (this.loanAmount <= 0 || this.interestRate <= 0 || this.loanTermYears <= 0) {
      this.error = 'Please enter valid positive values for loan amount, interest rate, and term.';
      return;
    }

    if (this.oneTimePayment >= this.loanAmount) {
      this.error = 'One-time payment cannot be greater than or equal to the loan amount.';
      return;
    }

    try {
      this.baseResult = this.calculateMortgage({
        principal: this.loanAmount,
        annualRate: this.interestRate,
        years: this.loanTermYears,
        frequency: this.paymentFrequency,
      });

      // Determine which extra payment to use based on selection
      const hasExtraPayment = this.extraPaymentType !== 'none';
      const activeExtraPayment = this.extraPaymentType === 'perPayment' ? this.extraPayment : 0;
      const activeYearlyPayment = this.extraPaymentType === 'yearly' ? this.extraYearlyPayment : 0;
      const activeOneTimePayment = this.extraPaymentType === 'oneTime' ? this.oneTimePayment : 0;

      if (hasExtraPayment) {
        this.extraResult = this.calculateMortgage({
          principal: this.loanAmount,
          annualRate: this.interestRate,
          years: this.loanTermYears,
          frequency: this.paymentFrequency,
          extraPayment: activeExtraPayment,
          extraYearly: activeYearlyPayment,
          oneTime: activeOneTimePayment,
          yearlyTiming: this.yearlyPaymentTiming,
        });
      } else {
        this.extraResult = null;
      }

      // Generate amortization schedule based on which result to show
      if (this.extraResult) {
        this.amortizationSchedule = this.generateAmortizationSchedule({
          principal: this.loanAmount,
          annualRate: this.interestRate,
          years: this.loanTermYears,
          frequency: this.paymentFrequency,
          extraPayment: activeExtraPayment,
          extraYearly: activeYearlyPayment,
          oneTime: activeOneTimePayment,
          yearlyTiming: this.yearlyPaymentTiming,
        });
      } else {
        this.amortizationSchedule = this.generateAmortizationSchedule({
          principal: this.loanAmount,
          annualRate: this.interestRate,
          years: this.loanTermYears,
          frequency: this.paymentFrequency,
        });
      }
      
      // Redraw graph if currently on graph tab
      if (this.activeTab === 'graph') {
        this.updateComplete.then(() => this.drawGraph());
      }
    } catch (e) {
      console.error('Calculation error:', e);
      this.error = 'An error occurred during calculation. Please check your inputs.';
    }
  }

  private handleReset() {
    this.loanAmount = 750000;
    this.interestRate = 4.5;
    this.loanTermYears = 25;    this.termLength = 5;    this.paymentFrequency = 'monthly';
    this.compoundingMethod = 'canadian';
    this.extraPaymentType = 'none';
    this.extraPayment = 0;
    this.extraYearlyPayment = 0;
    this.yearlyPaymentTiming = 'start';
    this.oneTimePayment = 0;
    this.baseResult = null;
    this.extraResult = null;
    this.amortizationSchedule = [];
    this.activeTab = 'summary';
    this.scheduleView = 'annual';
    this.error = '';
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private formatYearsMonths(totalMonths: number): string {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    if (years === 0) return `${months} month${months === 1 ? '' : 's'}`;
    if (months === 0) return `${years} year${years === 1 ? '' : 's'}`;
    return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}`;
  }

  private formatTermTitle(): string {
    return `Term Details (${this.termLength} Year${this.termLength === 1 ? '' : 's'})`;
  }

  render() {
    return html`
      <div class="calculator-container">
        <h1>Mortgage Payoff Calculator</h1>
        <p class="subtitle">Calculate your mortgage payoff schedule and see how extra payments can save you money</p>

        ${this.error ? html`<div class="error">${this.error}</div>` : ''}

        <div class="section">
          <div class="section-header">Mortgage Details</div>
          
          <div class="subsection">
            <div class="subsection-label">Loan Information</div>
            <div class="input-grid">
              <div class="input-group">
                <label for="loanAmount">Loan Amount ($)</label>
                <input
                  id="loanAmount"
                  type="number"
                  .value=${this.loanAmount.toString()}
                  @input=${(e: InputEvent) => {
                    this.loanAmount = Number((e.target as HTMLInputElement).value);
                  }}
                />
              </div>

              <div class="input-group">
                <label for="interestRate">Interest Rate (%)</label>
                <input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  .value=${this.interestRate.toString()}
                  @input=${(e: InputEvent) => {
                    this.interestRate = Number((e.target as HTMLInputElement).value);
                  }}
                />
              </div>

              <div class="input-group">
                <label for="compoundingMethod">Compounding Method</label>
                <select
                  id="compoundingMethod"
                  .value=${this.compoundingMethod}
                  @change=${(e: Event) => {
                    this.compoundingMethod = (e.target as HTMLSelectElement).value as CompoundingMethod;
                  }}
                >
                  <option value="canadian">Semi-Annual (Canadian)</option>
                  <option value="us">Monthly (US)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="subsection">
            <div class="subsection-label">Loan Terms</div>
            <div class="input-grid">
              <div class="input-group">
                <label for="loanTerm">Amortization (years)</label>
                <input
                  id="loanTerm"
                  type="number"
                  .value=${this.loanTermYears.toString()}
                  @input=${(e: InputEvent) => {
                    this.loanTermYears = Number((e.target as HTMLInputElement).value);
                  }}
                />
              </div>

              <div class="input-group">
                <label for="termLength">Term (years)</label>
                <input
                  id="termLength"
                  type="number"
                  .value=${this.termLength.toString()}
                  @input=${(e: InputEvent) => {
                    this.termLength = Number((e.target as HTMLInputElement).value);
                  }}
                />
              </div>
            </div>
          </div>

          <div class="subsection">
            <div class="subsection-label">Payment Schedule</div>
            <div class="input-grid">
              <div class="input-group">
                <label for="paymentFrequency">Payment Frequency</label>
                <select
                  id="paymentFrequency"
                  .value=${this.paymentFrequency}
                  @change=${(e: Event) => {
                    this.paymentFrequency = (e.target as HTMLSelectElement).value as PaymentFrequency;
                  }}
                >
                  <option value="monthly">Monthly</option>
                  <option value="semi-monthly">Semi-Monthly (24/year)</option>
                  <option value="bi-weekly">Bi-Weekly (26/year)</option>
                  <option value="accelerated-bi-weekly">Accelerated Bi-Weekly</option>
                  <option value="weekly">Weekly (52/year)</option>
                  <option value="accelerated-weekly">Accelerated Weekly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">Extra Payments (Optional)</div>
          <div class="input-group" style="margin-bottom: 20px;">
            <label style="margin-bottom: 12px;">Payment Type</label>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input
                  type="radio"
                  name="extraPaymentType"
                  value="none"
                  .checked=${this.extraPaymentType === 'none'}
                  @change=${() => { this.extraPaymentType = 'none'; }}
                />
                <span>No Extra Payments</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input
                  type="radio"
                  name="extraPaymentType"
                  value="perPayment"
                  .checked=${this.extraPaymentType === 'perPayment'}
                  @change=${() => { this.extraPaymentType = 'perPayment'; }}
                />
                <span>Extra Per Payment</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input
                  type="radio"
                  name="extraPaymentType"
                  value="yearly"
                  .checked=${this.extraPaymentType === 'yearly'}
                  @change=${() => { this.extraPaymentType = 'yearly'; }}
                />
                <span>Extra Yearly Payment</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input
                  type="radio"
                  name="extraPaymentType"
                  value="oneTime"
                  .checked=${this.extraPaymentType === 'oneTime'}
                  @change=${() => { this.extraPaymentType = 'oneTime'; }}
                />
                <span>One-time Payment</span>
              </label>
            </div>
          </div>

          ${this.extraPaymentType === 'perPayment' ? html`
            <div class="input-grid">
              <div class="input-group">
                <label for="extraPayment">Extra Per Payment ($)</label>
                <input
                  id="extraPayment"
                  type="number"
                  .value=${this.extraPayment.toString()}
                  @input=${(e: InputEvent) => {
                    this.extraPayment = Number((e.target as HTMLInputElement).value);
                  }}
                />
              </div>
            </div>
          ` : ''}

          ${this.extraPaymentType === 'yearly' ? html`
            <div class="input-grid">
              <div class="input-group">
                <label for="extraYearly">Extra Yearly Payment ($)</label>
                <input
                  id="extraYearly"
                  type="number"
                  .value=${this.extraYearlyPayment.toString()}
                  @input=${(e: InputEvent) => {
                    this.extraYearlyPayment = Number((e.target as HTMLInputElement).value);
                  }}
                />
              </div>
              <div class="input-group">
                <label for="yearlyTiming">Yearly Payment Timing</label>
                <select
                  id="yearlyTiming"
                  .value=${this.yearlyPaymentTiming}
                  @change=${(e: Event) => {
                    this.yearlyPaymentTiming = (e.target as HTMLSelectElement).value as YearlyPaymentTiming;
                  }}
                >
                  <option value="start">Start of Year</option>
                  <option value="middle">Middle of Year</option>
                  <option value="end">End of Year</option>
                </select>
              </div>
            </div>
          ` : ''}

          ${this.extraPaymentType === 'oneTime' ? html`
            <div class="input-grid">
              <div class="input-group">
                <label for="oneTime">One-time Payment ($)</label>
                <input
                  id="oneTime"
                  type="number"
                  .value=${this.oneTimePayment.toString()}
                  @input=${(e: InputEvent) => {
                    this.oneTimePayment = Number((e.target as HTMLInputElement).value);
                  }}
                />
              </div>
            </div>
          ` : ''}
        </div>

        <div class="button-container">
          <button class="calculate-btn" @click=${this.handleCalculate}>
            Calculate
          </button>
          <button class="reset-btn" @click=${this.handleReset}>
            Reset
          </button>
        </div>

        ${this.baseResult ? this.renderTabs() : ''}
      </div>
    `;
  }

  private renderTabs() {
    return html`
      <div class="tabs">
        <button
          class="tab ${this.activeTab === 'summary' ? 'active' : ''}"
          @click=${() => { this.activeTab = 'summary'; }}
        >
          Summary
        </button>
        <button
          class="tab ${this.activeTab === 'schedule' ? 'active' : ''}"
          @click=${() => { this.activeTab = 'schedule'; }}
        >
          Amortization Schedule
        </button>
        <button
          class="tab ${this.activeTab === 'graph' ? 'active' : ''}"
          @click=${() => { 
            this.activeTab = 'graph';
            this.updateComplete.then(() => this.drawGraph());
          }}
        >
          Graph
        </button>
      </div>
      ${this.renderTabContent()}
    `;
  }

  private renderTabContent() {
    if (this.activeTab === 'summary') {
      return this.renderResults();
    } else if (this.activeTab === 'schedule') {
      return this.renderSchedule();
    } else {
      return this.renderGraph();
    }
  }

  private renderResults() {
    if (!this.baseResult) return '';

    return html`
      <div class="results">
        <div class="section-header">Payment Summary</div>
        <div class="results-grid">
          <div class="result-section">
            <h3>Standard Payment Plan</h3>
            <div class="result-row">
              <span class="result-label">${this.getFrequencyLabel(this.paymentFrequency)} Payment:</span>
              <span class="result-value">${this.formatCurrency(this.baseResult.regularPayment)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Payoff Time:</span>
              <span class="result-value">${this.formatYearsMonths(this.baseResult.payoffMonths)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Total Interest:</span>
              <span class="result-value">${this.formatCurrency(this.baseResult.totalInterest)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Total Paid:</span>
              <span class="result-value">${this.formatCurrency(this.baseResult.totalPaid)}</span>
            </div>

            <div class="result-subsection">
              <div class="result-subsection-title">${this.formatTermTitle()}</div>
              <div class="result-row">
                <span class="result-label">Interest in Term:</span>
                <span class="result-value">${this.formatCurrency(this.baseResult.termInterest)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Principal Paid in Term:</span>
                <span class="result-value">${this.formatCurrency(this.baseResult.termPrincipal)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Balance at Term End:</span>
                <span class="result-value">${this.formatCurrency(this.baseResult.balanceAtTermEnd)}</span>
              </div>
            </div>
          </div>

          ${this.extraResult ? html`
            <div class="result-section with-extra">
              <h3>With Extra Payments</h3>
              <div class="result-row">
                <span class="result-label">${this.getFrequencyLabel(this.paymentFrequency)} Payment:</span>
                <span class="result-value">${this.formatCurrency(this.extraResult.regularPayment + this.extraPayment)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Payoff Time:</span>
                <span class="result-value">${this.formatYearsMonths(this.extraResult.payoffMonths)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Total Interest:</span>
                <span class="result-value">${this.formatCurrency(this.extraResult.totalInterest)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Total Paid:</span>
                <span class="result-value">${this.formatCurrency(this.extraResult.totalPaid)}</span>
              </div>

              <div class="result-subsection">
                <div class="result-subsection-title">${this.formatTermTitle()}</div>
                <div class="result-row">
                  <span class="result-label">Interest in Term:</span>
                  <span class="result-value">${this.formatCurrency(this.extraResult.termInterest)}</span>
                </div>
                <div class="result-row">
                  <span class="result-label">Principal Paid in Term:</span>
                  <span class="result-value">${this.formatCurrency(this.extraResult.termPrincipal)}</span>
                </div>
                <div class="result-row">
                  <span class="result-label">Balance at Term End:</span>
                  <span class="result-value">${this.formatCurrency(this.extraResult.balanceAtTermEnd)}</span>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        ${this.extraResult ? this.renderSavings() : ''}
      </div>
    `;
  }

  private renderSavings() {
    if (!this.baseResult || !this.extraResult) return '';

    const timeSaved = this.baseResult.payoffMonths - this.extraResult.payoffMonths;
    const interestSaved = this.baseResult.totalInterest - this.extraResult.totalInterest;

    return html`
      <div class="savings-section">
        <h3>Your Savings</h3>
        <div class="savings-highlight">
          <div class="result-row">
            <span class="result-label">Time Saved:</span>
            <span class="savings-value">${this.formatYearsMonths(timeSaved)}</span>
          </div>
        </div>
        <div class="savings-highlight">
          <div class="result-row">
            <span class="result-label">Interest Saved:</span>
            <span class="savings-value">${this.formatCurrency(interestSaved)}</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderGraph() {
    if (this.amortizationSchedule.length === 0) {
      return html`
        <div class="schedule-empty">
          No amortization schedule available. Please calculate first.
        </div>
      `;
    }

    return html`
      <div class="results">
        <div class="graph-container">
          <div class="graph-header">Balance & Interest Over Time</div>
          <div class="graph-canvas-wrapper">
            <canvas id="mortgageGraph"></canvas>
          </div>
          <div class="graph-legend">
            <div class="legend-item">
              <div class="legend-color" style="background: #1e40af;"></div>
              <span>Principal Balance</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: #0ea5e9;"></div>
              <span>Cumulative Interest</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderSchedule() {
    if (this.amortizationSchedule.length === 0) {
      return html`
        <div class="schedule-empty">
          No amortization schedule available. Please calculate first.
        </div>
      `;
    }

    const schedule = this.scheduleView === 'annual' 
      ? this.groupScheduleByYear() 
      : this.amortizationSchedule;

    return html`
      <div class="results">
        <div class="schedule-controls">
          <div class="section-header" style="margin: 0; border: none;">Amortization Schedule</div>
          <div class="input-group" style="margin: 0;">
            <select
              .value=${this.scheduleView}
              @change=${(e: Event) => {
                this.scheduleView = (e.target as HTMLSelectElement).value as ScheduleView;
              }}
            >
              <option value="annual">Annual View</option>
              <option value="payment">Payment by Payment</option>
            </select>
          </div>
        </div>

        <div class="schedule-table-container">
          <table class="schedule-table">
            <thead>
              <tr>
                <th>${this.scheduleView === 'annual' ? 'Year' : 'Payment #'}</th>
                <th>Total Payment</th>
                <th>Principal Paid</th>
                <th>Interest Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${schedule.map((entry, index) => html`
                <tr>
                  <td>${this.scheduleView === 'annual' ? `Year ${index + 1}` : entry.paymentNumber}</td>
                  <td>${this.formatCurrency(entry.payment)}</td>
                  <td>${this.formatCurrency(entry.principal)}</td>
                  <td>${this.formatCurrency(entry.interest)}</td>
                  <td>${this.formatCurrency(entry.balance)}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private groupScheduleByYear(): AmortizationEntry[] {
    const paymentsPerYear = this.getPaymentsPerYear(this.paymentFrequency);
    const yearlySchedule: AmortizationEntry[] = [];
    
    for (let i = 0; i < this.amortizationSchedule.length; i += paymentsPerYear) {
      const yearPayments = this.amortizationSchedule.slice(i, i + paymentsPerYear);
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

  private drawGraph() {
    const canvas = this.shadowRoot?.querySelector('#mortgageGraph') as HTMLCanvasElement;
    if (!canvas || this.amortizationSchedule.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const container = canvas.parentElement;
    if (container) {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    }

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    const padding = { top: 50, right: 60, bottom: 80, left: 100 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Get data - sample every nth point if too many
    const maxPoints = 150;
    const step = Math.max(1, Math.floor(this.amortizationSchedule.length / maxPoints));
    const data = this.amortizationSchedule.filter((_, i) => i % step === 0 || i === this.amortizationSchedule.length - 1);
    
    // Find max values for scaling with nice round numbers
    const maxBalance = this.loanAmount;
    const maxInterest = Math.max(...data.map(d => d.cumulativeInterest));
    const rawMax = Math.max(maxBalance, maxInterest);
    const maxValue = Math.ceil(rawMax / 50000) * 50000; // Round up to nearest 50k

    // Draw grid lines first (behind everything)
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;
    const ySteps = 8;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (graphHeight / ySteps) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    const xSteps = 10;
    for (let i = 0; i <= xSteps; i++) {
      const x = padding.left + (graphWidth / xSteps) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Draw y-axis labels
    ctx.fillStyle = '#555';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= ySteps; i++) {
      const value = maxValue - (maxValue / ySteps) * i;
      const y = padding.top + (graphHeight / ySteps) * i;
      const label = value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`;
      ctx.fillText(label, padding.left - 12, y);
    }

    // Draw x-axis labels
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const totalMonths = this.amortizationSchedule.length * (12 / this.getPaymentsPerYear(this.paymentFrequency));
    const totalYears = Math.ceil(totalMonths / 12);
    const yearStep = Math.max(1, Math.ceil(totalYears / xSteps));
    
    for (let i = 0; i <= Math.floor(totalYears / yearStep); i++) {
      const year = i * yearStep;
      const x = padding.left + (graphWidth * year) / totalYears;
      if (x <= width - padding.right) {
        ctx.fillText(`${year}`, x, height - padding.bottom + 12);
      }
    }

    // Helper function to draw a smooth line with gradient
    const drawLine = (
      data: AmortizationEntry[], 
      getValue: (d: AmortizationEntry) => number, 
      color: string,
      lineWidth: number = 3
    ) => {
      if (data.length === 0) return;

      // Create gradient for line
      const gradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      
      data.forEach((entry, i) => {
        const progress = i / (data.length - 1);
        const x = padding.left + graphWidth * progress;
        const y = padding.top + graphHeight * (1 - getValue(entry) / maxValue);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    };

    // Draw balance line with shadow
    ctx.shadowColor = 'rgba(30, 64, 175, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    drawLine(data, d => d.balance, '#1e40af', 3);
    
    // Draw cumulative interest line with shadow
    ctx.shadowColor = 'rgba(14, 165, 233, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    drawLine(data, d => d.cumulativeInterest, '#0ea5e9', 3);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw axis labels
    ctx.fillStyle = '#333';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    
    // Y-axis label
    ctx.save();
    ctx.translate(25, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Amount', 0, 0);
    ctx.restore();
    
    // X-axis label
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Years', width / 2, height - 15);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mortgage-calculator': MortgageCalculator;
  }
}
