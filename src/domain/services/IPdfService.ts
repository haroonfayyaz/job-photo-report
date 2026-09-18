import type { BusinessProfile, Report, ReportPhoto, ReportSection, Signature } from '../models';

export type PhotoLayout = 'one_per_row' | 'two_per_row';

export interface PdfGenerationOptions {
  layout: PhotoLayout;
  includeSignature: boolean;
}

export interface PdfGenerationResult {
  filePath: string;
  pageCount: number;
}

/**
 * Contract for on-device PDF generation.
 * Implementation deferred to a later step.
 */
export interface IPdfService {
  generate(
    report: Report,
    sections: ReportSection[],
    photos: ReportPhoto[],
    profile: BusinessProfile,
    signature: Signature | null,
    options: PdfGenerationOptions,
  ): Promise<PdfGenerationResult>;
}
