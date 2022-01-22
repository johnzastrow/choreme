export function groupBy<T>(
  xs: T[],
  groupingKey: keyof T
): { [key: string]: T[] } {
  const res: { [key: string]: T[] } = {};
  return xs.reduce(function (rv, x) {
    rv[String(x[groupingKey])]
      ? rv[String(x[groupingKey])].push(x)
      : (rv[String(x[groupingKey])] = [x]);
    return rv;
  }, res);
}
