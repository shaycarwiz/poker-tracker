import {
  Controller,
  Get,
  Put,
  Route,
  Tags,
  Security,
  Body,
  Request,
} from "tsoa";
import { injectable, inject } from "tsyringe";
import { UserService } from "@/application/services/user-service";
import { logger } from "@/shared/utils/logger";
import { AuthenticatedRequest } from "@/api/middleware/auth";
import { ApiResponse } from "../types";

@Route("users")
@Tags("Users")
@injectable()
export class UserController extends Controller {
  constructor(@inject("UserService") private userService: UserService) {
    super();
  }

  @Get("/me/preferences")
  @Security("jwt")
  public async getPreferences(
    @Request() req: AuthenticatedRequest
  ): Promise<
    ApiResponse<{ preferredLanguage: string; defaultCurrency: string }>
  > {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const preferences = await this.userService.getPreferences(req.user.userId);

      return { success: true, data: preferences };
    } catch (error) {
      logger.error("Error getting user preferences", { error });
      this.setStatus(500);
      return { success: false, error: "Failed to get user preferences" };
    }
  }

  @Put("/me/preferences")
  @Security("jwt")
  public async updatePreferences(
    @Request() req: AuthenticatedRequest,
    @Body() body: { preferredLanguage?: string; defaultCurrency?: string }
  ): Promise<
    ApiResponse<{ preferredLanguage: string; defaultCurrency: string }>
  > {
    try {
      if (!req.user?.userId) {
        this.setStatus(401);
        return { success: false, error: "Authentication required" };
      }

      const preferences = await this.userService.updatePreferences({
        userId: req.user.userId,
        preferredLanguage: body.preferredLanguage,
        defaultCurrency: body.defaultCurrency,
      });

      return { success: true, data: preferences };
    } catch (error) {
      logger.error("Error updating user preferences", { error, body });
      this.setStatus(500);
      return { success: false, error: "Failed to update user preferences" };
    }
  }
}
