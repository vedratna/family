const API_URL = "http://localhost:4000/graphql";

interface GqlResponse<T = Record<string, unknown>> {
  data: T;
  errors?: { message: string }[];
}

export async function gqlRequest<T = Record<string, unknown>>(
  query: string,
  variables: Record<string, unknown> = {},
  userId?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (userId !== undefined) {
    headers["x-user-id"] = userId;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = (await response.json()) as GqlResponse<T>;
  if (json.errors !== undefined && json.errors.length > 0) {
    const messages = json.errors.map((e) => e.message).join("; ");
    throw new Error(`GraphQL error: ${messages}`);
  }
  return json.data;
}
