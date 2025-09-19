// src/controllers/UserController.ts
import { Controller, Get, Route, Tags } from "tsoa";

@Route("users")
@Tags("Users")
export class UserController extends Controller {
  @Get("{userId}")
  // @Security("jwt") // if you set up auth in tsoa.json
  public async getUser(userId: string): Promise<{ id: string; name: string }> {
    // Call your service/business logic
    return { id: userId, name: "Alice" };
  }
}
