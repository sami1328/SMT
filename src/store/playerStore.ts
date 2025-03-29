import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Define player stats interfaces
export interface PhysicalStats {
  acceleration: number
  agility: number
  balance: number
  jumping: number
  reactions: number
  sprint_speed: number
  stamina: number
  strength: number
}

export interface MentalStats {
  aggression: number
  attacking_position: number
  composure: number
  interceptions: number
  vision: number
}

export interface TechnicalStats {
  ball_control: number
  crossing: number
  curve: number
  defensive_awareness: number
  dribbling: number
  fk_accuracy: number
  finishing: number
  heading_accuracy: number
  long_passing: number
  long_shots: number
  penalties: number
  short_passing: number
  shot_power: number
  sliding_tackle: number
  standing_tackle: number
  volleys: number
}

export interface GoalkeepingStats {
  gk_diving: number
  gk_handling: number
  gk_kicking: number
  gk_positioning: number
  gk_reflexes: number
}

export interface Player {
  id?: string
  full_name: string
  date_of_birth: string
  nationality: string
  height: number
  weight: number
  preferred_foot: 'left' | 'right'
  position: string
  created_by?: string
  created_at?: string
  updated_at?: string
  physical_stats: PhysicalStats
  mental_stats: MentalStats
  technical_stats: TechnicalStats
  goalkeeping_stats: GoalkeepingStats
}

interface PlayerStore {
  currentPlayer: Player | null
  searchQuery: string
  searchResults: Player[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setSearchQuery: (query: string) => void
  searchPlayers: () => Promise<void>
  createPlayer: (player: Player) => Promise<string | null>
  updatePlayer: (playerId: string, player: Partial<Player>) => Promise<boolean>
  getPlayer: (playerId: string) => Promise<void>
  resetPlayer: () => void
  updatePlayerField: (field: keyof Player | string, value: any) => void
}

// Helper to create default stats with zeros
function createDefaultStats() {
  return {
    physical_stats: {
      acceleration: 0,
      agility: 0,
      balance: 0,
      jumping: 0,
      reactions: 0,
      sprint_speed: 0,
      stamina: 0,
      strength: 0
    },
    mental_stats: {
      aggression: 0,
      attacking_position: 0,
      composure: 0,
      interceptions: 0,
      vision: 0
    },
    technical_stats: {
      ball_control: 0,
      crossing: 0,
      curve: 0,
      defensive_awareness: 0,
      dribbling: 0,
      fk_accuracy: 0,
      finishing: 0,
      heading_accuracy: 0,
      long_passing: 0,
      long_shots: 0,
      penalties: 0,
      short_passing: 0,
      shot_power: 0,
      sliding_tackle: 0,
      standing_tackle: 0,
      volleys: 0
    },
    goalkeeping_stats: {
      gk_diving: 0,
      gk_handling: 0,
      gk_kicking: 0,
      gk_positioning: 0,
      gk_reflexes: 0
    }
  }
}

// Initialize default player
const defaultPlayer: Player = {
  full_name: '',
  date_of_birth: '',
  nationality: '',
  height: 0,
  weight: 0,
  preferred_foot: 'right',
  position: '',
  ...createDefaultStats()
}

// Add validation helper function
function validateStatValue(value: number): number {
  if (value < 0) return 0
  if (value > 100) return 100
  return value
}

// Create the store
export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentPlayer: null,
  searchQuery: '',
  searchResults: [],
  isLoading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  searchPlayers: async () => {
    const { searchQuery } = get()
    if (!searchQuery.trim()) {
      set({ searchResults: [] })
      return
    }

    set({ isLoading: true, error: null })
    const supabase = createClientComponentClient()

    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .ilike('full_name', `%${searchQuery}%`)
        .limit(10)

      if (error) throw error
      set({ searchResults: data || [] })
    } catch (error: any) {
      set({ error: error.message })
      console.error('Error searching players:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  createPlayer: async (player: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    set({ isLoading: true, error: null })
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from('players')
        .insert([{
          full_name: player.full_name,
          date_of_birth: player.date_of_birth,
          nationality: player.nationality,
          height: player.height,
          weight: player.weight,
          preferred_foot: player.preferred_foot,
          position: player.position,
          physical_stats: player.physical_stats,
          mental_stats: player.mental_stats,
          technical_stats: player.technical_stats,
          goalkeeping_stats: player.goalkeeping_stats
        }])
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned from insert')

      set({ 
        currentPlayer: data,
        isLoading: false,
        error: null
      })
      return data.id
    } catch (error) {
      console.error('Error creating player:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create player',
        isLoading: false 
      })
      return null
    }
  },

  updatePlayer: async (playerId: string, playerUpdates: Partial<Player>) => {
    set({ isLoading: true, error: null })
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase
        .from('players')
        .update({
          full_name: playerUpdates.full_name,
          date_of_birth: playerUpdates.date_of_birth,
          nationality: playerUpdates.nationality,
          height: playerUpdates.height,
          weight: playerUpdates.weight,
          preferred_foot: playerUpdates.preferred_foot,
          position: playerUpdates.position,
          physical_stats: playerUpdates.physical_stats,
          mental_stats: playerUpdates.mental_stats,
          technical_stats: playerUpdates.technical_stats,
          goalkeeping_stats: playerUpdates.goalkeeping_stats
        })
        .eq('id', playerId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned from update')

      set({ 
        currentPlayer: data,
        isLoading: false,
        error: null
      })
      return true
    } catch (error) {
      console.error('Error updating player:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update player',
        isLoading: false 
      })
      return false
    }
  },

  getPlayer: async (playerId) => {
    set({ isLoading: true, error: null })
    const supabase = createClientComponentClient()

    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()

      if (error) throw error
      set({ currentPlayer: data })
    } catch (error: any) {
      set({ error: error.message })
      console.error('Error fetching player:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  resetPlayer: () => {
    set({ currentPlayer: { ...defaultPlayer } })
  },

  updatePlayerField: (field: keyof Player | string, value: any) => {
    set((state) => {
      if (!state.currentPlayer) return state

      if (field.includes('.')) {
        // Handle nested fields (e.g., 'physical_stats.acceleration')
        const [parent, child] = field.split('.')
        const parentField = parent as keyof Player
        const childField = child as string

        const parentValue = state.currentPlayer[parentField] as Record<string, any>
        
        // Validate numeric values for stats
        const validatedValue = typeof value === 'number' ? validateStatValue(value) : value
        
        return {
          currentPlayer: {
            ...state.currentPlayer,
            [parentField]: {
              ...parentValue,
              [childField]: validatedValue
            }
          }
        }
      }

      // Handle top-level fields
      return {
        currentPlayer: {
          ...state.currentPlayer,
          [field]: value
        }
      }
    })
  }
})) 