export const TryCatchHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res)).catch(next);
};
