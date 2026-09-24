import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Icon } from '../ds';
import { TEAM_ADDRESS } from '../lib/data';
import type { EmailRec } from '../lib/types';
import { useApp, useEmails } from '../store/app';
import { emailStatusTone, stop } from '../lib/utils';
import { Pill } from '../components/Pill';
import { EmptyState } from '../components/EmptyState';
import { Scrim } from '../components/Modal';
import { Skel, SkelLines } from '../components/Paper';

type Tab = 'all' | 'out' | 'in';
const TABS: [Tab, string][] = [['all', 'All'], ['out', 'Sent'], ['in', 'Responses']];

interface Quick { mode: 'reply' | 'replyall' | 'forward'; to: string; cc: string; subject: string; body: string }

export function Emails() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const emails = useEmails();
  const setEmailFlag = useApp((s) => s.setEmailFlag);
  const addEmails = useApp((s) => s.addEmails);
  const collapsed = useApp((s) => s.emailGroupCollapsed);
  const toggleGroup = useApp((s) => s.toggleEmailGroup);
  const [tab, setTab] = useState<Tab>('all');
  const [quick, setQuick] = useState<Quick | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const sel = params.get('sel');
  const filtered = tab === 'all' ? emails : emails.filter((e) => e.dir === tab);
  const cur: EmailRec | null = filtered.find((e) => e.id === sel) || filtered[0] || null;
  const unread = emails.filter((e) => e.unread).length;

  const groups = useMemo(() => {
    const out: { name: string; rows: EmailRec[] }[] = [];
    filtered.forEach((e) => {
      let g = out.find((x) => x.name === e.peer);
      if (!g) { g = { name: e.peer, rows: [] }; out.push(g); }
      g.rows.push(e);
    });
    return out;
  }, [filtered]);

  const select = (e: EmailRec) => { setEmailFlag(e.id, false); setParams({ sel: e.id }); setQuick(null); };
  const startQuick = (mode: Quick['mode']) => {
    if (!cur) return;
    const strip = (x: string) => x.replace(/^((RE|FW):\s*)+/i, '');
    setQuick({ mode, to: mode === 'forward' ? '' : cur.dir === 'in' ? cur.fromAddr : cur.toAddr, cc: mode === 'replyall' ? cur.cc || 'dwhitfield@accoes.com' : '', subject: (mode === 'forward' ? 'FW: ' : 'RE: ') + strip(cur.subject), body: '' });
  };
  const sendQuick = () => {
    if (!quick || !cur || !quick.to.trim()) return;
    const rec: EmailRec = { id: 'eq' + Date.now(), dir: 'out', peer: cur.peer, subject: quick.subject, ref: cur.ref, time: 'Sep 9', status: 'Sent', attach: [], fromAddr: TEAM_ADDRESS, toAddr: quick.to, cc: quick.cc, body: quick.body || '(no message)' };
    addEmails([rec]);
    setQuick(null);
    setTab('all');
    setParams({ sel: rec.id });
  };
  const openRequest = () => { if (cur) navigate(`/requests/${cur.ref}`); };

  return (
    <div className="page-fill">
      <div className="page-bar" style={{ justifyContent: 'flex-start' }}>
        <h1 className="h1-sm" data-ds="page-title">Union emails</h1>
        {unread > 0 && <Pill tone="navy" style={{ padding: '2px 10px', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--primary)' }} />{unread} unread</Pill>}
        <span className="hint ml-auto">Sent from <span className="mono">{TEAM_ADDRESS}</span> · responses parsed automatically</span>
      </div>

      {emails.length > 0 ? (
        <div className="email-layout">
          <div className="col" style={{ background: 'var(--card)', borderRight: '1px solid var(--border)', overflow: 'auto' }}>
            <div className="seg" role="tablist" style={{ margin: '10px 12px', flex: '0 0 auto' }}>
              {TABS.map(([k, label]) => {
                const pool = k === 'all' ? emails : emails.filter((e) => e.dir === k);
                const un = pool.filter((e) => e.unread).length;
                return (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} className={`seg-btn${tab === k ? ' on' : ''}`} onClick={() => { setTab(k); setParams({}); }}>
                    {label} · {pool.length}
                    {un > 0 && <span className="count-badge" style={{ minWidth: 15, height: 15, fontSize: 9 }}>{un}</span>}
                  </button>
                );
              })}
            </div>
            {groups.map((g) => {
              const open = !collapsed[g.name];
              const un = g.rows.filter((e) => e.unread).length;
              return (
                <div key={g.name} className="col">
                  <button type="button" aria-expanded={open} aria-label={`${g.name} — ${open ? 'collapse' : 'expand'}`} className="list-row" data-ds="table-row" style={{ gap: 8, padding: '9px 16px', background: 'var(--ds-bg-gray-light)', position: 'sticky', top: 0, zIndex: 5 }} onClick={() => toggleGroup(g.name)}>
                    <Icon name={open ? 'chevron-down' : 'chevron-right'} size={13} style={{ color: 'var(--muted-foreground)' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', flex: 1 }}>{g.name}</span>
                    {un > 0 && <span className="count-badge">{un}</span>}
                    <span className="pill pill-muted mono" style={{ padding: '0 7px', fontSize: 10 }}>{g.rows.length}</span>
                  </button>
                  {open && g.rows.map((e) => {
                    const on = cur?.id === e.id;
                    return (
                      <button key={e.id} type="button" data-ds="table-row" className={`email-row${on ? ' on' : ''}`} aria-label={`${e.peer}: ${e.subject}`} onClick={() => select(e)}>
                        <div className="row" style={{ justifyContent: 'space-between', gap: 8, width: '100%' }}>
                          <span className="row" style={{ gap: 6, fontSize: 12, fontWeight: 600 }}>
                            {e.unread && <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--primary)', flex: '0 0 auto' }} />}
                            <Icon name={e.dir === 'in' ? 'mail' : 'send'} size={12} style={{ color: e.dir === 'in' ? 'var(--status-pre-approved)' : 'var(--primary)' }} />
                            {e.peer}
                          </span>
                          <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{e.time}</span>
                        </div>
                        <span className="truncate" style={{ fontSize: 12, fontWeight: e.unread ? 700 : 400, width: '100%' }}>{e.subject}</span>
                        <div className="row" style={{ gap: 6 }}>
                          {e.unread && <Pill tone="solid" xs>Unread</Pill>}
                          <Pill tone={emailStatusTone(e.status)} xs>{e.status}</Pill>
                          {e.attach.length > 0 && <Icon name="paperclip" size={12} style={{ color: 'var(--muted-foreground)' }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="col" style={{ padding: '16px 20px', gap: 12, minHeight: 0, overflow: 'auto' }}>
            {cur && (
              <div className="card col" data-ds="section-card" style={{ flex: 1 }}>
                <div className="col" style={{ gap: 8, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600 }}>{cur.subject}</h2>
                    <Pill tone={emailStatusTone(cur.status)}>{cur.status}</Pill>
                  </div>
                  <div className="row hint" style={{ gap: 16, flexWrap: 'wrap' }}>
                    <span><strong style={{ color: 'var(--foreground)' }}>From</strong> <span className="mono">{cur.fromAddr}</span></span>
                    <span><strong style={{ color: 'var(--foreground)' }}>To</strong> <span className="mono">{cur.toAddr}</span></span>
                    {cur.cc && <span><strong style={{ color: 'var(--foreground)' }}>Cc</strong> <span className="mono">{cur.cc}</span></span>}
                    <span className="ml-auto mono">{cur.time}</span>
                  </div>
                  {cur.attach.length > 0 && (
                    <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                      {cur.attach.map((a) => (
                        <button key={a.name} type="button" title="Preview attachment" className="btn-outline-xs" style={{ height: 'auto', padding: '4px 10px', fontWeight: 400 }} onClick={() => setPreview(a.name)}>
                          <Icon name="paperclip" size={12} style={{ color: 'var(--muted-foreground)' }} />{a.name}<Icon name="eye" size={12} style={{ color: 'var(--primary)' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px 20px', fontSize: 12, lineHeight: 1.7, flex: 1, whiteSpace: 'pre-wrap' }}>{cur.body}</div>
                {cur.parsedNote && (
                  <div className="row" style={{ gap: 8, padding: '10px 20px', borderTop: '1px solid var(--border)' }}>
                    <Pill tone="navy" icon="sparkles" iconSize={11}>Parsed automatically</Pill>
                    <span className="sub">{cur.parsedNote}</span>
                  </div>
                )}
                {quick && (
                  <div className="col" style={{ gap: 8, padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{quick.mode === 'forward' ? 'Forward' : quick.mode === 'replyall' ? 'Reply all' : 'Reply'}</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: '6px 8px', alignItems: 'center' }}>
                      <span className="label-sm">To</span>
                      <input className="input mono" aria-label="To" style={{ height: 28, fontSize: 11 }} value={quick.to} onChange={(e) => setQuick({ ...quick, to: e.target.value })} />
                      <span className="label-sm">Cc</span>
                      <input className="input mono" aria-label="Cc" style={{ height: 28, fontSize: 11 }} value={quick.cc} onChange={(e) => setQuick({ ...quick, cc: e.target.value })} />
                    </div>
                    <textarea className="textarea" aria-label="Message" placeholder="Write your message…" style={{ minHeight: 76, padding: '8px 10px' }} value={quick.body} onChange={(e) => setQuick({ ...quick, body: e.target.value })} />
                    <div className="row" style={{ gap: 8 }}>
                      <Button variant="action" size="sm" iconLeft="send" onClick={sendQuick}>Send</Button>
                      <button type="button" className="btn-flat mf" style={{ padding: '6px 10px' }} onClick={() => setQuick(null)}>Discard</button>
                    </div>
                  </div>
                )}
                <div className="card-foot" style={{ padding: '12px 20px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn-outline-sm" onClick={() => startQuick('reply')}><Icon name="reply" size={13} style={{ color: 'var(--muted-foreground)' }} />Reply</button>
                  <button type="button" className="btn-outline-sm" onClick={() => startQuick('replyall')}><Icon name="reply-all" size={13} style={{ color: 'var(--muted-foreground)' }} />Reply all</button>
                  <button type="button" className="btn-outline-sm" onClick={() => startQuick('forward')}><Icon name="forward" size={13} style={{ color: 'var(--muted-foreground)' }} />Forward</button>
                  <button type="button" className="btn-flat" style={{ height: 30, fontWeight: 600, padding: '0 12px' }} onClick={() => setEmailFlag(cur.id, !cur.unread)}>
                    <Icon name={cur.unread ? 'mail-open' : 'mail'} size={13} />{cur.unread ? 'Mark as read' : 'Mark as unread'}
                  </button>
                  <div className="ml-auto"><Button variant="action" size="sm" iconRight="arrow-right" onClick={openRequest}>Open labor request</Button></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState card={false} icon="send" iconSize={22} title="No union emails yet" body="Emails you send to unions and their responses appear here, tied to their labor request." />
      )}

      {preview && (
        <Scrim dark onClose={() => setPreview(null)} zIndex={610}>
          <div className="viewer-bar" role="dialog" aria-modal="true" aria-label="Attachment preview" onClick={stop}>
            <Icon name="paperclip" size={15} style={{ color: 'rgba(255,255,255,.75)' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{preview}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.75)' }}>Received attachment — preview before opening the request</span>
            <button type="button" className="nav-icon-btn ml-auto" aria-label="Close preview" onClick={() => setPreview(null)}><Icon name="x" size={16} /></button>
          </div>
          <div className="col" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, overflow: 'auto', padding: 24 }}>
            <div className="paper" onClick={stop} style={{ width: 440, height: 540, flex: '0 0 auto', padding: '32px 36px' }}>
              <div className="row" style={{ justifyContent: 'space-between', borderBottom: '2px solid #1F2937', paddingBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1F2937' }}>UNION DISPATCH DOCUMENT</span>
                <span className="round-icon" style={{ width: 30, height: 30, border: '2px solid #1F2937', fontSize: 8, fontWeight: 700, color: '#1F2937' }}>UA</span>
              </div>
              <div className="row" style={{ gap: 14, alignItems: 'stretch' }}>
                <span className="round-icon" style={{ width: 80, height: 100, background: '#E5E7EB', borderRadius: 4, color: '#9CA3AF' }}><Icon name="user" size={32} /></span>
                <div className="col flex-1" style={{ gap: 8, justifyContent: 'center' }}>
                  <Skel w="70%" h={6} bg="#C9CFD8" /><Skel w="56%" h={5} bg="#D8DDE4" /><Skel w="64%" h={5} bg="#D8DDE4" />
                </div>
              </div>
              <SkelLines widths={['92%', '85%', '88%', '60%']} style={{ marginTop: 6 }} />
              <span style={{ marginTop: 'auto', fontSize: 10, color: '#6B7280', textAlign: 'center' }}>{preview} — scanned photocopy as received</span>
            </div>
            <div className="row" style={{ gap: 8 }} onClick={stop}>
              <Button variant="outline" size="sm" onClick={() => setPreview(null)}>Close</Button>
              <Button variant="action" size="sm" iconRight="arrow-right" onClick={() => { setPreview(null); openRequest(); }}>Open labor request</Button>
            </div>
          </div>
        </Scrim>
      )}
    </div>
  );
}
