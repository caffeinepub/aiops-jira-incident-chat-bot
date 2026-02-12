import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Card } from '../backend';

export function useGreetingCard() {
  const { actor, isFetching } = useActor();

  return useQuery<Card>({
    queryKey: ['greetingCard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getGreetingCard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStaticAvatar(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Uint8Array>({
    queryKey: ['staticAvatar', userId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getStaticAvatar(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}
