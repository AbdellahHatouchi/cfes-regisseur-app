import z from 'zod'

// Vignette schema
export const vignetteSchema = z.object({
  type: z.literal('vignette'),
  vignetteValueId: z.string().min(1, 'Valeur de vignette est requis!'),
  vignetteQuantity: z.coerce.number().min(1)
})

// Quittance schema
export const quittanceSchema = z.object({
  type: z.literal('quittance'),
  quittanceNum: z.string().min(1, 'Numero quittance est requis!'),
  quittanceAmount: z.coerce.number().min(1)
})
// Union based on "type"
export const itemSchema = z.discriminatedUnion('type', [vignetteSchema, quittanceSchema])
export type ItemSchama = z.infer<typeof itemSchema>

export const formSchema = z
  .object({
    numeroVersement: z.string().default('VER-NN-YYY'),
    dateVersement: z.coerce.date().transform((d) => d.toDateString()),
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
