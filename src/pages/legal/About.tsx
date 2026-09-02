import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-5xl font-semibold mb-6">About Marginalia</h1>
            <p className="text-xl text-muted-foreground mb-8">
              The premier platform for software developers and cybersecurity professionals to share knowledge, discuss trends, and build a secure digital future.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
            <div>
              <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                We believe that secure, well-built software is essential in today's digital world. Marginalia is built on the principle that knowledge about software development and cybersecurity should be accessible to everyone—from beginners to experts.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Our mission is to create a space where software engineers, security professionals, and DevOps specialists can publish quality content, share experiences, and learn from one another in a vibrant, collaborative community.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-lg p-12 border border-primary/20 h-96 flex items-center justify-center">
              <Zap className="h-32 w-32 text-primary opacity-20" />
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-semibold mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Target,
                  title: "Security First",
                  description: "We prioritize security best practices in everything we do, advocating for secure coding and DevSecOps practices.",
                },
                {
                  icon: Users,
                  title: "Knowledge Sharing",
                  description: "We foster a collaborative community where developers and security professionals learn from each other's experiences.",
                },
                {
                  icon: Zap,
                  title: "Technical Excellence",
                  description: "We uphold high standards for technical content, promoting best practices and cutting-edge methodologies.",
                },
              ].map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="bg-card rounded-lg border border-border p-8">
                    <Icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div className="mb-16 py-12 border-t border-b border-border">
            <h2 className="text-3xl font-semibold mb-8 text-center">Built by Security-Minded Engineers</h2>
            <p className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              Marginalia is developed and maintained by a passionate team of software engineers, security researchers, and DevOps specialists committed to creating the best platform for knowledge sharing in the tech community.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">Join Our Developer Community</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start sharing your expertise and learn from thousands of developers and security professionals worldwide.
            </p>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2 mx-auto">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
