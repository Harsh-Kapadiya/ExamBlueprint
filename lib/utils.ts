import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn's class helper: joins class names and lets later Tailwind classes win over earlier ones. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
