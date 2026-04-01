export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: "owner" | "member";
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: "owner" | "member";
          joined_at?: string;
        };
        Update: {
          role?: "owner" | "member";
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      group_dates: {
        Row: {
          id: string;
          group_id: string;
          date: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          date: string;
        };
        Update: {
          date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_dates_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
      };
      availability_slots: {
        Row: {
          id: string;
          group_id: string;
          group_date_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          group_date_id: string;
          user_id: string;
          start_time: string;
          end_time: string;
        };
        Update: {
          start_time?: string;
          end_time?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_slots_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_slots_group_date_id_fkey";
            columns: ["group_date_id"];
            isOneToOne: false;
            referencedRelation: "group_dates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "availability_slots_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      meetings: {
        Row: {
          id: string;
          group_id: string;
          title: string | null;
          scheduled_start: string;
          scheduled_end: string;
          daily_room_url: string | null;
          daily_room_name: string | null;
          status: "scheduled" | "active" | "ended";
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          title?: string | null;
          scheduled_start: string;
          scheduled_end: string;
          daily_room_url?: string | null;
          daily_room_name?: string | null;
          status?: "scheduled" | "active" | "ended";
          created_by: string;
          created_at?: string;
        };
        Update: {
          title?: string | null;
          scheduled_start?: string;
          scheduled_end?: string;
          daily_room_url?: string | null;
          daily_room_name?: string | null;
          status?: "scheduled" | "active" | "ended";
        };
        Relationships: [
          {
            foreignKeyName: "meetings_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meetings_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string | null;
          is_ai: boolean;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          user_id?: string | null;
          is_ai?: boolean;
          content: string;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transcript_fragments: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string;
          content: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          user_id: string;
          content: string;
          timestamp?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transcript_fragments_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transcript_fragments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
