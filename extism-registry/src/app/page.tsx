import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Feature Complete Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4 mb-8 text-center">
        <p className="text-green-800 dark:text-green-400 font-medium">
          🎉 All planned features are now complete! The Extism Plugin Ecosystem is ready for use 🎉
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">Extism Plugin Registry</h1>
        <p className="text-xl mb-8 text-muted-foreground">
          A modern platform for discovering, sharing, and managing Extism plugins.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/packages">Browse Plugins</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/publish">Publish Plugin</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/docs">Documentation</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <FeatureCard 
          title="Multi-language Support" 
          description="Build plugins in TypeScript, Go, Python, Rust, or C/C++. Extism makes it easy to develop in your preferred language."
          icon="🌍"
        />
        <FeatureCard 
          title="Secure Execution" 
          description="All plugins run in isolated WebAssembly sandboxes, ensuring security and portability across different environments."
          icon="🔒"
        />
        <FeatureCard 
          title="Mastra Integration" 
          description="Seamlessly integrate plugins with Mastra tools, expanding functionality without compromising on performance."
          icon="🔌"
        />
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-3xl font-bold mb-8">Start Building with Extism</h2>
        <div className="max-w-3xl mx-auto mb-8 text-muted-foreground">
          <p>Extism provides a flexible framework for building and integrating plugins across your applications. Get started today and join a growing community of developers building portable, secure plugins.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/getting-started">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
} 