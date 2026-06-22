import PageHeader from "@/components/PageHeader";
import { leadership, churchInfo } from "@/lib/data";

export const metadata = {
  title: "About Us",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Us"
        subtitle="Discover our history, vision, and the people who lead our congregation"
      />

      {/* History */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80"
                alt="Church History"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-4">Our History</h2>
              <p className="text-stone-600 leading-relaxed mb-4">
                {churchInfo.name} was founded in 1892 by a small group of faithful Methodists
                who gathered in a humble wooden chapel. Over the decades, our congregation has
                grown from a handful of families to a vibrant community of over 500 members.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Through wars, economic changes, and social transformation, our church has remained
                a steadfast anchor in the community — a place where generations have come to worship,
                celebrate, mourn, and find hope.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <div className="h-12 w-12 rounded-full bg-[#1e3a5f] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-4">Our Vision</h2>
              <p className="text-stone-600 leading-relaxed">
                To be a thriving, Christ-centered community that transforms lives through worship,
                discipleship, and service — reaching every corner of our city with the gospel of
                Jesus Christ.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <div className="h-12 w-12 rounded-full bg-[#c9a227] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-4">Our Mission</h2>
              <p className="text-stone-600 leading-relaxed">
                To make disciples of Jesus Christ for the transformation of the world by
                proclaiming the gospel, nurturing believers, and serving our community with
                compassion and justice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#c9a227] font-medium tracking-widest uppercase text-sm mb-3">
              Our Team
            </p>
            <h2 className="font-serif text-3xl font-bold text-[#1e3a5f]">Church Leadership</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader) => (
              <div
                key={leader.name}
                className="bg-white rounded-xl overflow-hidden text-center border border-stone-200 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square w-full overflow-hidden bg-stone-100">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-[#1e3a5f] text-sm">{leader.name}</h3>
                  <p className="text-[#c9a227] text-xs font-medium mb-2">{leader.role}</p>
                  <p className="text-stone-500 text-xs leading-relaxed">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
