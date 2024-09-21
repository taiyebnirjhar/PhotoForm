interface Background {
  id: number
  name: string
  url: string | null
}

interface Effect {
  id: number
  name: string
  filter: string
}


export type { Background, Effect }
