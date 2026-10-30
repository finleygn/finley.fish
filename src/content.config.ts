
import { defineCollection } from 'astro:content';

import { file } from 'astro/loaders';

import { z } from 'astro/zod';

const creative = defineCollection({
  loader: file('src/content/creative.json'),
  schema: ({ image }) => z.object({
    id: z.string(),
    title: z.string(),
    image: image(),
    description: z.string(),
    yearStart: z.int(),
    yearEnd: z.int().optional(),
    link: z.string().optional()
  }),
});

export const collections = { creative };