import { Response } from "express";

export default class ApiResponse {
  static success<T>(res: Response, statusCode = 200, message = "Success", data: T | null = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, statusCode = 500, message = "Something went wrong", errors: unknown = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}
