/**
 * Common template generator abstractions
 */

/**
 * Options for template generation
 */
export interface TemplateOptions {
  /**
   * Initialize git repository
   */
  initGit?: boolean;
  
  /**
   * Author name
   */
  author?: string;
  
  /**
   * Author email
   */
  authorEmail?: string;
  
  /**
   * License to use
   */
  license?: string;
}

/**
 * Abstract template generator
 */
export abstract class TemplateGenerator {
  /**
   * Constructor
   * 
   * @param options - Template options
   */
  constructor(
    protected options: TemplateOptions = {}
  ) {}

  /**
   * Generate a new project
   * 
   * @param projectPath - Path where to create the project
   * @param name - Project name
   * @param description - Project description
   */
  abstract generate(projectPath: string, name: string, description?: string): Promise<void>;
} 