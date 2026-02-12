import { css } from 'lit';

export const mortgageCalculatorStyles = css`
  :host {
    display: block;
    max-width: 800px;
    width: 100%;
  }

  .calculator-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    padding: 40px;
    border: 1px solid #e5e7eb;
  }

  .header {
    text-align: center;
    margin-bottom: 30px;
  }

  .logo {
    width: 150px;
    height: 150px;
    margin: 0 auto 20px;
    display: block;
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
    line-height: 1.5;
  }

  .help-text {
    color: #94a3b8;
    font-size: 0.8rem;
    margin-top: 4px;
    font-style: italic;
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
    transition: all 0.3s ease;
    background: white;
    font-variant-numeric: tabular-nums;
  }

  input[type="text"] {
    text-align: left;
  }

  input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
  }

  input:hover {
    border-color: #cbd5e1;
  }

  select {
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  select:hover {
    border-color: #cbd5e1;
  }

  input[type="radio"] {
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
    transition: all 0.3s ease;
    animation: slideIn 0.4s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .result-section:only-child {
    grid-column: 1 / -1;
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
    color: #1e40af;
    font-weight: 700;
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
  }

  .result-value.highlight {
    color: #1e3a8a;
    font-size: 1.15rem;
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
    font-size: 1.8rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .footer {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 2px solid #e5e7eb;
    text-align: center;
    color: #64748b;
    font-size: 0.85rem;
    line-height: 1.6;
  }

  .footer-disclaimer {
    background: #fef3c7;
    border: 1px solid #fbbf24;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 15px;
    text-align: left;
  }

  .footer-disclaimer strong {
    color: #92400e;
    display: block;
    margin-bottom: 8px;
  }

  .footer-copyright {
    color: #94a3b8;
    font-size: 0.8rem;
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
    transition: all 0.3s ease;
    position: relative;
  }

  .tab:hover {
    color: #1e40af;
    background: rgba(30, 64, 175, 0.05);
  }

  .tab.active {
    color: #1e40af;
    border-bottom-color: #1e40af;
    background: rgba(30, 64, 175, 0.08);
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
      padding: 20px;
    }

    .logo {
      width: 110px;
      height: 110px;
      margin-bottom: 15px;
    }

    h1 {
      font-size: 1.4rem;
    }

    .subtitle {
      font-size: 0.85rem;
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

    .tab {
      padding: 10px 16px;
      font-size: 0.9rem;
    }

    .section-header {
      font-size: 1rem;
    }

    .subsection-label {
      font-size: 0.8rem;
    }
  }
`;
