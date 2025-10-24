# 🚀 MCP Tools Setup Guide for Craved Artisan

## ✅ Installed MCP Servers

The following MCP servers have been configured and are ready to use:

### 1. **PostgreSQL MCP** 
- **Purpose**: Direct database integration for your Prisma/PostgreSQL setup
- **Status**: ✅ Configured
- **Connection**: `postgresql://localhost:5432/craved_artisan`

### 2. **GitHub MCP**
- **Purpose**: Version control, code reviews, and CI/CD integration
- **Status**: ✅ Configured
- **Setup Required**: Add your GitHub Personal Access Token

### 3. **Filesystem MCP**
- **Purpose**: File operations and project management
- **Status**: ✅ Configured
- **Access**: Limited to `C:\dev\craved-artisan`

### 4. **Memory MCP**
- **Purpose**: Persistent memory and context management
- **Status**: ✅ Configured

### 5. **Brave Search MCP**
- **Purpose**: Web search capabilities
- **Status**: ✅ Configured
- **Setup Required**: Add your Brave Search API key

## 🔧 Configuration Steps

### Step 1: Environment Variables Setup

Create a `.env` file in your project root with the following variables:

```bash
# Database
POSTGRES_CONNECTION_STRING=postgresql://localhost:5432/craved_artisan

# GitHub
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here

# Brave Search
BRAVE_API_KEY=your_brave_api_key_here

# Stripe (for future integration)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Sentry (for future integration)
SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project

# Notion (for future integration)
NOTION_API_KEY=your_notion_api_key

# Figma (for future integration)
FIGMA_ACCESS_TOKEN=your_figma_token

# Linear (for future integration)
LINEAR_API_KEY=your_linear_api_key
```

### Step 2: API Keys Setup

#### GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with these permissions:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `read:user` (Read user profile data)
3. Copy the token and add it to your `.env` file

#### Brave Search API Key
1. Visit [Brave Search API](https://brave.com/search/api/)
2. Sign up for an API key
3. Add the key to your `.env` file

### Step 3: Restart Cursor

After configuring the environment variables:
1. Close Cursor completely
2. Reopen Cursor
3. The MCP servers should now be active

## 🎯 Usage Examples

### Database Operations
```typescript
// Query your PostgreSQL database directly
// The MCP server will handle the connection
```

### GitHub Integration
```typescript
// Create issues, manage pull requests, view repository data
// All through the MCP interface
```

### File System Operations
```typescript
// Read, write, and manage files in your project
// With full access to your Craved Artisan codebase
```

### Web Search
```typescript
// Search the web for documentation, solutions, or research
// Perfect for development and problem-solving
```

## 🔮 Future MCP Integrations

The following tools are planned for future integration as MCP servers become available:

- **Stripe MCP** - Payment processing integration
- **Sentry MCP** - Error monitoring and performance tracking
- **Notion MCP** - Documentation and project management
- **Figma MCP** - Design collaboration
- **Linear MCP** - Issue tracking and project management
- **Playwright MCP** - End-to-end testing
- **Chrome Sidekick MCP** - Browser automation

## 🛠️ Troubleshooting

### MCP Server Not Starting
1. Check that Node.js is installed and up to date
2. Verify the MCP server packages are installed globally
3. Check the Cursor logs for error messages

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Verify the connection string in your `.env` file
3. Check that the database `craved_artisan` exists

### GitHub Integration Issues
1. Verify your GitHub token has the correct permissions
2. Check that the token is not expired
3. Ensure the token is properly set in your environment variables

## 📚 Resources

- [MCP Documentation](https://docs.cursor.com/en/tools/mcp)
- [PostgreSQL MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
- [GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [Filesystem MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)

## 🎉 Next Steps

1. **Set up your API keys** in the `.env` file
2. **Restart Cursor** to activate the MCP servers
3. **Test the integrations** by using the MCP tools in your development workflow
4. **Explore the capabilities** of each MCP server for your Craved Artisan project

Your MCP setup is now ready to enhance your development workflow! 🚀
