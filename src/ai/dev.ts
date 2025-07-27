import { config } from 'dotenv';
config();

import '@/ai/flows/generate-tags.ts';
import '@/ai/flows/summarize-article.ts';
import '@/ai/flows/moderate-toxic-content.ts';