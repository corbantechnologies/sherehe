"use client";

import { getTickets } from "@/services/tickets";
import { useQuery } from "@tanstack/react-query";

export function useFetchTickets(event_identity) {
  return useQuery({
    queryKey: ["tickets", event_identity],
    queryFn: () => getTickets(event_identity),
    enabled: !!event_identity,
  });
}

export function useFetchTicket(reference) {
  return useQuery({
    queryKey: ["ticket", reference],
    queryFn: () => getTicket(reference),
    enabled: !!reference,
  });
}
