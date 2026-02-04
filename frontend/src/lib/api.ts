// API configuration for Moo Music Tracker
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface MilkingSession {
  _id: string;
  start_time: string;
  end_time: string;
  duration: number;
  milk_quantity: number;
  created_at?: string;
}

export interface CreateSessionPayload {
  start_time: string;
  end_time: string;
  duration: number;
  milk_quantity: number;
}

export interface SessionsResponse {
  data: MilkingSession[];
  total?: number;
  limit?: number;
  skip?: number;
}

export interface StatsResponse {
  totalSessions: number;
  totalMilk: number;
  totalDuration: number;
  avgMilkPerSession: number;
}

export async function createSession(payload: CreateSessionPayload): Promise<MilkingSession> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  return response.json();
}

export async function getSessions(limit = 50, skip = 0): Promise<MilkingSession[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions?sortBy=-created_at&limit=${limit}&skip=${skip}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.statusText}`);
  }

  const data = await response.json();
  // Handle both array response and paginated response
  return Array.isArray(data) ? data : (data.data || data);
}

export async function getStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/stats/overview`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
