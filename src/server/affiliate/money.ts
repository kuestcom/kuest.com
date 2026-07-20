export function integerString(value: string | null | undefined): string {
  const normalized = value?.trim()
  if (!normalized || !/^\d+$/.test(normalized)) {
    throw new Error('On-chain amount must be an unsigned integer string.')
  }
  return BigInt(normalized).toString()
}

export function rawToCentsWithRemainder(params: {
  amountRaw: string
  decimals: number
  remainderRaw?: string
}) {
  if (!Number.isSafeInteger(params.decimals) || params.decimals < 2 || params.decimals > 36) {
    throw new Error('Token decimals must be an integer between 2 and 36.')
  }
  const scale = 10n ** BigInt(params.decimals - 2)
  const total = BigInt(integerString(params.amountRaw)) + BigInt(params.remainderRaw || '0')
  const cents = total / scale
  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Dub sale amount exceeds JavaScript safe integer range.')
  }
  return {
    cents: Number(cents),
    remainderRaw: (total % scale).toString(),
    scaleRawPerCent: scale.toString(),
  }
}

export function addRawAmounts(values: Iterable<string>) {
  let total = 0n
  for (const value of values) total += BigInt(integerString(value))
  return total.toString()
}
