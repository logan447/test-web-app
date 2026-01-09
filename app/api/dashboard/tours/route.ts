import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeMode = session.user.activeMode || session.user.role;

    let tours;

    if (activeMode === 'PROVIDER') {
      // Provider mode: Get tours where provider received the request
      tours = await prisma.tourAppointment.findMany({
        where: {
          request: {
            provider: {
              userId: session.user.id,
            },
          },
          // Only get upcoming and accepted tours
          status: {
            in: ['PENDING', 'ACCEPTED'],
          },
          proposedDate: {
            gte: new Date(), // Future tours only
          },
        },
        include: {
          request: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              familyProfile: {
                select: {
                  id: true,
                  lovedOneName: true,
                  profilePhoto: true,
                },
              },
              provider: {
                select: {
                  id: true,
                  name: true,
                  providerType: true,
                },
              },
            },
          },
        },
        orderBy: {
          proposedDate: 'asc',
        },
        take: 10,
      });
    } else {
      // Family mode: Get tours where family sent the request
      tours = await prisma.tourAppointment.findMany({
        where: {
          request: {
            senderId: session.user.id,
          },
          // Only get upcoming and accepted tours
          status: {
            in: ['PENDING', 'ACCEPTED'],
          },
          proposedDate: {
            gte: new Date(), // Future tours only
          },
        },
        include: {
          request: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              familyProfile: {
                select: {
                  id: true,
                  lovedOneName: true,
                  profilePhoto: true,
                },
              },
              provider: {
                select: {
                  id: true,
                  name: true,
                  providerType: true,
                  address: true,
                  city: true,
                  state: true,
                  coverPhoto: true,
                },
              },
            },
          },
        },
        orderBy: {
          proposedDate: 'asc',
        },
        take: 10,
      });
    }

    return NextResponse.json({ tours });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    );
  }
}
