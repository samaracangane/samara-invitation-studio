export function asaasPaymentStatus(status: string): string | null {
  if (['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH', 'AWAITING_CHARGEBACK_REVERSAL'].includes(status)) return 'approved';
  if (status === 'REFUNDED') return 'refunded';
  if (['CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE'].includes(status)) return 'chargedback';
  return null;
}
export function paymentMatchesAmount(payment: { value: number; originalValue?: number | null | undefined }, cents: number) {
  return Math.round((payment.originalValue ?? payment.value) * 100) === cents;
}
