import type { BusinessProfile } from '../models';

export interface IBusinessProfileRepository {
  get(): BusinessProfile;
  save(profile: Partial<BusinessProfile>): BusinessProfile;
}
