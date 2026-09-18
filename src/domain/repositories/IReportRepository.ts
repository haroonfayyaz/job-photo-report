import type {
  CreateReportInput,
  Report,
  UpdateReportInput,
} from '../models';

export interface IReportRepository {
  create(input: CreateReportInput): Report;
  getById(id: string): Report | null;
  list(): Report[];
  update(id: string, input: UpdateReportInput): Report | null;
  delete(id: string): boolean;
  search(query: string): Report[];
  duplicate(id: string): Report | null;
}
