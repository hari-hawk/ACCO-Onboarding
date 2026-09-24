import { useNavigate } from 'react-router-dom';
import { Button, Icon, StageBar } from '../../ds';
import { OB_STAGES } from '../../lib/data';
import { useApp } from '../../store/app';
import { stageKey, useOnboarding } from '../../store/onboarding';
import { Pill } from '../../components/Pill';
import { SessionTimer } from '../../components/SessionTimer';
import { useSessionLink } from '../../components/useSessionLink';
import { useObDerived } from './derived';
import { IdentityCheck } from './IdentityCheck';
import { Extract } from './Extract';
import { Profile } from './Profile';
import { Sign } from './Sign';
import { Filed } from './Filed';
import { DocViewer, HcmBusy, PinDialog, PreResult } from './Modals';

const DONE_BY_STAGE: Record<string, string[]> = {
  precheck: [],
  extract: ['identity'],
  profile: ['identity', 'extract'],
  sign: ['identity', 'extract', 'profile'],
  filed: ['identity', 'extract', 'profile', 'sign'],
};

export function Onboarding() {
  const navigate = useNavigate();
  const key = useApp((s) => s.account)!;
  const stage = useOnboarding((s) => s.stage);
  const selectStage = useOnboarding((s) => s.selectStage);
  const d = useObDerived();
  const kiosk = useSessionLink();
  const back = () => navigate(key === 'dana' ? '/onboardings' : '/dashboard');

  return (
    <div className="page-fill">
      <div className="col" style={{ gap: 10, padding: '14px 40px', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="row" style={{ justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <button type="button" className="icon-btn s32" aria-label="Back" onClick={back}><Icon name="chevron-left" size={16} /></button>
            <h1 className="h1-sm" data-ds="page-title">{d.title}</h1>
            <span className="sub">{d.meta}</span>
            {d.ctx.prefilled && <Pill tone="navy" icon="mail">Dispatch received via union email</Pill>}
            <SessionTimer />
          </div>
          <div className="row" style={{ gap: 8 }}>
            {stage !== 'filed' && <Button variant="outline" size="sm" iconLeft={kiosk.icon} onClick={kiosk.copy}>{kiosk.label}</Button>}
            {stage !== 'filed' && <Button variant="outline" size="sm" iconLeft="save" onClick={() => navigate('/onboardings')}>Save &amp; resume</Button>}
          </div>
        </div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '100%' }}>
          <StageBar stages={OB_STAGES} activeId={stageKey(stage)} completed={DONE_BY_STAGE[stage]} onSelect={selectStage} />
        </div>
      </div>

      {stage === 'precheck' && <IdentityCheck />}
      {stage === 'extract' && <Extract />}
      {stage === 'profile' && <Profile />}
      {stage === 'sign' && <Sign />}
      {stage === 'filed' && <Filed />}

      <PreResult />
      <PinDialog />
      <HcmBusy />
      <DocViewer />
    </div>
  );
}
