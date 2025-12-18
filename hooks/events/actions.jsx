"use client";

import { getEvent, getEvents, getMyEvents } from "@/services/events";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../general/useAxiosAuth";

export function useFetchEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });
}

export function useFetchEvent(event_code) {
  return useQuery({
    queryKey: ["events", event_code],
    queryFn: () => getEvent(event_code),
    enabled: !!event_code,
  });
}

export function useFetchMyEvents() {
  const axios = useAxiosAuth();
  return useQuery({
    queryKey: ["events"],
    queryFn: () => getMyEvents(axios),
  });
}
