import { PackageManager } from '@/components/ui/package-manager';

export const metadata = {
  title: 'Package Manager | Extism Plugin Registry',
  description: 'Manage and install Extism plugins with the package manager',
};

export default function PackageManagerPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Package Manager</h1>
          <p className="text-muted-foreground">
            Install, update, and manage Extism plugins with the integrated package manager.
          </p>
        </div>
        
        <div className="mt-8">
          <PackageManager />
        </div>
        
        <div className="mt-10 border-t pt-8">
          <h2 className="text-xl font-bold mb-4">About Package Management</h2>
          <div className="prose prose-gray max-w-none dark:prose-invert">
            <p>
              The Extism Package Manager allows you to install and manage WebAssembly plugins 
              from the registry. Packages are resolved with their dependencies, verified for 
              security, and cached locally for optimal performance.
            </p>
            <h3>Key Features</h3>
            <ul>
              <li>Dependency resolution and conflict management</li>
              <li>Version control with semver compatibility</li>
              <li>Cryptographic verification of package signatures</li>
              <li>Local caching system for improved performance</li>
              <li>Plugin activation and deactivation</li>
            </ul>
            <h3>Command Line Usage</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto">
              <code>
                # Install a package{'\n'}
                extism package install markdown-parser{'\n\n'}
                # Install a specific version{'\n'}
                extism package install json-validator@0.8.2{'\n\n'}
                # Update all packages{'\n'}
                extism package update{'\n\n'}
                # Uninstall a package{'\n'}
                extism package uninstall hello-plugin
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 