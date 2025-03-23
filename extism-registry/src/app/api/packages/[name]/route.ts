import { NextRequest, NextResponse } from 'next/server';

// Define types for package data structure
interface PackageVersion {
  version: string;
  date: string;
}

interface PackageDownloads {
  total: number;
  monthly: number;
  weekly: number;
}

interface PackageExportParam {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
  properties?: Array<{ name: string; type: string; description: string }>;
}

interface PackageExport {
  name: string;
  description: string;
  inputs: PackageExportParam[];
  outputs: PackageExportParam[];
}

interface PackageDetails {
  name: string;
  description: string;
  versions: PackageVersion[];
  latest: string;
  license: string;
  author: string;
  repository: string;
  homepage: string;
  language: string;
  keywords: string[];
  downloads: PackageDownloads;
  stars: number;
  readme: string;
  exports: PackageExport[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

// Mock package details database
const mockPackageDetails: Record<string, PackageDetails> = {
  'hello-plugin': {
    name: 'hello-plugin',
    description: 'A simple Hello World plugin for Extism',
    versions: [
      { version: '1.0.0', date: '2023-09-15' },
      { version: '0.9.0', date: '2023-08-20' },
      { version: '0.8.5', date: '2023-07-10' }
    ],
    latest: '1.0.0',
    license: 'MIT',
    author: 'Extism Team',
    repository: 'https://github.com/extism/hello-plugin',
    homepage: 'https://extism.org/plugins/hello-plugin',
    language: 'typescript',
    keywords: ['hello', 'example', 'starter'],
    downloads: {
      total: 1250,
      monthly: 320,
      weekly: 85
    },
    stars: 24,
    readme: `# Hello Plugin\n\nA simple Hello World plugin for Extism.\n\n## Usage\n\n\`\`\`typescript\nimport { Plugin } from '@extism/sdk';\n\nconst plugin = new Plugin('./hello-plugin.wasm');\nconst result = await plugin.call('hello', 'World');\nconsole.log(result.string()); // Hello, World!\n\`\`\``,
    exports: [
      {
        name: 'hello',
        description: 'Returns a greeting',
        inputs: [
          { name: 'name', type: 'string', description: 'Name to greet', optional: true }
        ],
        outputs: [
          { name: 'greeting', type: 'string', description: 'The greeting message' }
        ]
      }
    ],
    dependencies: {},
    devDependencies: {
      '@extism/pdk': '^1.0.0'
    }
  },
  'markdown-parser': {
    name: 'markdown-parser',
    description: 'Parse and render Markdown content to HTML and other formats',
    versions: [
      { version: '2.1.3', date: '2023-12-15' },
      { version: '2.1.2', date: '2023-11-10' },
      { version: '2.1.1', date: '2023-10-25' },
      { version: '2.1.0', date: '2023-10-05' },
      { version: '2.0.0', date: '2023-08-18' }
    ],
    latest: '2.1.3',
    license: 'Apache-2.0',
    author: 'Markdown Team',
    repository: 'https://github.com/extism/markdown-parser',
    homepage: 'https://extism.org/plugins/markdown-parser',
    language: 'rust',
    keywords: ['markdown', 'parser', 'renderer', 'html'],
    downloads: {
      total: 3420,
      monthly: 860,
      weekly: 210
    },
    stars: 78,
    readme: `# Markdown Parser\n\nA plugin for parsing and rendering Markdown content.\n\n## Features\n\n- Convert Markdown to HTML\n- Support for GitHub Flavored Markdown\n- Table of contents generation\n- Syntax highlighting\n\n## Usage\n\n\`\`\`rust\nuse extism_sdk::Plugin;\n\nlet plugin = Plugin::new("./markdown-parser.wasm");\nlet markdown = "# Hello\\nThis is **bold**.";\nlet result = plugin.call("parse", markdown.as_bytes());\nprintln!("{}", String::from_utf8(result).unwrap());\n\`\`\``,
    exports: [
      {
        name: 'parse',
        description: 'Parse Markdown to HTML',
        inputs: [
          { name: 'content', type: 'string', description: 'Markdown content to parse' }
        ],
        outputs: [
          { name: 'html', type: 'string', description: 'HTML output' }
        ]
      },
      {
        name: 'parse_with_options',
        description: 'Parse Markdown to HTML with options',
        inputs: [
          { name: 'content', type: 'string', description: 'Markdown content to parse' },
          { name: 'options', type: 'object', description: 'Parsing options' }
        ],
        outputs: [
          { name: 'html', type: 'string', description: 'HTML output' }
        ]
      }
    ],
    dependencies: {},
    devDependencies: {}
  },
  'json-validator': {
    name: 'json-validator',
    description: 'Validate JSON against schemas with comprehensive error reporting',
    versions: [
      { version: '0.8.2', date: '2023-11-20' },
      { version: '0.8.1', date: '2023-10-15' },
      { version: '0.8.0', date: '2023-09-30' },
      { version: '0.7.5', date: '2023-08-25' }
    ],
    latest: '0.8.2',
    license: 'MIT',
    author: 'JSON Tools',
    repository: 'https://github.com/json-tools/validator',
    homepage: 'https://json-tools.io/validator',
    language: 'go',
    keywords: ['json', 'schema', 'validator', 'jsonschema'],
    downloads: {
      total: 890,
      monthly: 320,
      weekly: 75
    },
    stars: 31,
    readme: `# JSON Validator\n\nValidate JSON against JSON Schema with detailed error reporting.\n\n## Usage\n\n\`\`\`go\nimport (\n  "github.com/extism/go-sdk"\n)\n\nfunc main() {\n  plugin, _ := extism.NewPlugin("./json-validator.wasm", nil, false)\n  defer plugin.Close()\n  \n  input := []byte(\`{"schema": { "type": "object" }, "data": { "name": "test" } }\`)\n  output, _ := plugin.Call("validate", input)\n  fmt.Println(string(output))\n}\n\`\`\``,
    exports: [
      {
        name: 'validate',
        description: 'Validate JSON against a schema',
        inputs: [
          { 
            name: 'input', 
            type: 'object', 
            description: 'Input with schema and data',
            properties: [
              { name: 'schema', type: 'object', description: 'JSON Schema' },
              { name: 'data', type: 'any', description: 'Data to validate' }
            ]
          }
        ],
        outputs: [
          { 
            name: 'result', 
            type: 'object', 
            description: 'Validation result',
            properties: [
              { name: 'valid', type: 'boolean', description: 'Whether validation passed' },
              { name: 'errors', type: 'array', description: 'Validation errors if any' }
            ]
          }
        ]
      }
    ],
    dependencies: {},
    devDependencies: {}
  }
};

interface PackageRouteParams {
  params: {
    name: string;
  }
}

export async function GET(
  request: NextRequest,
  { params }: PackageRouteParams
) {
  try {
    const packageName = params.name;
    
    // Check if package exists
    if (!mockPackageDetails[packageName]) {
      return NextResponse.json(
        { error: `Package "${packageName}" not found` },
        { status: 404 }
      );
    }
    
    // Get package details
    const packageDetails = mockPackageDetails[packageName];
    
    // URL query parameters
    const url = new URL(request.url);
    const version = url.searchParams.get('version') || packageDetails.latest;
    
    // Check if requested version exists
    const versionExists = packageDetails.versions.some((v: PackageVersion) => v.version === version);
    
    if (version !== 'latest' && !versionExists) {
      return NextResponse.json(
        { error: `Version "${version}" not found for package "${packageName}"` },
        { status: 404 }
      );
    }
    
    // For simplicity, we don't differentiate between versions in this mock
    return NextResponse.json(packageDetails);
  } catch (error) {
    console.error(`Error fetching package:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch package details' },
      { status: 500 }
    );
  }
} 