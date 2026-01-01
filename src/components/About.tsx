import { ShoppingCart, Truck, CreditCard, Award } from "lucide-react";

export const About = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Wide Selection",
      description:
        "From electronics to fashion and daily essentials — shop a wide range of products from trusted sellers.",
    },
    {
      icon: Award,
      title: "Verified Vendors",
      description: "Every seller is verified to ensure quality, reliability, and peace of mind.",
    },
    {
      icon: CreditCard,
      title: "Secure Shopping",
      description: "Protected payments and buyer safeguards for safe, worry-free transactions.",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable delivery options to your preferred location.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-secondary/10 to-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 px-2 sm:px-0">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Built for Everyone
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md sm:max-w-2xl mx-auto leading-relaxed">
            Whether you’re buying essentials, discovering great deals, or growing your online business, Alphadom
            connects buyers with verified vendors in one secure marketplace. Simple, reliable, and built for modern
            commerce.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <feature.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
