import { supabase } from '@/lib/supabase'

/**
 * Composable pentru a folosi clientul Supabase în componentele Vue
 * @example
 * const { supabase } = useSupabase()
 * const { data, error } = await supabase.from('table_name').select()
 */
export function useSupabase() {
  return {
    supabase
  }
}

