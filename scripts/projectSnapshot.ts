#!/usr/bin/env tsx

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

interface TreeNode {
  path: string;
  type: 'dir' | 'file';
  size?: number;
}

interface KeyFile {
  path: string;
  truncated: boolean;
  lines: number;
  content: string;
}

interface DerivedConfig {
  ports: { client?: number; server?: number };
  baseURLs: { client?: string[]; server?: string[] };
  cors: { allowList?: string[]; credentials?: boolean; sameSite?: string; secure?: boolean };
  auth: { login?: string; session?: string; strategy?: 'cookie' | 'jwt' | 'other' };
  analyticsRoutes: string[];
  reactQuery: { staleTime?: number; retry?: number; refetchOnWindowFocus?: boolean };
}

interface ProjectSnapshot {
  generatedAt: string;
  tree: TreeNode[];
  keyFiles: KeyFile[];
  derived: DerivedConfig;
}

const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', '.turbo', '.cache', 
  'coverage', '.idea', '.vscode', 'logs'
]);

const MAX_FILE_SIZE = 200 * 1024; // 200 KB
const MAX_LINES = 400;

function redactSecrets(text: string): string {
  return text.replace(
    /(key|secret|token|password|api[_-]?key|auth|cookie|session)\s*[:=]\s*["']?[^"'\s,}]+["']?/gi,
    '$1: "***REDACTED***"'
  );
}

async function buildTree(dir: string, depth: number = 0): Promise<TreeNode[]> {
  if (depth > 5) return [];
  
  try {
    const entries = await readdir(dir);
    const tree: TreeNode[] = [];
    
    for (const entry of entries) {
      if (EXCLUDED_DIRS.has(entry)) continue;
      
      const fullPath = join(dir, entry);
      const relativePath = relative(process.cwd(), fullPath);
      
      try {
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          tree.push({ path: relativePath, type: 'dir' });
          if (depth < 5) {
            const subTree = await buildTree(fullPath, depth + 1);
            tree.push(...subTree);
          }
        } else if (stats.isFile() && stats.size <= MAX_FILE_SIZE) {
          tree.push({ 
            path: relativePath, 
            type: 'file', 
            size: stats.size 
          });
        }
      } catch (error) {
        // Skip files we can't access
        continue;
      }
    }
    
    return tree;
  } catch (error) {
    return [];
  }
}

async function readKeyFile(filePath: string): Promise<KeyFile | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const truncated = lines.length > MAX_LINES;
    const truncatedContent = lines.slice(0, MAX_LINES).join('\n');
    
    return {
      path: relative(process.cwd(), filePath),
      truncated,
      lines: lines.length,
      content: redactSecrets(truncatedContent)
    };
  } catch (error) {
    return null;
  }
}

async function getKeyFiles(): Promise<KeyFile[]> {
  const keyFilePatterns = [
    // Frontend
    'client/package.json',
    'client/vite.config.ts',
    'client/tsconfig.json',
    'client/tsconfig.app.json',
    'client/tsconfig.node.json',
    'client/src/main.tsx',
    'client/src/App.tsx',
    'client/src/contexts/AuthContext.tsx',
    'client/src/contexts/CartContext.tsx',
    'client/src/contexts/ZipContext.tsx',
    
    // Backend
    'server/package.json',
    'server/src/index.ts',
    'server/src/index-mock.ts',
    'server/src/routes/auth.ts',
    'server/src/routes/analyticsRoutes.ts',
    'server/src/routes/vendorRoutes.ts',
    'server/src/controllers/analyticsController.ts',
    'server/src/controllers/vendorController.ts',
    'server/src/middleware/auth.ts',
    'server/src/middleware/auth-mock.ts',
    'server/src/middleware/cors.ts',
    
    // Prisma
    'prisma/schema.prisma',
    'prisma/seed.ts',
    
    // Configs
    'package.json',
    '.env.example',
    'eslint.config.js',
    'tailwind.config.js',
    'postcss.config.cjs'
  ];
  
  const keyFiles: KeyFile[] = [];
  
  for (const pattern of keyFilePatterns) {
    try {
      const file = await readKeyFile(pattern);
      if (file) {
        keyFiles.push(file);
      }
    } catch (error) {
      // Continue if file doesn't exist
    }
  }
  
  return keyFiles;
}

function extractDerivedConfig(keyFiles: KeyFile[]): DerivedConfig {
  const derived: DerivedConfig = {
    ports: {},
    baseURLs: { client: [], server: [] },
    cors: {},
    auth: {},
    analyticsRoutes: [],
    reactQuery: {}
  };
  
  // Extract configuration from key files
  for (const file of keyFiles) {
    const content = file.content;
    
    // Extract ports
    const portMatches = content.match(/port\s*[:=]\s*(\d+)/gi);
    if (portMatches) {
      const ports = portMatches.map(match => {
        const port = match.match(/\d+/)?.[0];
        return port ? parseInt(port) : null;
      }).filter(Boolean);
      
      if (file.path.includes('server')) {
        derived.ports.server = ports[0] || 3001;
      } else if (file.path.includes('client')) {
        derived.ports.client = ports[0] || 5173;
      }
    }
    
    // Extract VITE_ variables
    const viteMatches = content.match(/VITE_[A-Z_]+/g);
    if (viteMatches) {
      derived.baseURLs.client?.push(...viteMatches);
    }
    
    // Extract CORS settings
    if (content.includes('cors')) {
      const originMatches = content.match(/origin\s*[:=]\s*\[([^\]]+)\]/);
      if (originMatches) {
        derived.cors.allowList = originMatches[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
      }
      
      if (content.includes('credentials: true')) {
        derived.cors.credentials = true;
      }
      
      if (content.includes('sameSite')) {
        const sameSiteMatch = content.match(/sameSite\s*[:=]\s*["']([^"']+)["']/);
        if (sameSiteMatch) {
          derived.cors.sameSite = sameSiteMatch[1];
        }
      }
      
      if (content.includes('secure: true')) {
        derived.cors.secure = true;
      }
    }
    
    // Extract auth endpoints
    if (content.includes('/api/auth/')) {
      if (content.includes('login')) {
        derived.auth.login = '/api/auth/login';
      }
      if (content.includes('session')) {
        derived.auth.session = '/api/auth/session';
      }
      
      if (content.includes('cookie') || content.includes('session')) {
        derived.auth.strategy = 'cookie';
      } else if (content.includes('jwt') || content.includes('token')) {
        derived.auth.strategy = 'jwt';
      }
    }
    
    // Extract analytics routes
    const analyticsMatches = content.match(/\/api\/vendor\/[^\/]+\/analytics\/[^\s"']+/g);
    if (analyticsMatches) {
      derived.analyticsRoutes.push(...analyticsMatches);
    }
    
    // Extract React Query settings
    if (content.includes('QueryClient') || content.includes('queryClient')) {
      const staleTimeMatch = content.match(/staleTime\s*[:=]\s*(\d+)/);
      if (staleTimeMatch) {
        derived.reactQuery.staleTime = parseInt(staleTimeMatch[1]);
      }
      
      const retryMatch = content.match(/retry\s*[:=]\s*(\d+)/);
      if (retryMatch) {
        derived.reactQuery.retry = parseInt(retryMatch[1]);
      }
      
      if (content.includes('refetchOnWindowFocus')) {
        derived.reactQuery.refetchOnWindowFocus = true;
      }
    }
  }
  
  return derived;
}

async function main(): Promise<void> {
  try {
    const tree = await buildTree(process.cwd());
    const keyFiles = await getKeyFiles();
    const derived = extractDerivedConfig(keyFiles);
    
    const snapshot: ProjectSnapshot = {
      generatedAt: new Date().toISOString(),
      tree,
      keyFiles,
      derived
    };
    
    console.log(JSON.stringify(snapshot, null, 2));
  } catch (error) {
    console.error('Error generating snapshot:', error);
    process.exit(1);
  }
}

main();
