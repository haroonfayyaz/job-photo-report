import {
  getBusinessProfile,
  saveBusinessProfile,
} from '../../src/data/repositories/businessProfileRepository';
import {
  createTestDatabase,
  destroyTestDatabase,
} from '../helpers/sqlJsConnection';

describe('businessProfileRepository', () => {
  beforeEach(async () => {
    await createTestDatabase();
  });

  afterEach(async () => {
    await destroyTestDatabase();
  });

  it('returns defaults then persists updates', () => {
    const initial = getBusinessProfile();
    expect(initial.companyName).toBe('');

    const saved = saveBusinessProfile({
      companyName: 'Field Pro LLC',
      email: 'ops@fieldpro.com',
      defaultTechnicianName: 'Alex',
    });

    expect(saved.companyName).toBe('Field Pro LLC');
    expect(getBusinessProfile().defaultTechnicianName).toBe('Alex');
  });
});
