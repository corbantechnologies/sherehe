"use client";

import useAxiosAuth from "@/hooks/general/useAxiosAuth";
import { apiMultipartActions } from "@/tools/api";
import { Formik } from "formik";
import React, { useState } from "react";
import toast from "react-hot-toast";

function CreateTicketType({ closeModal, refetch, event }) {
  const axios = useAxiosAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Create Ticket Type
      </h2>

      <Formik
        initialValues={{
          event: event?.identity,
          name: "",
          price: "",
          quantity_available: "",
          is_limited: false,
        }}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const formData = new FormData();
            formData.append("event", values.event);
            formData.append("name", values.name);
            formData.append(
              "price",
              values.price ? values.price.toString() : "0"
            );
            formData.append(
              "quantity_available",
              values.quantity_available
                ? values.quantity_available.toString()
                : ""
            );
            formData.append("is_limited", values.is_limited.toString());

            await apiMultipartActions?.post(
              `/api/v1/ticket-types/`,
              formData,
              axios
            );
            toast.success("Ticket type created successfully.");
            setLoading(false);
            closeModal(); 
            refetch();
          } catch (error) {}
        }}
      ></Formik>
    </div>
  );
}

export default CreateTicketType;
