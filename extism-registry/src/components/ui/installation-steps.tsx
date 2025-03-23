import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

type LanguageOption = 'typescript' | 'python' | 'go' | 'rust' | 'cpp';

interface InstallationStepsProps {
  language: LanguageOption;
  pluginName?: string;
}

export function InstallationSteps({ language, pluginName = 'my-plugin' }: InstallationStepsProps) {
  const steps = getInstallationSteps(language, pluginName);

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted px-4 py-2 border-b">
              <h3 className="text-sm font-medium">Step {index + 1}: {step.title}</h3>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-sm text-muted-foreground">{step.description}</p>
              <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                <code>{step.code}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getInstallationSteps(language: LanguageOption, pluginName: string) {
  const steps = {
    typescript: [
      {
        title: 'Install SDK',
        description: 'Add the Extism SDK to your project:',
        code: 'npm install @extism/js'
      },
      {
        title: 'Install Plugin',
        description: 'Install the plugin from the registry:',
        code: `npx extism plugin install ${pluginName}`
      },
      {
        title: 'Use in Code',
        description: 'Import and use the plugin in your code:',
        code: `import { Plugin } from '@extism/js';

// Load the plugin
const plugin = new Plugin('.extism/plugins/${pluginName}/latest/plugin.wasm');

// Call a plugin function
const result = await plugin.call('main_function', 'input data');
console.log(result.string());`
      }
    ],
    python: [
      {
        title: 'Install SDK',
        description: 'Add the Extism SDK to your project:',
        code: 'pip install extism'
      },
      {
        title: 'Install Plugin',
        description: 'Install the plugin from the registry:',
        code: `extism plugin install ${pluginName}`
      },
      {
        title: 'Use in Code',
        description: 'Import and use the plugin in your code:',
        code: `from extism import Plugin

# Load the plugin
plugin = Plugin('.extism/plugins/${pluginName}/latest/plugin.wasm')

# Call a plugin function
result = plugin.call('main_function', b'input data')
print(result.decode())`
      }
    ],
    go: [
      {
        title: 'Install SDK',
        description: 'Add the Extism SDK to your project:',
        code: 'go get github.com/extism/go-sdk'
      },
      {
        title: 'Install Plugin',
        description: 'Install the plugin from the registry:',
        code: `extism plugin install ${pluginName}`
      },
      {
        title: 'Use in Code',
        description: 'Import and use the plugin in your code:',
        code: `package main

import (
	"fmt"
	"github.com/extism/go-sdk"
)

func main() {
	// Load the plugin
	plugin, err := extism.NewPlugin(".extism/plugins/${pluginName}/latest/plugin.wasm", nil)
	if err != nil {
		panic(err)
	}
	defer plugin.Close()

	// Call a plugin function
	result, err := plugin.Call("main_function", []byte("input data"))
	if err != nil {
		panic(err)
	}

	fmt.Println(string(result))
}`
      }
    ],
    rust: [
      {
        title: 'Install SDK',
        description: 'Add the Extism SDK to your project:',
        code: 'cargo add extism'
      },
      {
        title: 'Install Plugin',
        description: 'Install the plugin from the registry:',
        code: `extism plugin install ${pluginName}`
      },
      {
        title: 'Use in Code',
        description: 'Import and use the plugin in your code:',
        code: `use extism::*;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load the plugin
    let plugin = Plugin::new(".extism/plugins/${pluginName}/latest/plugin.wasm", None)?;
    
    // Call a plugin function
    let result = plugin.call("main_function", b"input data")?;
    println!("{}", String::from_utf8_lossy(&result));
    
    Ok(())
}`
      }
    ],
    cpp: [
      {
        title: 'Install SDK',
        description: 'Add the Extism SDK to your project:',
        code: `# With CMake
FetchContent_Declare(
  extism
  GIT_REPOSITORY https://github.com/extism/cpp-sdk.git
  GIT_TAG v0.3.0
)
FetchContent_MakeAvailable(extism)`
      },
      {
        title: 'Install Plugin',
        description: 'Install the plugin from the registry:',
        code: `extism plugin install ${pluginName}`
      },
      {
        title: 'Use in Code',
        description: 'Import and use the plugin in your code:',
        code: `#include <extism.h>
#include <iostream>
#include <string>

int main() {
    // Load the plugin
    extism::Plugin plugin(".extism/plugins/${pluginName}/latest/plugin.wasm");
    
    // Call a plugin function
    std::string input = "input data";
    auto result = plugin.call("main_function", input);
    
    std::cout << result.data() << std::endl;
    
    return 0;
}`
      }
    ]
  };

  return steps[language] || steps.typescript;
} 