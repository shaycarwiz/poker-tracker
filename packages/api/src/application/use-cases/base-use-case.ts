// Base use case class with common transaction and error handling patterns

import { UnitOfWork } from "@/model/repositories";
import { logger } from "@/shared/utils/logger";
import { AggregateRoot, DomainEventDispatcher } from "@/model/events";

export abstract class BaseUseCase {
  constructor(protected unitOfWork: UnitOfWork) {}

  /**
   * Executes a use case with proper transaction management and error handling
   */
  protected async executeWithTransaction<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      await this.unitOfWork.begin();
      const result = await operation();

      await this.unitOfWork.commit();

      return result;
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error(`Error in ${operationName}`, { error, context });
      throw error;
    }
  }

  /**
   * Executes a use case with transaction management and domain event publishing
   */
  protected async executeWithTransactionAndEvents<T>(
    operation: () => Promise<{ result: T; entity?: AggregateRoot }>,
    operationName: string,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      await this.unitOfWork.begin();
      const { result, entity } = await operation();

      await this.unitOfWork.commit();

      // Publish domain events if entity has them
      if (entity?.hasDomainEvents()) {
        await DomainEventDispatcher.publishAll(entity.domainEvents);
        entity.clearDomainEvents();
      }

      return result;
    } catch (error) {
      await this.unitOfWork.rollback();
      logger.error(`Error in ${operationName}`, { error, context });
      throw error;
    }
  }

  /**
   * Executes a read-only operation (no transaction needed)
   */
  protected async executeReadOnly<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      logger.error(`Error in ${operationName}`, { error, context });
      throw error;
    }
  }
}
