export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          service_name: string;
          cost: number;
          billing_cycle: 'monthly' | 'annual';
          billing_date: string;
          category: 'streaming' | 'software' | 'gaming' | 'other';
          payment_method: string;
          created_at: string;
          next_billing_date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_name: string;
          cost: number;
          billing_cycle: 'monthly' | 'annual';
          billing_date: string;
          category: 'streaming' | 'software' | 'gaming' | 'other';
          payment_method: string;
          created_at?: string;
          next_billing_date: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_name?: string;
          cost?: number;
          billing_cycle?: 'monthly' | 'annual';
          billing_date?: string;
          category?: 'streaming' | 'software' | 'gaming' | 'other';
          payment_method?: string;
          created_at?: string;
          next_billing_date?: string;
        };
      };
    };
  };
}