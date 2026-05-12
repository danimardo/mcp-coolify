/**
 * Handlers de la categoría Teams
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import { extractArray, asRecord, asString, asStringOpt } from "$lib/tools/response-helpers";

/** GET /teams/current */
export async function getCurrentTeamHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const raw = await context.httpClient.get<unknown>("/teams/current", {
    requestId: context.requestId,
  });
  const r = asRecord(raw);
  return {
    uuid: asString(r.uuid ?? r.id),
    name: asString(r.name),
    description: asStringOpt(r.description),
    created_at: asStringOpt(r.created_at),
    members_count: 0,
  };
}

/** GET /teams */
export async function listAllTeamsHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const raw = await context.httpClient.get<unknown>("/teams", {
    requestId: context.requestId,
  });
  const teams = extractArray(raw, "teams");
  return {
    teams: teams.map((t) => {
      const team = asRecord(t);
      return {
        uuid: asString(team.uuid ?? team.id),
        name: asString(team.name),
        description: asStringOpt(team.description),
        created_at: asStringOpt(team.created_at),
      };
    }),
    total: teams.length,
  };
}

/** GET /teams/{uuid} */
export async function getTeamByIdHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as { uuid: string };
  const raw = await context.httpClient.get<unknown>(`/teams/${uuid}`, {
    requestId: context.requestId,
  });
  const r = asRecord(raw);
  return {
    uuid: asString(r.uuid ?? r.id),
    name: asString(r.name),
    description: asStringOpt(r.description),
    created_at: asStringOpt(r.created_at),
    members_count: 0,
  };
}

/** GET /teams/current/members */
export async function getCurrentTeamMembersHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const raw = await context.httpClient.get<unknown>("/teams/current/members", {
    requestId: context.requestId,
  });
  const members = extractArray(raw, "members");
  return {
    members: members.map((m) => {
      const member = asRecord(m);
      return {
        uuid: asString(member.uuid ?? member.id),
        name: asString(member.name),
        email: asString(member.email),
        role: asString(member.role) as "owner" | "admin" | "member",
      };
    }),
    total: members.length,
  };
}
