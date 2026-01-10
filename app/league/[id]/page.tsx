import { LeagueDetailsContent } from '@/components/pages/league-details-content'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LeaguePage({ params }: Props) {
  const { id } = await params
  return <LeagueDetailsContent leagueId={id} />
}
