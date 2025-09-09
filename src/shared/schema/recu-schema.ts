import z from 'zod'

export const recuItemSchema = z.object({
  id: z.string().optional(),
  _delete: z.boolean().default(false),
  vignetteValueId: z.string().min(1, 'Valeur de vignette est requise'),
  quantity: z.coerce.number().min(1, 'Quantité doit être >= 1')
})

export const recuFormSchema = z.object({
  numeroRecu: z.string().min(1, 'Numéro du reçu est requis'),
  dateRecu: z.coerce.date(),
  note: z.string().default(''),
  items: recuItemSchema.array().min(1, 'Au moins un article est requis')
})

export type RecuForm = z.infer<typeof recuFormSchema>

