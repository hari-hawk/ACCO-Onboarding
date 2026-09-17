import type {
  Account, AccountKey, DocKey, EmailRec, FormClass, HistoryRow, KV, LaborForm, LaborRequest,
  ReportRange, RequestStatus, Session, StatusDef,
} from './types';
import { MIGUEL_PHOTO } from './miguelPhoto';

/* ── Accounts (Entra ID demo identities) ─────────────────────────────── */
export const ACCOUNTS: Record<AccountKey, Account> = {
  miguel: {
    key: 'miguel', name: 'Miguel Santos', email: 'msantos@accoes.com', initials: 'MS', short: 'Miguel S.', role: 'Superintendent',
    photo: MIGUEL_PHOTO,
    photoBg: '#DCE6F2', onboard: 6, onboardF: 'In the onboarding specialist’s queue', done: 11, doneF: 'Filed to HCM Documents of Record',
  },
  dana: { key: 'dana', name: 'Dana Whitfield', email: 'dwhitfield@accoes.com', initials: 'DW', short: 'Dana W.', role: 'Onboarding specialist', onboard: 6, onboardF: '2 with the tradesman present', done: 11, doneF: 'Filed to HCM Documents of Record' },
  alex: { key: 'alex', name: 'Alex Porter', email: 'aporter@accoes.com', initials: 'AP', short: 'Alex P.', role: 'Superintendent', onboard: 0, onboardF: 'No active onboardings', done: 0, doneF: 'Filed packets appear here' },
};

export const ACCOUNT_PICKS: { key: AccountKey; blurb: string }[] = [
  { key: 'miguel', blurb: 'Superintendent — labor requests & union emails' },
  { key: 'dana', blurb: 'Onboarding specialist — extraction & filing' },
  { key: 'alex', blurb: 'New workspace — no requests yet' },
];

export const DEMO_PIN = '482917';

/* ── Vocabulary ──────────────────────────────────────────────────────── */
export const STATUS: Record<RequestStatus, StatusDef> = {
  awaiting: { label: 'Awaiting union response', bg: 'var(--status-review-required-bg)', fg: 'var(--status-review-required)', icon: 'clock' },
  overdue: { label: 'Response overdue', bg: 'var(--status-action-mandatory-bg)', fg: 'var(--status-action-mandatory)', icon: 'triangle-alert' },
  partial: { label: 'Partially filled', bg: 'var(--ds-bg-blue-light)', fg: 'var(--primary)', icon: 'users' },
  onboarding: { label: 'In onboarding', bg: 'var(--status-pre-approved-bg)', fg: 'var(--status-pre-approved)', icon: 'circle-check' },
  withdrawn: { label: 'Withdrawn', bg: 'var(--muted)', fg: 'var(--muted-foreground)', icon: 'circle-x' },
  closed: { label: 'Closed — no response', bg: 'var(--muted)', fg: 'var(--muted-foreground)', icon: 'circle-x' },
};

export const FILTER_DEFS: [string, string][] = [
  ['all', 'All statuses'], ['awaiting', 'Awaiting union response'], ['overdue', 'Response overdue'], ['partial', 'Partially filled'], ['onboarding', 'In onboarding'],
];

export const UNIONS = [
  '078 · UA Local 78 — Plumbers & Fitters, LA',
  '105 · SMW Local 105 — Southern California',
  '250 · UA Local 250 — Steamfitters, LA',
  '761 · UA Local 761 — Long Beach',
];

export const UNION_EMAILS: Record<string, string> = {
  '078': 'dispatch@ualocal78.org', '105': 'dispatch@smw105.org', '250': 'dispatch@ualocal250.org', '761': 'dispatch@ualocal761.org',
};

export const TEAM_ADDRESS = 'onboarding-specialists@accoes.com';

export interface DocDef { key: DocKey; title: string; sub: string; req: boolean; chips: string[] }
export const DOCDEFS: DocDef[] = [
  { key: 'dispatch', title: 'Union dispatch slip', sub: 'DC-16 dispatch / travel card', req: true, chips: ['Full name', 'Classification', 'Union & local', 'Start date'] },
  { key: 'id', title: 'Identity — driver’s license / ID', sub: 'State or government-issued', req: true, chips: ['Full name', 'Date of birth', 'Address', 'License no.'] },
  { key: 'ssn', title: 'Social Security card', sub: 'Original — no laminated copies', req: false, chips: ['Full name', 'SSN'] },
  { key: 'bank', title: 'Void check / bank letter', sub: 'For direct deposit', req: true, chips: ['Routing no.', 'Account no.'] },
];

export const DOC_SRC: Record<DocKey, string> = {
  dispatch: 'Union dispatch slip', id: 'Driver’s license / ID', ssn: 'Social Security card', bank: 'Void check / bank letter',
};

export const DOC_SIM_NAMES: Record<DocKey, string> = {
  dispatch: 'dispatch-slip.pdf', id: 'drivers-license.jpeg', ssn: 'ssn-card.heic', bank: 'void-check.pdf',
};

export interface SessionStatusDef { label: string; icon: string; bg: string; fg: string }
export const SESSION_STATUS: SessionStatusDef[] = [
  { label: 'Active — timer running', icon: 'timer', bg: 'var(--status-review-required-bg)', fg: 'var(--status-review-required)' },
  { label: 'Paused — saved', icon: 'pause', bg: 'var(--muted)', fg: 'var(--muted-foreground)' },
  { label: 'Tradesman present', icon: 'user', bg: 'var(--ds-bg-blue-light)', fg: 'var(--primary)' },
  { label: 'Awaiting INN verification', icon: 'clock', bg: 'var(--status-review-required-bg)', fg: 'var(--status-review-required)' },
  { label: 'Hired — confirmed in HCM', icon: 'circle-check', bg: 'var(--status-pre-approved-bg)', fg: 'var(--status-pre-approved)' },
  { label: 'On hold', icon: 'minus', bg: 'var(--muted)', fg: 'var(--muted-foreground)' },
];

export const PACKET: { title: string; sub: string }[] = [
  { title: 'Employee History Record', sub: 'Demographics, emergency contact, self-ID' },
  { title: 'Form W-4 — Federal Tax Withholding', sub: 'Federal income tax election' },
  { title: 'Form DE-4 — CA State Withholding', sub: 'California Personal Income Tax' },
  { title: 'Direct Deposit Authorization', sub: 'Routing & account on file' },
  { title: 'Pay Stub Delivery Authorization', sub: 'Delivery preference on record' },
  { title: 'Employee Handbook Acknowledgment', sub: 'Receipt of ACCO Union Employee Handbook' },
  { title: 'Meal & Rest Periods', sub: 'Break entitlements acknowledgment' },
  { title: 'Alcohol & Drug Policy', sub: 'Drug-free workplace acknowledgment' },
  { title: 'Business Ethics Policies', sub: 'Ethics standards acknowledgment' },
  { title: 'Discrimination / Harassment Prevention', sub: 'Workplace conduct acknowledgment' },
  { title: 'Safety Pact', sub: 'ACCO safety commitment' },
  { title: 'Form CC-305 — Disability Self-ID', sub: 'Pre-filled from self-identification answers' },
];

export const FILED_CHIPS = ['HCM Profile Created', 'History Record', 'W-4', 'CA DE-4', 'Direct Deposit', '12 Documents Signed & Filed'];

export interface XField { k: string; src: DocKey; req: boolean; sample?: string }
export const XFIELDS: XField[] = [
  { k: 'Legal first name', src: 'dispatch', req: true },
  { k: 'Legal last name', src: 'dispatch', req: true },
  { k: 'Classification', src: 'dispatch', req: true },
  { k: 'Local union', src: 'dispatch', req: true },
  { k: 'Start date', src: 'dispatch', req: true },
  { k: 'Date of birth', src: 'id', req: true, sample: '08/26/1993' },
  { k: 'Address line 1', src: 'id', req: true, sample: '2406 Sierra View St' },
  { k: 'City · State · ZIP', src: 'id', req: true, sample: 'Selma · CA · 93662' },
  { k: 'Driver’s license no.', src: 'id', req: false, sample: '••••1768' },
  { k: 'SSN', src: 'ssn', req: false, sample: '•••-••-8840' },
  { k: 'Routing no.', src: 'bank', req: true, sample: '•••••2594' },
  { k: 'Account no.', src: 'bank', req: true, sample: '••••••5090' },
];

export const OB_STAGES = [
  { id: 'identity', label: 'Identity check', icon: 'shield-check' },
  { id: 'extract', label: 'Data extraction', icon: 'scan-search' },
  { id: 'profile', label: 'Profile', icon: 'user-plus' },
  { id: 'sign', label: 'Forms & sign', icon: 'pencil' },
  { id: 'file', label: 'File to HCM', icon: 'circle-check' },
];

export const PRE_SAMPLES = [
  { name: 'William Stout', note: 'SSN •••8840 · DOB 08/26/1993', badge: 'New hire', bIcon: 'circle-check', tone: 'ok' as const, f: ['William', 'Stout', '602-68-8840', '08/26/1993'] },
  { name: 'Marcus Okafor', note: 'SSN •••4821 · DOB 03/14/1988', badge: 'Rehire', bIcon: 'triangle-alert', tone: 'warn' as const, f: ['Marcus', 'Okafor', '571-22-4821', '03/14/1988'] },
  { name: 'Prakash Anand', note: 'SSN •••2210 · DOB 11/02/1990', badge: 'Do Not Hire', bIcon: 'circle-x', tone: 'bad' as const, f: ['Prakash', 'Anand', '544-90-2210', '11/02/1990'] },
];

/* ── Form options ────────────────────────────────────────────────────── */
export const OPTS = {
  requestor: ['Ana Montano', 'Luis Vega', 'Jin Park'],
  hm: ['T. Nguyen — Field Ops', 'R. Alvarez — Field Ops'],
  supervisor: ['K. Ibarra', 'S. Okafor', 'M. Chen'],
  dept: ['2018-ACC-Virtual Construction-Hy', '2020-ACC-Field Operations'],
  location: ['Los Angeles, CA', 'San Diego, CA', 'Downey, CA', 'Inglewood, CA'],
  employer: ['ACCO Engineered Systems, Inc.', 'ACCO Mechanical Services LLC'],
  bu: ['210 — Plumbing & Process Piping', '230 — Sheet Metal', '250 — Service'],
  trade: ['PLB-F · Plumber', 'PLB-J · Plumber', 'PPF-F · Pipefitter', 'SMW-J · Sheet Metal Worker'],
  level: ['Foreman', 'Journeyman', 'Apprentice'],
  title: ['Foreman — Plumber', 'Journeyman Plumber', 'Foreman — Pipefitter', 'Journeyman Sheet Metal Worker'],
};

export const EMPTY_CLASS: FormClass = { trade: '', level: '', title: '', open: 1, union: '' };

export const EMPTY_FORM: LaborForm = {
  requestor: '', specialist: '', hm: '', start: '', expiration: 'until', supervisor: '', dept: '', location: '', special: '',
  siteName: '', siteAddress: '', siteInstr: '', contactName: '', contactPhone: '', contactEmail: '', employer: '', bu: '',
  classes: [{ ...EMPTY_CLASS }],
};

export const SAMPLE_FORM: LaborForm = {
  requestor: 'Ana Montano', specialist: '', hm: '', start: '09/21/2026 · 6:00 AM', expiration: 'until', supervisor: 'K. Ibarra',
  dept: '2018-ACC-Virtual Construction-Hy', location: 'Los Angeles, CA', special: 'None',
  siteName: 'LAX Terminal 9 — Central Utility Plant', siteAddress: '1 World Way\nLos Angeles, CA 90045', siteInstr: 'Badging required — allow 45 min',
  contactName: 'R. Delgado', contactPhone: '(310) 555-0148', contactEmail: 'r.delgado@accoes.com',
  employer: 'ACCO Engineered Systems, Inc.', bu: '210 — Plumbing & Process Piping',
  classes: [
    { trade: 'PLB-F · Plumber', level: 'Foreman', title: 'Foreman — Plumber', open: 3, union: '078 · UA Local 78 — Plumbers & Fitters, LA' },
    { trade: 'PLB-J · Plumber', level: 'Journeyman', title: 'Journeyman Plumber', open: 2, union: '078 · UA Local 78 — Plumbers & Fitters, LA' },
  ],
};

export const SAMPLE_FORM2: LaborForm = {
  requestor: '', specialist: '', hm: 'R. Alvarez — Field Ops', start: '09/28/2026 · 7:00 AM', expiration: 'until', supervisor: 'S. Okafor',
  dept: '2018-ACC-Virtual Construction-Hy', location: 'Downey, CA', special: 'None',
  siteName: 'Kaiser Downey — Chiller Plant Retrofit', siteAddress: '9333 Imperial Hwy\nDowney, CA 90242', siteInstr: 'Park in structure C — bring PPE',
  contactName: 'S. Okafor', contactPhone: '(562) 555-0177', contactEmail: 's.okafor@accoes.com',
  employer: 'ACCO Engineered Systems, Inc.', bu: '210 — Plumbing & Process Piping',
  classes: [
    { trade: 'PPF-F · Pipefitter', level: 'Foreman', title: 'Foreman — Pipefitter', open: 2, union: '250 · UA Local 250 — Steamfitters, LA' },
    { trade: 'SMW-J · Sheet Metal Worker', level: 'Journeyman', title: 'Journeyman Sheet Metal Worker', open: 2, union: '105 · SMW Local 105 — Southern California' },
  ],
};

export type DraftKey = 'lax' | 'kaiser';
export const DRAFT_DEFS: Record<DraftKey, { site: string; meta: string; form: LaborForm }> = {
  lax: { site: 'LAX Terminal 9 — Central Utility Plant', meta: '2 classifications · 5 openings · saved Sep 6 · hiring manager missing', form: SAMPLE_FORM },
  kaiser: { site: 'Kaiser Downey — Chiller Plant Retrofit', meta: '2 classifications · 2 unions · 4 openings · saved Sep 7 · ready to submit', form: SAMPLE_FORM2 },
};

/* ── Sign-in carousel ────────────────────────────────────────────────── */
export const LOGIN_SLIDES = [
  { icon: 'file-text', title: 'Labor requests to unions, in minutes', text: 'Capture classifications, openings and the job site once — HCM labor records are created instantly and one email per union goes out automatically.' },
  { icon: 'mail-open', title: 'Union replies read for you', text: 'Dispatch confirmations are parsed straight from the reply. Classifications update on their own and pending openings can transfer to another local.' },
  { icon: 'scan-search', title: 'Documents extracted, nothing re-keyed', text: 'Dispatch slips, IDs and banking details are read automatically and validated against HCM — new hire, rehire or do-not-hire, before anything starts.' },
  { icon: 'circle-check', title: 'Sign once, filed to HCM', text: 'The tradesman signs once on the iPad, the signature applies across every form, and the packet lands in HCM Documents of Record ready for payroll.' },
];

export const LOGIN_TAGS = ['Labor Requests', 'Union Emails', 'Document Extraction', 'HCM Filing'];

/* ── Seed data ───────────────────────────────────────────────────────── */
const F = (k: string, v: string): KV => ({ k, v });

export const SEED_EMAILS: Record<AccountKey, EmailRec[]> = {
  alex: [],
  dana: [],
  miguel: [
    { id: 'e1', dir: 'in', peer: 'UA Local 250', subject: 'RE: Labor request LR-2026-0137 — dispatch confirmation', ref: 'LR-2026-0137', time: 'Sep 3', status: 'Response — parsed', unread: true, attach: [{ name: 'dispatch-ibanez.pdf' }], fromAddr: 'dispatch@ualocal250.org', toAddr: TEAM_ADDRESS, parsedNote: 'Classification PPF-F updated to 1 of 2 filled · in-person visit noted on the request.', body: 'To the ACCO Onboarding team,\n\nWe are dispatching Tomás D. Ibanez (Foreman — Pipefitter) for the Sep 14 start at Kaiser Downey Central Plant. He will present in person with his paper dispatch slip — the dispatch document is attached.\n\nWe have no second foreman available at this time and will advise if that changes.\n\n— Dispatch, UA Local 250\nRef LR-2026-0137' },
    { id: 'e2', dir: 'out', peer: 'UA Local 250', subject: 'Labor request LR-2026-0137 — 2 openings — Kaiser Downey', ref: 'LR-2026-0137', time: 'Sep 1', status: 'Sent', attach: [], fromAddr: TEAM_ADDRESS, toAddr: 'dispatch@ualocal250.org', cc: 'dwhitfield@accoes.com', body: 'To the Dispatch Office,\n\nACCO Engineered Systems requests the following dispatches for Kaiser Downey Central Plant, starting Mon, Sep 14, 2026 · 7:00 AM:\n\n  • 2 × Foreman — Pipefitter (PPF-F) — 250 · UA Local 250 — Steamfitters, LA\n\nJob site: 9333 Imperial Hwy, Downey, CA 90242\nSite contact: S. Okafor · (562) 555-0177 · s.okafor@accoes.com\nInstructions: Park in structure C — bring PPE\n\nPlease reply to this address with your dispatch confirmations — dispatch documents can be attached directly and are matched to this request automatically.\n\nRegards,\nACCO Onboarding — Dana Whitfield\nonboarding-specialists@accoes.com · Ref LR-2026-0137' },
    { id: 'e3', dir: 'in', peer: 'SMW Local 105', subject: 'RE: Labor request LR-2026-0139 — 2 dispatches', ref: 'LR-2026-0139', time: 'Sep 1', status: 'Response — parsed', attach: [{ name: 'dispatch-ruiz.pdf' }, { name: 'dispatch-anand.pdf' }], fromAddr: 'dispatch@smw105.org', toAddr: TEAM_ADDRESS, parsedNote: 'Classification SMW-J completed — 2 of 2 filled · both onboardings started automatically.', body: 'To the ACCO Onboarding team,\n\nConfirming 2 dispatches for UCSD Hillcrest Tower B, Sep 8 start: Carla M. Ruiz and Prakash Anand, both Journeyman Sheet Metal Workers. Dispatch documents are attached.\n\n— Dispatch, SMW Local 105\nRef LR-2026-0139' },
    { id: 'e4', dir: 'out', peer: 'UA Local 78', subject: 'Labor request LR-2026-0142 — 5 openings — LAX Terminal 9', ref: 'LR-2026-0142', time: 'Sep 4', status: 'Sent — awaiting response', attach: [], fromAddr: TEAM_ADDRESS, toAddr: 'dispatch@ualocal78.org', cc: 'dwhitfield@accoes.com', body: 'To the Dispatch Office,\n\nACCO Engineered Systems requests the following dispatches for LAX Terminal 9 — Central Utility Plant, starting Mon, Sep 21, 2026 · 6:00 AM:\n\n  • 3 × Foreman — Plumber (PLB-F) — 078 · UA Local 78 — Plumbers & Fitters, LA\n  • 2 × Journeyman Plumber (PLB-J) — 078 · UA Local 78 — Plumbers & Fitters, LA\n\nJob site: 1 World Way, Los Angeles, CA 90045\nSite contact: R. Delgado · (310) 555-0148 · r.delgado@accoes.com\nInstructions: Badging required — allow 45 min\n\nPlease reply to this address with your dispatch confirmations — dispatch documents can be attached directly and are matched to this request automatically.\n\nRegards,\nACCO Onboarding — Dana Whitfield\nonboarding-specialists@accoes.com · Ref LR-2026-0142' },
    { id: 'e5', dir: 'out', peer: 'UA Local 78', subject: 'Labor request LR-2026-0134 — 2 openings — SoFi Stadium', ref: 'LR-2026-0134', time: 'Sep 2', status: 'Sent — no response', attach: [], fromAddr: TEAM_ADDRESS, toAddr: 'dispatch@ualocal78.org', cc: 'dwhitfield@accoes.com', body: 'To the Dispatch Office,\n\nACCO Engineered Systems requests the following dispatches for the SoFi Stadium Chiller Retrofit, starting Wed, Sep 16, 2026 · 6:00 AM:\n\n  • 2 × Journeyman Plumber (PLB-J) — 078 · UA Local 78 — Plumbers & Fitters, LA\n\nJob site: 1001 Stadium Dr, Inglewood, CA 90301\nSite contact: L. Vega · (424) 555-0139 · l.vega@accoes.com\nInstructions: Gate E-2 — escort required first day\n\nPlease reply to this address with your dispatch confirmations — dispatch documents can be attached directly and are matched to this request automatically.\n\nRegards,\nACCO Onboarding — Dana Whitfield\nonboarding-specialists@accoes.com · Ref LR-2026-0134' },
  ],
};

export const SEED_REQUESTS: Record<AccountKey, LaborRequest[]> = {
  alex: [],
  dana: [],
  miguel: [
    {
      id: 'LR-2026-0142', owner: 'Miguel Santos', site: 'LAX Terminal 9 — Central Utility Plant', cls: '3 Foreman — Plumber · 2 Journeyman Plumber', filled: 0, total: 5, status: 'awaiting', submitted: 'Sep 4, 2026', by: 'amontano@accoes.com', emailed: true, pendNote: 'UA Local 78 · 2 classifications', pendBadge: 'Waiting 3 days',
      fields: [F('Labor requestor', 'Ana Montano'), F('Onboarding specialist', 'Dana Whitfield'), F('Start date & time', 'Mon, Sep 21, 2026 · 6:00 AM'), F('Expiration', 'Until filled'), F('Supervisor', 'K. Ibarra'), F('Hiring manager', 'T. Nguyen'), F('Department', '2018-ACC-Virtual Construction-Hy'), F('Location', 'Los Angeles, CA'), F('Special requests', 'None')],
      siteFields: [F('Job site name', 'LAX Terminal 9 — Central Utility Plant'), F('Job site address', '1 World Way, Los Angeles, CA 90045'), F('Site instructions', 'Badging required — allow 45 min'), F('Contact name', 'R. Delgado'), F('Contact phone', '(310) 555-0148'), F('Contact email', 'r.delgado@accoes.com'), F('Legal employer', 'ACCO Engineered Systems, Inc.'), F('Business unit', '210 — Plumbing & Process Piping')],
      classes: [
        { code: 'PLB-F', trade: 'Plumber', level: 'Foreman', title: 'Foreman — Plumber', open: 3, got: 0, union: '078 · UA Local 78 — Plumbers & Fitters, LA' },
        { code: 'PLB-J', trade: 'Plumber', level: 'Journeyman', title: 'Journeyman Plumber', open: 2, got: 0, union: '078 · UA Local 78 — Plumbers & Fitters, LA' },
      ],
      activity: [
        { t: 'Sep 4, 8:12 AM', label: 'Submitted — 2 HCM labor records created instantly via the HCM connection' },
        { t: 'Sep 4, 8:14 AM', label: 'Union email sent from onboarding-specialists@accoes.com · To dispatch@ualocal78.org · CC Dana Whitfield' },
        { t: 'Sep 7', label: 'Awaiting response — reminder scheduled Sep 8' },
      ],
    },
    {
      id: 'LR-2026-0139', owner: 'Miguel Santos', site: 'UCSD Hillcrest Tower B', cls: '2 Journeyman Sheet Metal Worker', filled: 2, total: 2, status: 'onboarding', submitted: 'Aug 28, 2026', by: 'jpark@accoes.com', emailed: true, pendNote: '', pendBadge: '',
      response: {
        union: 'SMW Local 105', time: 'Sep 1, 2:31 PM', summary: '2 dispatches confirmed — both classifications completed automatically.', note: 'Classification SMW-J updated automatically from the parsed reply — 2 of 2 filled, onboarding started for both tradesmen.', attach: [{ name: 'dispatch-ruiz.pdf' }, { name: 'dispatch-anand.pdf' }],
        tradesmen: [
          { full: 'Carla M. Ruiz', dob: '09/02/1990', doc: 'ssn-card-ruiz.heic', cls: 'Journeyman Sheet Metal Worker', state: 'Dispatched — documents received', good: true },
          { full: 'Prakash Anand', dob: '01/18/1987', doc: 'ssn-card-anand.heic', cls: 'Journeyman Sheet Metal Worker', state: 'Dispatched — documents received', good: true },
        ],
      },
      fields: [F('Labor requestor', 'Jin Park'), F('Onboarding specialist', 'Dana Whitfield'), F('Start date & time', 'Tue, Sep 8, 2026 · 6:30 AM'), F('Expiration', 'Until filled'), F('Supervisor', 'M. Chen'), F('Hiring manager', 'T. Nguyen'), F('Department', '2018-ACC-Virtual Construction-Hy'), F('Location', 'San Diego, CA'), F('Special requests', 'Hospital badging — TB test on file')],
      siteFields: [F('Job site name', 'UCSD Hillcrest Tower B'), F('Job site address', '200 W Arbor Dr, San Diego, CA 92103'), F('Site instructions', 'Check in at facilities office, level B1'), F('Contact name', 'M. Chen'), F('Contact phone', '(619) 555-0112'), F('Contact email', 'm.chen@accoes.com'), F('Legal employer', 'ACCO Engineered Systems, Inc.'), F('Business unit', '230 — Sheet Metal')],
      classes: [{ code: 'SMW-J', trade: 'Sheet Metal Worker', level: 'Journeyman', title: 'Journeyman Sheet Metal Worker', open: 2, got: 2, union: '105 · SMW Local 105 — Southern California' }],
      activity: [
        { t: 'Aug 28, 9:04 AM', label: 'Submitted — 1 HCM labor record created instantly via the HCM connection' },
        { t: 'Aug 28, 9:06 AM', label: 'Union email sent from onboarding-specialists@accoes.com · To dispatch@smw105.org · CC Dana Whitfield' },
        { t: 'Sep 1, 2:31 PM', label: 'Union replied — 2 dispatches parsed from the email, classification completed automatically' },
        { t: 'Sep 2', label: 'Both tradesmen in onboarding — document extraction' },
      ],
    },
    {
      id: 'LR-2026-0137', owner: 'Miguel Santos', site: 'Kaiser Downey Central Plant', cls: '2 Foreman — Pipefitter', filled: 1, total: 2, status: 'partial', submitted: 'Sep 1, 2026', by: 'amontano@accoes.com', emailed: true, pendNote: 'UA Local 250 · 1 opening remains', pendBadge: 'Waiting 2 days',
      response: {
        union: 'UA Local 250', time: 'Sep 3, 11:15 AM', summary: '1 dispatch confirmed — parsed from the reply; 1 opening still pending.', note: 'Classification PPF-F updated automatically — 1 of 2 filled. Complete the row when the union confirms the remainder, or transfer it to another union as a subticket.', attach: [{ name: 'dispatch-ibanez.pdf' }],
        tradesmen: [{ full: 'Tomás D. Ibanez', dob: '06/14/1985', doc: 'ssn-card-ibanez.heic', cls: 'Foreman — Pipefitter', state: 'In-person visit — confirmed as submitted', good: false }],
      },
      fields: [F('Labor requestor', 'Ana Montano'), F('Onboarding specialist', 'Dana Whitfield'), F('Start date & time', 'Mon, Sep 14, 2026 · 7:00 AM'), F('Expiration', 'On date — Sep 30, 2026'), F('Supervisor', 'S. Okafor'), F('Hiring manager', 'R. Alvarez'), F('Department', '2018-ACC-Virtual Construction-Hy'), F('Location', 'Downey, CA'), F('Special requests', 'None')],
      siteFields: [F('Job site name', 'Kaiser Downey Central Plant'), F('Job site address', '9333 Imperial Hwy, Downey, CA 90242'), F('Site instructions', 'Park in structure C — bring PPE'), F('Contact name', 'S. Okafor'), F('Contact phone', '(562) 555-0177'), F('Contact email', 's.okafor@accoes.com'), F('Legal employer', 'ACCO Engineered Systems, Inc.'), F('Business unit', '210 — Plumbing & Process Piping')],
      classes: [{ code: 'PPF-F', trade: 'Pipefitter', level: 'Foreman', title: 'Foreman — Pipefitter', open: 2, got: 1, union: '250 · UA Local 250 — Steamfitters, LA' }],
      activity: [
        { t: 'Sep 1, 7:40 AM', label: 'Submitted — 1 HCM labor record created instantly via the HCM connection' },
        { t: 'Sep 1, 7:42 AM', label: 'Union email sent from onboarding-specialists@accoes.com · To dispatch@ualocal250.org · CC Dana Whitfield' },
        { t: 'Sep 3, 11:15 AM', label: 'Union replied — 1 dispatch parsed and confirmed, 1 opening still pending' },
      ],
    },
    {
      id: 'LR-2026-0134', owner: 'Miguel Santos', site: 'SoFi Stadium Chiller Retrofit', cls: '2 Journeyman Plumber', filled: 0, total: 2, status: 'overdue', submitted: 'Sep 2, 2026', by: 'lvega@accoes.com', emailed: true, pendNote: 'UA Local 78 · no response yet', pendBadge: 'Overdue — 5 days',
      fields: [F('Labor requestor', 'Luis Vega'), F('Onboarding specialist', 'Dana Whitfield'), F('Start date & time', 'Wed, Sep 16, 2026 · 6:00 AM'), F('Expiration', 'Until filled'), F('Supervisor', 'L. Vega'), F('Hiring manager', 'R. Alvarez'), F('Department', '2018-ACC-Virtual Construction-Hy'), F('Location', 'Inglewood, CA'), F('Special requests', 'Night shift weeks 2–4')],
      siteFields: [F('Job site name', 'SoFi Stadium Chiller Retrofit'), F('Job site address', '1001 Stadium Dr, Inglewood, CA 90301'), F('Site instructions', 'Gate E-2 — escort required first day'), F('Contact name', 'L. Vega'), F('Contact phone', '(424) 555-0139'), F('Contact email', 'l.vega@accoes.com'), F('Legal employer', 'ACCO Engineered Systems, Inc.'), F('Business unit', '210 — Plumbing & Process Piping')],
      classes: [{ code: 'PLB-J', trade: 'Plumber', level: 'Journeyman', title: 'Journeyman Plumber', open: 2, got: 0, union: '078 · UA Local 78 — Plumbers & Fitters, LA' }],
      activity: [
        { t: 'Sep 2, 3:22 PM', label: 'Submitted — 1 HCM labor record created instantly via the HCM connection' },
        { t: 'Sep 2, 3:25 PM', label: 'Union email sent from onboarding-specialists@accoes.com · To dispatch@ualocal78.org · CC Dana Whitfield' },
        { t: 'Sep 7', label: 'No response after 5 business days — escalation suggested' },
      ],
    },
  ],
};

export interface Notification { icon: string; bg: string; fg: string; text: string; ref?: string; time: string; id?: string }
export const MIGUEL_NOTIFS: Notification[] = [
  { icon: 'message-square', bg: 'var(--ds-bg-blue-light)', fg: 'var(--primary)', text: 'UA Local 250 replied — 1 dispatch confirmed, parsed automatically', ref: 'LR-2026-0137', time: 'Sep 3', id: 'LR-2026-0137' },
  { icon: 'triangle-alert', bg: 'var(--status-action-mandatory-bg)', fg: 'var(--status-action-mandatory)', text: 'No union response after 5 business days', ref: 'LR-2026-0134', time: 'Today', id: 'LR-2026-0134' },
  { icon: 'circle-check', bg: 'var(--status-pre-approved-bg)', fg: 'var(--status-pre-approved)', text: 'Onboarding complete — 2 tradesmen filed to HCM', ref: 'LR-2026-0139', time: 'Sep 4', id: 'LR-2026-0139' },
];

/* ── Dana's base sessions ────────────────────────────────────────────── */
export const SESSION_STOUT: Session = {
  name: 'William Stout', cls: 'Jrny Fitter · UA Local 246', lr: 'LR-1034', site: 'Fresno Community Hospital — Central Plant', docs: '4 / 4', stage: 'Extract & identity', session: 'Ready to submit', sIcon: 'circle-check', sBg: 'var(--status-pre-approved-bg)', sFg: 'var(--status-pre-approved)', full: true,
  fields: [{ k: 'Tradesman name', v: 'William Stout', conf: 'high' }, { k: 'Classification', v: 'Jrny Fitter', conf: 'high' }, { k: 'Local union', v: '246 · UA Local 246', conf: 'high' }, { k: 'Start date', v: '07/07/2026 · 6:00 AM', conf: 'high' }],
  doc: '7.7.26 - WILLIAM STOUT - DISPATCH.pdf', union: 'UA Local 246',
};
export const SESSION_IBANEZ: Session = {
  name: 'Tomás D. Ibanez', cls: 'Foreman — Pipefitter · UA Local 250', lr: 'LR-2026-0137', site: 'Kaiser Downey Central Plant', docs: '1 / 4', stage: 'Extract & identity', session: 'Active — 22:41 left', sIcon: 'timer', sBg: 'var(--status-review-required-bg)', sFg: 'var(--status-review-required)',
  fields: [{ k: 'Tradesman name', v: 'Tomás D. Ibanez', conf: 'high' }, { k: 'Classification', v: 'Foreman — Pipefitter', conf: 'high' }, { k: 'Local union', v: 'UA Local 250', conf: 'high' }, { k: 'Start date', v: 'Mon, Sep 14, 2026 · 7:00 AM', conf: 'medium' }],
  doc: 'dispatch-ibanez.pdf', union: 'UA Local 250',
};
export const SESSIONS_TAIL: Session[] = [
  { name: 'Marcus Okafor', cls: 'Foreman — Plumber · UA Local 78', lr: 'LR-2026-0142', site: 'LAX Terminal 9 — Central Utility Plant', docs: '3 / 4', stage: 'Extract & identity', session: 'Paused — saved Sep 5', sIcon: 'pause', sBg: 'var(--muted)', sFg: 'var(--muted-foreground)',
    fields: [{ k: 'Tradesman name', v: 'Marcus D. Okafor', conf: 'high' }, { k: 'Classification', v: 'Foreman — Plumber', conf: 'high' }, { k: 'Local union', v: 'UA Local 78', conf: 'high' }, { k: 'Start date', v: 'Mon, Sep 21, 2026 · 6:00 AM', conf: 'medium' }], doc: 'dispatch-okafor.pdf', union: 'UA Local 78' },
  { name: 'Carla M. Ruiz', cls: 'Journeyman Sheet Metal Worker · SMW 105', lr: 'LR-2026-0139', site: 'UCSD Hillcrest Tower B', docs: '4 / 4', stage: 'Forms & sign', session: 'Tradesman present', sIcon: 'user', sBg: 'var(--ds-bg-blue-light)', sFg: 'var(--primary)',
    fields: [{ k: 'Tradesman name', v: 'Carla M. Ruiz', conf: 'high' }, { k: 'Classification', v: 'Journeyman Sheet Metal Worker', conf: 'high' }, { k: 'Local union', v: 'SMW Local 105', conf: 'high' }, { k: 'Start date', v: 'Tue, Sep 8, 2026 · 6:30 AM', conf: 'high' }], doc: 'dispatch-ruiz.pdf', union: 'SMW Local 105' },
  { name: 'Prakash Anand', cls: 'Journeyman Sheet Metal Worker · SMW 105', lr: 'LR-2026-0139', site: 'UCSD Hillcrest Tower B', docs: '4 / 4', stage: 'Profile', session: 'Paused — saved Sep 4', sIcon: 'pause', sBg: 'var(--muted)', sFg: 'var(--muted-foreground)',
    fields: [{ k: 'Tradesman name', v: 'Prakash Anand', conf: 'high' }, { k: 'Classification', v: 'Journeyman Sheet Metal Worker', conf: 'high' }, { k: 'Local union', v: 'SMW Local 105', conf: 'high' }, { k: 'Start date', v: 'Tue, Sep 8, 2026 · 6:30 AM', conf: 'high' }], doc: 'dispatch-anand.pdf', union: 'SMW Local 105' },
];

/* ── Reports ─────────────────────────────────────────────────────────── */
export const RANGE_LABEL: Record<ReportRange, string> = { week: 'last 7 days', month: 'last 30 days', quarter: 'last 3 months', year: 'last 12 months' };
export const RANGE_DAYS: Record<ReportRange, number> = { week: 7, month: 30, quarter: 90, year: 365 };
export const RANGE_TABS: [ReportRange, string][] = [['week', '7D'], ['month', '30D'], ['quarter', '3M'], ['year', '1Y']];

export const SUPER_METRICS: Record<ReportRange, { req: number; open: number; disp: number; resp: string; fill: string; od: number; u: number[] }> = {
  week: { req: 4, open: 11, disp: 8, resp: '1.6 d', fill: '73%', od: 1, u: [4, 3, 2, 1] },
  month: { req: 12, open: 31, disp: 26, resp: '2.1 d', fill: '84%', od: 1, u: [12, 8, 7, 4] },
  quarter: { req: 31, open: 79, disp: 69, resp: '2.4 d', fill: '87%', od: 3, u: [29, 21, 17, 11] },
  year: { req: 96, open: 244, disp: 217, resp: '2.6 d', fill: '89%', od: 7, u: [88, 64, 52, 33] },
};

export const SPECIALIST_METRICS: Record<ReportRange, { done: number; ext: string; auto: string; rekey: number; inn: number; st: number[]; retry: number; expired: string }> = {
  week: { done: 4, ext: '5 min', auto: '94%', rekey: 3, inn: 2, st: [3, 1, 2, 2], retry: 1, expired: 'none' },
  month: { done: 11, ext: '6 min', auto: '92%', rekey: 9, inn: 2, st: [3, 1, 2, 2], retry: 3, expired: 'none' },
  quarter: { done: 29, ext: '7 min', auto: '90%', rekey: 31, inn: 4, st: [6, 2, 3, 4], retry: 8, expired: '1 session' },
  year: { done: 87, ext: '8 min', auto: '88%', rekey: 118, inn: 5, st: [9, 3, 5, 5], retry: 22, expired: '4 sessions' },
};

export const REPORT_UNIONS = ['UA Local 78 — Plumbers & Fitters', 'UA Local 250 — Steamfitters', 'SMW Local 105 — Sheet Metal', 'UA Local 761 — Long Beach'];

export const OUTCOME_STYLE: Record<string, { icon: string; bg: string; fg: string }> = {
  'Completed': { icon: 'circle-check', bg: 'var(--status-pre-approved-bg)', fg: 'var(--status-pre-approved)' },
  'Filed to HCM': { icon: 'circle-check', bg: 'var(--status-pre-approved-bg)', fg: 'var(--status-pre-approved)' },
  'Partially filled': { icon: 'users', bg: 'var(--ds-bg-blue-light)', fg: 'var(--primary)' },
  'In verification': { icon: 'clock', bg: 'var(--status-review-required-bg)', fg: 'var(--status-review-required)' },
  'Closed': { icon: 'circle-x', bg: 'var(--muted)', fg: 'var(--muted-foreground)' },
  'Withdrawn': { icon: 'minus', bg: 'var(--muted)', fg: 'var(--muted-foreground)' },
};

const REPORT_TODAY = new Date(2026, 8, 9);
export { REPORT_TODAY };

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function buildSuperHistory(): HistoryRow[] {
  const SITES = ['LAX Terminal 9 — Central Utility Plant', 'Kaiser Downey Central Plant', 'UCSD Hillcrest Tower B', 'SoFi Stadium Chiller Retrofit', 'Century Plaza Tower Retrofit', 'Long Beach Civic Center'];
  const TRADES = ['Jrny Plumber', 'Foreman Plumber', 'Jrny Pipefitter', 'Foreman Pipefitter', 'Jrny Sheet Metal Worker'];
  const OUT = ['Completed', 'Completed', 'Partially filled', 'Completed', 'Closed', 'Completed', 'Withdrawn'];
  const rows: HistoryRow[] = [];
  for (let i = 0; i < 22; i++) {
    const d = new Date(2026, 8, 8); d.setDate(d.getDate() - i * 2);
    const n = (i % 3) + 1;
    const out = OUT[i % OUT.length];
    rows.push({
      ref: 'LR-2026-0' + (141 - i),
      detail: SITES[i % SITES.length] + ' — ' + n + ' ' + TRADES[i % TRADES.length],
      confirm: out === 'Completed' ? `${n} of ${n} classifications confirmed` : out === 'Partially filled' ? `${Math.max(1, n - 1)} of ${n} confirmed · 1 pending child` : out === 'Closed' ? 'Closed — no response after 5 days' : 'Withdrawn before dispatch',
      dt: d.toISOString().slice(0, 10), date: fmtDate(d), outcome: out,
    });
  }
  return rows;
}

export function buildSpecialistHistory(): HistoryRow[] {
  const rows: HistoryRow[] = [
    { ref: '667003', detail: 'William Stout — Jrny Fitter · UA Local 246 · LR-1034', confirm: 'Packet filed · record 300009520151018', dt: '2026-09-08', date: 'Sep 8, 2026', outcome: 'Filed to HCM' },
    { ref: '651218', detail: 'Carla M. Ruiz — Jrny Sheet Metal · SMW 105 · LR-2026-0139', confirm: 'Verification confirmed · 1 of 2 for LR-0139', dt: '2026-09-05', date: 'Sep 5, 2026', outcome: 'Filed to HCM' },
    { ref: '651219', detail: 'Prakash Anand — Jrny Sheet Metal · SMW 105 · LR-2026-0139', confirm: 'Verification confirmed · 2 of 2 for LR-0139', dt: '2026-09-05', date: 'Sep 5, 2026', outcome: 'Filed to HCM' },
    { ref: '512446', detail: 'Tomás D. Ibanez — Foreman Pipefitter · UA 250 · LR-2026-0137', confirm: 'Awaiting INN verification', dt: '2026-09-03', date: '—', outcome: 'In verification' },
  ];
  const DNAMES = ['J. Okafor', 'R. Castellanos', 'M. Tran', 'D. Kowalski', 'A. Reyes', 'S. Lindqvist', 'H. Nakamura', 'B. Whitaker', 'C. Mbeki', 'E. Fontaine', 'G. Petrov', 'L. Herrera', 'N. Okoye', 'P. Salazar', 'T. Grigoryan', 'V. Ashford', 'W. Dominguez', 'K. Ferreira', 'F. Lombardi', 'O. Sandoval', 'I. Vasquez', 'U. Beckett'];
  const DTRADES = ['Jrny Plumber', 'Foreman Plumber', 'Jrny Pipefitter', 'Foreman Pipefitter', 'Jrny Sheet Metal'];
  const DUNIONS = ['UA Local 78', 'UA Local 250', 'SMW 105', 'UA Local 761'];
  const DOUT = ['Filed to HCM', 'Filed to HCM', 'Filed to HCM', 'In verification', 'Filed to HCM', 'Filed to HCM'];
  const gap = [4, 9, 13, 21, 27, 34, 41, 52, 63, 74, 88, 102, 121, 143, 165, 188, 214, 241, 268, 296, 322, 348];
  DNAMES.forEach((nm, i) => {
    const d = new Date(2026, 8, 9); d.setDate(d.getDate() - gap[i]);
    const out = DOUT[i % DOUT.length];
    rows.push({
      ref: String(510000 + i * 731),
      detail: `${nm} — ${DTRADES[i % 5]} · ${DUNIONS[i % 4]} · LR-2026-0${98 + i}`,
      confirm: out === 'Filed to HCM' ? 'Packet filed · record 3000095' + String(20150000 + i * 137) : 'Awaiting INN verification',
      dt: d.toISOString().slice(0, 10), date: out === 'Filed to HCM' ? fmtDate(d) : '—', outcome: out,
    });
  });
  return rows;
}
