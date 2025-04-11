import { Filter } from './filter';

export interface UpdateFilterPayload {
  filter_id: string;
  filter_name: string;
  is_alerting: boolean;
  frequency: string;
  filters: Filter[];
} 