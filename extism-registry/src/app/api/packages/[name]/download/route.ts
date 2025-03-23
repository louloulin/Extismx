import { NextRequest, NextResponse } from 'next/server';

interface DownloadRouteParams {
  params: {
    name: string;
  }
}

export async function GET(
  request: NextRequest,
  { params }: DownloadRouteParams
) {
  try {
    const packageName = params.name;
    const url = new URL(request.url);
    const version = url.searchParams.get('version') || 'latest';
    
    // In a real implementation, this would:
    // 1. Check if the package and version exist
    // 2. Increment download counter
    // 3. Generate a signed URL for downloading the actual file
    // 4. Return the URL or stream the file directly
    
    console.log(`Download request for ${packageName}@${version}`);
    
    // For now, we'll simulate a download by returning a mock response
    // In a real app, you might redirect to a file URL or stream a file
    
    // Check if package exists (very simple mock)
    const knownPackages = ['hello-plugin', 'markdown-parser', 'json-validator', 'image-processor', 'text-classifier', 'http-client', 'crypto-utils', 'mastra-ai-connector'];
    
    if (!knownPackages.includes(packageName)) {
      return NextResponse.json(
        { error: `Package "${packageName}" not found` },
        { status: 404 }
      );
    }
    
    // Check if version is valid (simple check)
    if (version !== 'latest' && !version.match(/^\d+\.\d+\.\d+$/)) {
      return NextResponse.json(
        { error: `Invalid version format: "${version}"` },
        { status: 400 }
      );
    }
    
    // Return a mock download response
    // In a real API, you would set appropriate headers and return the actual file
    return new NextResponse(
      JSON.stringify({
        message: `Download initiated for ${packageName}@${version}`,
        downloadUrl: `https://registry.extism.org/downloads/${packageName}/${version}/${packageName}.wasm`,
        version: version === 'latest' ? '1.0.0' : version, // Simulate resolving 'latest'
        size: 1024 * 1024 * 2, // 2MB mock size
        checksum: {
          sha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // In a real API, you'd set these headers for an actual file download:
          // 'Content-Disposition': `attachment; filename="${packageName}-${version}.wasm"`,
          // 'Content-Type': 'application/wasm',
        },
      }
    );
  } catch (error) {
    console.error(`Error processing download for package:`, error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
} 