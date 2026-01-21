import { useQueries } from '@tanstack/react-query';
import { useFetchAllUsers } from '@/app/queries/admin/fetch-users';
import { useFetchAllCafes } from '@/app/queries/fetch-cafes';
import { useFetchAllLocations } from '@/app/queries/fetch-locations';
import { useFetchEvents } from '@/app/queries/get-events';
import { useFetchUserLeads } from './user-leads';
import { useFetchSuggestions } from './fetch-suggestions';

export function useFetchAllAdminData() {
  const results = useQueries({
    queries: [
      {
        queryKey: ['all-users'],
        queryFn: useFetchAllUsers().queryFn,
      },
      {
        queryKey: ['all-cafes'],
        queryFn: useFetchAllCafes().queryFn,
      },
      {
        queryKey: ['all-locations'],
        queryFn: useFetchAllLocations().queryFn,
      },
      {
        queryKey: ['all-events'],
        queryFn: useFetchEvents().queryFn,
      },
      {
        queryKey: ['user-leads'],
        queryFn: useFetchUserLeads().queryFn,
      },
      {
        queryKey: ['suggestions'],
        queryFn: useFetchSuggestions().queryFn,
      },
    ],
  });

  const [usersQuery, cafesQuery, locationsQuery, eventsQuery, leadsQuery, suggestionsQuery] = results;

  const isLoading =
    usersQuery.isLoading ||
    cafesQuery.isLoading ||
    locationsQuery.isLoading ||
    eventsQuery.isLoading ||
    leadsQuery.isLoading ||
    suggestionsQuery.isLoading;

  const isError =
    usersQuery.isError ||
    cafesQuery.isError ||
    locationsQuery.isError ||
    eventsQuery.isError ||
    leadsQuery.isError ||
    suggestionsQuery.isError;

  const error =
    usersQuery.error ||
    cafesQuery.error ||
    locationsQuery.error ||
    eventsQuery.error ||
    leadsQuery.error ||
    suggestionsQuery.error;

  return {
    users: usersQuery.data,
    cafes: cafesQuery.data,
    locations: locationsQuery.data,
    events: eventsQuery.data,
    leads: leadsQuery.data,
    suggestions: suggestionsQuery.data,
    isLoading,
    isError,
    error,
  };
}
