export async function parseApiResponse(response) {
  const text = await response.text();

  if (!text) {
    return {
      data: {
        success: false,
        message: response.ok ? 'Empty response from server' : `Request failed (${response.status})`,
      },
      ok: response.ok,
      status: response.status,
    };
  }

  try {
    return {
      data: JSON.parse(text),
      ok: response.ok,
      status: response.status,
    };
  } catch {
    return {
      data: {
        success: false,
        message: response.ok
          ? 'Invalid response from server'
          : `Request failed (${response.status}). Try again in a moment.`,
      },
      ok: false,
      status: response.status,
    };
  }
}
