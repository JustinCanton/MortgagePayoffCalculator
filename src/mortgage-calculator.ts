import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type {
  PaymentFrequency,
  CompoundingMethod,
  YearlyPaymentTiming,
  ActiveTab,
  ScheduleView,
  ExtraPaymentType,
  MortgageResult,
  AmortizationEntry,
} from './types';
import { mortgageCalculatorStyles } from './mortgage-calculator-styles';
import {
  getFrequencyLabel,
  calculateMortgage,
  generateAmortizationSchedule,
  groupScheduleByYear,
} from './mortgage-calculations';
import {
  formatCurrency,
  formatInputValue,
  parseFormattedNumber,
  formatYearsMonths,
  formatTermTitle,
} from './mortgage-formatting';
import { drawMortgageGraph } from './mortgage-graph';

@customElement('mortgage-calculator')
export class MortgageCalculator extends LitElement {
  static readonly styles = mortgageCalculatorStyles;

  @state() private loanAmount = 750000;
  @state() private interestRate = 4.5;
  @state() private loanTermYears = 25;
  @state() private termLength = 5;
  @state() private paymentFrequency: PaymentFrequency = 'monthly';
  @state() private compoundingMethod: CompoundingMethod = 'semi-annual';
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
      this.baseResult = calculateMortgage(
        {
          principal: this.loanAmount,
          annualRate: this.interestRate,
          years: this.loanTermYears,
          frequency: this.paymentFrequency,
        },
        this.compoundingMethod,
        this.termLength
      );

      // Determine which extra payment to use based on selection
      const hasExtraPayment = this.extraPaymentType !== 'none';
      const activeExtraPayment = this.extraPaymentType === 'perPayment' ? this.extraPayment : 0;
      const activeYearlyPayment = this.extraPaymentType === 'yearly' ? this.extraYearlyPayment : 0;
      const activeOneTimePayment = this.extraPaymentType === 'oneTime' ? this.oneTimePayment : 0;

      if (hasExtraPayment) {
        this.extraResult = calculateMortgage(
          {
            principal: this.loanAmount,
            annualRate: this.interestRate,
            years: this.loanTermYears,
            frequency: this.paymentFrequency,
            extraPayment: activeExtraPayment,
            extraYearly: activeYearlyPayment,
            oneTime: activeOneTimePayment,
            yearlyTiming: this.yearlyPaymentTiming,
          },
          this.compoundingMethod,
          this.termLength
        );
      } else {
        this.extraResult = null;
      }

      // Generate amortization schedule based on which result to show
      if (this.extraResult) {
        this.amortizationSchedule = generateAmortizationSchedule(
          {
            principal: this.loanAmount,
            annualRate: this.interestRate,
            years: this.loanTermYears,
            frequency: this.paymentFrequency,
            extraPayment: activeExtraPayment,
            extraYearly: activeYearlyPayment,
            oneTime: activeOneTimePayment,
            yearlyTiming: this.yearlyPaymentTiming,
          },
          this.compoundingMethod
        );
      } else {
        this.amortizationSchedule = generateAmortizationSchedule(
          {
            principal: this.loanAmount,
            annualRate: this.interestRate,
            years: this.loanTermYears,
            frequency: this.paymentFrequency,
          },
          this.compoundingMethod
        );
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
    this.loanTermYears = 25;
    this.termLength = 5;
    this.paymentFrequency = 'monthly';
    this.compoundingMethod = 'semi-annual';
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

  private drawGraph() {
    const canvas = this.shadowRoot?.querySelector('#mortgageGraph') as HTMLCanvasElement;
    if (canvas && this.amortizationSchedule.length > 0) {
      drawMortgageGraph(canvas, this.amortizationSchedule, this.loanAmount, this.paymentFrequency);
    }
  }

  render() {
    return html`
      <div class="calculator-container">
        <div class="header">
          <img src="/icon.png" alt="Mortgage Calculator Logo" class="logo" />
          <h1>Mortgage Payoff Calculator</h1>
        </div>
        <p class="subtitle">
          Analyze your mortgage payment options and visualize how extra payments can accelerate your payoff timeline 
          and reduce total interest costs. Get detailed amortization schedules and savings projections.
        </p>

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
                  type="text"
                  value="${formatInputValue(this.loanAmount, false)}"
                  @blur=${(e: FocusEvent) => {
                    const input = e.target as HTMLInputElement;
                    this.loanAmount = parseFormattedNumber(input.value, false);
                    input.value = formatInputValue(this.loanAmount, false);
                  }}
                />
                <div class="help-text">Total principal amount of your mortgage</div>
              </div>

              <div class="input-group">
                <label for="interestRate">Interest Rate (%)</label>
                <input
                  id="interestRate"
                  type="text"
                  value="${formatInputValue(this.interestRate, true)}"
                  @blur=${(e: FocusEvent) => {
                    const input = e.target as HTMLInputElement;
                    this.interestRate = parseFormattedNumber(input.value, true);
                    input.value = formatInputValue(this.interestRate, true);
                  }}
                />
                <div class="help-text">Annual interest rate (e.g., 4.5 for 4.5%)</div>
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
                  <option value="semi-annual">Semi-Annual</option>
                  <option value="monthly">Monthly</option>
                </select>
                <div class="help-text">How interest is calculated and compounded</div>
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
                  type="text"
                  value="${formatInputValue(this.loanTermYears, false)}"
                  @blur=${(e: FocusEvent) => {
                    const input = e.target as HTMLInputElement;
                    this.loanTermYears = parseFormattedNumber(input.value, false);
                    input.value = formatInputValue(this.loanTermYears, false);
                  }}
                />
                <div class="help-text">Total time to pay off the mortgage</div>
              </div>

              <div class="input-group">
                <label for="termLength">Term (years)</label>
                <input
                  id="termLength"
                  type="text"
                  value="${formatInputValue(this.termLength, false)}"
                  @blur=${(e: FocusEvent) => {
                    const input = e.target as HTMLInputElement;
                    this.termLength = parseFormattedNumber(input.value, false);
                    input.value = formatInputValue(this.termLength, false);
                  }}
                />
                <div class="help-text">Length of your current rate commitment</div>
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
                  type="text"
                  value="${this.extraPayment === 0 ? '' : formatInputValue(this.extraPayment, false)}"
                  @blur=${(e: FocusEvent) => {
                    const input = e.target as HTMLInputElement;
                    this.extraPayment = parseFormattedNumber(input.value, false);
                    input.value = this.extraPayment === 0 ? '' : formatInputValue(this.extraPayment, false);
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
                  type="text"
                  value="${this.extraYearlyPayment === 0 ? '' : formatInputValue(this.extraYearlyPayment, false)}"
                  @blur=${(e: FocusEvent) => {
                    const input = e.target as HTMLInputElement;
                    this.extraYearlyPayment = parseFormattedNumber(input.value, false);
                    input.value = this.extraYearlyPayment === 0 ? '' : formatInputValue(this.extraYearlyPayment, false);
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
                  type="text"
                  value="${this.oneTimePayment === 0 ? '' : formatInputValue(this.oneTimePayment, false)}"
                  @blur=${(e: FocusEvent) => {
                    const input = e.target as HTMLInputElement;
                    this.oneTimePayment = parseFormattedNumber(input.value, false);
                    input.value = this.oneTimePayment === 0 ? '' : formatInputValue(this.oneTimePayment, false);
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

        <div class="footer">
          <div class="footer-disclaimer">
            <strong>⚠️ Financial Disclaimer</strong>
            This calculator is provided for informational and educational purposes only. Results are estimates based on the information you provide and should not be considered financial advice. Actual mortgage terms, payments, and conditions may vary. Please consult with a qualified financial advisor or mortgage professional for personalized guidance.
          </div>
          <div class="footer-copyright">
            © ${new Date().getFullYear()} Mortgage Payoff Calculator | All calculations are approximations
          </div>
        </div>
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
              <span class="result-label">${getFrequencyLabel(this.paymentFrequency)} Payment:</span>
              <span class="result-value highlight">${formatCurrency(this.baseResult.regularPayment)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Payoff Time:</span>
              <span class="result-value">${formatYearsMonths(this.baseResult.payoffMonths)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Total Interest:</span>
              <span class="result-value">${formatCurrency(this.baseResult.totalInterest)}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Total Paid:</span>
              <span class="result-value highlight">${formatCurrency(this.baseResult.totalPaid)}</span>
            </div>

            <div class="result-subsection">
              <div class="result-subsection-title">${formatTermTitle(this.termLength)}</div>
              <div class="result-row">
                <span class="result-label">Interest in Term:</span>
                <span class="result-value">${formatCurrency(this.baseResult.termInterest)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Principal Paid in Term:</span>
                <span class="result-value">${formatCurrency(this.baseResult.termPrincipal)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Balance at Term End:</span>
                <span class="result-value">${formatCurrency(this.baseResult.balanceAtTermEnd)}</span>
              </div>
            </div>
          </div>

          ${this.extraResult ? html`
            <div class="result-section with-extra">
              <h3>With Extra Payments</h3>
              <div class="result-row">
                <span class="result-label">${getFrequencyLabel(this.paymentFrequency)} Payment:</span>
                <span class="result-value highlight">${formatCurrency(this.extraResult.regularPayment + this.extraPayment)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Payoff Time:</span>
                <span class="result-value">${formatYearsMonths(this.extraResult.payoffMonths)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Total Interest:</span>
                <span class="result-value">${formatCurrency(this.extraResult.totalInterest)}</span>
              </div>
              <div class="result-row">
                <span class="result-label">Total Paid:</span>
                <span class="result-value highlight">${formatCurrency(this.extraResult.totalPaid)}</span>
              </div>

              <div class="result-subsection">
                <div class="result-subsection-title">${formatTermTitle(this.termLength)}</div>
                <div class="result-row">
                  <span class="result-label">Interest in Term:</span>
                  <span class="result-value">${formatCurrency(this.extraResult.termInterest)}</span>
                </div>
                <div class="result-row">
                  <span class="result-label">Principal Paid in Term:</span>
                  <span class="result-value">${formatCurrency(this.extraResult.termPrincipal)}</span>
                </div>
                <div class="result-row">
                  <span class="result-label">Balance at Term End:</span>
                  <span class="result-value">${formatCurrency(this.extraResult.balanceAtTermEnd)}</span>
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
            <span class="savings-value">${formatYearsMonths(timeSaved)}</span>
          </div>
        </div>
        <div class="savings-highlight">
          <div class="result-row">
            <span class="result-label">Interest Saved:</span>
            <span class="savings-value">${formatCurrency(interestSaved)}</span>
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
      ? groupScheduleByYear(this.amortizationSchedule, this.paymentFrequency)
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
                  <td>${formatCurrency(entry.payment)}</td>
                  <td>${formatCurrency(entry.principal)}</td>
                  <td>${formatCurrency(entry.interest)}</td>
                  <td>${formatCurrency(entry.balance)}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mortgage-calculator': MortgageCalculator;
  }
}
