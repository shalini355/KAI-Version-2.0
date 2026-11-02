export interface NearbyPsychiatrist {
  id: string;
  name: string;
  address: string;
  phoneNumber?: string;
  mapsUrl?: string;
}

export type ProviderSearch =
  | { searchBy: 'coordinates'; latitude: number; longitude: number }
  | { searchBy: 'text'; location: string };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? '';

function isNearbyPsychiatrist(value: unknown): value is NearbyPsychiatrist {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !('name' in value) ||
    typeof value.name !== 'string' ||
    !('address' in value) ||
    typeof value.address !== 'string'
  ) {
    return false;
  }

  if ('phoneNumber' in value && typeof value.phoneNumber !== 'string') return false;
  if (!('mapsUrl' in value) || value.mapsUrl === undefined) return true;
  if (typeof value.mapsUrl !== 'string') return false;

  try {
    const url = new URL(value.mapsUrl);
    return (
      url.protocol === 'https:' && ['maps.google.com', 'www.google.com'].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

function isProvidersResponse(value: unknown): value is { providers: NearbyPsychiatrist[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'providers' in value &&
    Array.isArray(value.providers) &&
    value.providers.every(isNearbyPsychiatrist)
  );
}

export const providerService = {
  async findNearbyPsychiatrists(search: ProviderSearch): Promise<NearbyPsychiatrist[]> {
    const response = await fetch(`${API_BASE_URL}/api/providers/psychiatrists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(search),
    });

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        typeof payload === 'object' &&
        payload !== null &&
        'error' in payload &&
        typeof payload.error === 'string'
          ? payload.error
          : 'Unable to search for nearby psychiatrists.';
      throw new Error(message);
    }

    if (!isProvidersResponse(payload)) {
      throw new Error('The provider search returned an invalid response.');
    }

    return payload.providers;
  },
};
