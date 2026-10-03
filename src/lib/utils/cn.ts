/** Junta classes, ignorando falsy. Pequeno de propósito: não precisamos de merge de Tailwind. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
