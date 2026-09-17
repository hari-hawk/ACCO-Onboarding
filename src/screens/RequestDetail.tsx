import { useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Icon } from '../ds';
import { STATUS, TEAM_ADDRESS, UNIONS, UNION_EMAILS, buildSuperHistory, historyRowToRequest } from '../lib/data';
import type { EmailRec, KV, LaborRequest } from '../lib/types';
import { useAccount, useActiveEmail, useApp, useEmails, useRequests } from '../store/app';
import { unionCode, unionShort } from '../lib/utils';
import { Pill } from '../components/Pill';
import { Modal, Scrim } from '../components/Modal';

interface Draft { from: string; to: string; cc: string; subject: string; body: string }

const SUPER_HISTORY = buildSuperHistory();

function requestUnions(r: LaborRequest): string[] {
  const set: string[] = [];
  r.classes.forEach((c) => c.union.split(' + ').filter(Boolean).forEach((u) => { if (!set.includes(u)) set.push(u); }));
  return set;
}

function buildEmail(r: LaborRequest, acctName: string, union: string | null) {
  const to = union ? UNION_EMAILS[unionCode(union)] || 'dispatch@union.org' : UNION_EMAILS[unionCode(r.classes[0]?.union || '')] || 'dispatch@union.org';
  const clsList = union ? r.classes.filter((c) => c.union.includes(union)) : r.classes;
  const clsLines = clsList.map((c) => `  • ${c.open - c.got} × ${c.title} (${c.code}) — ${c.union}`).join('\n');
  const sf: Record<string, string> = {}; r.siteFields.forEach((f) => { sf[f.k] = f.v; });
  const rf: Record<string, string> = {}; r.fields.forEach((f) => { rf[f.k] = f.v; });
  return {
    to,
    subject: `Labor request ${r.id} — ${r.total - r.filled} openings — ${r.site}`,
    body: `To the Dispatch Office,\n\nACCO Engineered Systems requests the following dispatches for ${r.site}, starting ${rf['Start date & time'] || 'TBD'}:\n\n${clsLines}\n\nJob site: ${sf['Job site address'] || ''}\nSite contact: ${sf['Contact name'] || ''} · ${sf['Contact phone'] || ''} · ${sf['Contact email'] || ''}\nInstructions: ${sf['Site instructions'] || 'None'}\n\nPlease reply to this address with your dispatch confirmations — dispatch documents can be attached directly and are matched to this request automatically.\n\nRegards,\nACCO Onboarding — ${acctName}\n${TEAM_ADDRESS} · Ref ${r.id}`,
  };
}

function KVGrid({ title, fields, right }: { title: string; fields: KV[]; right?: string }) {
  return (
    <div className="card">
      <div className="card-head card-head-xs"><h3 className="h3">{title}</h3>{right && <span className="hint">{right}</span>}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px 16px', padding: '12px 20px' }}>
        {fields.map((f) => (
          <div key={f.k} className="col" style={{ gap: 2 }}>
            <span className="label-sm">{f.k}</span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>{f.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const acct = useAccount()!;
  const acctKey = useApp((s) => s.account)!;
  const email = useActiveEmail();
  const reqs = useRequests();
  const emails = useEmails();
  const updateRequest = useApp((s) => s.updateRequest);
  const addEmails = useApp((s) => s.addEmails);
  const enqueue = useApp((s) => s.enqueueOnboarding);
  const mdSentFor = useApp((s) => s.mdSentFor);
  const markMdSent = useApp((s) => s.markMdSent);

  const [justSubmitted, setJustSubmitted] = useState<boolean>(!!(location.state as { justSubmitted?: boolean } | null)?.justSubmitted);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferIdx, setTransferIdx] = useState<number | null>(null);
  const [transferPick, setTransferPick] = useState<number | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailUnionIdx, setEmailUnionIdx] = useState(0);
  const [draft, setDraft] = useState<Draft>({ from: '', to: '', cc: '', subject: '', body: '' });
  const [copied, setCopied] = useState(false);
  const [mdFiles, setMdFiles] = useState<string[]>([]);
  const mdRef = useRef<HTMLInputElement>(null);

  /* Live request first; otherwise a closed record opened from Reports, rebuilt read-only. */
  const histRow = SUPER_HISTORY.find((h) => h.ref === id);
  const sel = reqs.find((r) => r.id === id) ?? (histRow ? historyRowToRequest(histRow) : undefined);
  if (!sel) return <Navigate to="/dashboard" replace />;

  const st = STATUS[sel.status];
  const isOwner = !sel.owner || sel.owner === acct.name;
  const closedOut = sel.status === 'withdrawn' || sel.status === 'closed';
  const editable = !closedOut && isOwner && !sel.hist;
  const viewOnlyLabel = sel.hist ? 'View only — historical record' : `View only — owned by ${sel.owner}`;
  const selUnions = requestUnions(sel);
  const overdue = sel.status === 'overdue';
  const withdrawLabel = overdue ? 'Close request' : 'Withdraw request';
  const mdShow = acctKey === 'miguel' && editable && !sel.hist && !sel.response;
  const mdMini = acctKey === 'miguel' && editable && !sel.hist && !!sel.response;
  const mdSent = !!mdSentFor[sel.id];
  const transferCls = transferIdx !== null ? sel.classes[transferIdx] : null;

  const openEmail = () => {
    const d = buildEmail(sel, acct.name, selUnions.length > 1 ? selUnions[Math.min(emailUnionIdx, selUnions.length - 1)] : null);
    setDraft({ from: TEAM_ADDRESS, to: d.to, cc: email, subject: d.subject, body: d.body });
    setEmailEditing(false); setCopied(false); setEmailOpen(true);
  };
  const pickUnionTab = (i: number) => {
    const d = buildEmail(sel, acct.name, selUnions[i]);
    setEmailUnionIdx(i); setEmailEditing(false);
    setDraft({ from: TEAM_ADDRESS, to: d.to, cc: email, subject: d.subject, body: d.body });
  };
  const copyEmail = () => {
    const text = `From: ${draft.from}\nTo: ${draft.to}\nCc: ${draft.cc}\nSubject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const sendEmail = () => {
    const rec: EmailRec = { id: 'e' + Date.now(), dir: 'out', peer: sel.response ? sel.response.union : unionShort(sel.classes[0].union), subject: draft.subject, ref: sel.id, time: 'Just now', status: 'Sent — awaiting response', attach: [{ name: `${sel.id}-labor-request-form.pdf` }], fromAddr: draft.from, toAddr: draft.to, cc: draft.cc, body: draft.body };
    addEmails([rec]);
    updateRequest(sel.id, (r) => { r.emailed = true; r.pendBadge = 'Emailed just now'; r.activity.push({ t: 'Sep 7, just now', label: `Union email sent from ${draft.from} · To ${draft.to} · CC ${draft.cc}` }); });
    setEmailOpen(false); setJustSubmitted(false);
  };
  const openSentEmail = () => {
    const rec = emails.find((e) => e.ref === sel.id && e.dir === 'out') || emails.find((e) => e.ref === sel.id);
    navigate(rec ? `/emails?sel=${rec.id}` : '/emails');
  };
  const confirmWithdraw = () => {
    updateRequest(sel.id, (r) => {
      r.status = overdue ? 'closed' : 'withdrawn'; r.pendNote = ''; r.pendBadge = '';
      r.activity.push({ t: 'Sep 8, just now', label: overdue ? 'Request closed — 3+ days without a union response; HCM labor records closed and union notified' : 'Request withdrawn — union notified, open HCM labor records closed' });
    });
    setWithdrawOpen(false); setJustSubmitted(false);
  };
  const confirmTransfer = () => {
    if (transferPick === null || transferIdx === null) return;
    const union = UNIONS[transferPick];
    updateRequest(sel.id, (r) => {
      const cl = r.classes[transferIdx]; const remain = cl.open - cl.got; const subId = `${r.id}-S1`;
      cl.sub = { id: subId, note: `${remain} remaining opening${remain > 1 ? 's' : ''} transferred to ${union}` };
      r.activity.push({ t: 'Sep 7, just now', label: `Subticket ${subId} created — ${remain} opening${remain > 1 ? 's' : ''} of ${cl.code} transferred to ${union}, union notified` });
    });
    setTransferIdx(null); setTransferPick(null);
  };
  const setGot = (i: number, raw: string) => {
    updateRequest(sel.id, (r) => {
      const cl = r.classes[i];
      const n = Math.max(0, Math.min(cl.open, parseInt(raw.replace(/\D/g, ''), 10) || 0));
      const delta = n - cl.got; cl.got = n; r.filled += delta;
      r.activity = [{ t: 'Just now', label: `Union dispatch count updated — ${cl.code} now ${n} of ${cl.open} filled` }].concat(r.activity);
      if (r.classes.every((x) => x.got >= x.open)) { r.status = 'onboarding'; r.pendNote = ''; r.pendBadge = ''; }
      else if (r.status === 'onboarding') r.status = 'partial';
    });
  };
  const completeRow = (i: number) => updateRequest(sel.id, (r) => {
    const cl = r.classes[i]; const gained = cl.open - cl.got; cl.got = cl.open; r.filled += gained;
    r.activity.push({ t: 'Sep 7, just now', label: `Classification ${cl.code} marked complete — ${cl.open} of ${cl.open} filled` });
    if (r.classes.every((x) => x.got >= x.open)) { r.status = 'onboarding'; r.pendNote = ''; r.pendBadge = ''; }
  });
  const moveToOnboarding = () => {
    if (!sel.response) return;
    const t = sel.response.tradesmen[0];
    const rf: Record<string, string> = {}; sel.fields.forEach((x) => { rf[x.k] = x.v; });
    enqueue({
      name: t.full, cls: `${t.cls} · ${sel.response.union}`, lr: sel.id, site: sel.site, union: sel.response.union,
      doc: sel.response.attach[0]?.name || 'dispatch.pdf',
      fields: [{ k: 'Tradesman name', v: t.full, conf: 'high' }, { k: 'Classification', v: t.cls, conf: 'high' }, { k: 'Local union', v: sel.response.union, conf: 'high' }, { k: 'Start date', v: rf['Start date & time'] || 'TBD', conf: 'medium' }],
    });
    updateRequest(sel.id, (r) => { r.movedToOb = true; r.activity = [{ t: 'Just now', label: 'Moved to onboarding extraction — assigned to Dana Whitfield (onboarding specialist)' }].concat(r.activity); });
  };
  const mdSend = () => {
    if (!mdFiles.length) return;
    updateRequest(sel.id, (r) => r.activity.push({ t: 'Sep 9, just now', label: `Union confirmed off-platform — ${mdFiles.length} tradesman document${mdFiles.length > 1 ? 's' : ''} uploaded manually and routed to the onboarding specialist` }));
    markMdSent(sel.id); setMdFiles([]);
  };
  const mdPick = () => mdRef.current?.click();
  const mdInput = <input ref={mdRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.heic" style={{ display: 'none' }} onChange={(e) => { const names = Array.from(e.target.files || []).map((f) => f.name); if (names.length) setMdFiles((cur) => cur.concat(names)); e.target.value = ''; }} />;

  const pills = (s: string, navy?: boolean) => s.split(',').map((x) => x.trim()).filter(Boolean).map((x) => (
    <span key={x} className={`pill mono ${navy ? 'pill-navy' : 'pill-muted'}`} style={{ padding: '3px 10px', fontWeight: 500 }}>{x}</span>
  ));

  return (
    <div className="page-fill">
      <div className="page-bar" style={{ flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="icon-btn s32" aria-label={sel.hist ? 'Back to reports' : 'Back to dashboard'} onClick={() => navigate(sel.hist ? '/reports' : '/dashboard')}><Icon name="chevron-left" size={16} /></button>
          <h1 className="h1">Labor request <span className="mono" style={{ color: 'var(--primary)' }}>{sel.id}</span></h1>
          <Pill bg={st.bg} fg={st.fg} icon={st.icon} style={{ padding: '2px 10px' }}>{st.label}</Pill>
          {(!isOwner || sel.hist) && <Pill tone="muted" icon="eye" style={{ padding: '2px 10px' }}>{viewOnlyLabel}</Pill>}
        </div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span className="hint" style={{ marginRight: 8 }}><strong style={{ color: 'var(--foreground)' }}>Submitted</strong> {sel.submitted} · <strong style={{ color: 'var(--foreground)' }}>Filled</strong> <span className="mono">{sel.filled} / {sel.total}</span></span>
          {editable && (
            <>
              <Button variant="outline" size="sm" iconLeft="pencil" onClick={() => navigate(`/requests/${sel.id}/edit`)}>Edit request</Button>
              <button type="button" className="btn-danger-outline" onClick={() => setWithdrawOpen(true)}><Icon name="circle-x" size={13} />{withdrawLabel}</button>
              <Button variant={sel.emailed ? 'outline' : 'action'} size="sm" iconLeft="mail" onClick={openEmail}>{sel.emailed ? 'Email again' : 'Email union'}</Button>
              {sel.emailed && <Button variant="ghost" size="sm" iconLeft="external-link" onClick={openSentEmail}>View in Emails</Button>}
            </>
          )}
        </div>
      </div>

      <div className="page" style={{ gap: 12 }}>
        {justSubmitted && (
          <div className="notice-ok">
            <Icon name="circle-check" size={16} style={{ color: 'var(--status-pre-approved)', flex: '0 0 auto' }} />
            <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>Request submitted — labor records created instantly in HCM through the platform connection. Next: email the union to notify them of the openings.</span>
            <Button variant="action" size="sm" iconLeft="mail" onClick={openEmail}>Draft union email</Button>
          </div>
        )}
        <div className="two-col" style={{ gridTemplateColumns: '1fr 360px', gap: 12 }}>
          <div className="col" style={{ gap: 12 }}>
            <KVGrid title="Request details" fields={sel.fields} />
            <KVGrid title="Job site & legal employer" fields={sel.siteFields} />
            <div className="card">
              <div className="card-head card-head-xs"><h3 className="h3">Classifications</h3><span className="hint">Complete a row, or reopen the remainder as a subticket to another union</span></div>
              <div className="table-scroll">
                <div style={{ minWidth: 900 }}>
                  {sel.classes.map((c, i) => {
                    const done = c.got >= c.open;
                    const canAct = !done && editable;
                    const partial = c.got > 0 && c.got < c.open;
                    const hasPending = partial && !c.sub;
                    const canTransfer = canAct && !partial && !c.sub;
                    const transferOff = canAct && (partial || !!c.sub);
                    return (
                      <div key={i} className="col" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 90px 1fr 150px 1.4fr 230px', gap: 12, alignItems: 'center', padding: '10px 20px' }}>
                          <div className="col" style={{ gap: 1 }}>
                            <span style={{ fontSize: 12 }}><span className="mono" style={{ fontWeight: 600 }}>{c.code}</span> · {c.trade}</span>
                            <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{c.recNo || `HCM-${sel.id.slice(-4)}-C${i + 1}`}</span>
                          </div>
                          <span style={{ fontSize: 12 }}>{c.level}</span>
                          <span style={{ fontSize: 12 }}>{c.title}</span>
                          <div className="row" style={{ gap: 5 }}>
                            {canAct && <input className="input mono" inputMode="numeric" aria-label="Tradesmen dispatched by the union" title="Enter how many the union has provided" style={{ width: 40, height: 28, padding: 0, fontWeight: 600, textAlign: 'center' }} value={c.got} onChange={(e) => setGot(i, e.target.value)} />}
                            {done && <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{c.got}</span>}
                            <span className="sub" style={{ whiteSpace: 'nowrap' }}>of {c.open}</span>
                          </div>
                          <span style={{ fontSize: 12, lineHeight: 1.45 }}>{c.union}</span>
                          <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                            {canAct && (
                              <>
                                <button type="button" className="btn-outline-xs" onClick={() => completeRow(i)}><Icon name="circle-check" size={12} />Complete</button>
                                {canTransfer && <button type="button" className="btn-outline-xs" onClick={() => { setTransferIdx(i); setTransferPick(null); }}><Icon name="arrow-left-right" size={12} />Transfer</button>}
                                {transferOff && <button type="button" className="btn-outline-xs" disabled title="Pending remainder is tracked on the child ticket below"><Icon name="arrow-left-right" size={12} />Transfer</button>}
                              </>
                            )}
                            {done && <Pill tone="ok" icon="circle-check">Complete</Pill>}
                          </div>
                        </div>
                        {hasPending && (
                          <div className="row" style={{ gap: 8, padding: '2px 20px 10px 34px' }}>
                            <span style={{ display: 'inline-flex', width: 14, height: 14, borderLeft: '1.5px solid var(--border-strong)', borderBottom: '1.5px solid var(--border-strong)', borderRadius: '0 0 0 4px', marginTop: -8 }} />
                            <Pill tone="warn" icon="clock" iconSize={11}>Child · {sel.id.slice(-4)}-C{i + 1}-P</Pill>
                            <span className="hint flex-1">{c.open - c.got} pending tradesman{c.open - c.got > 1 ? 's' : ''} still awaited from the union — the {c.got} confirmed need no transfer</span>
                            {canAct && <button type="button" className="btn-outline-xs" style={{ height: 24, padding: '0 8px' }} onClick={() => { setTransferIdx(i); setTransferPick(null); }}><Icon name="arrow-left-right" size={11} />Transfer pending</button>}
                          </div>
                        )}
                        {c.sub && (
                          <div className="row" style={{ gap: 8, padding: '6px 20px 10px' }}>
                            <Pill tone="navy" icon="external-link" iconSize={11}>Subticket {c.sub.id}</Pill>
                            <span className="hint">{c.sub.note}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="col" style={{ gap: 12 }}>
            {sel.response && (
              <div className="card" style={{ border: '1px solid var(--status-pre-approved)' }}>
                <div className="card-head card-head-sm"><h3 className="h3">Union response</h3><Pill tone="navy" icon="sparkles" iconSize={11}>Parsed automatically</Pill></div>
                <div className="col" style={{ gap: 10, padding: '12px 20px' }}>
                  <span style={{ fontSize: 12, lineHeight: 1.5 }}><strong>{sel.response.union}</strong> · {sel.response.time} — {sel.response.summary}</span>
                  <div className="col" style={{ gap: 6 }}>
                    {sel.response.tradesmen.map((t) => (
                      <div key={t.full} className="row" style={{ alignItems: 'flex-start', gap: 8, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
                        <Avatar name={t.full} size="sm" style={{ width: 28, height: 28 }} />
                        <div className="col flex-1" style={{ gap: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{t.full}</span>
                          <span className="hint">{t.cls}</span>
                          <Pill tone={t.good ? 'ok' : 'navy'} xs style={{ alignSelf: 'flex-start' }}>{t.state}</Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    {sel.response.attach.map((a) => <span key={a.name} className="pill" style={{ border: '1px solid var(--border)', fontWeight: 400 }}><Icon name="paperclip" size={11} style={{ color: 'var(--muted-foreground)' }} />{a.name}</span>)}
                  </div>
                  <span className="hint" style={{ lineHeight: 1.5 }}>{sel.response.note}</span>
                  {mdMini && (
                    <div className="col" style={{ gap: 6, paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                      {mdSent ? (
                        <div className="row" style={{ gap: 6 }}><Icon name="circle-check" size={13} style={{ color: 'var(--status-pre-approved)' }} /><span style={{ fontSize: 11, color: 'var(--status-pre-approved)', fontWeight: 500 }}>Off-platform documents routed to the onboarding specialist.</span></div>
                      ) : (
                        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="chip-btn" onClick={mdPick}><Icon name="upload" size={12} style={{ color: 'var(--muted-foreground)' }} />Upload documents received off-platform</button>
                          {mdFiles.length > 0 && (
                            <>
                              <span className="hint">{mdFiles.length} file{mdFiles.length === 1 ? '' : 's'} ready</span>
                              <button type="button" className="chip-btn" style={{ border: 'none', background: 'var(--action)', color: '#fff' }} onClick={mdSend}>Route to specialist<Icon name="arrow-right" size={11} /></button>
                            </>
                          )}
                          {mdInput}
                        </div>
                      )}
                    </div>
                  )}
                  {sel.movedToOb ? (
                    <div className="row" style={{ gap: 8, padding: '10px 12px', background: 'var(--status-pre-approved-bg)', border: '1px solid var(--status-pre-approved)', borderRadius: 8 }}>
                      <Icon name="circle-check" size={14} style={{ color: 'var(--status-pre-approved)' }} />
                      <span style={{ fontSize: 12, color: 'var(--status-pre-approved)', fontWeight: 500 }}>Moved to onboarding extraction — now in the onboarding specialist's queue.</span>
                    </div>
                  ) : (
                    <Button variant="action" size="sm" iconRight="arrow-right" fullWidth onClick={moveToOnboarding}>Move to onboarding extraction</Button>
                  )}
                </div>
              </div>
            )}

            {mdShow && (
              <div className="card col" style={{ padding: '16px 20px', gap: 10 }}>
                <div className="col" style={{ gap: 2 }}>
                  <span className="overline">Union responded off-platform?</span>
                  <span className="sub" style={{ lineHeight: 1.5 }}>If the union confirmed in person or by phone and handed over the tradesman documents, drop them here and route them to the onboarding specialist.</span>
                </div>
                {mdFiles.length > 0 && (
                  <div className="col" style={{ gap: 4 }}>
                    {mdFiles.map((n, i) => (
                      <div key={`${n}-${i}`} className="row" style={{ gap: 6 }}>
                        <Icon name="paperclip" size={12} style={{ color: 'var(--muted-foreground)' }} />
                        <span className="truncate flex-1" style={{ fontSize: 11 }}>{n}</span>
                        <button type="button" className="ghost-icon" aria-label="Remove file" style={{ padding: 2 }} onClick={() => setMdFiles((cur) => cur.filter((_, j) => j !== i))}><Icon name="x" size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {mdSent ? (
                  <div className="row" style={{ gap: 8, padding: '8px 10px', background: 'var(--status-pre-approved-bg)', border: '1px solid var(--status-pre-approved)', borderRadius: 8 }}>
                    <Icon name="circle-check" size={14} style={{ color: 'var(--status-pre-approved)' }} />
                    <span style={{ fontSize: 11, color: 'var(--status-pre-approved)', fontWeight: 500, lineHeight: 1.4 }}>Documents routed to the onboarding specialist — they appear in Dana's extraction queue against this request.</span>
                  </div>
                ) : (
                  <>
                    <button type="button" className="dropzone" aria-label="Upload tradesman documents received off-platform" style={{ gap: 6, cursor: 'pointer', width: '100%', border: '1px dashed var(--border-strong)' }} onClick={mdPick}>
                      <Icon name="upload" size={16} style={{ color: 'var(--muted-foreground)' }} />
                      <span className="hint">Drop tradesman documents — multiple files at once</span>
                    </button>
                    {mdInput}
                    <Button variant="action" size="sm" iconRight="arrow-right" fullWidth disabled={mdFiles.length === 0} onClick={mdSend}>Move to onboarding specialist</Button>
                  </>
                )}
              </div>
            )}

            <div className="card col" style={{ padding: '16px 20px', gap: 10 }}>
              <span className="overline">Union activity</span>
              {sel.activity.map((a, i) => (
                <div key={i} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ display: 'inline-flex', flex: '0 0 auto', width: 8, height: 8, borderRadius: 999, background: 'var(--primary)', marginTop: 4 }} />
                  <div className="col" style={{ gap: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.5 }}>{a.label}</span>
                    <span className="hint mono">{a.t}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="card col" style={{ padding: '16px 20px', gap: 8 }}>
              <span className="overline">What happens next</span>
              <span className="sub" style={{ lineHeight: 1.6 }}>Union replies are parsed automatically: confirmed dispatches complete their classification and move to the onboarding specialist's extraction queue. When a union fills only part of a request, transfer the remainder to another union as a subticket — it keeps this request as its parent.</span>
            </div>
          </div>
        </div>
      </div>

      {withdrawOpen && (
        <Scrim onClose={() => setWithdrawOpen(false)}>
          <Modal width={440} label="Withdraw labor request">
            <span className="modal-title">{overdue ? 'Close' : 'Withdraw'} labor request {sel.id}?</span>
            <span className="sub" style={{ lineHeight: 1.6 }}>{overdue ? 'No union response after 3+ days — closing notifies the union the request has lapsed and closes the open HCM labor records. Within the first 3 days you would withdraw instead.' : 'Withdrawing notifies the union and closes the open HCM labor records.'} Confirmed tradesmen already in onboarding are not affected. The request moves to Withdrawn and can be resubmitted later.</span>
            <div className="modal-actions">
              <Button variant="ghost" size="sm" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
              <button type="button" className="btn-danger" onClick={confirmWithdraw}><Icon name="circle-x" size={13} />{withdrawLabel}</button>
            </div>
          </Modal>
        </Scrim>
      )}

      {transferCls && (
        <Scrim onClose={() => setTransferIdx(null)}>
          <Modal width={480} label="Reopen as subticket">
            <div className="col" style={{ gap: 2 }}>
              <span className="modal-title">Reopen as subticket — transfer to another union</span>
              <span className="sub">{transferCls.code} · {transferCls.title} — {transferCls.open - transferCls.got} remaining of {transferCls.open} openings</span>
            </div>
            <div className="col" style={{ gap: 6 }}>
              <span className="label">Transfer remaining openings to<span className="req"> *</span></span>
              <div className="col" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                {UNIONS.map((u, i) => (
                  <button key={u} type="button" className={`menu-item${transferPick === i ? ' on' : ''}`} style={{ gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)', fontWeight: 500 }} onClick={() => setTransferPick(i)}>
                    <span style={{ display: 'inline-flex', width: 14, justifyContent: 'center' }}>{transferPick === i && <Icon name="check" size={13} style={{ color: 'var(--primary)' }} />}</span>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <span className="hint" style={{ lineHeight: 1.5 }}>The subticket keeps this request as its parent — a new HCM labor record and union email are created for the remaining openings only.</span>
            <div className="modal-actions">
              <Button variant="ghost" size="sm" onClick={() => setTransferIdx(null)}>Cancel</Button>
              <Button variant="action" size="sm" iconLeft="send" disabled={transferPick === null} onClick={confirmTransfer}>Create subticket &amp; notify union</Button>
            </div>
          </Modal>
        </Scrim>
      )}

      {emailOpen && (
        <Scrim onClose={() => setEmailOpen(false)} zIndex={600}>
          <Modal width={640} label="Email union" padded={false} style={{ maxHeight: 'calc(100vh - 48px)', overflow: 'hidden' }}>
            <div className="modal-head">
              <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>Email union — {sel.id}</h3>
                <Pill tone="navy" icon="sparkles" iconSize={11}>Drafted by AI from the request record</Pill>
              </div>
              <button type="button" className="ghost-icon" aria-label="Close email draft" onClick={() => setEmailOpen(false)}><Icon name="x" size={15} /></button>
            </div>
            <div className="col" style={{ gap: 10, padding: '16px 20px', overflow: 'auto' }}>
              {selUnions.length > 1 && (
                <div className="col" style={{ gap: 6 }}>
                  <span className="hint">This request spans multiple unions — each union receives its own email with only its classifications.</span>
                  <div className="seg" style={{ padding: 2, alignSelf: 'flex-start' }}>
                    {selUnions.map((u, i) => (
                      <button key={u} type="button" role="tab" aria-selected={i === emailUnionIdx} className={`seg-btn${i === emailUnionIdx ? ' on' : ''}`} style={{ flex: 'none', padding: '4px 12px' }} onClick={() => pickUnionTab(i)}>{unionShort(u)}</button>
                    ))}
                  </div>
                </div>
              )}
              {!emailEditing ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: '10px 12px', alignItems: 'start', fontSize: 12 }}>
                    <span className="label-sm" style={{ paddingTop: 3 }}>From</span><div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>{pills(draft.from)}<span className="hint">Common team address</span></div>
                    <span className="label-sm" style={{ paddingTop: 3 }}>To</span><div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>{pills(draft.to, true)}<span className="hint">Pulled from the union record</span></div>
                    <span className="label-sm" style={{ paddingTop: 3 }}>Cc</span><div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>{pills(draft.cc)}<span className="hint">You — kept in the loop</span></div>
                    <span className="label-sm">Subject</span><span style={{ fontWeight: 600 }}>{draft.subject}</span>
                  </div>
                  <div style={{ padding: '14px 16px', background: 'var(--ds-bg-gray-light)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{draft.body}</div>
                  <span className="hint">Select <strong>Edit draft</strong> to change recipients or the message, or copy the content to share from your personal email instead.</span>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: '8px 12px', alignItems: 'center', fontSize: 12 }}>
                    <label htmlFor="em-from" className="label-sm">From</label><input id="em-from" className="input mono" style={{ height: 30, fontSize: 11 }} value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
                    <label htmlFor="em-to" className="label-sm">To</label><input id="em-to" className="input mono" style={{ height: 30, fontSize: 11 }} placeholder="Separate multiple addresses with commas" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
                    <label htmlFor="em-cc" className="label-sm">Cc</label><input id="em-cc" className="input mono" style={{ height: 30, fontSize: 11 }} placeholder="Separate multiple addresses with commas" value={draft.cc} onChange={(e) => setDraft({ ...draft, cc: e.target.value })} />
                    <label htmlFor="em-subject" className="label-sm">Subject</label><input id="em-subject" className="input" style={{ height: 30, fontWeight: 600 }} value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
                  </div>
                  <textarea aria-label="Email message" className="textarea" rows={12} style={{ padding: '14px 16px', lineHeight: 1.7 }} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
                  <span className="hint">Multiple addresses are comma-separated — they appear as pills once you're done. Select <strong>Done</strong> to review before sending.</span>
                </>
              )}
            </div>
            <div className="card-foot" style={{ padding: '12px 20px', flexWrap: 'wrap' }}>
              <button type="button" className="btn-flat" style={{ height: 32, fontWeight: 600 }} aria-label={emailEditing ? 'Finish editing' : 'Edit the email draft'} onClick={() => setEmailEditing((e) => !e)}>
                <Icon name={emailEditing ? 'check' : 'pencil'} size={13} />{emailEditing ? 'Done' : 'Edit draft'}
              </button>
              <div className="row ml-auto" style={{ gap: 8 }}>
                <button type="button" className="btn-outline-sm" style={{ height: 32, padding: '0 14px' }} onClick={copyEmail}><Icon name={copied ? 'check' : 'copy'} size={13} style={{ color: 'var(--muted-foreground)' }} />{copied ? 'Copied' : 'Copy content'}</button>
                <Button variant="action" size="sm" iconLeft="send" onClick={sendEmail}>Send from platform</Button>
              </div>
            </div>
          </Modal>
        </Scrim>
      )}
    </div>
  );
}
