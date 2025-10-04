
import { Leaf, Users, Award, Target, Heart, Globe, Loader2 } from "lucide-react";
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
    { label: "Workers", value: statsLoading ? "..." : liveStats.workers.toLocaleString() },
    { label: "Happy Customers", value: statsLoading ? "..." : liveStats.happyCustomers.toLocaleString() },
  ];

  const values = [
    {
      icon: Leaf,
      title: "Sustainability First",
      description: "Every product is carefully selected for its environmental impact and sustainability credentials."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "We work closely with eco-conscious communities to understand and meet their needs."
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "All products undergo rigorous quality checks and meet our strict sustainability standards."
    },
    {
      icon: Heart,
      title: "Impact Focused",
      description: "We measure and track the positive environmental impact of every purchase made."
    }
  ];

  const team = [
    {
      name: "Sarah Green",
      role: "CEO & Founder",
      bio: "Environmental scientist turned entrepreneur, passionate about sustainable living.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Michael Eco",
      role: "Head of Sustainability",
      bio: "Former environmental consultant with 15+ years of experience in green technologies.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Emma Forest",
      role: "Product Manager",
      bio: "Product expert specializing in eco-friendly materials and sustainable manufacturing.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
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

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <Card key={index} className="border-primary/20">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {settings.about_story ? (
                  <div className="whitespace-pre-line">{settings.about_story}</div>
                ) : (
                  <>
                    <p>
                      {settings.site_name} was born from a simple belief: that quality products shouldn't be hard to find. 
                      Founded in 2020 by a team of product enthusiasts, we started as a small collection 
                      of carefully curated items spanning technology, lifestyle, and sustainable goods.
                    </p>
                    <p>
                      Today, we've grown into a comprehensive platform that connects discerning consumers with 
                      quality brands from around the world. Every product in our catalog is evaluated 
                      for its design, functionality, sustainability, and value proposition.
                    </p>
                    <p>
                      Our unique rating system helps customers make informed choices, while 
                      our fast shipping and customer service initiatives ensure that every purchase 
                      contributes to a positive shopping experience.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop"
                alt="Sustainable workspace"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-4 rounded-lg shadow-lg">
                <Globe className="h-8 w-8 mb-2" />
                <div className="text-lg font-bold">Global Impact</div>
                <div className="text-sm">Worldwide Shipping</div>
              </div>
            </div>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate individuals working together to make sustainable living the new normal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-green-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
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
            {settings.about_mission || `To make quality products accessible to everyone by providing carefully curated items 
            that don't compromise on style, function, or value. 
            We believe that thoughtful product selection can enhance daily life while 
            supporting innovative brands and sustainable practices.`}
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold mb-2">2030 Goal</div>
              <div className="text-green-200">Carbon Neutral Operations</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">100K</div>
              <div className="text-green-200">Trees to Plant</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-2">1M</div>
              <div className="text-green-200">Sustainable Products Sold</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
