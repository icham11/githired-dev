const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: err.errors.map((e) => e.message),
    });
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: err.errors.map((e) => e.message),
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid Token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token Expired" });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File size is too large" });
  }

  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
};

module.exports = errorHandler;
