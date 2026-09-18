import type { CreateSignatureInput, Signature } from '../models';

export interface ISignatureRepository {
  create(input: CreateSignatureInput): Signature;
  getByReportId(reportId: string): Signature | null;
  deleteByReportId(reportId: string): boolean;
}
