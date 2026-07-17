export const calculateBackOff = (retryCount: number): number => {
  /**
   * starts the first retry at 0 and returns 5
   */
  return Math.pow(2, retryCount) * 5;
};

console.log(calculateBackOff(1));
calculateBackOff(0);
