export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      chatgpt_settings: {
        Row: {
          id: string;
          user_id: string;
          api_key: string;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          api_key: string;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          api_key?: string;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      health_check: {
        Row: {
          id: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          status: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          status?: string;
          created_at?: string;
        };
      };
      servicenow_credentials: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          instance_url: string;
          username: string;
          password: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          instance_url: string;
          username: string;
          password: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          instance_url?: string;
          username?: string;
          password?: string;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          content: string;
          sender: string;
          created_at: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          content: string;
          sender: string;
          created_at?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          content?: string;
          sender?: string;
          created_at?: string;
          metadata?: Json | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_health_check_table: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      delete_user: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      get_user_profile: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      is_email_verified: {
        Args: { user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
