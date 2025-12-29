
import { Leaf, Users, Award, Target, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAboutStats } from "@/hooks/useAboutStats";

const About = () => {
  const { settings } = useAdminSettings();
  const { stats: liveStats, loading: statsLoading } = useAboutStats();
  
  const stats = [
    { label: "Products Sold", value: statsLoading ? "..." : liveStats.productsSold.toLocaleString() },
    { label: "Users", value: statsLoading ? "..." : liveStats.users.toLocaleString() },
    { label: "Happy Customers", value: statsLoading ? "..." : liveStats.happyCustomers.toLocaleString() },
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


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-white/20 text-white mb-4">About {settings.site_name}</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {settings.about_hero_title || "Curating Quality Products"}
            </h1>
            <p className="text-xl lg:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {settings.about_hero_subtitle || "We're on a mission to make quality products accessible, affordable, and beautiful for everyone."}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - NOW BEFORE STATS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
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
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop"
                alt="Sustainable workspace"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-4 rounded-lg shadow-lg">
                <GraduationCap className="h-8 w-8 mb-2" />
                <div className="text-lg font-bold">Global Impact</div>
                <div className="text-sm">Business Journey</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - NOW AFTER STORY */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
            {stats.map((stat, index) => (
              <Card key={index} className="border-primary/20">
                <CardContent className="p-4 md:p-6">
                  <div className="text-xl md:text-3xl font-bold text-primary mb-1 md:mb-2">{stat.value}</div>
                  <div className="text-xs md:text-base text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and help us stay true to our mission.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-green-100">
                <CardContent className="p-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Mission Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl leading-relaxed text-green-100 mb-8">
            To make online marketing as easy as possible for everyone across Africa. We're building a platform that empowers sellers, connects buyers, and simplifies e-commerce.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold mb-2">500K+</div>
              <div className="text-green-200">Sellers Across Africa by 2030</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">4M+</div>
              <div className="text-green-200">Products Sold by 2030</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">Fast</div>
              <div className="text-green-200">Delivery Across All Regions</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;