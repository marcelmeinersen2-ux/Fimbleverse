// GENERATED FILE PLACEHOLDER.
// Real types are generated from the live schema with:  pnpm db:types
// (runs `supabase gen types typescript --local`). Do not hand-maintain
// row types once generation is wired up (CLAUDE.md 8.5). This minimal
// stand-in lets the app typecheck before the local Supabase is running.
export type Json =
  | string | number | boolean | null
  | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      households: {
        Row: { id: string; name: string; timezone: string; currency: string;
               created_at: string; updated_at: string };
        Insert: { id?: string; name?: string; timezone?: string; currency?: string };
        Update: Partial<Database['public']['Tables']['households']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: { id: string; display_name: string; created_at: string; updated_at: string };
        Insert: { id: string; display_name: string };
        Update: Partial<{ display_name: string }>;
        Relationships: [];
      };
      household_members: {
        Row: { household_id: string; user_id: string; role: 'member' | 'admin';
               created_at: string };
        Insert: { household_id: string; user_id: string; role?: 'member' | 'admin' };
        Update: Partial<{ role: 'member' | 'admin' }>;
        Relationships: [];
      };
      expense_categories: {
        Row: { id: string; household_id: string; name: string; sort_order: number;
               created_at: string };
        Insert: { id?: string; household_id: string; name: string; sort_order?: number };
        Update: Partial<{ name: string; sort_order: number }>;
        Relationships: [];
      };
      expenses: {
        Row: { id: string; household_id: string; category_id: string; payer_id: string;
               amount: number; spent_on: string; description: string;
               created_at: string; updated_at: string; created_by: string };
        Insert: { id?: string; household_id: string; category_id: string; payer_id: string;
                  amount: number; spent_on: string; description?: string; created_by: string };
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
        Relationships: [];
      };
      cat_feedings: {
        Row: { id: string; household_id: string; fed_on: string; meal: string;
               had_snack: boolean; fed_by: string; created_at: string };
        Insert: { id?: string; household_id: string; fed_on: string; meal?: string;
                  had_snack?: boolean; fed_by: string };
        Update: Partial<Database['public']['Tables']['cat_feedings']['Insert']>;
        Relationships: [];
      };
      shopping_items: {
        Row: { id: string; household_id: string; name: string; checked: boolean;
               created_at: string; created_by: string };
        Insert: { id?: string; household_id: string; name: string; checked?: boolean;
                  created_by: string };
        Update: Partial<Database['public']['Tables']['shopping_items']['Insert']>;
        Relationships: [];
      };
      bills: {
        Row: { id: string; household_id: string; name: string; amount: number;
               due_day: number; category_id: string | null; created_at: string;
               created_by: string };
        Insert: { id?: string; household_id: string; name: string; amount: number;
                  due_day: number; category_id?: string | null; created_by: string };
        Update: Partial<Database['public']['Tables']['bills']['Insert']>;
        Relationships: [];
      };
      notes: {
        Row: { id: string; household_id: string; body: string; done: boolean;
               created_at: string; created_by: string };
        Insert: { id?: string; household_id: string; body: string; done?: boolean;
                  created_by: string };
        Update: Partial<Database['public']['Tables']['notes']['Insert']>;
        Relationships: [];
      };
      settlements: {
        Row: { id: string; household_id: string; kind: 'payment' | 'adjustment';
               from_user_id: string; to_user_id: string; amount: number; note: string;
               settled_on: string; created_at: string; created_by: string };
        Insert: { id?: string; household_id: string; kind: 'payment' | 'adjustment';
                  from_user_id: string; to_user_id: string; amount: number; note?: string;
                  settled_on: string; created_by: string };
        Update: Partial<Database['public']['Tables']['settlements']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_household_member: { Args: { target_household: string }; Returns: boolean };
      create_household: { Args: { household_name: string }; Returns: string };
      create_invitation: { Args: Record<string, never>; Returns: string };
      redeem_invitation: { Args: { invite_code: string }; Returns: string };
    };
    Enums: {
      household_role: 'member' | 'admin';
      settlement_kind: 'payment' | 'adjustment';
    };
    CompositeTypes: Record<string, never>;
  };
}
