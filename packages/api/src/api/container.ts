// TSOA Container Configuration for Dependency Injection
import "reflect-metadata";
import { diContainer } from "@/infrastructure/di-container";
import { AuthController } from "./controllers/AuthController";
import { PlayerController } from "./controllers/PlayerController";

// Register TSOA controllers in the DI container
diContainer.container.registerSingleton(AuthController, AuthController);
diContainer.container.registerSingleton(PlayerController, PlayerController);


// TSOA container resolver function
export const iocContainer = {
  get: <T>(controller: { new(...args: any[]): T }): T => {
    return diContainer.container.resolve(controller);
  },
};
