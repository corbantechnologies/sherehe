"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Badge,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import LoadingSpinner from "@/components/general/LoadingSpinner";
import { useFetchEvent } from "@/hooks/events/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateTicketType from "@/forms/tickettypes/CreateTicketType";

function EventDetail() {
  const { identity } = useParams();
  const navigate = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  const {
    isLoading: isLoadingEvent,
    data: event,
    isError: isErrorEvent,
    refetch: refetchEvent,
  } = useFetchEvent(identity);

  // Calculate event statistics
  const getEventStats = (event) => {
    let totalBookings = 0;
    let totalRevenue = 0;
    let confirmedBookings = 0;

    event.ticket_types.forEach((ticketType) => {
      ticketType.bookings.forEach((booking) => {
        totalBookings += booking?.quantity || 0;
        if (booking.status === "CONFIRMED") {
          confirmedBookings += booking?.quantity || 0;
          totalRevenue +=
            parseFloat(ticketType?.price || 0) * (booking?.quantity || 0);
        }
      });
    });

    return {
      totalBookings,
      confirmedBookings,
      totalRevenue,
      ticketTypes: event.ticket_types.length,
    };
  };

  // Flatten bookings with ticket type name for easier handling
  const getAllBookings = () => {
    return (
      event?.ticket_types?.flatMap((ticketType) =>
        ticketType?.bookings?.map((booking) => ({
          ...booking,
          ticketTypeName: ticketType?.name,
        }))
      ) || []
    );
  };

  // Filter bookings based on selected ticket type and status
  const filteredBookings = () => {
    let allBookings = getAllBookings();
    if (selectedTicketType !== "all") {
      allBookings = allBookings.filter(
        (booking) => booking.ticketTypeName === selectedTicketType
      );
    }
    if (selectedStatus === "confirmed") {
      allBookings = allBookings.filter(
        (booking) => booking.status === "CONFIRMED"
      );
    }
    return allBookings;
  };

  // Pagination logic
  const bookings = filteredBookings();
  const totalBookings = bookings.length;
  const totalPages = Math.ceil(totalBookings / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = bookings.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoadingEvent) {
    return <LoadingSpinner />;
  }

  if (isErrorEvent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load event details. Please try again.
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchEvent()}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Event not found.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const stats = getEventStats(event);
  const isUpcoming = new Date(event.start_date) >= new Date();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate?.back("/admin/events")}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
            <div className="flex items-center gap-2">
              <BadgeComponent variant={isUpcoming ? "default" : "secondary"}>
                {isUpcoming ? "Upcoming" : "Past"}
              </BadgeComponent>
              <span className="text-sm text-gray-500">#{event.reference}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {event.name}
              </h1>
              <p className="text-gray-600 mb-4">{event.description}</p>

              {/* Event Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {format(new Date(event.start_date), "MMM dd, yyyy")}
                    {event.start_time && ` at ${event.start_time}`}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>
                    {event.capacity
                      ? `${event.capacity} capacity`
                      : "Unlimited capacity"}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Actions */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto ">
              <Button
                size="sm"
                onClick={() =>
                  navigate?.push(`/admin/events/tickets/${identity}`)
                }
                className="w-full sm:w-auto bg-green-700 hover:bg-green-600 text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                View Tickets
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate?.push(`/admin/events/${identity}/edit`)}
                className="w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </Button>
            </div>
          </div>
        </div>

        {/* Event Image */}
        {event.image && (
          <div className="mb-6 sm:mb-8">
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats.confirmedBookings}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    KES {stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ticket Types</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {stats.ticketTypes}
                  </p>
                </div>
                <Badge className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Capacity Used</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {event.capacity
                      ? `${Math.round(
                          (stats.confirmedBookings / event.capacity) * 100
                        )}%`
                      : "N/A"}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="flex flex-wrap justify-start">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
            <TabsTrigger value="details">Event Details</TabsTrigger>
          </TabsList>

          {/* Ticket Types Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-semibold">Ticket Types</h2>

              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket Type
              </Button>
            </div>
            {event.ticket_types.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <Badge className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No ticket types yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first ticket type for this event.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="mx-auto flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket Type
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {event.ticket_types.map((ticketType) => {
                  const ticketStats = ticketType.bookings.reduce(
                    (acc, booking) => {
                      if (booking.status === "CONFIRMED") {
                        acc.sold += booking.quantity;
                        acc.revenue +=
                          parseFloat(ticketType.price) * booking.quantity;
                      }
                      return acc;
                    },
                    { sold: 0, revenue: 0 }
                  );
                  return (
                    <Card key={ticketType.id}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div>
                            <CardTitle className="text-lg">
                              {ticketType.name}
                            </CardTitle>
                            <CardDescription>
                              KES {ticketType.price}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Sold</p>
                            <p className="font-semibold">{ticketStats.sold}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Available</p>
                            <p className="font-semibold">
                              {ticketType.quantity_available
                                ? ticketType.quantity_available -
                                  ticketStats.sold
                                : "Unlimited"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Revenue</p>
                            <p className="font-semibold">
                              KES {ticketStats.revenue.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl">Recent Bookings</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Select
                      value={selectedTicketType}
                      onValueChange={(value) => {
                        setSelectedTicketType(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select Ticket Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Bookings</SelectItem>
                        {event.ticket_types.map((ticketType) => (
                          <SelectItem
                            key={ticketType.id}
                            value={ticketType.name}
                          >
                            {ticketType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedStatus}
                      onValueChange={(value) => {
                        setSelectedStatus(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="confirmed">
                          Confirmed Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>
                  Latest bookings for this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                          <tr>
                            <th scope="col" className="px-4 py-3">
                              Ticket Type
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Customer Name
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Email
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Phone
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Quantity
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Status
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Amount (KES)
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Booking Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedBookings.map((booking) => (
                            <tr
                              key={booking.identity}
                              className="bg-white border-b hover:bg-gray-50"
                            >
                              <td className="px-4 py-3">
                                {booking.ticketTypeName}
                              </td>
                              <td className="px-4 py-3">{booking.name}</td>
                              <td className="px-4 py-3">{booking.email}</td>
                              <td className="px-4 py-3">{booking.phone}</td>
                              <td className="px-4 py-3">{booking.quantity}</td>
                              <td className="px-4 py-3">
                                <BadgeComponent
                                  variant={
                                    booking.status === "CONFIRMED"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {booking.status}
                                </BadgeComponent>
                              </td>
                              <td className="px-4 py-3">
                                {parseFloat(booking.amount).toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                {format(
                                  new Date(booking.created_at),
                                  "MMM dd, yyyy HH:mm"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-4">
                      {paginatedBookings.map((booking) => (
                        <Card key={booking.identity} className="p-4">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-semibold">
                                Ticket Type:
                              </span>{" "}
                              {booking.ticketTypeName}
                            </div>
                            <div>
                              <span className="font-semibold">
                                Customer Name:
                              </span>{" "}
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
                              <span className="font-semibold">Quantity:</span>{" "}
                              {booking.quantity}
                            </div>
                            <div>
                              <span className="font-semibold">Status:</span>{" "}
                              <BadgeComponent
                                variant={
                                  booking.status === "CONFIRMED"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {booking.status}
                              </BadgeComponent>
                            </div>
                            <div>
                              <span className="font-semibold">
                                Amount (KES):
                              </span>{" "}
                              {parseFloat(booking.amount).toFixed(2)}
                            </div>
                            <div>
                              <span className="font-semibold">
                                Booking Date:
                              </span>{" "}
                              {format(
                                new Date(booking.created_at),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, totalBookings)} of {totalBookings}{" "}
                        bookings
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="w-full sm:w-auto"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex gap-1">
                          {totalPages <= 5 ? (
                            Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            ).map((page) => (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Button>
                            ))
                          ) : (
                            <>
                              <Button
                                variant={
                                  currentPage === 1 ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(1)}
                              >
                                1
                              </Button>
                              {currentPage > 3 && (
                                <span className="px-2">...</span>
                              )}
                              {Array.from(
                                { length: 3 },
                                (_, i) => currentPage - 1 + i
                              )
                                .filter((page) => page > 1 && page < totalPages)
                                .map((page) => (
                                  <Button
                                    key={page}
                                    variant={
                                      currentPage === page
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </Button>
                                ))}
                              {currentPage < totalPages - 2 && (
                                <span className="px-2">...</span>
                              )}
                              <Button
                                variant={
                                  currentPage === totalPages
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(totalPages)}
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="w-full sm:w-auto"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No bookings yet
                    </h3>
                    <p className="text-gray-600">
                      Bookings for this event will appear here once they are
                      made.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created By</p>
                    <p className="font-medium">{event.created_by}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reference</p>
                    <p className="font-mono">{event.reference}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created At</p>
                    <p className="font-medium">
                      {format(
                        new Date(event.created_at),
                        "MMM dd, yyyy 'at' HH:mm"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="font-medium">
                      {format(
                        new Date(event.updated_at),
                        "MMM dd, yyyy 'at' HH:mm"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-white max-w-md sm:max-w-lg p-6 sm:p-8 rounded-2xl shadow-2xl transform transition-all duration-300 animate-modal-open">
            <DialogHeader className="flex justify-between items-center mb-4">
              <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900">
                Create Ticket Type
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Add a new ticket type for the event "{event.name}"
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <CreateTicketType
                closeModal={() => setIsModalOpen(false)}
                event={event}
                refetch={refetchEvent}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default EventDetail;
