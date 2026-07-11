import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import ApiResponse from "../utils/apiResponse";

// Run after express-validator rules to short-circuit with a clean 400 response
const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    ApiResponse.error(res, 400, "Validation failed", errors.array());
    return;
  }
  next();
};

export default validate;
