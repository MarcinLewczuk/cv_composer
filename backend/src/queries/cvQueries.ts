import { db } from '../app';
import { CV } from '../types/cv';
import { QueryError } from 'mysql2';

/**
 * Save a new CV to the database
 */
export const saveCV = (originalContent: string, userId: number, cvData: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const {
      fullName,
      email,
      phone,
      location,
      summary,
      experience,
      education,
      skills,
      certifications,
    } = cvData;

    const query = `
      INSERT INTO cvs (
        originalContent,
        fullName,
        email,
        phone,
        location,
        summary,
        createdBy,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      originalContent,
      fullName || null,
      email || null,
      phone || null,
      location || null,
      summary || null,
      userId,
    ];

    db.query(query, values, (error: QueryError | null, results: any) => {
      if (error) {
        console.error('Save CV Error:', error);
        reject(error);
      } else {
        resolve({
          id: results.insertId,
          ...cvData,
          createdAt: new Date(),
        });
      }
    });
  });
};

/**
 * Get a CV by ID
 */
export const getCVById = (cvId: number, userId: number): Promise<CV> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM cvs WHERE id = ? AND createdBy = ?
    `;

    db.query(query, [cvId, userId], (error: QueryError | null, results: any[]) => {
      if (error) {
        console.error('Get CV Error:', error);
        reject(error);
      } else if (results.length === 0) {
        reject(new Error('CV not found'));
      } else {
        resolve(results[0]);
      }
    });
  });
};

/**
 * Get all CVs for a user
 */
export const getUserCVs = (userId: number): Promise<CV[]> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM cvs WHERE createdBy = ? ORDER BY createdAt DESC
    `;

    db.query(query, [userId], (error: QueryError | null, results: any[]) => {
      if (error) {
        console.error('Get User CVs Error:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

/**
 * Delete a CV by ID
 */
export const deleteCV = (cvId: number, userId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    // First verify ownership
    const selectQuery = `SELECT createdBy FROM cvs WHERE id = ?`;

    db.query(selectQuery, [cvId], (error: QueryError | null, results: any[]) => {
      if (error) {
        console.error('Delete CV Check Error:', error);
        reject(error);
      } else if (results.length === 0) {
        reject(new Error('CV not found'));
      } else if (results[0].createdBy !== userId) {
        reject(new Error('Unauthorized'));
      } else {
        // Delete the CV
        const deleteQuery = `DELETE FROM cvs WHERE id = ?`;
        db.query(deleteQuery, [cvId], (error: QueryError | null) => {
          if (error) {
            console.error('Delete CV Error:', error);
            reject(error);
          } else {
            resolve();
          }
        });
      }
    });
  });
};

/**
 * Update CV content
 */
export const updateCV = (cvId: number, userId: number, cvData: any): Promise<CV> => {
  return new Promise((resolve, reject) => {
    const { originalContent, fullName, email, phone, location, summary } = cvData;

    const query = `
      UPDATE cvs SET
        originalContent = ?,
        fullName = ?,
        email = ?,
        phone = ?,
        location = ?,
        summary = ?,
        updatedAt = NOW()
      WHERE id = ? AND createdBy = ?
    `;

    const values = [
      originalContent,
      fullName || null,
      email || null,
      phone || null,
      location || null,
      summary || null,
      cvId,
      userId,
    ];

    db.query(query, values, (error: QueryError | null, results: any) => {
      if (error) {
        console.error('Update CV Error:', error);
        reject(error);
      } else if (results.affectedRows === 0) {
        reject(new Error('CV not found or unauthorized'));
      } else {
        resolve({
          id: cvId,
          ...cvData,
          updatedAt: new Date(),
        });
      }
    });
  });
};
