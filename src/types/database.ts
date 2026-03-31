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
      };
    };
  };
};
