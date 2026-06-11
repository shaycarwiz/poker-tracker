import { Hand } from "@/model/entities";
import {
  HandResponse,
  HandSummaryResponse,
} from "../../dto/hand-dto";

export function mapHandToSummary(hand: Hand): HandSummaryResponse {
  return {
    handId: hand.id.value,
    sessionId: hand.sessionId.value,
    captureType: hand.captureType,
    potAmount: hand.potAmount,
    netResult: hand.netResult,
    currency: hand.currency,
    tags: [...hand.tags],
    note: hand.note,
    createdAt: hand.createdAt,
  };
}

export function mapHandToResponse(hand: Hand): HandResponse {
  return {
    ...mapHandToSummary(hand),
    heroPlayerId: hand.heroPlayerId?.value,
    handState: hand.handState,
    schemaVersion: hand.schemaVersion,
    updatedAt: hand.updatedAt,
  };
}
