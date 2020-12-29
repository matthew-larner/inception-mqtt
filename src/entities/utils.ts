export const numberToBinaryStringWithZeroPadding = (num: number, maxPadding: number): string => {
  const value = num.toString(2);
  const valueLength = value.length;

  if (valueLength > maxPadding) {
    return value.slice(valueLength - maxPadding);
  }

  return '0'.repeat(maxPadding - valueLength) + value;
};

export const isStringIndexContains = (str: string, index: number, char: string) => str[index - 1] === char; // index here uses 1 indexing