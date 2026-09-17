import type { CSSProperties } from 'react';
import {
  ArrowDown, ArrowLeftRight, ArrowRight, ArrowUp, ArrowUpDown, Bell, Camera, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleCheck, CircleX, ClipboardCheck, Clock, Copy, Download, ExternalLink, Eye, FileStack, FileText, Filter, Forward, History,
  Inbox, Info, LayoutDashboard, LoaderCircle, Lock, LogIn, LogOut, Mail, MailOpen, MessageSquare, Minus, Paperclip, Pause, Pencil,
  Play, Plus, Reply, ReplyAll, RotateCw, Save, Scan, ScanSearch, Send, ShieldCheck, Sparkles, Timer, Trash2, TrendingDown,
  TrendingUp, TriangleAlert, Upload, User, UserPlus, Users, X, ZoomIn, ZoomOut,
  type LucideIcon, type LucideProps,
} from 'lucide-react';

/* Lucide is ACCO's real icon set. Names are the kebab-case Lucide ids used in the
   design. Importing each glyph explicitly keeps the bundle tree-shakeable — add a
   line here when a screen needs a new glyph. */
const REGISTRY: Record<string, LucideIcon> = {
  'arrow-down': ArrowDown, 'arrow-left-right': ArrowLeftRight, 'arrow-right': ArrowRight, 'arrow-up': ArrowUp, 'arrow-up-down': ArrowUpDown,
  bell: Bell, camera: Camera, check: Check, 'chevron-down': ChevronDown, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  'circle-check': CircleCheck, 'circle-x': CircleX, 'clipboard-check': ClipboardCheck, clock: Clock, copy: Copy, download: Download,
  'external-link': ExternalLink, eye: Eye, 'file-stack': FileStack, 'file-text': FileText, filter: Filter, forward: Forward, history: History,
  inbox: Inbox, info: Info, 'layout-dashboard': LayoutDashboard, 'loader-2': LoaderCircle, 'loader-circle': LoaderCircle, lock: Lock,
  'log-in': LogIn, 'log-out': LogOut, mail: Mail, 'mail-open': MailOpen, 'message-square': MessageSquare, minus: Minus, paperclip: Paperclip,
  pause: Pause, pencil: Pencil, play: Play, plus: Plus, reply: Reply, 'reply-all': ReplyAll, 'rotate-cw': RotateCw, save: Save, scan: Scan,
  'scan-search': ScanSearch, send: Send, 'shield-check': ShieldCheck, sparkles: Sparkles, timer: Timer, 'trash-2': Trash2,
  'trending-down': TrendingDown, 'trending-up': TrendingUp, 'triangle-alert': TriangleAlert, upload: Upload, user: User, 'user-plus': UserPlus,
  users: Users, x: X, 'zoom-in': ZoomIn, 'zoom-out': ZoomOut,
};

const SIZE_TOKEN: Record<string, string> = {
  xs: 'var(--icon-xs)', sm: 'var(--icon-sm)', md: 'var(--icon-md)', lg: 'var(--icon-lg)', xl: 'var(--icon-xl)', '2xl': 'var(--icon-2xl)', '3xl': 'var(--icon-3xl)',
};

export interface IconProps extends Omit<LucideProps, 'size' | 'ref'> {
  name: string;
  /** Token size (xs…3xl) or an explicit pixel size. */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number;
  style?: CSSProperties;
}

export function Icon({ name, size = 'md', style, strokeWidth = 2, ...rest }: IconProps) {
  const Cmp = REGISTRY[name];
  if (!Cmp) {
    if (import.meta.env.DEV) console.warn(`Icon "${name}" is not in the registry (src/ds/Icon.tsx)`);
    return null;
  }
  const px = typeof size === 'number' ? `${size}px` : SIZE_TOKEN[size] ?? size;
  return (
    <Cmp
      aria-hidden="true"
      focusable="false"
      strokeWidth={strokeWidth}
      style={{ width: px, height: px, flex: '0 0 auto', display: 'block', ...style }}
      {...rest}
    />
  );
}
