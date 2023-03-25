import z from 'zod';

export const UserGroupSchema = z.object({
    'ID': z.string().or(z.number()).optional(),
    'Display Name': z.string({
        required_error: 'Display Name is required',
    }),
    'Description': z.string().optional(),
    'Members': z.string().or(z.number()),
    'Manager': z.string().or(z.number()),
});