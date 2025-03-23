"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock type for installed package
interface InstalledPackage {
  name: string;
  version: string;
  language: string;
  path: string;
  installedAt: string;
  size: string;
  status: 'active' | 'inactive' | 'error';
}

// Mock data for installed packages
const mockInstalledPackages: InstalledPackage[] = [
  {
    name: 'hello-plugin',
    version: '1.0.0',
    language: 'typescript',
    path: '/.extism/packages/hello-plugin/1.0.0',
    installedAt: '2023-12-10T14:30:00Z',
    size: '1.2 MB',
    status: 'active'
  },
  {
    name: 'markdown-parser',
    version: '2.1.3',
    language: 'rust',
    path: '/.extism/packages/markdown-parser/2.1.3',
    installedAt: '2023-12-12T09:15:00Z',
    size: '3.5 MB',
    status: 'active'
  },
  {
    name: 'json-validator',
    version: '0.8.2',
    language: 'go',
    path: '/.extism/packages/json-validator/0.8.2',
    installedAt: '2023-12-05T11:45:00Z',
    size: '2.1 MB',
    status: 'inactive'
  }
];

export function PackageManager() {
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>(mockInstalledPackages);
  const [packageName, setPackageName] = useState('');
  const [packageVersion, setPackageVersion] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [installing, setInstalling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter installed packages based on search query
  const filteredPackages = installedPackages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstall = () => {
    if (!packageName) {
      setErrorMessage('Please enter a package name');
      return;
    }

    setInstalling(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Simulate installation
    setTimeout(() => {
      // Check if package already exists
      const existingIndex = installedPackages.findIndex(p => p.name === packageName);
      
      if (existingIndex >= 0) {
        // Update existing package
        const updatedPackages = [...installedPackages];
        updatedPackages[existingIndex] = {
          ...updatedPackages[existingIndex],
          version: packageVersion === 'latest' ? '1.0.0' : packageVersion,
          installedAt: new Date().toISOString(),
          status: 'active'
        };
        setInstalledPackages(updatedPackages);
        setSuccessMessage(`Updated package ${packageName} to version ${packageVersion === 'latest' ? '1.0.0' : packageVersion}`);
      } else {
        // Add new package
        const newPackage: InstalledPackage = {
          name: packageName,
          version: packageVersion === 'latest' ? '1.0.0' : packageVersion,
          language: ['typescript', 'rust', 'go', 'python', 'cpp'][Math.floor(Math.random() * 5)],
          path: `/.extism/packages/${packageName}/${packageVersion === 'latest' ? '1.0.0' : packageVersion}`,
          installedAt: new Date().toISOString(),
          size: `${(Math.random() * 5).toFixed(1)} MB`,
          status: 'active'
        };
        setInstalledPackages([...installedPackages, newPackage]);
        setSuccessMessage(`Installed package ${packageName}@${packageVersion === 'latest' ? '1.0.0' : packageVersion}`);
      }

      setInstalling(false);
      setPackageName('');
      setPackageVersion('latest');
    }, 1500);
  };

  const handleUninstall = (packageName: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Filter out the package to uninstall
    const updatedPackages = installedPackages.filter(pkg => pkg.name !== packageName);
    setInstalledPackages(updatedPackages);
    setSuccessMessage(`Uninstalled package ${packageName}`);
  };

  const handleActivate = (packageName: string) => {
    const updatedPackages = installedPackages.map(pkg => 
      pkg.name === packageName ? { ...pkg, status: 'active' } : pkg
    );
    setInstalledPackages(updatedPackages);
    setSuccessMessage(`Activated package ${packageName}`);
  };

  const handleDeactivate = (packageName: string) => {
    const updatedPackages = installedPackages.map(pkg => 
      pkg.name === packageName ? { ...pkg, status: 'inactive' } : pkg
    );
    setInstalledPackages(updatedPackages);
    setSuccessMessage(`Deactivated package ${packageName}`);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="installed">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="installed">Installed Packages</TabsTrigger>
          <TabsTrigger value="install">Install Package</TabsTrigger>
        </TabsList>
        
        <TabsContent value="installed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Installed Packages</CardTitle>
              <CardDescription>
                Manage your installed Extism plugins
              </CardDescription>
              <div className="mt-2">
                <Input 
                  placeholder="Search packages..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 text-green-800 p-3 rounded-md mb-4">
                  {successMessage}
                </div>
              )}
              
              {filteredPackages.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  {searchQuery ? 'No packages match your search' : 'No packages installed yet'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPackages.map((pkg) => (
                    <Card key={`${pkg.name}-${pkg.version}`} className="border-muted">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <h3 className="font-medium">{pkg.name}</h3>
                              <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                {pkg.version}
                              </span>
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                                pkg.status === 'active' ? 'bg-green-100 text-green-800' : 
                                pkg.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {pkg.status}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {pkg.language} • {pkg.size} • Installed: {new Date(pkg.installedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-auto">
                            {pkg.status === 'active' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeactivate(pkg.name)}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleActivate(pkg.name)}
                              >
                                Activate
                              </Button>
                            )}
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleUninstall(pkg.name)}
                            >
                              Uninstall
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''} installed
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="install" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Install Package</CardTitle>
              <CardDescription>
                Install a new Extism plugin from the registry
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMessage && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 text-green-800 p-3 rounded-md mb-4">
                  {successMessage}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="package-name">Package Name</Label>
                    <Input 
                      id="package-name" 
                      placeholder="e.g., markdown-parser" 
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="package-version">Version</Label>
                    <Select value={packageVersion} onValueChange={setPackageVersion}>
                      <SelectTrigger id="package-version">
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="1.0.0">1.0.0</SelectItem>
                        <SelectItem value="0.9.0">0.9.0</SelectItem>
                        <SelectItem value="0.8.0">0.8.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button 
                onClick={handleInstall}
                disabled={installing || !packageName}
              >
                {installing ? 'Installing...' : 'Install Package'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Package Management Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Update All Packages
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Verify Signatures
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clean Cache
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Dependency Management</CardTitle>
          <CardDescription>
            Manage and resolve package dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Conflict Resolution Strategy</span>
              <Select defaultValue="highest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highest">Highest Version</SelectItem>
                  <SelectItem value="compatible">Compatible Versions</SelectItem>
                  <SelectItem value="multiple">Allow Multiple</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Cache Mode</span>
              <Select defaultValue="use">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cache Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="use">Use Cache</SelectItem>
                  <SelectItem value="update">Update Cache</SelectItem>
                  <SelectItem value="bypass">Bypass Cache</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Verification Mode</span>
              <Select defaultValue="checksums">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="signatures">Full Signature</SelectItem>
                  <SelectItem value="checksums">Checksums Only</SelectItem>
                  <SelectItem value="none">No Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button className="ml-auto">Apply Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 