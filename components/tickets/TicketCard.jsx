import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { QrCode, CheckCircle, Clock } from "lucide-react";

function TicketCard({ ticket, onMarkUsed }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConfirmCheckIn = async () => {
    setIsCheckingIn(true);
    await onMarkUsed(ticket.reference);
    setIsCheckingIn(false);
    setIsConfirmOpen(false);
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm font-medium text-foreground">
              {ticket.reference}
            </span>
          </div>
          <Badge
            variant={ticket.is_used ? "secondary" : "default"}
            className={`${
              ticket.is_used
                ? "bg-muted text-muted-foreground"
                : "bg-success text-success-foreground"
            }`}
          >
            {ticket.is_used ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Used
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Valid
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-lg border-2 border-border">
            <img
              src={ticket.qr_code}
              alt={`QR Code for ticket ${ticket.reference}`}
              className="w-32 h-32 object-contain"
            />
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {ticket.booking_info?.name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{ticket.booking_info.name}</span>
            </div>
          )}
          {ticket.ticket_type_info?.name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Type:</span>
              <span className="font-medium">
                {ticket.ticket_type_info.name}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{formatDate(ticket.created_at)}</span>
          </div>
          {ticket.updated_at !== ticket.created_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated:</span>
              <span className="font-medium">
                {formatDate(ticket.updated_at)}
              </span>
            </div>
          )}
        </div>

        {!ticket.is_used && (
          <>
            <Button
              variant="default"
              className="w-full bg-green-700 text-white hover:bg-green-600"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? "Checking In..." : "Check In"}
            </Button>
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogContent className="bg-white max-w-md sm:max-w-lg p-6 sm:p-8 rounded-2xl shadow-2xl transform transition-all duration-300 animate-modal-open">
                <DialogHeader>
                  <DialogTitle>Confirm Check-In</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to mark ticket {ticket.reference} as
                    used? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmOpen(false)}
                    disabled={isCheckingIn}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    className="w-full bg-green-700 text-white hover:bg-green-600"
                    onClick={handleConfirmCheckIn}
                    disabled={isCheckingIn}
                  >
                    {isCheckingIn ? "Processing..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default TicketCard;
