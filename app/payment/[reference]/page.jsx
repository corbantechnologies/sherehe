"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Clock,
  CreditCard,
  Mail,
  Phone,
  User,
  Ticket,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiActions } from "@/tools/api";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { useFetchBooking } from "@/hooks/bookings/actions";

function BookingPayment() {
  const router = useRouter();
  const { reference } = useParams();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");

  const {
    isLoading: isLoadingBooking,
    data: booking,
    error: bookingError,
  } = useFetchBooking(reference);

  // Set loading to false when booking fetch completes
  useEffect(() => {
    if (!isLoadingBooking) {
      setLoading(false);
      // Pre-fill phone number from booking if available
      if (booking?.phone) {
        setPhoneNumber(booking.phone);
      }
    }
  }, [isLoadingBooking, booking]);

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^254\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handlePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid phone number (e.g., 2547XXXXXXXX)");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentMessage(null);
    try {
      const payload = {
        booking_reference: booking?.reference,
        phone_number: phoneNumber,
      };

      const response = await apiActions?.post("/api/v1/mpesa/pay/", payload);
      setPaymentMessage(
        "Please check your phone and enter your M-Pesa PIN to complete the payment."
      );
    } catch (error) {
      setIsProcessingPayment(false);
      setPaymentMessage(null);
      toast.error(
        "Error initiating payment: " + (error.message || "Please try again")
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoadingBooking || loading) {
    return <LoadingSpinner />;
  }

  if (bookingError || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Booking not found.</p>
          <button
            onClick={() => router.push("/events")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Details
          </h1>
          <p className="text-gray-600">
            Complete your payment to confirm your booking
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Booking Summary
              </h2>
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
            </div>
            <p className="text-gray-600 mb-4">Reference: {booking.reference}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{booking.name}</p>
                    <p className="text-sm text-gray-600">Attendee</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{booking.phone}</p>
                    <p className="text-sm text-gray-600">Phone</p>
                  </div>
                </div>
                {booking.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{booking.email}</p>
                      <p className="text-sm text-gray-600">Email</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Ticket Type</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {booking.ticket_type?.name || booking.ticket_type}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Quantity</p>
                  <p className="text-sm text-gray-600">
                    {booking.quantity} ticket{booking.quantity > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Booked on</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <hr className="my-4" />
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="font-medium">
                {booking.description || "No description provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </h2>
            <p className="text-gray-600 mb-4">
              Complete your payment to secure your booking
            </p>
            <div className="flex items-center justify-between text-lg mb-6">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold text-2xl">
                {booking.currency || "KES"}{" "}
                {parseFloat(booking.amount).toLocaleString()}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(
                    booking.payment_status
                  )}`}
                >
                  {booking.payment_status}
                </span>
              </div>
            </div>
            {booking.payment_status === "PENDING" && (
              <div className="mb-6">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  M-Pesa Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="2547XXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the phone number registered with M-Pesa (e.g.,
                  2547XXXXXXXX)
                </p>
              </div>
            )}
            {paymentMessage && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <p className="text-blue-600">{paymentMessage}</p>
              </div>
            )}
            <hr className="my-4" />
            {booking.payment_status === "PENDING" && (
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment || !phoneNumber}
                className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>Processing Payment...</>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay with M-Pesa {booking.currency || "KES"}{" "}
                    {parseFloat(booking.amount).toLocaleString()}
                  </>
                )}
              </button>
            )}
            {booking.payment_status === "COMPLETED" && (
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-green-600 font-semibold mb-2">
                  Payment Completed!
                </div>
                <p className="text-sm text-green-600">
                  Your booking has been confirmed.
                </p>
                {booking.mpesa_receipt_number && (
                  <p className="text-xs text-green-600 mt-2">
                    M-Pesa Receipt: {booking.mpesa_receipt_number}
                  </p>
                )}
              </div>
            )}
            {booking.payment_status === "FAILED" && (
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-red-600 font-semibold mb-2">
                  Payment Failed
                </div>
                <p className="text-sm text-red-600">
                  Please try again or contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPayment;
