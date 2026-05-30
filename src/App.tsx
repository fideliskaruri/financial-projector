import { useMemo, useCallback } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_INPUTS, LEAN_SPENDING } from './data/defaults';
import { runProjection } from './engine/projectionEngine';
import type { AllInputs, FinancialParams, MonthYear, RecurringInflow, OnHireVest, StockGrant, OneTimeEvent } from './engine/types';
import { exportToCSV } from './utils/csvExport';

import Header from './components/Layout/Header';
import FixedParamsForm from './components/InputForm/FixedParamsForm';
import RecurringInflowsForm from './components/InputForm/RecurringInflowsForm';
import OnHireVestsForm from './components/InputForm/OnHireVestsForm';
import StockBonusForm from './components/InputForm/StockBonusForm';
import OneTimeEventsForm from './components/InputForm/OneTimeEventsForm';
import ProjectionRangeForm from './components/InputForm/ProjectionRangeForm';
import ProjectionTable from './components/Results/ProjectionTable';
import BalanceChart from './components/Results/BalanceChart';
import MilestoneMarkers from './components/Results/MilestoneMarkers';
import SummaryCards from './components/Results/SummaryCards';
import ScenarioToggle from './components/ScenarioToggle';

function App() {
  const [inputs, setInputs] = useLocalStorage<AllInputs>('fp-inputs', DEFAULT_INPUTS);
  const [darkMode, setDarkMode] = useLocalStorage('fp-dark-mode', false);
  const [showComparison, setShowComparison] = useLocalStorage('fp-comparison', false);

  const result = useMemo(() => runProjection(inputs), [inputs]);

  const leanResult = useMemo(() => {
    if (!showComparison) return undefined;
    return runProjection({
      ...inputs,
      params: { ...inputs.params, monthlySpending: LEAN_SPENDING },
    });
  }, [inputs, showComparison]);

  const updateParams = useCallback((params: FinancialParams) => {
    setInputs((prev) => ({ ...prev, params }));
  }, [setInputs]);

  const updateRecurring = useCallback((recurringInflows: RecurringInflow[]) => {
    setInputs((prev) => ({ ...prev, recurringInflows }));
  }, [setInputs]);

  const updateOnHireVests = useCallback((onHireVests: OnHireVest[]) => {
    setInputs((prev) => ({ ...prev, onHireVests }));
  }, [setInputs]);

  const updateStockGrants = useCallback((stockGrants: StockGrant[]) => {
    setInputs((prev) => ({ ...prev, stockGrants }));
  }, [setInputs]);

  const updateOneTimeEvents = useCallback((oneTimeEvents: OneTimeEvent[]) => {
    setInputs((prev) => ({ ...prev, oneTimeEvents }));
  }, [setInputs]);

  const updateStartDate = useCallback((startDate: MonthYear) => {
    setInputs((prev) => ({ ...prev, params: { ...prev.params, startDate } }));
  }, [setInputs]);

  const updateEndDate = useCallback((endDate: MonthYear) => {
    setInputs((prev) => ({ ...prev, params: { ...prev.params, endDate } }));
  }, [setInputs]);

  const resetDefaults = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
  }, [setInputs]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, [setDarkMode]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">⚙️ Parameters</h2>
                  <button
                    onClick={resetDefaults}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>

                <FixedParamsForm params={inputs.params} onChange={updateParams} />

                <ProjectionRangeForm
                  startDate={inputs.params.startDate}
                  endDate={inputs.params.endDate}
                  onChangeStart={updateStartDate}
                  onChangeEnd={updateEndDate}
                />

                <RecurringInflowsForm
                  inflows={inputs.recurringInflows}
                  onChange={updateRecurring}
                />

                <OnHireVestsForm
                  vests={inputs.onHireVests}
                  onChange={updateOnHireVests}
                />

                <StockBonusForm
                  grants={inputs.stockGrants}
                  onChange={updateStockGrants}
                />

                <OneTimeEventsForm
                  events={inputs.oneTimeEvents}
                  onChange={updateOneTimeEvents}
                />
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">📈 Projection Results</h2>
                <button
                  onClick={() => exportToCSV(result.rows)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Download size={12} /> Export CSV
                </button>
              </div>

              <BalanceChart
                rows={result.rows}
                milestones={result.milestones}
                comparisonRows={leanResult?.rows}
                comparisonLabel="Lean Spending"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MilestoneMarkers milestones={result.milestones} />
                <ScenarioToggle
                  inputs={inputs}
                  baselineResult={result}
                  showComparison={showComparison}
                  onToggle={() => setShowComparison((prev) => !prev)}
                />
              </div>

              <SummaryCards summaries={result.yearlySummaries} />

              <ProjectionTable rows={result.rows} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
