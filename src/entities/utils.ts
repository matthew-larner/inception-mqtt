export const numberToBinaryStringWithZeroPadding = (num: number, maxPadding: number): string => {
  const value = num.toString(2);

  return '0'.repeat(maxPadding - value.length) + value;
};
