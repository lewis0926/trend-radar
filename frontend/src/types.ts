export interface Returns {
  '5d': number
  '21d': number
  '63d': number
}

export interface IndexItem {
  ticker: string
  name: string
  region: 'us' | 'global'
  returns: Returns
}

export interface SectorItem {
  ticker: string
  name: string
  sector: string
  composite_score: number
  returns: Returns
}

export interface CandleData {
  date: string
  open: number
  high: number
  low: number
  close: number
  ma20: number | null
  ma50: number | null
  ma200: number | null
}

export interface CommodityItem {
  ticker: string
  name: string
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
  commodities: CommodityItem[]
  sectors: SectorItem[]
  notable_movers: NotableMover[]
}
