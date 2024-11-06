/**
 * Takes two arrays and compares their values.
 * @param arr1 First array to compare
 * @param arr2 Second array to compare
 * @returns Whether the arrays are equal or not
 */
function compareArrays(arr1: Array<any>, arr2: Array<any>): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

export { compareArrays };
