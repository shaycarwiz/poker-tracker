// src/controllers/TestController.ts
import { Controller, Get, Route } from "tsoa";

@Route("test")
export class TestController extends Controller {
  @Get("/")
  public async getTest(): Promise<{ success: boolean }> {
    console.log("Test");
    return { success: true };
  }
}
