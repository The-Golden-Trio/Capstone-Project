import { BookOpen, FileText, MessageCircle, PenLine } from 'lucide-react';

/** Bàn làm việc của ca: mỗi tab là một loại thứ người chơi dùng được. */
export type WorkbenchTab = 'work' | 'people' | 'docs' | 'notebook';

export const WORKBENCH_TABS: Array<{
  key: WorkbenchTab;
  label: string;
  icon: typeof PenLine;
  color: string;
  /** Số trên huy hiệu của tab đếm cái gì, để trình đọc màn hình đọc được. */
  badgeNoun?: string;
}> = [
  {
    key: 'work',
    label: 'Việc',
    icon: PenLine,
    color: '#eea7b4',
    badgeNoun: 'hẹn sắp tới giờ',
  },
  { key: 'people', label: 'Người', icon: MessageCircle, color: '#a6d2ea' },
  { key: 'docs', label: 'Tài liệu', icon: FileText, color: '#a8dbb9' },
  {
    key: 'notebook',
    label: 'Sổ tay',
    icon: BookOpen,
    color: '#f6b496',
    badgeNoun: 'dữ kiện',
  },
];

export const tabLabel = (key: WorkbenchTab) =>
  WORKBENCH_TABS.find((tab) => tab.key === key)?.label ?? key;

/** Chốt không nằm trong tab: nó là nút chính của ca, ở thanh trạng thái. */
export type ActionPlace = WorkbenchTab | 'trigger';

/** Liên lạc với người thuộc tab Người; mở tài liệu thuộc tab Tài liệu. */
export function placeOf(kind: string): ActionPlace {
  switch (kind) {
    case 'talk':
    case 'meeting':
    case 'message':
      return 'people';
    case 'open':
      return 'docs';
    case 'trigger':
      return 'trigger';
    default:
      return 'work';
  }
}
