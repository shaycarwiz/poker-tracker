import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.backendToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // For now, we'll need to get the player ID from the player data
    // In a real implementation, you might want to store the player ID in the session
    // or create a separate endpoint that handles this
    const playerResponse = await fetch(`${API_BASE_URL}/api/players/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.backendToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!playerResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to get player data' },
        { status: playerResponse.status }
      );
    }

    const playerData = await playerResponse.json();
    const playerId = playerData.data?.id;

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID not found' },
        { status: 404 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/sessions/player/${playerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.backendToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching player sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
