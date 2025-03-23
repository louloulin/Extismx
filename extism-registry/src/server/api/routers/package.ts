import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

const mockPlugins = [
  {
    id: 'hello-plugin',
    name: 'hello-plugin',
    description: 'A simple hello world plugin for Extism',
    language: 'typescript',
    version: '1.0.0',
    downloads: 1250,
    author: 'Extism Team',
    githubUrl: 'https://github.com/extism/hello-plugin',
    readme: '# Hello Plugin\n\nA simple plugin that demonstrates Extism capabilities.\n\n## Usage\n\n```ts\nimport { Plugin } from \'@extism/sdk\';\n\nconst plugin = new Plugin(\'./hello-plugin.wasm\');\nconst result = plugin.call(\'greet\', \'World\');\nconsole.log(result); // Hello, World!\n```',
    versions: ['1.0.0', '0.9.0', '0.8.5'],
    dependencies: [
      { name: '@extism/sdk', version: '^1.0.0' }
    ],
    publishedAt: '2023-06-15'
  },
  {
    id: 'markdown-parser',
    name: 'markdown-parser',
    description: 'Parse and render markdown content using Extism',
    language: 'go',
    version: '0.5.2',
    downloads: 842,
    author: 'Jane Developer',
    githubUrl: 'https://github.com/janedeveloper/markdown-parser',
    readme: '# Markdown Parser\n\nThis plugin parses markdown content and renders it to HTML.\n\n## Installation\n\n```bash\nextism install markdown-parser\n```\n\n## Usage\n\n```go\nfunc main() {\n  plugin := extism.NewPlugin("markdown-parser")\n  html := plugin.Call("render", "# Hello\\n\\nThis is **markdown**")\n  fmt.Println(html)\n}\n```',
    versions: ['0.5.2', '0.5.1', '0.5.0', '0.4.2'],
    dependencies: [
      { name: 'github.com/extism/go-sdk', version: 'v0.5.0' }
    ],
    publishedAt: '2023-08-22'
  }
];

export const packageRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(() => {
      return mockPlugins;
    }),
    
  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      const plugin = mockPlugins.find(p => p.name === input.name);
      
      if (!plugin) {
        throw new Error(`Plugin '${input.name}' not found`);
      }
      
      return plugin;
    }),
    
  search: publicProcedure
    .input(z.object({ 
      query: z.string().optional(), 
      language: z.string().optional() 
    }))
    .query(({ input }) => {
      let results = [...mockPlugins];
      
      if (input.query) {
        const searchTerm = input.query.toLowerCase();
        results = results.filter(p => 
          p.name.toLowerCase().includes(searchTerm) || 
          p.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (input.language) {
        results = results.filter(p => p.language === input.language);
      }
      
      return results;
    })
}); 