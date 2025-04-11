import { Filter } from './filter';

export interface SaveFilterPayload {
  user_id: string;
  email_id: string;
  frequency: string;
  filter_name: string;
  filters: Filter[];
  is_alerting: boolean;
} 