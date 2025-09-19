// src/controllers/TestController.ts
import { Controller, Get, Route } from "tsoa";
import { injectable } from "tsyringe";

@Route("test")
@injectable()
export class TestController extends Controller {
  @Get("/")
  public async getTest(): Promise<{ success: boolean }> {
    console.log("Test");
    return { success: true };
  }
}
