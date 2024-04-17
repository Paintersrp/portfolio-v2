import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { I18N } from '@/config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const formatter: Intl.DateTimeFormat = I18N.dateFormatter

export const getFormattedDate = (date: Date): string => (date ? formatter.format(date) : '')
