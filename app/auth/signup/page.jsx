"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { RegistrationSchema } from "@/validation";
import { useRouter } from "next/navigation";
import { signUpEvent } from "@/tools/api";
import toast from "react-hot-toast";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Sherehe
            </h1>
            <p className="text-gray-600">
              Create your account and start planning amazing events
            </p>
          </div>

          <Formik
            initialValues={{
              email: "",
              password: "",
              confirmPassword: "",
              name: "",
              username: "",
            }}
            validationSchema={RegistrationSchema}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await signUpEvent(values);
                toast.success("Account created successfully!");
                router.push("/auth/login");
                setLoading(false);
              } catch (error) {
                console.log(error);
                toast.error("Error creating account. Please try again.");
              } finally {
                setLoading(false);
              }
            }}
          >
            {({ touched }) => (
              <Form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Name
                    </Label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-gray-700 font-medium"
                    >
                      Username
                    </Label>
                    <Field
                      type="text"
                      id="username"
                      name="username"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                    <ErrorMessage
                      name="username"
                      component="p"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-gray-700 font-medium"
                    >
                      Password
                    </Label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-gray-700 font-medium"
                    >
                      Confirm Password
                    </Label>
                    <Field
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-md transition-colors"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </Form>
            )}
          </Formik>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default Signup;
