# Personal Financial Projector

A single-page web app that projects month-by-month **Money Market Fund (MMF)** balance growth based on your financial parameters -- salary, spending, interest rates, stock vests, bonuses, and more.

Built with **Vite + React + TypeScript + Tailwind CSS + Recharts**.

## Features

- Month-by-month projection table with expandable inflow details
- Interactive line chart showing balance growth over time
- Milestone tracking -- see when you'll hit 1M, 5M, 10M, 20M, etc.
- Yearly summary cards with total saved and interest earned
- What-if scenarios -- compare baseline vs lean spending
- Dark/Light mode toggle
- localStorage persistence -- your inputs survive browser refreshes
- CSV export of projection data
- Fully responsive -- works on mobile and desktop

## Quick Start

```bash
git clone https://github.com/fideliskaruri/financial-projector.git
cd financial-projector
npm install
npm run dev
```

## Default Configuration

Pre-populated with example data:
- Starting balance: KES 404,000 (June 2026)
- Net salary: KES 315,000/month
- Monthly spending: KES 165,000
- MMF interest: 1%/month (12% annual)
- ESPP quarterly sales, cash bonus, on-hire vests, annual stock grants

**Projected Dec 2030 balance: ~KES 29.5M**

## Tech Stack

- Vite - Build tool and dev server
- React 19 + TypeScript - UI framework
- Tailwind CSS 4 - Styling
- Recharts - Charts
- Lucide React - Icons

## License

MIT
