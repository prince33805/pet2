import { z } from 'zod';

export const ZOrderPayload = z.object({
  customerId: z.string().uuid(),
  pets: z.array(z.object({
    petId: z.string().uuid(),
    services: z.array(z.object({
      serviceId: z.string().uuid(),
      options: z.array(z.object({
        optionId: z.string().uuid(),
      })).optional(),
    })).min(1),
  })).min(1),
  staffId: z.string().uuid().optional().nullable(),
  startSlotId: z.string().uuid(),
  status: z.enum(['SCHEDULED','CONFIRMED','COMPLETED','CANCELED']).default('SCHEDULED'),
  idempotencyKey: z.string().optional(),
});
