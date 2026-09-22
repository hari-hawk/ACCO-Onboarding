import { useMemo } from 'react';
import { buildSpecialistHistory, buildSuperHistory, expiredToHistoryRow } from './data';
import type { HistoryRow } from './types';
import { useApp } from '../store/app';

const SPECIALIST_HISTORY = buildSpecialistHistory();
const SUPER_HISTORY = buildSuperHistory();

/** Reports history for the signed-in role. Expired sessions lead the specialist's list as "Delayed". */
export function useHistory(specialist: boolean): HistoryRow[] {
  const expired = useApp((s) => s.expiredSessions);
  return useMemo(
    () => (specialist ? expired.map(expiredToHistoryRow).concat(SPECIALIST_HISTORY) : SUPER_HISTORY),
    [specialist, expired],
  );
}
