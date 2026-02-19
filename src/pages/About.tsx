import { Leaf, Users, Award, Target, Rocket, ShoppingBag, Truck, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAboutStats } from "@/hooks/useAboutStats";

const About = () => {
  const { settings } = useAdminSettings();
  const { stats: liveStats, loading: statsLoading } = useAboutStats();
  
  const stats = [
    { label: "Products Sold", value: statsLoading ? "..." : liveStats.productsSold.toLocaleString(), icon: ShoppingBag },
    { label: "Users", value: statsLoading ? "..." : liveStats.users.toLocaleString(), icon: Users },
    { label: "Happy Customers", value: statsLoading ? "..." : liveStats.happyCustomers.toLocaleString(), icon: Award },
  ];

  const values = [
    {
      icon: Leaf,
      title: "Simple Visibility",
      description: "We make product visibility simple, helping sellers showcase their items to the right audience."
    },
    {
      icon: Users,
      title: "Connecting People",
      description: "We connect buyers to sellers, creating seamless transactions across Africa."
    },
    {
      icon: Award,
      title: "Growing Businesses",
      description: "We help small businesses grow by providing them with the tools and platform they need to succeed."
    }
  ];

  const timeline = [
    { year: "2025", title: "Launch Year", description: "Alphadom launches in Abuja, Nigeria — building the foundation for a new era of African e-commerce." },
    { year: "2026", title: "Growing Strong", description: "Our goal: onboard 1,000+ verified vendors and establish Alphadom as a trusted marketplace." },
    { year: "2027", title: "National Expansion", description: "Expanding operations to all major cities across Nigeria with fast, reliable delivery." },
    { year: "2030", title: "Continental Vision", description: "Reaching 500,000+ sellers across Africa with 4M+ products sold — empowering entrepreneurs everywhere." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-24 overflow-hidden">
        <img src="/images/hero-about.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-primary/10 text-primary border-0 mb-4">About {settings.site_name}</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              {settings.about_hero_title || "Curating Quality Products"}
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {settings.about_hero_subtitle || "We're on a mission to make quality products accessible, affordable, and beautiful for everyone."}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Badge className="bg-primary/10 text-primary border-0 mb-4">Our Journey</Badge>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                {settings.about_story ? (
                  <div className="whitespace-pre-line">{settings.about_story}</div>
                ) : (
                  <>
                    <p>
                      Alphadom was born from a simple belief: that everyone deserves a platform where they can 
                      build and manage their own brands online. Founded in 2025, we started with a vision 
                      to transform how entrepreneurs approach e-commerce in Africa.
                    </p>
                    <p>
                      We believe that starting a business shouldn't be complicated. With Alphadom, sellers 
                      can start building their entrepreneurial journey today, gaining real-world experience in 
                      product management, customer service, and business operations.
                    </p>
                    <p>
                      We're not just building a marketplace — we're building the next generation of 
                      business leaders across Africa, one entrepreneur at a time.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/about-workspace.jpg"
                  alt="Alphadom workspace"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-5 rounded-2xl shadow-xl">
                <Rocket className="h-8 w-8 mb-2" />
                <div className="text-lg font-bold">Global Impact</div>
                <div className="text-sm opacity-90">Business Journey</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-border/50 rounded-2xl hover:shadow-lg transition-shadow">
                <CardContent className="p-4 md:p-8 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <div className="text-2xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-0 mb-4">Our Roadmap</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Journey Ahead</h2>
            <p className="text-muted-foreground">From vision to reality — here's how we plan to transform African e-commerce by 2030.</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform md:-translate-x-1/2"></div>
            
            {timeline.map((item, index) => (
              <div key={index} className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-12 md:pl-0`}>
                  <Card className="border-border/50 rounded-2xl hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <Badge className="bg-primary/10 text-primary border-0 mb-2">{item.year}</Badge>
                      <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full transform -translate-x-1/2 border-4 border-background shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-0 mb-4">Our Values</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">What We Stand For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do and help us stay true to our mission.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-border/50 rounded-2xl">
                <CardContent className="p-6 md:p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl leading-relaxed opacity-90 mb-10">
            To make online marketing as easy as possible for everyone across Africa. We're building a platform that empowers sellers, connects buyers, and simplifies e-commerce.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold mb-2">500K+</div>
              <div className="text-sm opacity-80">Sellers Across Africa by 2030</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold mb-2">4M+</div>
              <div className="text-sm opacity-80">Products Sold by 2030</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold mb-2">Fast</div>
              <div className="text-sm opacity-80">Delivery Across All Regions</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
