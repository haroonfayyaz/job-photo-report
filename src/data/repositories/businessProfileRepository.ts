import type { IBusinessProfileRepository } from '../../domain/repositories/IBusinessProfileRepository';
import type { BusinessProfile } from '../../domain/models';
import { getDatabase } from '../database/database';
import { mapBusinessProfileRow } from '../database/mappers';
import type { DatabaseConnection } from '../database/types';

const DEFAULT_PROFILE: BusinessProfile = {
  companyName: '',
  logoPath: null,
  phone: '',
  email: '',
  website: '',
  address: '',
  defaultTechnicianName: '',
};

function getDb(db?: DatabaseConnection): DatabaseConnection {
  return db ?? getDatabase();
}

export function getBusinessProfile(db?: DatabaseConnection): BusinessProfile {
  const connection = getDb(db);
  const result = connection.execute(
    'SELECT * FROM business_profile WHERE id = 1 LIMIT 1;',
  );
  const row = result.rows[0];
  return row ? mapBusinessProfileRow(row) : DEFAULT_PROFILE;
}

export function saveBusinessProfile(
  profile: Partial<BusinessProfile>,
  db?: DatabaseConnection,
): BusinessProfile {
  const connection = getDb(db);
  const current = getBusinessProfile(connection);
  const updated: BusinessProfile = {
    companyName: profile.companyName?.trim() ?? current.companyName,
    logoPath:
      profile.logoPath !== undefined ? profile.logoPath : current.logoPath,
    phone: profile.phone?.trim() ?? current.phone,
    email: profile.email?.trim() ?? current.email,
    website: profile.website?.trim() ?? current.website,
    address: profile.address?.trim() ?? current.address,
    defaultTechnicianName:
      profile.defaultTechnicianName?.trim() ?? current.defaultTechnicianName,
  };

  connection.execute(
    `INSERT INTO business_profile (
      id, company_name, logo_path, phone, email, website, address, default_technician_name
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      company_name = excluded.company_name,
      logo_path = excluded.logo_path,
      phone = excluded.phone,
      email = excluded.email,
      website = excluded.website,
      address = excluded.address,
      default_technician_name = excluded.default_technician_name;`,
    [
      updated.companyName,
      updated.logoPath,
      updated.phone,
      updated.email,
      updated.website,
      updated.address,
      updated.defaultTechnicianName,
    ],
  );

  return updated;
}

export const businessProfileRepository: IBusinessProfileRepository = {
  get: () => getBusinessProfile(),
  save: profile => saveBusinessProfile(profile),
};
