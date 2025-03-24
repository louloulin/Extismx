/**
 * Python plugin template generator
 */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

import { TemplateGenerator, TemplateOptions } from '../common/template';
import { PDKError } from '../../errors';

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Python template options
 */
export interface PythonTemplateOptions extends TemplateOptions {
  /**
   * Python version to target (e.g., "3.9", "3.10")
   */
  pythonVersion?: string;
  
  /**
   * Include type annotations
   */
  useTypeAnnotations?: boolean;
  
  /**
   * Include example tests using pytest
   */
  includeTests?: boolean;
  
  /**
   * Include virtual environment setup
   */
  includeVenv?: boolean;
  
  /**
   * Additional packages to include in requirements.txt
   */
  additionalPackages?: string[];
  
  /**
   * Use advanced API features
   */
  useAdvancedApi?: boolean;
}

/**
 * Python plugin template generator
 */
export class PythonTemplateGenerator extends TemplateGenerator {
  /**
   * Default Python template options
   */
  private defaultPythonOptions: PythonTemplateOptions = {
    pythonVersion: "3.10",
    useTypeAnnotations: true,
    includeTests: true,
    includeVenv: true,
    useAdvancedApi: false
  };

  /**
   * Constructor
   * 
   * @param options - Template options
   */
  constructor(options?: PythonTemplateOptions) {
    super(options);
    this.options = { ...this.defaultPythonOptions, ...options };
  }

  /**
   * Get Python-specific template options
   */
  get pythonOptions(): PythonTemplateOptions {
    return this.options as PythonTemplateOptions;
  }

  /**
   * Create a Python plugin project
   * 
   * @param projectPath - Path where to create the project
   * @param name - Plugin name
   * @param description - Plugin description
   * @returns Promise resolving when the project is created
   */
  async generate(projectPath: string, name: string, description?: string): Promise<void> {
    try {
      // Create project directory
      await mkdirAsync(projectPath, { recursive: true });
      
      // Create project structure
      await this.createProjectStructure(projectPath, name, description);
      
      // Initialize git repository
      if (this.options.initGit) {
        try {
          await execAsync('git init', { cwd: projectPath });
          
          // Create .gitignore file
          await this.createGitignore(projectPath);
        } catch (error) {
          console.warn(`Failed to initialize git repository: ${error.message}`);
        }
      }
      
      // Create virtual environment if enabled
      if (this.pythonOptions.includeVenv) {
        try {
          await execAsync(`python -m venv ${path.join(projectPath, 'venv')}`);
        } catch (error) {
          console.warn(`Failed to create virtual environment: ${error.message}`);
        }
      }
      
      console.log(`Python plugin project created at ${projectPath}`);
    } catch (error) {
      throw new PDKError('BUILD_FAILED', `Failed to generate Python project: ${error.message}`);
    }
  }

  /**
   * Create the project structure
   * 
   * @param projectPath - Project path
   * @param name - Plugin name
   * @param description - Plugin description
   */
  private async createProjectStructure(
    projectPath: string,
    name: string,
    description?: string
  ): Promise<void> {
    // Create the package directory
    const packageName = name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const packageDir = path.join(projectPath, packageName);
    await mkdirAsync(packageDir, { recursive: true });
    
    // Create README.md
    await this.createReadme(projectPath, name, description);
    
    // Create setup.py
    await this.createSetupPy(projectPath, name, packageName, description);
    
    // Create requirements.txt
    await this.createRequirementsTxt(projectPath);
    
    // Create main package files
    await this.createPackageFiles(packageDir, packageName);
    
    // Create main.py
    await this.createMainPy(projectPath, packageName);
    
    // Create tests if enabled
    if (this.pythonOptions.includeTests) {
      await this.createTests(projectPath, packageName);
    }
  }

  /**
   * Create README.md file
   * 
   * @param projectPath - Project path
   * @param name - Plugin name
   * @param description - Plugin description
   */
  private async createReadme(
    projectPath: string,
    name: string,
    description?: string
  ): Promise<void> {
    const content = `# ${name}

${description || 'A Python plugin for the plugin registry.'}

## Development

### Setup

1. Clone this repository
2. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

### Build

To build the plugin:

\`\`\`
python -m build
\`\`\`

### Test

To run tests:

\`\`\`
pytest
\`\`\`

## License

This project is licensed under the MIT License - see LICENSE file for details.
`;

    await writeFileAsync(path.join(projectPath, 'README.md'), content);
  }

  /**
   * Create setup.py file
   * 
   * @param projectPath - Project path
   * @param name - Plugin name
   * @param packageName - Package name
   * @param description - Plugin description
   */
  private async createSetupPy(
    projectPath: string,
    name: string,
    packageName: string,
    description?: string
  ): Promise<void> {
    const content = `from setuptools import setup, find_packages

setup(
    name="${name}",
    version="0.1.0",
    packages=find_packages(),
    description="${description || 'A Python plugin for the plugin registry'}",
    author="${this.options.author || 'Plugin Author'}",
    author_email="${this.options.authorEmail || 'author@example.com'}",
    classifiers=[
        "Programming Language :: Python :: ${this.pythonOptions.pythonVersion}",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=${this.pythonOptions.pythonVersion}",
    install_requires=[
        "pywasm3",
        ${(this.pythonOptions.additionalPackages || [])
          .map(pkg => `"${pkg}"`)
          .join(',\n        ')}
    ],
)
`;

    await writeFileAsync(path.join(projectPath, 'setup.py'), content);
  }

  /**
   * Create requirements.txt file
   * 
   * @param projectPath - Project path
   */
  private async createRequirementsTxt(projectPath: string): Promise<void> {
    const requirements = [
      'pywasm3',
      'pytest',
      'build',
      'wheel',
      'setuptools>=42',
      'mypy'
    ];
    
    if (this.pythonOptions.additionalPackages) {
      requirements.push(...this.pythonOptions.additionalPackages);
    }
    
    await writeFileAsync(
      path.join(projectPath, 'requirements.txt'),
      requirements.join('\n')
    );
  }

  /**
   * Create package files
   * 
   * @param packageDir - Package directory
   * @param packageName - Package name
   */
  private async createPackageFiles(packageDir: string, packageName: string): Promise<void> {
    // Create __init__.py
    const initContent = this.pythonOptions.useTypeAnnotations
      ? `"""${packageName} package."""
from typing import Dict, Any, List, Optional, Callable

__version__ = "0.1.0"
`
      : `"""${packageName} package."""

__version__ = "0.1.0"
`;

    await writeFileAsync(path.join(packageDir, '__init__.py'), initContent);
    
    // Create plugin.py
    const pluginContent = this.createPluginPyContent(packageName);
    await writeFileAsync(path.join(packageDir, 'plugin.py'), pluginContent);
    
    // Create utils.py
    const utilsContent = this.createUtilsPyContent();
    await writeFileAsync(path.join(packageDir, 'utils.py'), utilsContent);
  }

  /**
   * Create plugin.py content
   * 
   * @param packageName - Package name
   */
  private createPluginPyContent(packageName: string): string {
    if (this.pythonOptions.useTypeAnnotations) {
      return `"""Plugin implementation."""
from typing import Dict, Any, List, Optional, Callable


class Plugin:
    """Main plugin class."""

    def __init__(self) -> None:
        """Initialize the plugin."""
        self.name = "${packageName}"
        self.tools: Dict[str, Callable] = {
            "greet": self.greet,
            "add": self.add,
        }

    def greet(self, name: str) -> str:
        """Greet a user.

        Args:
            name: The name to greet

        Returns:
            A greeting message
        """
        return f"Hello, {name}! Welcome to the {self.name} plugin."

    def add(self, a: float, b: float) -> float:
        """Add two numbers.

        Args:
            a: First number
            b: Second number

        Returns:
            The sum of a and b
        """
        return a + b

    def invoke_tool(self, tool_name: str, args: Dict[str, Any]) -> Any:
        """Invoke a tool by name with arguments.

        Args:
            tool_name: The name of the tool to invoke
            args: Arguments to pass to the tool

        Returns:
            The result of the tool invocation

        Raises:
            ValueError: If the tool is not found
        """
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not found")

        return self.tools[tool_name](**args)
`;
    } else {
      return `"""Plugin implementation."""


class Plugin:
    """Main plugin class."""

    def __init__(self):
        """Initialize the plugin."""
        self.name = "${packageName}"
        self.tools = {
            "greet": self.greet,
            "add": self.add,
        }

    def greet(self, name):
        """Greet a user.

        Args:
            name: The name to greet

        Returns:
            A greeting message
        """
        return f"Hello, {name}! Welcome to the {self.name} plugin."

    def add(self, a, b):
        """Add two numbers.

        Args:
            a: First number
            b: Second number

        Returns:
            The sum of a and b
        """
        return a + b

    def invoke_tool(self, tool_name, args):
        """Invoke a tool by name with arguments.

        Args:
            tool_name: The name of the tool to invoke
            args: Arguments to pass to the tool

        Returns:
            The result of the tool invocation

        Raises:
            ValueError: If the tool is not found
        """
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not found")

        return self.tools[tool_name](**args)
`;
    }
  }

  /**
   * Create utils.py content
   */
  private createUtilsPyContent(): string {
    if (this.pythonOptions.useTypeAnnotations) {
      return `"""Utility functions for the plugin."""
from typing import Dict, Any, List


def format_response(data: Any) -> Dict[str, Any]:
    """Format the response data.

    Args:
        data: The data to format

    Returns:
        Formatted response
    """
    return {
        "status": "success",
        "data": data
    }


def parse_input(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Parse and validate input data.

    Args:
        input_data: The input data to parse

    Returns:
        Parsed input data

    Raises:
        ValueError: If the input data is invalid
    """
    if not isinstance(input_data, dict):
        raise ValueError("Input must be a dictionary")

    return input_data
`;
    } else {
      return `"""Utility functions for the plugin."""


def format_response(data):
    """Format the response data.

    Args:
        data: The data to format

    Returns:
        Formatted response
    """
    return {
        "status": "success",
        "data": data
    }


def parse_input(input_data):
    """Parse and validate input data.

    Args:
        input_data: The input data to parse

    Returns:
        Parsed input data

    Raises:
        ValueError: If the input data is invalid
    """
    if not isinstance(input_data, dict):
        raise ValueError("Input must be a dictionary")

    return input_data
`;
    }
  }

  /**
   * Create main.py file
   * 
   * @param projectPath - Project path
   * @param packageName - Package name
   */
  private async createMainPy(projectPath: string, packageName: string): Promise<void> {
    const content = this.pythonOptions.useTypeAnnotations
      ? `"""Main entry point for the plugin."""
import json
import sys
from typing import Dict, Any

from ${packageName}.plugin import Plugin
from ${packageName}.utils import format_response, parse_input


def main() -> None:
    """Run the plugin."""
    plugin = Plugin()

    # Read from stdin
    input_data = json.loads(sys.stdin.read())
    
    try:
        # Parse and validate input
        parsed_input = parse_input(input_data)
        
        # Get the tool name and arguments
        tool_name = parsed_input.get("tool", "")
        tool_args = parsed_input.get("args", {})
        
        # Invoke the tool
        result = plugin.invoke_tool(tool_name, tool_args)
        
        # Format and return the response
        response = format_response(result)
        print(json.dumps(response))
        
    except Exception as e:
        # Handle errors
        error_response = {
            "status": "error",
            "error": str(e)
        }
        print(json.dumps(error_response))
        sys.exit(1)


if __name__ == "__main__":
    main()
`
      : `"""Main entry point for the plugin."""
import json
import sys

from ${packageName}.plugin import Plugin
from ${packageName}.utils import format_response, parse_input


def main():
    """Run the plugin."""
    plugin = Plugin()

    # Read from stdin
    input_data = json.loads(sys.stdin.read())
    
    try:
        # Parse and validate input
        parsed_input = parse_input(input_data)
        
        # Get the tool name and arguments
        tool_name = parsed_input.get("tool", "")
        tool_args = parsed_input.get("args", {})
        
        # Invoke the tool
        result = plugin.invoke_tool(tool_name, tool_args)
        
        # Format and return the response
        response = format_response(result)
        print(json.dumps(response))
        
    except Exception as e:
        # Handle errors
        error_response = {
            "status": "error",
            "error": str(e)
        }
        print(json.dumps(error_response))
        sys.exit(1)


if __name__ == "__main__":
    main()
`;

    await writeFileAsync(path.join(projectPath, 'main.py'), content);
  }

  /**
   * Create tests
   * 
   * @param projectPath - Project path
   * @param packageName - Package name
   */
  private async createTests(projectPath: string, packageName: string): Promise<void> {
    // Create tests directory
    const testsDir = path.join(projectPath, 'tests');
    await mkdirAsync(testsDir, { recursive: true });
    
    // Create __init__.py
    await writeFileAsync(path.join(testsDir, '__init__.py'), '');
    
    // Create conftest.py
    const conftestContent = `"""Pytest configuration."""
import pytest


@pytest.fixture
def plugin_instance():
    """Create a plugin instance for testing."""
    from ${packageName}.plugin import Plugin
    return Plugin()
`;
    await writeFileAsync(path.join(testsDir, 'conftest.py'), conftestContent);
    
    // Create test_plugin.py
    const testPluginContent = this.pythonOptions.useTypeAnnotations
      ? `"""Tests for the plugin module."""
import pytest
from typing import Dict, Any

from ${packageName}.plugin import Plugin


def test_plugin_init(plugin_instance: Plugin) -> None:
    """Test plugin initialization."""
    assert plugin_instance.name == "${packageName}"
    assert "greet" in plugin_instance.tools
    assert "add" in plugin_instance.tools


def test_greet(plugin_instance: Plugin) -> None:
    """Test the greet tool."""
    result = plugin_instance.greet("Test User")
    assert "Hello, Test User" in result
    assert "${packageName}" in result


def test_add(plugin_instance: Plugin) -> None:
    """Test the add tool."""
    result = plugin_instance.add(5, 7)
    assert result == 12

    result = plugin_instance.add(-3, 3)
    assert result == 0

    result = plugin_instance.add(2.5, 3.5)
    assert result == 6.0


def test_invoke_tool(plugin_instance: Plugin) -> None:
    """Test invoking tools by name."""
    result = plugin_instance.invoke_tool("greet", {"name": "Test User"})
    assert "Hello, Test User" in result

    result = plugin_instance.invoke_tool("add", {"a": 5, "b": 7})
    assert result == 12

    with pytest.raises(ValueError):
        plugin_instance.invoke_tool("unknown_tool", {})
`
      : `"""Tests for the plugin module."""
import pytest

from ${packageName}.plugin import Plugin


def test_plugin_init(plugin_instance):
    """Test plugin initialization."""
    assert plugin_instance.name == "${packageName}"
    assert "greet" in plugin_instance.tools
    assert "add" in plugin_instance.tools


def test_greet(plugin_instance):
    """Test the greet tool."""
    result = plugin_instance.greet("Test User")
    assert "Hello, Test User" in result
    assert "${packageName}" in result


def test_add(plugin_instance):
    """Test the add tool."""
    result = plugin_instance.add(5, 7)
    assert result == 12

    result = plugin_instance.add(-3, 3)
    assert result == 0

    result = plugin_instance.add(2.5, 3.5)
    assert result == 6.0


def test_invoke_tool(plugin_instance):
    """Test invoking tools by name."""
    result = plugin_instance.invoke_tool("greet", {"name": "Test User"})
    assert "Hello, Test User" in result

    result = plugin_instance.invoke_tool("add", {"a": 5, "b": 7})
    assert result == 12

    with pytest.raises(ValueError):
        plugin_instance.invoke_tool("unknown_tool", {})
`;
    await writeFileAsync(path.join(testsDir, 'test_plugin.py'), testPluginContent);
    
    // Create test_utils.py
    const testUtilsContent = this.pythonOptions.useTypeAnnotations
      ? `"""Tests for the utils module."""
import pytest
from typing import Dict, Any

from ${packageName}.utils import format_response, parse_input


def test_format_response() -> None:
    """Test formatting responses."""
    response = format_response("test data")
    assert response["status"] == "success"
    assert response["data"] == "test data"

    response = format_response({"key": "value"})
    assert response["status"] == "success"
    assert response["data"] == {"key": "value"}


def test_parse_input() -> None:
    """Test parsing and validating input."""
    input_data = {"tool": "test", "args": {"key": "value"}}
    parsed = parse_input(input_data)
    assert parsed == input_data

    with pytest.raises(ValueError):
        parse_input("not a dict")
`
      : `"""Tests for the utils module."""
import pytest

from ${packageName}.utils import format_response, parse_input


def test_format_response():
    """Test formatting responses."""
    response = format_response("test data")
    assert response["status"] == "success"
    assert response["data"] == "test data"

    response = format_response({"key": "value"})
    assert response["status"] == "success"
    assert response["data"] == {"key": "value"}


def test_parse_input():
    """Test parsing and validating input."""
    input_data = {"tool": "test", "args": {"key": "value"}}
    parsed = parse_input(input_data)
    assert parsed == input_data

    with pytest.raises(ValueError):
        parse_input("not a dict")
`;
    await writeFileAsync(path.join(testsDir, 'test_utils.py'), testUtilsContent);
  }

  /**
   * Create .gitignore file
   * 
   * @param projectPath - Project path
   */
  private async createGitignore(projectPath: string): Promise<void> {
    const content = `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environment
venv/
ENV/
env/

# IDE
.idea/
.vscode/
*.swp
*.swo

# Build artifacts
*.wasm
build-*/

# Pytest
.pytest_cache/
.coverage
htmlcov/
`;

    await writeFileAsync(path.join(projectPath, '.gitignore'), content);
  }
} 