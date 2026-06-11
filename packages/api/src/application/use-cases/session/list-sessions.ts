import { SessionStatus } from "@/model/enums";
import {
  ListSessionsRequest,
  ListSessionsResponse,
} from "../../dto/session-dto";
import { BaseUseCase } from "../base-use-case";
import { SessionFilters } from "@/model";
import { mapSessionToResponse } from "./get-session";

export class ListSessionsUseCase extends BaseUseCase {
  async execute(request: ListSessionsRequest): Promise<ListSessionsResponse> {
    return this.executeReadOnly(
      async () => {
        const page = request.page || 1;
        const limit = request.limit || 10;

        const filters: SessionFilters = {
          userId: request.userId,
          page,
          limit,
        };

        if (request.status) {
          filters.status = request.status as SessionStatus;
        }

        if (request.startDate) {
          filters.dateFrom = request.startDate;
        }

        if (request.endDate) {
          filters.dateTo = request.endDate;
        }

        const { sessions, total } =
          await this.unitOfWork.sessions.findByFilters(filters);

        return {
          sessions: sessions.map(mapSessionToResponse),
          total,
          page,
          limit,
        };
      },
      "ListSessionsUseCase",
      { request }
    );
  }
}
