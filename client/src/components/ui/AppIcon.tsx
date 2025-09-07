// src/components/ui/AppIcon.tsx
import * as React from 'react';
import * as Lucide from 'lucide-react';

type IconName =
  | 'file'
  | 'file-csv'
  | 'file-pdf'
  | 'file-json'
  | 'file-xlsx'
  | 'download'
  | 'copy'
  | 'search'
  | 'archive'
  | 'play'
  | 'pause'
  | 'stop'
  | 'edit'
  | 'trash'
  | 'eye'
  | 'settings'
  | 'filter'
  | 'calendar'
  | 'users'
  | 'mail'
  | 'message-square'
  | 'bar-chart'
  | 'pie-chart'
  | 'line-chart'
  | 'table'
  | 'image'
  | 'link'
  | 'cloud'
  | 'database'
  | 'refresh'
  | 'check-circle'
  | 'x-circle'
  | 'alert-circle'
  | 'clock'
  | 'arrow-right'
  | 'arrow-down'
  | 'arrow-up'
  | 'more-vertical'
  | 'zap'
  | 'target'
  | 'dollar-sign'
  | 'upload'
  | 'share'
  | 'hard-drive'
  | 'wifi'
  | 'wifi-off'
  | 'activity'
  | 'plus'
  | 'minus'
  | 'x'
  | 'check'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'warehouse'
  | 'calculator'
  | 'package'
  | 'arrow-up-down';

const map: Record<IconName, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // File icons - prefer precise icons if present in our lucide version; fall back gracefully
  file: Lucide.File ?? Lucide.FileStack ?? Lucide.FileArchive ?? (() => null as any),
  'file-csv': Lucide.FileSpreadsheet ?? Lucide.File ?? (() => null as any),
  'file-pdf': Lucide.FileText ?? Lucide.File ?? (() => null as any),
  'file-json': Lucide.FileJson ?? Lucide.FileCode ?? Lucide.FileText ?? Lucide.File ?? (() => null as any),
  'file-xlsx': Lucide.FileSpreadsheet ?? Lucide.File ?? (() => null as any),
  'image': Lucide.FileImage ?? Lucide.Image ?? Lucide.File ?? (() => null as any),
  'archive': Lucide.FileArchive ?? Lucide.Archive ?? (() => null as any),
  
  // Action icons
  download: Lucide.Download ?? (() => null as any),
  upload: Lucide.Upload ?? (() => null as any),
  copy: Lucide.Copy ?? (() => null as any),
  search: Lucide.Search ?? Lucide.SearchCheck ?? (() => null as any),
  edit: Lucide.Edit ?? Lucide.Pen ?? (() => null as any),
  trash: Lucide.Trash2 ?? Lucide.Trash ?? (() => null as any),
  eye: Lucide.Eye ?? (() => null as any),
  settings: Lucide.Settings ?? (() => null as any),
  filter: Lucide.Filter ?? (() => null as any),
  share: Lucide.Share ?? (() => null as any),
  
  // Media control icons
  play: Lucide.Play ?? (() => null as any),
  pause: Lucide.Pause ?? (() => null as any),
  stop: Lucide.SquareStop ?? Lucide.Square ?? (() => null as any),
  
  // Navigation icons
  'arrow-right': Lucide.ArrowRight ?? (() => null as any),
  'arrow-down': Lucide.ArrowDown ?? (() => null as any),
  'arrow-up': Lucide.ArrowUp ?? (() => null as any),
  'chevron-down': Lucide.ChevronDown ?? (() => null as any),
  'chevron-up': Lucide.ChevronUp ?? (() => null as any),
  'chevron-left': Lucide.ChevronLeft ?? (() => null as any),
  'chevron-right': Lucide.ChevronRight ?? (() => null as any),
  'more-vertical': Lucide.MoreVertical ?? (() => null as any),
  
  // Status icons
  'check-circle': Lucide.CheckCircle ?? Lucide.Check ?? (() => null as any),
  'x-circle': Lucide.XCircle ?? Lucide.X ?? (() => null as any),
  'alert-circle': Lucide.AlertCircle ?? Lucide.AlertTriangle ?? (() => null as any),
  check: Lucide.Check ?? (() => null as any),
  x: Lucide.X ?? (() => null as any),
  plus: Lucide.Plus ?? (() => null as any),
  minus: Lucide.Minus ?? (() => null as any),
  
  // Data & chart icons
  'bar-chart': Lucide.BarChart3 ?? Lucide.BarChart ?? (() => null as any),
  'pie-chart': Lucide.PieChart ?? (() => null as any),
  'line-chart': Lucide.LineChart ?? (() => null as any),
  table: Lucide.Table ?? (() => null as any),
  
  // Communication icons
  mail: Lucide.Mail ?? (() => null as any),
  'message-square': Lucide.MessageSquare ?? (() => null as any),
  users: Lucide.Users ?? (() => null as any),
  
  // Utility icons
  calendar: Lucide.Calendar ?? (() => null as any),
  clock: Lucide.Clock ?? (() => null as any),
  link: Lucide.Link ?? (() => null as any),
  cloud: Lucide.Cloud ?? (() => null as any),
  database: Lucide.Database ?? (() => null as any),
  'hard-drive': Lucide.HardDrive ?? (() => null as any),
  wifi: Lucide.Wifi ?? (() => null as any),
  'wifi-off': Lucide.WifiOff ?? (() => null as any),
  activity: Lucide.Activity ?? (() => null as any),
  refresh: Lucide.RefreshCw ?? Lucide.Refresh ?? (() => null as any),
  zap: Lucide.Zap ?? (() => null as any),
  target: Lucide.Target ?? (() => null as any),
  'dollar-sign': Lucide.DollarSign ?? (() => null as any),
  warehouse: Lucide.Warehouse ?? Lucide.Building ?? (() => null as any),
  calculator: Lucide.Calculator ?? Lucide.Hash ?? (() => null as any),
  package: Lucide.Package ?? Lucide.Package2 ?? Lucide.Box ?? (() => null as any),
  'arrow-up-down': Lucide.ArrowUpDown ?? Lucide.ArrowUp ?? (() => null as any),
};

export type AppIconProps = React.SVGProps<SVGSVGElement> & { name: IconName };

export function AppIcon({ name, ...props }: AppIconProps) {
  const Cmp = map[name] ?? map.file;
  return <Cmp aria-hidden="true" {...props} />;
}
