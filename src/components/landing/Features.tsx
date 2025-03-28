import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Code, Database, FileText, Sparkles, Bot, Zap } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("h-full transition-all hover:shadow-lg", className)}>
      <CardHeader>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function Features() {
  const features = [
    {
      icon: <Database size={24} />,
      title: "ServiceNow Integration",
      description:
        "Seamlessly connect to your ServiceNow instance and access records, tables, and system information through natural language queries.",
    },
    {
      icon: <Bot size={24} />,
      title: "AI-Powered Queries",
      description:
        "Ask questions in plain English and get intelligent responses about ServiceNow functionality, best practices, and troubleshooting tips.",
    },
    {
      icon: <Code size={24} />,
      title: "Code Generation",
      description:
        "Generate ServiceNow scripts, business rules, and client-side code snippets automatically based on your requirements.",
    },
    {
      icon: <FileText size={24} />,
      title: "Documentation Assistant",
      description:
        "Instantly access relevant ServiceNow documentation and get explanations tailored to your specific implementation.",
    },
    {
      icon: <Sparkles size={24} />,
      title: "Natural Language Processing",
      description:
        "Transform complex ServiceNow tasks into simple conversations with our advanced NLP capabilities.",
    },
    {
      icon: <Zap size={24} />,
      title: "Workflow Automation",
      description:
        "Automate repetitive tasks and create efficient workflows with AI-generated solutions tailored to your ServiceNow environment.",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 overflow-x-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Powerful Features for ServiceNow Professionals
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Leverage the power of AI to streamline your ServiceNow workflow and
            boost productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
