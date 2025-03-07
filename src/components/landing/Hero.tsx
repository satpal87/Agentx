import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Database, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface HeroProps {
  onGetStarted?: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/chat");
    } else if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
      <div className="container px-4 md:px-6 mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        <div className="flex flex-col items-start space-y-6 lg:w-1/2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
            ServiceNow AI Assistant
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl">
            The ultimate ServiceNow problem-solver—built for Developers,
            Consultants, and Agents to work smarter, not harder.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gap-2" onClick={handleGetStarted}>
              Get Started <ArrowRight size={16} />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn More
            </Button>
          </div>

          <div className="flex items-center space-x-8 pt-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <MessageSquare size={20} />
              </div>
              <span className="text-sm font-medium">
                Natural Language Queries
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Database size={20} />
              </div>
              <span className="text-sm font-medium">
                ServiceNow Integration
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Code size={20} />
              </div>
              <span className="text-sm font-medium">Code Generation</span>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2">
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1607798748738-b15c40d33d57?w=800&q=80"
              alt="ServiceNow AI Assistant Interface"
              className="w-full h-auto object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-60 rounded-lg"></div>

            {/* Chat interface preview overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg backdrop-blur-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    How can I query ServiceNow records?
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    I can help you with that! Here's how to query ServiceNow
                    records using the GlideRecord API...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
