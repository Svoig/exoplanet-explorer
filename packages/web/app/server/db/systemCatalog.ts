import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    BatchGetCommand,
    DynamoDBDocumentClient,
    GetCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";

// NOTE: Copy/pasted from packages/core/exoplanets/nasaClient.ts
// TODO: Move to a shared space
const MINIMAL_DEV_SYSTEMS = [
  // Famous systems
  "TRAPPIST-1",
  "Proxima Cen",
  "Barnard's Star",
  "Kepler-186",
  "TOI-700",
  "K2-18",
  // Systems with at least one displayable gaseous planet
  "TOI-1408"
];

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const tableName = Resource.SystemCatalog.name;

export async function listStarSystems() {
    const result = await client.send(
        new QueryCommand({
            TableName: tableName,
            IndexName: 'gsi1',
            KeyConditionExpression: 'gsi1pk = :pk',
            ExpressionAttributeValues: {
                ":pk": "SYSTEMS",
            }
        })
    );

    return result.Items ?? [];
}

export async function listSeedSystems() {
    const seedSystemIds = MINIMAL_DEV_SYSTEMS.map(normalizeHostName);
    const result = await client.send(
        new BatchGetCommand({
            RequestItems: {
                [tableName]: {
                    Keys: seedSystemIds.map(systemId => ({
                        pk: `SYSTEM#${systemId}`,
                        sk: "PROFILE"
                    }))
                }
            }
        })
    );

    const systems = result.Responses?.[tableName] ?? [];
    const systemsById = new Map(systems.map(system => [system.id, system]));

    return seedSystemIds
        .map(systemId => systemsById.get(systemId))
        .filter(system => system != null);
}

function normalizeHostName(host: string): string {
    return host.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function getSystem(systemId: string) {
    const result = await client.send(
        new GetCommand({
            TableName: tableName,
            Key: {
                pk: `SYSTEM#${systemId}`,
                sk: "PROFILE"
            }
        })
    );

    return result.Item ?? null;
}

export async function getPlanet(planetId: string) {
    const result = await client.send(
        new GetCommand({
            TableName: tableName,
            Key: {
                pk: `PLANET#${planetId}`,
                sk: "PROFILE"
            }
        })
    );

    return result.Item ?? null;
}

// Note: This will not work, as no STAR# records written yet.
export async function listStarsInSystem(systemId: string) {
    const result = await client.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
            ExpressionAttributeValues: {
                ":pk": `SYSTEM#${systemId}`,
                ":sk": "STAR#"
            }
        })
    );

    return result.Items ?? [];
}

export async function listPlanetsInSystem(systemId: string) {
    const result = await client.send(
        new QueryCommand({
            TableName: tableName,
            IndexName: "gsi1",
            KeyConditionExpression: "gsi1pk = :pk AND begins_with(gsi1sk, :sk)",
            ExpressionAttributeValues: {
                ":pk": `SYSTEM#${systemId}`,
                ":sk": "PLANET#"
            }
        })
    );

    return result.Items ?? [];
}

// Note: This will not work, as no STAR# records written yet.
export async function listPlanetsForStar(starId: string) {
    const result = await client.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
            ExpressionAttributeValues: {
                ":pk": `STAR#${starId}`,
                ":sk": "PLANET#"
            }
        })
    );

    return result.Items ?? [];
}
