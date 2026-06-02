export const fetchWithRetry = async (
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
): Promise<Response> => {
  try {
    return await fetch(input, init);
  } catch {
    await new Promise((r) => setTimeout(r, 500));
    return fetch(input, init);
  }
};
