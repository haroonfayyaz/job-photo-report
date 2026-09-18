import type {
  CreateSectionInput,
  ReportSection,
  UpdateSectionInput,
} from '../models';

export interface ISectionRepository {
  create(input: CreateSectionInput): ReportSection;
  getById(id: string): ReportSection | null;
  listByReportId(reportId: string): ReportSection[];
  update(id: string, input: UpdateSectionInput): ReportSection | null;
  delete(id: string): boolean;
  reorder(reportId: string, orderedSectionIds: string[]): ReportSection[];
}
