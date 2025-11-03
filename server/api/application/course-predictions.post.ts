import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const systemPrompt = `
You are an expert at extracting course information from text into JSON.

Goal
From the provided text, extract all courses and return a single JSON object with this shape:
courses: array of course objects
name: string — official course/module title (strip level/semester tags unless integral to title)
credits: number (ECTS), 0.5–30; half-points allowed (e.g., 3.0, 4.5)
subjectArea: one of:
"computer_science"
"information_systems"
"quantitative_methods"
"business_administration"
"none"
description: string, one sentence (10–300 chars) summarizing course content (no prerequisites, assessment, or scheduling)
page (optional): positive integer page where content is defined in detail (not just first mention); if unknown, set null or omit

Subject area mapping (pick the best single match)
computer_science: programming (incl. OO/Java), algorithms/data structures, software engineering (process models, tools), computer architecture & operating systems, web engineering.
information_systems: IS basics; data models & databases (ER, SQL); process management; project management; communication/collaboration systems; digital business; information management; IT law.
quantitative_methods: math in economics (calculus, linear systems, vectors/matrices, nonlinear optimization); operations research (LP, optimization, decision theory); data & probabilities (descriptive stats, probability, statistical software); data analysis & simulation (estimation/tests, regression/classification, simulation software).
business_administration: business management basics (procurement, investment, accounting, HR & organization, production planning); IS-relevant basics (marketing, controlling, innovation, entrepreneurship, corporate management); economics (micro, macro, international, policy).
none: if none of the above fits.

Rules
Language: output has to be in English.
Only include courses also listed in the transcript of records section.
Extract every distinct course exactly once.
If a module lists sub-courses with their own ECTS and content, treat each sub-course as a separate course; otherwise, treat the module as one course.
Credits: use the value explicitly tied to ECTS. If a range is given, choose the lower bound. Ignore contact hours.
Page: choose the page with the start of the fullest description (not index/summary).
Ordering: preserve the order of first detailed definition in the text.
Missing data: if credits are missing, omit the course (credits are mandatory).
`

const bodySchema = z.object({
  text: z.string(),
})

const outputSchema = z.object({
  courses: z.array(z.object({
    name: z.string(),
    credits: z.number().min(0.5).max(30),
    subjectArea: z.enum(subjectAreaEnum.enumValues),
    description: z.string().min(10).max(300),
    page: z.number().min(1).nullable().optional(),
  })),
})

export default eventHandler(async (event) => {
  const validatedBody = await readValidatedBody(event, bodySchema.safeParse)

  if (!validatedBody.success) {
    throw createError({ statusCode: 400, statusMessage: 'Text is required' })
  }

  const { OPENAI_MODEL } = useRuntimeConfig()

  const response = await useAi().responses.parse({
    model: OPENAI_MODEL,
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: validatedBody.data.text },
    ],
    text: {
      format: zodTextFormat(outputSchema, 'output'),
    },
  })

  return response.output_parsed?.courses || []
})
