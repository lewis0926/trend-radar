export interface Returns {
  '5d': number
  '21d': number
  '63d': number
}

export interface IndexItem {
  ticker: string
  name: string
  returns: Returns
}

export interface SectorItem {
  ticker: string
  name: string
  sector: string
  composite_score: number
  returns: Returns
}

export interface NotableMover {
  ticker: string
  return_pct: number
  z_score: number
  direction: 'up' | 'down'
}

export interface Report {
  as_of: string
  indices: IndexItem[]
  sectors: SectorItem[]
  notable_movers: NotableMover[]
}
