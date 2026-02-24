import {
  TrendingUp,
  BookOpen,
  Coffee,
  Code2,
  Heart,
  Zap,
  FileText,
} from "lucide-react";

export interface Note {
  id: number;
  title: string;
  preview: string;
  date: string;
  tag: string;
  tagColor: string;
  pinned: boolean;
  starred: boolean;
  wordCount: number;
  icon: any;
}

export const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: "Q2 Product Roadmap",
    preview: "Key initiatives for next quarter: redesign onboarding flow, ship mobile app v2, integrate AI suggestions into the editor...",
    date: "Today, 2:14 PM",
    tag: "Work",
    tagColor: "bg-blue-500/20 text-blue-400",
    pinned: true,
    starred: true,
    wordCount: 342,
    icon: TrendingUp,
  },
  {
    id: 2,
    title: "Book Notes — The Creative Act",
    preview: "Rick Rubin's philosophy: creativity is not a talent, it's a way of operating. The work chooses you...",
    date: "Today, 10:30 AM",
    tag: "Reading",
    tagColor: "bg-amber-500/20 text-amber-400",
    pinned: true,
    starred: false,
    wordCount: 218,
    icon: BookOpen,
  },
  {
    id: 3,
    title: "Weekend Trip — Coorg",
    preview: "Things to pack: rain jacket, hiking boots, camera. Book homestay at Silver Brook. Drive via Mysore highway...",
    date: "Yesterday",
    tag: "Personal",
    tagColor: "bg-green-500/20 text-green-400",
    pinned: false,
    starred: false,
    wordCount: 156,
    icon: Coffee,
  },
  {
    id: 4,
    title: "React Performance Patterns",
    preview: "useMemo vs useCallback — memoize values vs functions. React.memo for component-level memoization...",
    date: "Yesterday",
    tag: "Dev",
    tagColor: "bg-purple-500/20 text-purple-400",
    pinned: false,
    starred: true,
    wordCount: 489,
    icon: Code2,
  },
  {
    id: 5,
    title: "Morning Reflections",
    preview: "Gratitude for the small things — morning chai, the sound of rain, conversations that go nowhere but feel like home...",
    date: "Feb 22",
    tag: "Journal",
    tagColor: "bg-rose-500/20 text-rose-400",
    pinned: false,
    starred: false,
    wordCount: 93,
    icon: Heart,
  },
  {
    id: 6,
    title: "Design System Tokens",
    preview: "Color scales: primary-50 through primary-950. Spacing: 4px base unit. Typography: display/body/mono...",
    date: "Feb 21",
    tag: "Design",
    tagColor: "bg-cyan-500/20 text-cyan-400",
    pinned: false,
    starred: true,
    wordCount: 271,
    icon: Zap,
  },
  {
    id: 7,
    title: "Meeting Notes — Standup",
    preview: "Blocked: API integration waiting on backend. In progress: navbar component, theme context. Done: search overlay...",
    date: "Feb 20",
    tag: "Work",
    tagColor: "bg-blue-500/20 text-blue-400",
    pinned: false,
    starred: false,
    wordCount: 127,
    icon: FileText,
  },
  {
    id: 8,
    title: "Recipe — Malabar Fish Curry",
    preview: "Ingredients: 500g kingfish, coconut milk, raw mango, green chillies, curry leaves, mustard seeds...",
    date: "Feb 18",
    tag: "Personal",
    tagColor: "bg-green-500/20 text-green-400",
    pinned: false,
    starred: false,
    wordCount: 204,
    icon: Coffee,
  },
];

export const TAG_OPTIONS = [
  { label: "Work",     color: "bg-blue-500/20 text-blue-400",    icon: TrendingUp },
  { label: "Reading",  color: "bg-amber-500/20 text-amber-400",  icon: BookOpen   },
  { label: "Personal", color: "bg-green-500/20 text-green-400",  icon: Coffee     },
  { label: "Dev",      color: "bg-purple-500/20 text-purple-400",icon: Code2      },
  { label: "Journal",  color: "bg-rose-500/20 text-rose-400",    icon: Heart      },
  { label: "Design",   color: "bg-cyan-500/20 text-cyan-400",    icon: Zap        },
];

export const FOLDERS_DATA = [
  { id: 1, name: "Work",     count: 24, icon: TrendingUp, color: "text-blue-400"   },
  { id: 2, name: "Reading",  count: 17, icon: BookOpen,   color: "text-amber-400"  },
  { id: 3, name: "Dev",      count: 31, icon: Code2,      color: "text-purple-400" },
  { id: 4, name: "Journal",  count: 12, icon: Heart,      color: "text-rose-400"   },
  { id: 5, name: "Design",   count: 9,  icon: Zap,        color: "text-cyan-400"   },
  { id: 6, name: "Personal", count: 18, icon: Coffee,     color: "text-green-400"  },
];