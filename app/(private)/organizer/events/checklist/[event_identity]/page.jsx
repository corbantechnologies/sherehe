"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { useFetchEvent } from "@/hooks/events/actions";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  ArrowLeft,
  CheckCircle,
  Download,
  Users,
} from "lucide-react";
import Papa from "papaparse";
import useAxiosAuth from "@/hooks/general/useAxiosAuth";
import { apiActions } from "@/tools/api";

function EventCheckList() {
  const { event_identity: identity } = useParams();
  const axios = useAxiosAuth();
  const router = useRouter();
  const {
    isLoading: isLoadingEvent,
    data: event,
    refetch: refetchEvent,
  } = useFetchEvent(identity);

  const [searchTerm, setSearchTerm] = useState("");
  const [ticketTypeFilter, setTicketTypeFilter] = useState("all");
  const [checkingInBooking, setCheckingInBooking] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Extract confirmed bookings
  const confirmedBookings = useMemo(() => {
    if (!event?.ticket_types) return [];
    return event.ticket_types
      .flatMap((ticketType) =>
        (ticketType.bookings || []).map((booking) => ({
          ...booking,
          ticket_type_name:
            ticketType.ticket_type_info?.name || ticketType.name,
        }))
      )
      .filter((booking) => booking.status === "CONFIRMED");
  }, [event]);

  // Get unique ticket types for filter
  const ticketTypes = useMemo(() => {
    const types = new Set(
      confirmedBookings.map((booking) => booking.ticket_type_name)
    );
    return ["all", ...Array.from(types)];
  }, [confirmedBookings]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalConfirmed = confirmedBookings.length;
    const pendingCheckIn = confirmedBookings.reduce(
      (sum, booking) =>
        sum + booking.tickets.filter((ticket) => !ticket.is_used).length,
      0
    );
    const checkedIn = confirmedBookings.reduce(
      (sum, booking) =>
        sum + booking.tickets.filter((ticket) => ticket.is_used).length,
      0
    );
    return { totalConfirmed, pendingCheckIn, checkedIn };
  }, [confirmedBookings]);

  // Filter bookings by search and ticket type
  const filteredBookings = useMemo(() => {
    return confirmedBookings.filter((booking) => {
      const matchesSearch =
        booking.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.email || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (booking.phone || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTicketType =
        ticketTypeFilter === "all" ||
        booking.ticket_type_name === ticketTypeFilter;

      return matchesSearch && matchesTicketType;
    });
  }, [searchTerm, ticketTypeFilter, confirmedBookings]);

  const handleMarkBookingUsed = async (booking) => {
    setCheckingInBooking(booking.reference);
    try {
      // Mark all tickets in the booking as used
      const ticketPromises = booking.tickets.map((ticket) =>
        apiActions?.patch(
          `/api/v1/tickets/${ticket.reference}/checkin/`,
          {
            is_used: true,
          },
          axios
        )
      );

      await Promise.all(ticketPromises);
      await refetchEvent();
      toast.success(`Checked in booking ${booking.reference} successfully!`);
    } catch (error) {
      toast.error("Failed to check in booking. Please try again.");
      console.error("Error checking in booking:", error);
    } finally {
      setCheckingInBooking(null);
      setIsConfirmOpen(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvData = confirmedBookings.map((booking) => ({
      Reference: booking.reference,
      Name: booking.name,
      Email: booking.email,
      Phone: booking.phone,
      "Ticket Type": booking.ticket_type_name,
      Quantity: booking.quantity,
      Amount: booking.amount,
      "Created At": new Date(booking.created_at).toLocaleString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.name}_confirmed_bookings.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (isLoadingEvent) {
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
            <CheckCircle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              {event.name} - Check-In List
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage confirmed bookings for check-in
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {analytics.totalConfirmed}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Confirmed Bookings
            </div>
          </Card>
          <Card className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {analytics.pendingCheckIn}
            </div>
            <div className="text-sm text-muted-foreground">
              Pending Check-In Tickets
            </div>
          </Card>
          <Card className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-muted-foreground">
              {analytics.checkedIn}
            </div>
            <div className="text-sm text-muted-foreground">
              Checked-In Tickets
            </div>
          </Card>
        </div>

        {/* Download and View Tickets Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleDownloadCSV}
            disabled={!confirmedBookings.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/organizer/events/tickets/${identity}`)}
            className="bg-green-700 hover:bg-green-600 text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            View Tickets
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by reference, name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2 flex-wrap">
                {ticketTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={ticketTypeFilter === type ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setTicketTypeFilter(type)}
                  >
                    {type === "all" ? "All" : type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          Reference
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Name
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Email
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Phone
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Ticket Type
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Quantity
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Check-In
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => (
                        <tr
                          key={booking.reference}
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">{booking.reference}</td>
                          <td className="px-4 py-3">{booking.name}</td>
                          <td className="px-4 py-3">{booking.email}</td>
                          <td className="px-4 py-3">{booking.phone}</td>
                          <td className="px-4 py-3">
                            {booking.ticket_type_name}
                          </td>
                          <td className="px-4 py-3">{booking.quantity}</td>
                          <td className="px-4 py-3">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() =>
                                setIsConfirmOpen(booking.reference)
                              }
                              disabled={
                                checkingInBooking === booking.reference ||
                                booking.tickets.every(
                                  (ticket) => ticket.is_used
                                )
                              }
                            >
                              {checkingInBooking === booking.reference
                                ? "Checking In..."
                                : "Check In"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-4">
                  {filteredBookings.map((booking) => (
                    <Card key={booking.reference} className="p-4">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold">Reference:</span>{" "}
                          {booking.reference}
                        </div>
                        <div>
                          <span className="font-semibold">Name:</span>{" "}
                          {booking.name}
                        </div>
                        <div>
                          <span className="font-semibold">Email:</span>{" "}
                          {booking.email}
                        </div>
                        <div>
                          <span className="font-semibold">Phone:</span>{" "}
                          {booking.phone}
                        </div>
                        <div>
                          <span className="font-semibold">Ticket Type:</span>{" "}
                          {booking.ticket_type_name}
                        </div>
                        <div>
                          <span className="font-semibold">Quantity:</span>{" "}
                          {booking.quantity}
                        </div>
                        <div>
                          <Button
                            variant="default"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setIsConfirmOpen(booking.reference)}
                            disabled={
                              checkingInBooking === booking.reference ||
                              booking.tickets.every((ticket) => ticket.is_used)
                            }
                          >
                            {checkingInBooking === booking.reference
                              ? "Checking In..."
                              : "Check In"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎫</span>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No confirmed bookings found
                </h3>
                <p className="text-muted-foreground">
                  There are no confirmed bookings for this event.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        {isConfirmOpen && (
          <Dialog
            open={!!isConfirmOpen}
            onOpenChange={() => setIsConfirmOpen(false)}
          >
            <DialogContent className="bg-white max-w-md sm:max-w-lg p-6 sm:p-8 rounded-2xl shadow-2xl transform transition-all duration-300 animate-modal-open">
              <DialogHeader>
                <DialogTitle>Confirm Check-In</DialogTitle>
                <DialogDescription>
                  Are you sure you want to check in all tickets for booking{" "}
                  {isConfirmOpen}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={!!checkingInBooking}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() =>
                    handleMarkBookingUsed(
                      confirmedBookings.find(
                        (b) => b.reference === isConfirmOpen
                      )
                    )
                  }
                  disabled={!!checkingInBooking}
                >
                  {checkingInBooking ? "Processing..." : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default EventCheckList;
