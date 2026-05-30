import { useMemo } from 'react';
import type { AllInputs, ProjectionResult } from '../engine/types';
import { runProjection } from '../engine/projectionEngine';

export function useProjection(inputs: AllInputs): ProjectionResult {
  return useMemo(() => runProjection(inputs), [inputs]);
}
