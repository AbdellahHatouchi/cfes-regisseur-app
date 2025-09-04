import z from 'zod'

// Common fields for all items
const baseItemSchema = z.object({
  id: z.string().optional(),              // optional since new items may not have an id yet
  _delete: z.boolean().default(false),    // to mark item for deletion
  itemAmount: z.coerce.number().min(1),   // unified amount field
})

// Vignette schema
export const vignetteSchema = baseItemSchema.extend({
  type: z.literal("vignette"),
  vignetteValueId: z.string().min(1, "Valeur de vignette est requis!"),
  vignetteQuantity: z.coerce.number().min(1),
})

// Quittance schema
export const quittanceSchema = baseItemSchema.extend({
  type: z.literal("quittance"),
  quittanceNum: z.string().min(1, "Numero quittance est requis!"),
})

// Union based on "type"
export const itemSchema = z.discriminatedUnion("type", [
  vignetteSchema,
  quittanceSchema,
])

export type ItemSchema = z.infer<typeof itemSchema>


export const formSchema = z
  .object({
    numeroVersement: z.string().default('VER-NN-YYY'),
    dateVersement: z.coerce.date(),
    type: z.enum(['Mixte', 'Quittance', 'Vignette']).default('Mixte'),
    note: z.string().default(''),
    items: itemSchema.array().min(1, 'Au moins one article est requis!')
  })
  .superRefine((data, ctx) => {
    data.items.forEach((item, index) => {
      if (data.type === 'Vignette' && item.type !== 'vignette') {
        ctx.addIssue({
          path: ['items', index, 'type'],
          message: `Item #${index + 1} doit être une vignette`,
          code: z.ZodIssueCode.custom
        })
      }
      if (data.type === 'Quittance' && item.type !== 'quittance') {
        ctx.addIssue({
          path: ['items', index, 'type'],
          message: `Item #${index + 1} doit être une quittance`,
          code: z.ZodIssueCode.custom
        })
      }
    })

    if (data.type === 'Mixte') {
      const hasVignette = data.items.some((item) => item.type === 'vignette')
      const hasQuittance = data.items.some((item) => item.type === 'quittance')
      if (!hasVignette || !hasQuittance) {
        ctx.addIssue({
          path: ['items'],
          message: 'Pour un versement mixte, il faut au moins une vignette et une quittance',
          code: z.ZodIssueCode.custom
        })
      }
    }
  })
export type VersementForm = z.infer<typeof formSchema>

export const assignQuittanceformSchema = z.object({
  assignQuittanceNum: z
    .string()
    .min(1, 'Quittance Num est requis!')
    .regex(/^\d{2}\/\d{4}$/, 'Le numéro de quittance doit être au format Ex: 21/2025'),
  assignQuittanceDate: z.coerce.date().default(new Date())
})
export type AssignQuittanceData = z.infer<typeof assignQuittanceformSchema>
