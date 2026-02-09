# Mortgage Payoff Calculator

A comprehensive mortgage calculator built with TypeScript and Lit that matches RBC's payment calculation accuracy. Calculate mortgage payments, analyze amortization schedules, and visualize your payoff progress with professional-grade tools.

## Features

### Payment Frequencies
- **Monthly** - 12 payments per year
- **Semi-Monthly** - 24 payments per year
- **Bi-Weekly** - 26 payments per year
- **Accelerated Bi-Weekly** - 26 payments per year (faster payoff)
- **Weekly** - 52 payments per year
- **Accelerated Weekly** - 52 payments per year (faster payoff)

### Compounding Methods
- **Canadian** - Semi-annual compounding (default)
- **US** - Monthly compounding

### Extra Payment Options
Choose one of the following mutually exclusive options:
- **Per Payment** - Extra amount added to each regular payment
- **Yearly** - Annual lump sum payment (start, middle, or end of year)
- **One-Time** - Single lump sum payment applied immediately

### Term Tracking
- Configurable term length (1-10 years)
- Track interest and principal breakdown per term
- View balance at term end
- 5-year breakdown details

### Visualization
Three-tab interface:
1. **Summary** - Side-by-side comparison of standard vs. extra payment plans
2. **Amortization Schedule** - Annual or payment-by-payment breakdown
3. **Graph** - Visual representation of principal balance and cumulative interest

## Installation

```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Production Build

Build for production:
```bash
npm run build
```

This creates a `dist` folder with the compiled application.

Preview the production build:
```bash
npm run preview
```

## GitHub Pages Deployment

This project is configured with GitHub Actions for automatic deployment to GitHub Pages.

### Setup (One-time)

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### Deployment

The site automatically deploys when you push to the `main` branch. The workflow will:
- Install dependencies
- Run all tests
- Build the application
- Deploy to GitHub Pages

Your site will be available at: `https://yourusername.github.io/MortgagePayoffCalculator/`

You can also manually trigger a deployment from the **Actions** tab on GitHub.

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

The test suite includes 66+ comprehensive tests covering:
- All payment frequency calculations
- Extra payment scenarios
- Canadian vs US compounding
- Term calculations
- Edge cases and boundary conditions
- Precision and rounding validation
- Payment impact analysis

## Technology Stack

- **Lit 3.1.0** - Fast, lightweight web components
- **TypeScript 5.3.0** - Type-safe development
- **Vite 5.0.0** - Lightning-fast build tool
- **Vitest 1.0.0** - Unit testing framework

## Usage Example

```typescript
import './mortgage-calculator';

// Add to your HTML
<mortgage-calculator></mortgage-calculator>
```

## How to Use

1. **Enter Mortgage Details:**
   - Loan Amount (default: $750,000)
   - Interest Rate (annual percentage)
   - Loan Term (in years)
   - Term Length (1-10 years for tracking)

2. **Select Payment Schedule:**
   - Payment Frequency (monthly, bi-weekly, etc.)
   - Compounding Method (Canadian or US)

3. **Add Extra Payments (Optional):**
   - Choose one option: Per Payment, Yearly, or One-Time
   - For yearly payments, select timing (start/middle/end of year)

4. **View Results:**
   - Click "Calculate" to see detailed breakdown
   - Navigate between Summary, Schedule, and Graph tabs
   - Compare standard vs. accelerated payment plans

## Key Calculations

### Interest Rate Conversion
- Canadian: Semi-annual to periodic rate conversion
- US: Annual to monthly to periodic rate conversion

### Payment Calculation
Uses standard amortization formula with precise periodic rate adjustments for each payment frequency to match industry standards.

### Extra Payments
- **Per Payment:** Added to principal reduction after each regular payment
- **Yearly:** Large lump sum applied at specified time of year
- **One-Time:** Immediate principal reduction applied at loan start

## Professional Features

- Clean, corporate-friendly design
- Professional blue color scheme
- Responsive layout
- Scrollable tables for long amortization schedules
- High-resolution canvas graphs with device pixel ratio support
- Precise calculations matching RBC calculator standards
- Organized subsections for better usability
- Side-by-side payment plan comparison

## Project Structure

```
MortgagePayoffCalculator/
├── src/
│   ├── main.ts                         # Application entry point
│   ├── mortgage-calculator.ts          # Main calculator component (1562 lines)
│   └── mortgage-calculator.test.ts     # Comprehensive test suite (66 tests)
├── index.html                          # HTML entry point
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── vite.config.ts                      # Vite configuration
├── vitest.config.ts                    # Vitest configuration
├── .gitignore                          # Git ignore rules
└── README.md                           # This file
```

## License

This project is provided as-is for educational and personal use.
