"use client";

import { useState, useMemo } from "react";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { useFetchTickets } from "@/hooks/tickets/actions";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Ticket as TicketIcon, ArrowLeft } from "lucide-react";
import TicketsGrid from "@/components/tickets/TicketsGrid";

function EventTickets() {
  const { event_identity } = useParams();
  const router = useRouter();

  const {
    isLoading: isLoadingTickets,
    data: tickets,
    refetch: refetchTickets,
  } = useFetchTickets(event_identity);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [localTickets, setLocalTickets] = useState([]);

  useMemo(() => {
    if (tickets) {
      setLocalTickets(tickets);
    }
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return localTickets.filter((ticket) => {
      const matchesSearch =
        ticket.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.identity.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "valid" && !ticket.is_used) ||
        (statusFilter === "used" && ticket.is_used);

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, localTickets]);

  const stats = useMemo(() => {
    const total = localTickets.length;
    const used = localTickets.filter((t) => t.is_used).length;
    const valid = total - used;

    return { total, used, valid };
  }, [localTickets]);

  const handleMarkUsed = async (reference) => {
    // Optimistic update
    setLocalTickets((prev) =>
      prev.map((t) => (t.reference === reference ? { ...t, is_used: true } : t))
    );

    // TODO: Implement actual API call to mark ticket as used
    // For example:
    // await fetch(`/api/tickets/${reference}/mark-used`, { method: 'POST' });

    // Refetch to sync with server
    refetchTickets();
  };

  if (isLoadingTickets) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="items-center gap-2 sm:w-auto mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Button>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <TicketIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Event Tickets
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage and view all event tickets
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tickets</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-success">{stats.valid}</div>
            <div className="text-sm text-muted-foreground">Valid Tickets</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-muted-foreground">
              {stats.used}
            </div>
            <div className="text-sm text-muted-foreground">Used Tickets</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by reference or identity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
                <Badge
                  variant={statusFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setStatusFilter("all")}
                >
                  All ({stats.total})
                </Badge>
                <Badge
                  variant={statusFilter === "valid" ? "default" : "outline"}
                  className={`cursor-pointer ${
                    statusFilter === "valid"
                      ? "bg-success text-success-foreground"
                      : ""
                  }`}
                  onClick={() => setStatusFilter("valid")}
                >
                  Valid ({stats.valid})
                </Badge>
                <Badge
                  variant={statusFilter === "used" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setStatusFilter("used")}
                >
                  Used ({stats.used})
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Grid */}
        <TicketsGrid tickets={filteredTickets} onMarkUsed={handleMarkUsed} />
      </div>
    </div>
  );
}

export default EventTickets;
