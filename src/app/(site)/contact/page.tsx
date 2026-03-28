import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — Pacific Surfaces",
  description:
    "Get in touch with Pacific Surfaces for quotes, samples, and project inquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Contact Us
      </h1>
      <p className="mt-2 text-gray-600">
        Ready to transform your space? Get in touch for quotes, samples, or any
        questions.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-500 focus:ring-gray-500"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-500 focus:ring-gray-500"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-gray-500 focus:ring-gray-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Send Message
          </button>
        </form>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900">Email</h3>
            <p className="mt-1 text-gray-600">info@thepacific.group</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Location</h3>
            <p className="mt-1 text-gray-600">India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
