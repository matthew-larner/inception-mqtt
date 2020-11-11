export const numberToBinaryStringWithZeroPadding = (num: number, maxPadding: number): string => {
  const value = num.toString(2);

  return '0'.repeat(maxPadding - value.length) + value;
};

export const isStringIndexContains = (str: string, index: number, char: string) => str[index - 1] === char; // index here uses 1 indexing