import { HandStateV1 } from "@/model/hand-state";

export interface HandSummaryResponse {
  handId: string;
  sessionId: string;
  captureType: string;
  potAmount?: number;
  netResult?: number;
  currency: string;
  tags: string[];
  note?: string;
  createdAt: Date;
}

export interface HandResponse extends HandSummaryResponse {
  heroPlayerId?: string;
  handState: HandStateV1;
  schemaVersion: number;
  updatedAt: Date;
}

export interface CreateHandRequest {
  sessionId: string;
  userId: string;
  captureType: "snapshot" | "full";
  handState: HandStateV1;
  heroPlayerId?: string;
  tags?: string[];
  note?: string;
}

export interface CreateHandResponse extends HandResponse {}

export interface UpdateHandRequest {
  handId: string;
  userId: string;
  handState: HandStateV1;
  heroPlayerId?: string;
  tags?: string[];
  note?: string;
}

export interface UpdateHandResponse extends HandResponse {}

export interface ListHandsResponse {
  hands: HandSummaryResponse[];
}
