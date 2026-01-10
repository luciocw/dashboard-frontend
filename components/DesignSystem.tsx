import { memo } from 'react'
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Crown,
  Zap,
  Shield,
  Flame,
  Star,
  Check,
  X,
  AlertCircle,
  Info,
} from 'lucide-react'

export const DesignSystem = memo(function DesignSystem() {
  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <div className="container mx-auto space-y-12 px-4 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white">
            Dynasty Dashboard Design System
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            Sistema de design para o gerenciamento de fantasy football
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-white">Paleta de Cores</h2>
            <p className="text-slate-400">Cores base para backgrounds, cards e acentos</p>
          </div>

          {/* Background Colors */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">Background Colors</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-slate-950 ring-1 ring-slate-700" />
                <p className="text-sm font-medium text-white">Background</p>
                <p className="font-mono text-xs text-slate-400">slate-950</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-slate-900 ring-1 ring-slate-700" />
                <p className="text-sm font-medium text-white">Surface</p>
                <p className="font-mono text-xs text-slate-400">slate-900</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-slate-800 ring-1 ring-slate-700" />
                <p className="text-sm font-medium text-white">Card</p>
                <p className="font-mono text-xs text-slate-400">slate-800</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-slate-700 ring-1 ring-slate-600" />
                <p className="text-sm font-medium text-white">Border</p>
                <p className="font-mono text-xs text-slate-400">slate-700</p>
              </div>
            </div>
          </div>

          {/* Accent Colors */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">Accent Colors</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-cyan-500 shadow-lg shadow-cyan-500/20" />
                <p className="text-sm font-medium text-white">Primary (Cyan)</p>
                <p className="font-mono text-xs text-slate-400">cyan-500</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-green-500 shadow-lg shadow-green-500/20" />
                <p className="text-sm font-medium text-white">Success (Green)</p>
                <p className="font-mono text-xs text-slate-400">green-500</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-red-500 shadow-lg shadow-red-500/20" />
                <p className="text-sm font-medium text-white">Danger (Red)</p>
                <p className="font-mono text-xs text-slate-400">red-500</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-yellow-500 shadow-lg shadow-yellow-500/20" />
                <p className="text-sm font-medium text-white">Warning (Yellow)</p>
                <p className="font-mono text-xs text-slate-400">yellow-500</p>
              </div>
              <div className="space-y-2">
                <div className="h-24 rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30" />
                <p className="text-sm font-medium text-white">Gold (Achievements)</p>
                <p className="font-mono text-xs text-slate-400">yellow-400/500/600</p>
              </div>
            </div>
          </div>

          {/* Player Position Colors */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">Player Position Colors</h3>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="space-y-2">
                <div className="flex h-24 items-center justify-center rounded-lg bg-red-500/20 ring-2 ring-red-500/50">
                  <span className="text-3xl font-bold text-red-400">QB</span>
                </div>
                <p className="text-sm font-medium text-white">Quarterback</p>
                <p className="text-xs text-slate-400">red-400</p>
              </div>
              <div className="space-y-2">
                <div className="flex h-24 items-center justify-center rounded-lg bg-green-500/20 ring-2 ring-green-500/50">
                  <span className="text-3xl font-bold text-green-400">RB</span>
                </div>
                <p className="text-sm font-medium text-white">Running Back</p>
                <p className="text-xs text-slate-400">green-400</p>
              </div>
              <div className="space-y-2">
                <div className="flex h-24 items-center justify-center rounded-lg bg-blue-500/20 ring-2 ring-blue-500/50">
                  <span className="text-3xl font-bold text-blue-400">WR</span>
                </div>
                <p className="text-sm font-medium text-white">Wide Receiver</p>
                <p className="text-xs text-slate-400">blue-400</p>
              </div>
              <div className="space-y-2">
                <div className="flex h-24 items-center justify-center rounded-lg bg-yellow-500/20 ring-2 ring-yellow-500/50">
                  <span className="text-3xl font-bold text-yellow-400">TE</span>
                </div>
                <p className="text-sm font-medium text-white">Tight End</p>
                <p className="text-xs text-slate-400">yellow-400</p>
              </div>
              <div className="space-y-2">
                <div className="flex h-24 items-center justify-center rounded-lg bg-purple-500/20 ring-2 ring-purple-500/50">
                  <span className="text-3xl font-bold text-purple-400">K</span>
                </div>
                <p className="text-sm font-medium text-white">Kicker</p>
                <p className="text-xs text-slate-400">purple-400</p>
              </div>
              <div className="space-y-2">
                <div className="flex h-24 items-center justify-center rounded-lg bg-orange-500/20 ring-2 ring-orange-500/50">
                  <span className="text-3xl font-bold text-orange-400">DEF</span>
                </div>
                <p className="text-sm font-medium text-white">Defense</p>
                <p className="text-xs text-slate-400">orange-400</p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-white">Tipografia</h2>
            <p className="text-slate-400">Escala tipográfica e hierarquia de texto</p>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6">
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-slate-700/50 pb-4">
                <h1 className="text-4xl font-extrabold text-white">Heading 1</h1>
                <span className="font-mono text-xs text-slate-400">text-4xl font-extrabold</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-700/50 pb-4">
                <h2 className="text-3xl font-bold text-white">Heading 2</h2>
                <span className="font-mono text-xs text-slate-400">text-3xl font-bold</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-700/50 pb-4">
                <h3 className="text-xl font-semibold text-white">Heading 3</h3>
                <span className="font-mono text-xs text-slate-400">text-xl font-semibold</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-700/50 pb-4">
                <h4 className="text-lg font-medium text-white">Heading 4</h4>
                <span className="font-mono text-xs text-slate-400">text-lg font-medium</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-700/50 pb-4">
                <p className="text-base text-slate-300">Body text</p>
                <span className="font-mono text-xs text-slate-400">text-base text-slate-300</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-700/50 pb-4">
                <p className="text-sm text-slate-400">Small / Caption</p>
                <span className="font-mono text-xs text-slate-400">text-sm text-slate-400</span>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-500">Label</p>
                <span className="font-mono text-xs text-slate-400">text-xs uppercase tracking-wider</span>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-white">Botões</h2>
            <p className="text-slate-400">Variantes de botões com estados hover</p>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6">
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-medium text-white transition-all">
                Primary
              </button>
              <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-white transition-all">
                Secondary
              </button>
              <button className="px-6 py-3 bg-transparent border border-slate-600 hover:bg-slate-800 rounded-xl font-medium text-slate-300 transition-all">
                Ghost
              </button>
              <button className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-medium text-white transition-all">
                Success
              </button>
              <button className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-medium text-white transition-all">
                Danger
              </button>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-white">Badges</h2>
            <p className="text-slate-400">Tags e badges para categorização</p>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-purple-500/40 bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300 uppercase">Dynasty</span>
                <span className="rounded-md border border-slate-500/40 bg-slate-500/20 px-2 py-0.5 text-xs font-semibold text-slate-300 uppercase">Redraft</span>
                <span className="rounded-md border border-green-500/40 bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-300 uppercase">SF</span>
                <span className="rounded-md border border-red-500/40 bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300 uppercase">IDP</span>
                <span className="rounded-md border border-blue-500/40 bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300 uppercase">PPR</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-yellow-500/40 bg-yellow-500/20 px-2.5 py-1 text-xs font-bold text-yellow-400">'25 R1</span>
                <span className="rounded-full border border-slate-400/40 bg-slate-400/20 px-2.5 py-1 text-xs font-bold text-slate-300">'25 R2</span>
                <span className="rounded-full border border-amber-600/40 bg-amber-600/20 px-2.5 py-1 text-xs font-bold text-amber-500">'26 R3</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-bold text-green-400">62.5%</span>
                <span className="inline-flex items-center rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs font-bold text-cyan-400">50.0%</span>
                <span className="inline-flex items-center rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-400">35.0%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-white">Cards</h2>
            <p className="text-slate-400">Exemplos de cards com glassmorphism</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Card */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10">
              <h3 className="mb-2 text-xl font-bold text-white">Card Básico</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Card padrão com borda, background semi-transparente e efeito hover.
              </p>
            </div>

            {/* Card with Icon */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/20 ring-2 ring-cyan-500/30">
                  <Trophy className="h-6 w-6 text-cyan-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Card com Ícone</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Card com badge de ícone e indicador de tendência.
              </p>
            </div>

            {/* Gold Achievement Card */}
            <div className="rounded-xl border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent p-6 shadow-lg shadow-yellow-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-500/30">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 ring-2 ring-yellow-500/50">
                  <Crown className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Conquista</h3>
                  <p className="text-xs text-yellow-400">Campeão 2025</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Card especial dourado para conquistas e títulos.
              </p>
            </div>
          </div>
        </section>

        {/* Icons */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-white">Ícones</h2>
            <p className="text-slate-400">Biblioteca Lucide React</p>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">Conquistas</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                    <span className="text-xs text-slate-400">Trophy</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Medal className="h-8 w-8 text-slate-300" />
                    <span className="text-xs text-slate-400">Medal</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Award className="h-8 w-8 text-amber-600" />
                    <span className="text-xs text-slate-400">Award</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Crown className="h-8 w-8 text-yellow-400" />
                    <span className="text-xs text-slate-400">Crown</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Star className="h-8 w-8 text-yellow-400" />
                    <span className="text-xs text-slate-400">Star</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">Tendências</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                    <span className="text-xs text-slate-400">Subindo</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <TrendingDown className="h-8 w-8 text-red-400" />
                    <span className="text-xs text-slate-400">Caindo</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">Ações</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-cyan-400" />
                    <span className="text-xs text-slate-400">Users</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Target className="h-8 w-8 text-cyan-400" />
                    <span className="text-xs text-slate-400">Target</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Zap className="h-8 w-8 text-yellow-400" />
                    <span className="text-xs text-slate-400">Zap</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="h-8 w-8 text-green-400" />
                    <span className="text-xs text-slate-400">Shield</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Flame className="h-8 w-8 text-red-400" />
                    <span className="text-xs text-slate-400">Flame</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-white">Status</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Check className="h-8 w-8 text-green-400" />
                    <span className="text-xs text-slate-400">Check</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <X className="h-8 w-8 text-red-400" />
                    <span className="text-xs text-slate-400">X</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-yellow-400" />
                    <span className="text-xs text-slate-400">Alert</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Info className="h-8 w-8 text-cyan-400" />
                    <span className="text-xs text-slate-400">Info</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm p-8 text-center">
          <p className="text-sm leading-relaxed text-slate-400">
            Este design system garante consistência em todos os componentes do Dynasty Dashboard.
          </p>
        </div>
      </div>
    </div>
  )
})
