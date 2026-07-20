export interface InFlightJob {
  id: string;
  type: string;
  workerId: string | null;
  startedAt: string | null;
}

export interface CompletedJob {
  id: string;
  type: string;
  workerId: string | null;
  finishedAt: string | null;
}

export interface FailedJob {
  id: string;
  type: string;
  workerId: string | null;
  error: string | null;
  stackTrace: string | null;
  finishedAt: string | null;
}
