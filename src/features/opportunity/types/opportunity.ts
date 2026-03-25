export interface Opportunity {
  potentialid: number;
  potential_no: string;
  potentialname: string;
  amount: number | null;
  closingdate: string | null;
  sales_stage: string;
  probability: number | null;
  related_to: number | null;
  related_to_name: string | null; 
  assigned_user_id: number | null;
  assigned_user_name: string | null;
  description: string | null;
  is_active: boolean;
}

export const OPPORTUNITY_STAGES = [
  'Prospecting',
  'Qualification', 
  'Needs Analysis',
  'Value Proposition',
  'Identifying Decision Makers',
  'Perception Analysis',
  'Proposal/Price Quote',
  'Negotiation/Review',
  'Closed Won',
  'Closed Lost'
] as const;

export type OpportunityStage = typeof OPPORTUNITY_STAGES[number];

export type OpportunityViewMode = "cards" | "table";