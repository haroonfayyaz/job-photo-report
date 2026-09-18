import type {
  CreatePhotoInput,
  ReportPhoto,
  UpdatePhotoInput,
} from '../models';

export interface IPhotoRepository {
  create(input: CreatePhotoInput): ReportPhoto;
  getById(id: string): ReportPhoto | null;
  listByReportId(reportId: string): ReportPhoto[];
  listBySectionId(sectionId: string): ReportPhoto[];
  update(id: string, input: UpdatePhotoInput): ReportPhoto | null;
  delete(id: string): boolean;
  reorder(reportId: string, orderedPhotoIds: string[]): ReportPhoto[];
}
