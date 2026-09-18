import {getDatabase} from '../db/database';
import type {BusinessProfile} from '../models/types';

type BusinessProfileRow = {
  id: number;
  company_name: string;
  logo_path: string | null;
  phone: string;
  email: string;
  website: string;
  address: string;
  default_technician_name: string;
};

const DEFAULT_PROFILE: BusinessProfile = {
  companyName: '',
  logoPath: null,
  phone: '',
  email: '',
  website: '',
  address: '',
  defaultTechnicianName: '',
};

function mapRowToProfile(row: BusinessProfileRow): BusinessProfile {
  return {
    companyName: row.company_name,
    logoPath: row.logo_path,
    phone: row.phone,
    email: row.email,
    website: row.website,
    address: row.address,
    defaultTechnicianName: row.default_technician_name,
  };
}

export function getBusinessProfile(): BusinessProfile {
  const db = getDatabase();
  const result = db.executeSync(
    'SELECT * FROM business_profile WHERE id = 1 LIMIT 1;',
  );

  const row = result.rows?.[0] as BusinessProfileRow | undefined;
  return row ? mapRowToProfile(row) : DEFAULT_PROFILE;
}

export function saveBusinessProfile(
  profile: Partial<BusinessProfile>,
): BusinessProfile {
  const db = getDatabase();
  const current = getBusinessProfile();
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

  db.executeSync(
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
