export const errorHandler = (err, req, res, next) => {
  const message = err.message || "Something went wrong";
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  const response = {
    success: false,
    status,
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
