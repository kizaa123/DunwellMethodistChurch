import PageHeader from "@/components/PageHeader";
import MinistryList from "@/components/MinistryList";

export const metadata = {
  title: "Ministries",
};

export default function MinistriesPage() {
  return (
    <>
      <PageHeader
        title="Our Ministries"
        subtitle="Serving together, growing in faith, and transforming our community through active fellowship and love."
      />

      <section className="py-16 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MinistryList />
        </div>
      </section>
    </>
  );
}
