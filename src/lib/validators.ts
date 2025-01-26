import { z } from 'zod';

export const ResumeSchema = z.object({
  user_id: z.string(),
  version: z.enum(['base', 'generated']),
  metadata: z.object({
    status: z.enum(['draft', 'published']),
    target_job: z.object({
      title: z.string(),
      company: z.string(),
      job_post_url: z.string().url().optional()
    }).optional()
  })
});

export const WorkExperienceSchema = z.object({
  title: z.string().min(2),
  company: z.string().min(2),
  start_date: z.date(),
  end_date: z.date().optional(),
  current: z.boolean().optional(),
  descriptions: z.array(z.string().min(10)).min(1)
});
