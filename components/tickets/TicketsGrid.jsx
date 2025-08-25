import TicketCard from "./TicketCard";
import React from "react";

function TicketsGrid({ tickets, onMarkUsed }) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎫</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No tickets found
        </h3>
        <p className="text-muted-foreground">
          There are no tickets available for this event.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tickets.map((ticket, index) => (
        <TicketCard
          key={`${ticket.reference}-${index}`}
          ticket={ticket}
          onMarkUsed={onMarkUsed}
        />
      ))}
    </div>
  );
}
export default TicketsGrid;
