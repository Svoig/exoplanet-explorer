import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { fetchDevSeedExoplanets } from "../exoplanets/nasaClient";
import { normalizeSystem, normalizePlanet, normalizeHostName } from "../exoplanets/normalize";
import type { NasaPlanetRow } from "../../types";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function handler() {
    const rows = await fetchDevSeedExoplanets();
    const systems = dedupeSystemRows(rows).map(row => normalizeSystem(row, true)).filter(system => system.id && system.id !== "Unknown");
    const planets = rows.map(normalizePlanet);

    // Spread systems and planets into one array (entity type doesn't matter for this simple write command)
    for (const chunk of chunks([...systems, ...planets], 25)) {
        await client.send(
            new BatchWriteCommand({
                RequestItems: {
                    [Resource.SystemCatalog.name]: chunk.map(item => ({
                        PutRequest: { Item: item }
                    }))
                }
            })
        );
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            imported: planets.length
        })
    };
}

function dedupeSystemRows(rows: NasaPlanetRow[]): NasaPlanetRow[] {
    const seen = new Set<string>();
    const result: NasaPlanetRow[] = [];

    for (const row of rows) {
        const key = normalizeHostName(row.hostname ?? "");
        if (!key || seen.has(key)) continue;

        seen.add(key);
        result.push(row);
    }

    return result;
}

function chunks<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        result.push(items.slice(i, i + size));
    }

    return result;
}
