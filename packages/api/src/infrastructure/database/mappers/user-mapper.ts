import { PlayerId, User, UserId } from "@/model/entities";
import { UserRow } from "../types";

export class UserMapper {
  static toDomain(row: UserRow): User {
    return new User(
      new UserId(row.id),
      row.google_id || "",
      row.email,
      row.name,
      row.preferred_language,
      row.default_currency,
      row.default_player_id ? new PlayerId(row.default_player_id) : undefined,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  static toPersistence(user: User): UserRow {
    return {
      id: user.id.value,
      google_id: user.googleId || null,
      email: user.email,
      name: user.name,
      preferred_language: user.preferredLanguage,
      default_currency: user.defaultCurrency,
      default_player_id: user.defaultPlayerId?.value || null,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
