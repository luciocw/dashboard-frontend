# 🎨 Visual Redesign Roadmap - Dynasty Dashboard

> Cronograma de prompts visuais para o v0.dev/Vercel
> Última atualização: 07/01/2026

---

## Status Geral

| # | Componente | Status | Data |
|---|------------|--------|------|
| 1 | Header + Hero Section | ✅ Implementado | 07/01/2026 |
| 2 | League Card | ✅ Implementado | 07/01/2026 |
| 3 | Matchup Card | ✅ Implementado | 07/01/2026 |
| 4 | Standings Table | ✅ Implementado | 07/01/2026 |
| 5 | Power Rankings | 🔜 Pendente | - |
| 6 | Design System / Color Palette | 🔜 Pendente | - |

---

## Prompts Detalhados

### PROMPT 1 - Header + Hero Section ✅
```
Create a header and hero section for a fantasy football dashboard with dark theme:

Header:
- Logo: styled text "Dynasty Dashboard" (no emoji), modern font
- Season selector dropdown (2024, 2025, 2026)
- User avatar (circular image) with display name
- Logout button
- Background with subtle gradient or geometric pattern

Hero section (after login):
- Personalized greeting "Hello, [username]"
- 4 stat cards in grid: "Leagues", "Dynasty", "Record" (W-L format like "45-23"), "Titles"
- Cards with SVG icons (not emojis), large numbers, small labels
- "Titles" card with golden highlight/glow if value > 0
- Win Rate badge below cards (green if >=60%, blue if >=50%, red if <50%)

Style: Dark theme, glassmorphism cards, vibrant accent colors (cyan/blue primary, gold for achievements), modern and professional look.
Tech: React + Tailwind CSS only, lucide-react for icons.
```

---

### PROMPT 2 - League Card ✅
```
Create a league card component for a fantasy football dashboard with dark theme:
- League avatar (circular image) on the left
- League name (main title) 
- Season record prominent (e.g., "8-3")
- Colored tags/badges row: league type (DYNASTY in purple, REDRAFT in gray), format (PPR in blue, SF in green, IDP in red), size (10T, 12T in gray)
- Lineup section: small badges showing positions (QB, 2RB, 2WR, TE, FLEX, SUPER_FLEX)
- Player count by position: colored text (QB 3 in red, RB 8 in green, WR 10 in blue, TE 3 in yellow)
- Draft Picks section: badges with year and round (e.g., '25 R1 in gold, '26 R2 in silver)
- Hover state with elevation/shadow animation
- Clickable (pointer cursor)

Style: Dark theme, glassmorphism or gradient border, professional sports app look.
Tech: React + Tailwind CSS only, lucide-react for icons.
```

---

### PROMPT 3 - Matchup Card ✅
```
Create a matchup/versus card for weekly fantasy football games with dark theme:
- Two teams side by side
- Each side: manager avatar (circular), manager name, large score number
- Visual indicator for winning team (green glow, border, or highlight)
- Small record below each name (e.g., "8-3")
- If it's MY matchup, special blue border or highlight
- Center divider with styled "VS" text
- Tied game state with yellow/gold indicator

Style: Dark theme, competitive sports feel, clear visual hierarchy showing who's winning.
Tech: React + Tailwind CSS only, lucide-react for icons.
```

---

### PROMPT 4 - Standings Table ✅
```
Create a standings/leaderboard table for fantasy football with dark theme:
- Columns: Rank (#), Manager (avatar + name), Record (W-L), Points, Win%
- Current user row highlighted with blue background
- Top 3 with visual indicators (gold/silver/bronze badges or colored ranks)
- Hover state on rows
- Responsive for mobile (prioritize rank, name, record)
- Alternating row colors or dividers
- Points in cyan/blue color, Win% in green color

Style: Dark theme, clean data table, professional sports statistics look.
Tech: React + Tailwind CSS only, lucide-react for icons.
```

---

### PROMPT 5 - Power Rankings 🔜
```
Create a Power Rankings visualization for fantasy football with dark theme:
- Ranked list of teams (not table)
- Each item: rank badge (1-3 special gold/silver/bronze), avatar, team name, record, total points, average points
- Power Score prominently displayed (large number in cyan/blue)
- Trend indicator: green arrow up (rising), red arrow down (falling), gray dash (stable)
- Top 3 with special styling (glow, border, or background)
- Header with title "Power Rankings" and short explanation text

Style: Dark theme, modern card-based list, gamification feel with ranks and badges.
Tech: React + Tailwind CSS only, lucide-react for icons.
```

---

### PROMPT 6 - Design System / Color Palette 🔜
```
Create a design system preview for a fantasy football dashboard with dark theme:

Show a component that displays:
- Color palette: background colors, card colors, accent colors (primary blue/cyan, success green, danger red, warning yellow, gold for achievements)
- Player position colors: QB (red), RB (green), WR (blue), TE (orange/yellow), K (purple), DEF (gray)
- Typography scale: headings (h1-h4), body text, captions, labels
- Button variants: primary, secondary, ghost, with hover states
- Badge variants: different colors and sizes
- Card example with glassmorphism effect
- Icon examples from lucide-react

Style: Dark theme (#0f172a background), modern, professional sports app aesthetic.
Tech: React + Tailwind CSS only, lucide-react for icons.
```

---

## 🎨 Padrões Estabelecidos

### Cores Principais
- Background: `slate-950`, `slate-900`
- Cards: `slate-800/50` com `backdrop-blur-sm`
- Primary: `cyan-400`, `cyan-500`
- Borders: `slate-700/60`

### Posições (cores)
- QB: `red-400`
- RB: `green-400`
- WR: `blue-400`
- TE: `yellow-400`
- K: `purple-400`
- DEF: `orange-400`

### Badges de Liga
- DYNASTY: `purple-500/20`
- REDRAFT: `slate-500/20`
- SF: `green-500/20`
- IDP: `red-500/20`

### Draft Picks
- Round 1: `yellow-500/20` (gold)
- Round 2: `slate-300/20` (silver)
- Round 3: `amber-700/20` (bronze)
- Round 4+: `slate-600/20`

---

## 📅 Histórico

| Data | Alteração |
|------|-----------|
| 07/01/2026 | Criação do cronograma |
| 07/01/2026 | ✅ Prompt 1 - Header + Hero |
| 07/01/2026 | ✅ Prompt 2 - League Card |
| 07/01/2026 | ✅ Prompt 3 - Matchup Card |
