import z from 'zod';

export const UserGroupSchema = z.object({
    'ID': z.coerce.string().optional(),
    'Display Name': z.string({
        required_error: 'Display Name is required',
    }),
    'Description': z.coerce.string().optional(),
    'Members': z.coerce.string(),
    'Manager': z.coerce.string(),
});