import { z } from 'zod';

export const documentIdSchema = z
  .string()
  .min(1, 'Missing document id')
  .max(64, 'Invalid document id');
