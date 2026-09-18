import { toUTCString } from '../../domain/dates';
import type { ISignatureRepository } from '../../domain/repositories/ISignatureRepository';
import type { CreateSignatureInput, Signature } from '../../domain/models';
import { generateId } from '../../utils/id';
import { getDatabase } from '../database/database';
import { mapSignatureRow } from '../database/mappers';
import type { DatabaseConnection } from '../database/types';

function getDb(db?: DatabaseConnection): DatabaseConnection {
  return db ?? getDatabase();
}

export function createSignature(
  input: CreateSignatureInput,
  db?: DatabaseConnection,
): Signature {
  const connection = getDb(db);
  const signature: Signature = {
    id: generateId(),
    reportId: input.reportId,
    signerName: input.signerName.trim(),
    localPath: input.localPath,
    signedAt: input.signedAt ?? toUTCString(),
  };

  const existing = getSignatureByReportId(input.reportId, connection);
  if (existing) {
    connection.execute(
      `UPDATE signatures SET signer_name = ?, local_path = ?, signed_at = ?
       WHERE report_id = ?;`,
      [
        signature.signerName,
        signature.localPath,
        signature.signedAt,
        signature.reportId,
      ],
    );
    return {
      ...existing,
      signerName: signature.signerName,
      localPath: signature.localPath,
      signedAt: signature.signedAt,
    };
  }

  connection.execute(
    `INSERT INTO signatures (id, report_id, signer_name, local_path, signed_at)
     VALUES (?, ?, ?, ?, ?);`,
    [
      signature.id,
      signature.reportId,
      signature.signerName,
      signature.localPath,
      signature.signedAt,
    ],
  );

  return signature;
}

export function getSignatureByReportId(
  reportId: string,
  db?: DatabaseConnection,
): Signature | null {
  const connection = getDb(db);
  const result = connection.execute(
    'SELECT * FROM signatures WHERE report_id = ? LIMIT 1;',
    [reportId],
  );
  const row = result.rows[0];
  return row ? mapSignatureRow(row) : null;
}

export function deleteSignatureByReportId(
  reportId: string,
  db?: DatabaseConnection,
): boolean {
  const connection = getDb(db);
  const result = connection.execute(
    'DELETE FROM signatures WHERE report_id = ?;',
    [reportId],
  );
  return result.rowsAffected > 0;
}

export const signatureRepository: ISignatureRepository = {
  create: input => createSignature(input),
  getByReportId: reportId => getSignatureByReportId(reportId),
  deleteByReportId: reportId => deleteSignatureByReportId(reportId),
};
