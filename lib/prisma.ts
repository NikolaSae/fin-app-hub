import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export type ClaimWithRelations = Prisma.ClaimGetPayload<{
  include: {
    submitter: true;
    assignedTo: true;
    attachments: true;
    notes: {
      include: {
        author: true;
      };
    };
    history: true;
  };
}>;

export default prisma;