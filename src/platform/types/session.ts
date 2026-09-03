export type PlatformSessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  accountNumber: string;
  balance: number;
  phone?: string | null;
  clearanceLevel?: string;
  tier?: string;
  isDemoAccount?: boolean;
};
