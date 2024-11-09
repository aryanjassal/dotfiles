/**
 * Takes two arrays and compares their values.
 * @param arr1 First array to compare
 * @param arr2 Second array to compare
 * @returns Whether the arrays are equal or not
 */
function compareArrays(arr1: Array<any>, arr2: Array<any>): boolean {
  // To ensure the order doesn't cause issues
  arr1.sort();
  arr2.sort();

  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

/**
 * Takes in a time length or duration in seconds, and converts it to a mm:ss
 * format for displaying and rendering.
 * @param length Time in seconds
 * @returns String representation of the time
 */
// TODO: add hours
function lengthToDuration(length: number): string {
  if (length < 0) return '??';
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const paddedSec = String(sec).padStart(2, '0');
  return `${min}:${paddedSec}`;
}

export { compareArrays, lengthToDuration };
