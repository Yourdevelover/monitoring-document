import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProfileRequestRecord = {
  id: string;
  userId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewerId: number | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export function readProfileRequests(value: Prisma.JsonValue): ProfileRequestRecord[] {
  return Array.isArray(value) ? (value as unknown as ProfileRequestRecord[]) : [];
}

export function profileRequestsJson(requests: ProfileRequestRecord[]): Prisma.InputJsonValue {
  return requests as unknown as Prisma.InputJsonValue;
}

export async function processProfileRequestDecisions(options: {
  action: "approve" | "reject";
  reviewerId: number;
  requestId?: string;
  teamId?: number;
}) {
  const users = await prisma.user.findMany({
    where: options.teamId === undefined ? undefined : { teamId: options.teamId },
    select: { id: true, profileRequests: true },
  });
  const candidates = users.flatMap((user) =>
    readProfileRequests(user.profileRequests)
      .filter((profileRequest) => profileRequest.status === "PENDING")
      .filter((profileRequest) => !options.requestId || profileRequest.id === options.requestId)
      .map((profileRequest) => ({ userId: user.id, profileRequest })),
  );

  let processedCount = 0;

  for (const candidate of candidates) {
    const processed = await prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`SELECT "id" FROM "users" WHERE "id" = ${candidate.userId} FOR UPDATE`;
      const user = await transaction.user.findUnique({
        where: { id: candidate.userId },
        select: { id: true, teamId: true, profileRequests: true },
      });

      if (!user || (options.teamId !== undefined && user.teamId !== options.teamId)) {
        return false;
      }

      const requests = readProfileRequests(user.profileRequests);
      const requestIndex = requests.findIndex(
        (profileRequest) => profileRequest.id === candidate.profileRequest.id && profileRequest.status === "PENDING",
      );
      if (requestIndex < 0) return false;

      const currentRequest = requests[requestIndex];
      const updateData: Prisma.UserUpdateInput = {};

      if (options.action === "approve") {
        let payload: Record<string, unknown> = {};
        try {
          const parsed = JSON.parse(currentRequest.newValue ?? "{}");
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            payload = parsed as Record<string, unknown>;
          }
        } catch {
          payload = {};
        }

        if (typeof payload.name === "string" && payload.name.trim()) {
          updateData.name = payload.name.trim();
        }
        if (typeof payload.email === "string" && payload.email.trim()) {
          updateData.email = payload.email.trim().toLowerCase();
        }
        if (typeof payload.phoneNumber === "string" || payload.phoneNumber === null) {
          updateData.phoneNumber = typeof payload.phoneNumber === "string" ? payload.phoneNumber.trim() || null : null;
        }
        if (typeof payload.nik === "string" || payload.nik === null) {
          updateData.nik = typeof payload.nik === "string" ? payload.nik.trim() || null : null;
        }
        if (typeof payload.passwordHash === "string" && payload.passwordHash) {
          updateData.passwordHash = payload.passwordHash;
        } else if (typeof payload.password === "string" && payload.password.length >= 6) {
          updateData.passwordHash = await hash(payload.password, 10);
        }
      }

      const now = new Date().toISOString();
      requests[requestIndex] = {
        ...currentRequest,
        status: options.action === "approve" ? "APPROVED" : "REJECTED",
        reviewerId: options.reviewerId,
        updatedAt: now,
      };

      await transaction.user.update({
        where: { id: user.id },
        data: {
          ...updateData,
          profileRequests: profileRequestsJson(requests),
        },
      });
      return true;
    });

    if (processed) processedCount++;
  }

  return processedCount;
}

export async function removeProfileRequestsForDeletedUser(
  transaction: Prisma.TransactionClient,
  userId: number,
) {
  const users = await transaction.user.findMany({
    where: { id: { not: userId } },
    select: { id: true, profileRequests: true },
  });

  for (const user of users) {
    const requests = readProfileRequests(user.profileRequests);
    const remainingRequests = requests.filter((profileRequest) => profileRequest.reviewerId !== userId);

    if (remainingRequests.length !== requests.length) {
      await transaction.user.update({
        where: { id: user.id },
        data: { profileRequests: profileRequestsJson(remainingRequests) },
      });
    }
  }
}