import type { ReportPhoto, ReportSection } from '../domain/models';

export const UNASSIGNED_SECTION_TITLE = 'Unassigned';

export type PhotoSectionGroup = {
  sectionId: string | null;
  title: string;
  photos: ReportPhoto[];
};

export function groupPhotosBySection(
  sections: ReportSection[],
  photos: ReportPhoto[],
): PhotoSectionGroup[] {
  const groups: PhotoSectionGroup[] = [];
  const unassigned = photos.filter(photo => photo.sectionId == null);

  if (unassigned.length > 0) {
    groups.push({
      sectionId: null,
      title: UNASSIGNED_SECTION_TITLE,
      photos: unassigned,
    });
  }

  for (const section of sections) {
    const sectionPhotos = photos.filter(photo => photo.sectionId === section.id);
    if (sectionPhotos.length > 0) {
      groups.push({
        sectionId: section.id,
        title: section.title,
        photos: sectionPhotos,
      });
    }
  }

  return groups;
}

export function flattenPhotoIds(groups: PhotoSectionGroup[]): string[] {
  return groups.flatMap(group => group.photos.map(photo => photo.id));
}

export function getUncategorizedPhotoIds(photos: ReportPhoto[]): string[] {
  return photos
    .filter(photo => photo.category === 'UNCATEGORIZED')
    .map(photo => photo.id);
}
