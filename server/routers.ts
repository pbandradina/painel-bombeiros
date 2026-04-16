import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../../server/routers';

// Criar o objeto trpc principal
export const trpc = createTRPCReact<AppRouter>();