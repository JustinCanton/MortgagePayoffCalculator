# Mortgage Payoff Calculator

A comprehensive mortgage calculator built with TypeScript and Lit. Calculate mortgage payments, analyze amortization schedules, and visualize your payoff progress.

## Features

### Payment Frequencies
- Monthly (12/year)
- Semi-Monthly (24/year)
- Bi-Weekly (26/year)
- Accelerated Bi-Weekly
- Weekly (52/year)
- Accelerated Weekly

### Compounding Methods
- Semi-Annual compounding
- Monthly compounding

### Extra Payment Options
- **Per Payment** - Extra amount added to each regular payment
- **Yearly** - Annual lump sum payment (start, middle, or end of year)
- **One-Time** - Single lump sum payment applied immediately

### Visualization
- **Summary** - Side-by-side comparison of standard vs. extra payment plans
- **Amortization Schedule** - Annual or payment-by-payment breakdown
- **Graph** - Visual representation of principal balance and cumulative interest

## Technology Stack

- **Lit 3.1.0** - Lightweight web components
- **TypeScript 5.3.0** - Type-safe development
- **Vite 5.0.0** - Build tool
- **Vitest 1.0.0** - Unit testing

## Installation

```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

The test suite includes 66+ comprehensive tests covering all payment scenarios, edge cases, and calculation accuracy.

## Usage

```typescript
import './mortgage-calculator';

// Add to your HTML
<mortgage-calculator></mortgage-calculator>
```

## License

All rights reserved.
