import { ShoppingCart, Truck, Shield, Award } from "lucide-react";

export const About = () => {
  const features = [
    {
      icon: ShoppingCart,
      title: "Wide Selection",
      description: "From tech gadgets to sustainable products and everything in between"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep"
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Safe and secure payment processing with buyer protection"
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Premium quality products you can trust"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-secondary/10 to-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Why Choose Us
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're your one-stop destination for everything from cutting-edge technology to eco-friendly alternatives. Quality, variety, and customer satisfaction are at the heart of everything we do.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/20 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};