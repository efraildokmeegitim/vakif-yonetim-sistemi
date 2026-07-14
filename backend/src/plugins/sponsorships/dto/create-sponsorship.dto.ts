export class CreateSponsorshipDto {
  sponsor_id: number;
  beneficiary_id?: number;
  project_id?: number;
  amount: number;
  period: string;
  start_date: string;
  end_date?: string;
  status?: string;
}

export class CreateSponsorshipPaymentDto {
  amount: number;
  payment_date: string;
  receipt_no?: string;
  notes?: string;
}
