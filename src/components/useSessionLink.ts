import { KIOSK_SESSION_URL } from '../lib/data';
import { useApp } from '../store/app';
import { useUi } from '../store/ui';

/* Copying the tradesman session link puts this device into kiosk mode:
   only New onboarding stays reachable until the specialist ends the session. */
export function useSessionLink() {
  const active = useApp((s) => s.kioskActive);
  const setKiosk = useApp((s) => s.setKiosk);
  const showToast = useUi((s) => s.showToast);
  return {
    active,
    icon: active ? 'check' : 'link',
    label: active ? 'Link copied' : 'Copy session link',
    copy: () => {
      navigator.clipboard?.writeText(KIOSK_SESSION_URL).catch(() => {});
      setKiosk(true);
      showToast('Session link copied — this device is now limited to New onboarding. Hand it to the tradesman.', 'link');
    },
    end: () => {
      setKiosk(false);
      showToast('Session ended — full access restored.', 'unlock');
    },
    restricted: () => showToast('Restricted — a session link is active on this device. End the session to unlock.', 'lock'),
  };
}
