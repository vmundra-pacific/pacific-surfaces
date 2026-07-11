import NewGrievanceForm from "@/components/customer/NewGrievanceForm";

export default function NewGrievancePage() {
  return (
    <div className="max-w-5xl">

      <p className="text-xs uppercase tracking-[0.3em] text-pacific-mid">
        Customer Care
      </p>

      <h1 className="mt-3 text-5xl font-light">
        Raise a Grievance
      </h1>

      <p className="mt-6 max-w-2xl text-pacific-mid leading-relaxed">
        Let us know the issue you&apos;re facing. Our customer support team
        will review your request and respond as quickly as possible.
      </p>

      <div className="mt-14">
        <NewGrievanceForm />
      </div>

    </div>
  );
}
