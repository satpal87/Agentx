import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  badge?: string;
  buttonText: string;
  popular?: boolean;
}

interface PricingProps {
  onSelectPlan?: (planId: string) => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const tiers: PricingTier[] = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description:
        "Basic access to ServiceNow AI Assistant with limited features.",
      features: [
        "5 AI queries per day",
        "Basic ServiceNow record search",
        "Simple code explanations",
        "Community support",
      ],
      buttonText: "Get Started",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$49",
      description:
        "Enhanced capabilities for professional ServiceNow developers.",
      features: [
        "Unlimited AI queries",
        "Advanced ServiceNow integration",
        "Code generation & optimization",
        "Priority support",
        "Custom API access",
        "Conversation history",
      ],
      badge: "Most Popular",
      buttonText: "Subscribe Now",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$199",
      description: "Full-featured solution for teams and organizations.",
      features: [
        "Everything in Pro",
        "Team collaboration features",
        "Custom ServiceNow instance integration",
        "Advanced security controls",
        "Dedicated account manager",
        "Custom training sessions",
        "SLA guarantees",
      ],
      buttonText: "Contact Sales",
      popular: false,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  return (
    <section
      id="pricing"
      className="py-20 px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-950 overflow-x-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that's right for you and start enhancing your
            ServiceNow experience today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={`flex flex-col h-full ${tier.popular ? "border-primary shadow-lg relative" : ""}`}
            >
              {tier.badge && (
                <Badge
                  className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2 px-3 py-1"
                  variant="default"
                >
                  {tier.badge}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.id !== "enterprise" && (
                    <span className="text-muted-foreground ml-2">/month</span>
                  )}
                </div>
                <p className="text-muted-foreground mt-2">{tier.description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSelectPlan(tier.id)}
                  className="w-full"
                  variant={tier.popular ? "default" : "outline"}
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Need a custom plan for your enterprise?{" "}
            <a href="#contact" className="text-primary hover:underline">
              Contact us
            </a>{" "}
            for special pricing.
          </p>
        </div>
      </div>
    </section>
  );
}
