import { Player, PlayerId } from "@/model/entities";
import { Money, Stakes, Duration } from "@/model/value-objects";

export class TestHelpers {
  static createTestPlayer(
    name: string = "Test Player",
    email?: string,
    bankroll?: Money
  ): Player {
    return Player.create(name, email, bankroll);
  }

  static createTestMoney(
    amount: number = 100,
    currency: string = "USD"
  ): Money {
    return new Money(amount, currency);
  }

  static createTestStakes(
    smallBlind: number = 1,
    bigBlind: number = 2,
    ante?: number
  ): Stakes {
    const smallBlindMoney = new Money(smallBlind, "USD");
    const bigBlindMoney = new Money(bigBlind, "USD");
    const anteMoney = ante ? new Money(ante, "USD") : undefined;

    return new Stakes(smallBlindMoney, bigBlindMoney, anteMoney);
  }

  static createTestDuration(hours: number = 2): Duration {
    return new Duration(hours);
  }

  static createTestPlayerId(value: string = "test-player-id"): PlayerId {
    return new PlayerId(value);
  }
}
