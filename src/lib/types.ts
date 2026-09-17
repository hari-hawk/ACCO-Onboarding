export type AccountKey = 'miguel' | 'dana' | 'alex';

export interface Account {
  key: AccountKey;
  name: string;
  email: string;
  initials: string;
  short: string;
  role: string;
  photo?: string;
  photoBg?: string;
  onboard: number;
  onboardF: string;
  done: number;
  doneF: string;
}

export type RequestStatus = 'awaiting' | 'overdue' | 'partial' | 'onboarding' | 'withdrawn' | 'closed';

export interface StatusDef { label: string; bg: string; fg: string; icon: string }

export interface KV { k: string; v: string }

export interface Classification {
  code: string;
  trade: string;
  level: string;
  title: string;
  open: number;
  got: number;
  union: string;
  recNo?: string;
  sub?: { id: string; note: string };
}

export interface Tradesman {
  full: string;
  dob: string;
  doc: string;
  cls: string;
  state: string;
  good: boolean;
}

export interface Attachment { name: string }

export interface UnionResponse {
  union: string;
  time: string;
  summary: string;
  note: string;
  attach: Attachment[];
  tradesmen: Tradesman[];
}

export interface Activity { t: string; label: string }

export interface LaborRequest {
  id: string;
  owner: string;
  site: string;
  cls: string;
  filled: number;
  total: number;
  status: RequestStatus;
  submitted: string;
  by: string;
  emailed: boolean;
  pendNote: string;
  pendBadge: string;
  response?: UnionResponse;
  fields: KV[];
  siteFields: KV[];
  classes: Classification[];
  activity: Activity[];
  movedToOb?: boolean;
}

export interface EmailRec {
  id: string;
  dir: 'in' | 'out';
  peer: string;
  subject: string;
  ref: string;
  time: string;
  status: string;
  unread?: boolean;
  attach: Attachment[];
  fromAddr: string;
  toAddr: string;
  cc?: string;
  parsedNote?: string;
  body: string;
}

export interface FormClass {
  trade: string;
  level: string;
  title: string;
  open: number;
  union: string;
  done?: boolean;
}

export interface LaborForm {
  requestor: string;
  specialist: string;
  hm: string;
  start: string;
  expiration: 'until' | 'date';
  supervisor: string;
  dept: string;
  location: string;
  special: string;
  siteName: string;
  siteAddress: string;
  siteInstr: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  employer: string;
  bu: string;
  classes: FormClass[];
}

export type FormMode = 'new' | 'edit' | 'draft';

export type DocKey = 'dispatch' | 'id' | 'ssn' | 'bank';
export type DocStatus = 'empty' | 'uploading' | 'scanning' | 'ready' | 'error';

export interface DocEntry { name: string; time: string }

export interface DocState {
  status: DocStatus;
  pct: number;
  files: DocEntry[];
  history?: DocEntry[];
}

export type ObDocs = Record<DocKey, DocState>;

export interface ObField { k: string; v: string; conf: 'high' | 'medium' | 'low' }

export interface ObCtx {
  prefilled: boolean;
  lr?: string;
  site?: string;
  union?: string;
  name?: string;
  doc?: string;
  fields?: ObField[];
}

export type ObStage = 'precheck' | 'extract' | 'profile' | 'sign' | 'filed';

export type PreVerdict = 'new' | 'rehire' | 'dnh' | 'noverify';

export interface PreDoc { status: 'empty' | 'uploading' | 'ready'; pct: number; file: string }

export interface Session {
  name: string;
  cls: string;
  lr: string;
  site: string;
  docs: string;
  stage: string;
  session: string;
  sIcon: string;
  sBg: string;
  sFg: string;
  full?: boolean;
  fields: ObField[];
  doc: string;
  union: string;
}

export interface QueueItem {
  name: string;
  cls: string;
  lr: string;
  site: string;
  union: string;
  doc: string;
  fields: ObField[];
}

export interface HistoryRow {
  ref: string;
  detail: string;
  confirm: string;
  dt: string;
  date: string;
  outcome: string;
}

export type ReportRange = 'week' | 'month' | 'quarter' | 'year';

export interface SortState<K extends string = string> { key: K | null; dir: 1 | -1 }
