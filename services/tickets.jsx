"use client";

import { apiMultipartActions } from "@/tools/api";

export const getTickets = async (event_identity) => {
  const response = await apiMultipartActions?.get(
    `/api/v1/tickets/${event_identity}/`
  );
  return response?.data?.results || [];
};

export const getTicket = async (reference) => {
  const response = await apiMultipartActions?.get(
    `/api/v1/tickets/${reference}/`
  );
  return response?.data || {};
};

export const checkinTicket = async (reference, axios) => {
  await apiMultipartActions?.patch(`/api/v1/tickets/${reference}/`, axios);
};
