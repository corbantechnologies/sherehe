"use client";

import LoadingSpinner from "@/components/general/LoadingSpinner";
import { useFetchTickets } from "@/hooks/tickets/actions";
import { useParams } from "next/navigation";
import React from "react";

function EventTickets() {
  const { event_identity } = useParams();

  const {
    isLoading: isLoadingTickets,
    data: tickets,
    refetch: refetchTickets,
  } = useFetchTickets(event_identity);

  if (isLoadingTickets) {
    return <LoadingSpinner />;
  }

  console.log(tickets);

  return <div>EventTickets</div>;
}

export default EventTickets;
