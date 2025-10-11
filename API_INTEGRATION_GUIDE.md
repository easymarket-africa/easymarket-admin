# FreshMarket Admin API Integration Guide

This guide documents the comprehensive API integration for the FreshMarket Admin Panel, following industry best practices including SOLID principles, YAGNI, and DRY.

## 🏗️ Architecture Overview

The API integration follows a layered architecture:

```
┌─────────────────────────────────────┐
│           UI Components             │
├─────────────────────────────────────┤
│         React Query Hooks          │
├─────────────────────────────────────┤
│          Service Layer             │
├─────────────────────────────────────┤
│         API Client Layer           │
├─────────────────────────────────────┤
│         Type Definitions           │
└─────────────────────────────────────┘
```

## 📁 File Structure

```
src/
├── types/
│   └── api.ts                    # TypeScript type definitions
├── lib/
│   ├── api-client.ts             # Axios-based API client
│   └── query-client.ts           # React Query configuration
├── services/
│   ├── auth.service.ts           # Authentication service
│   ├── orders.service.ts         # Orders management service
│   ├── products.service.ts       # Products management service
│   ├── agents.service.ts         # Agents management service
│   ├── vendors.service.ts        # Vendors management service
│   ├── analytics.service.ts      # Analytics service
│   ├── settings.service.ts       # Settings service
│   └── whatsapp.service.ts       # WhatsApp integration service
├── hooks/
│   ├── use-auth.ts               # Authentication hooks
│   ├── use-orders.ts             # Orders hooks
│   ├── use-products.ts           # Products hooks
│   ├── use-agents.ts             # Agents hooks
│   ├── use-vendors.ts            # Vendors hooks
│   ├── use-analytics.ts          # Analytics hooks
│   ├── use-settings.ts           # Settings hooks
│   └── use-whatsapp.ts           # WhatsApp hooks
└── components/
    ├── query-provider.tsx        # React Query provider
    ├── error-boundary.tsx        # Error boundary component
    ├── loading-states.tsx        # Loading state components
    └── error-display.tsx         # Error display components
```

## 🔧 Setup and Configuration

### 1. Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
```

### 2. Dependencies

The following packages are required:

```json
{
  "@tanstack/react-query": "^5.90.2",
  "@tanstack/react-query-devtools": "^5.90.2",
  "axios": "^1.12.2",
  "sonner": "^1.7.4"
}
```

## 🚀 Usage Examples

### Basic Data Fetching

```tsx
import { useAgents } from "@/hooks/use-agents";

function AgentsPage() {
  const { data, isLoading, error } = useAgents({
    search: "john",
    status: "active",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((agent) => (
        <div key={agent.id}>{agent.fullName}</div>
      ))}
    </div>
  );
}
```

### Mutations with Optimistic Updates

```tsx
import { useUpdateAgent } from "@/hooks/use-agents";

function EditAgentForm({ agentId }) {
  const updateAgent = useUpdateAgent();

  const handleSubmit = async (formData) => {
    try {
      await updateAgent.mutateAsync({
        id: agentId,
        data: formData,
      });
      // Success toast is automatically shown
    } catch (error) {
      // Error toast is automatically shown
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={updateAgent.isPending}>
        {updateAgent.isPending ? "Updating..." : "Update"}
      </button>
    </form>
  );
}
```

### Error Handling

```tsx
import { ErrorDisplay, ErrorAlert } from "@/components/error-display";

function MyComponent() {
  const { data, error, refetch } = useAgents();

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={refetch}
        title="Failed to load agents"
      />
    );
  }

  return (
    <div>
      {/* component content */}
      {error && <ErrorAlert error={error} onRetry={refetch} />}
    </div>
  );
}
```

### Loading States

```tsx
import { TableSkeleton, StatsCardSkeleton } from "@/components/loading-states";

function AgentsPage() {
  const { data, isLoading } = useAgents();

  if (isLoading) {
    return (
      <div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return <div>{/* actual content */}</div>;
}
```

## 🔐 Authentication

### Login Flow

```tsx
import { useLogin } from "@/hooks/use-auth";

function LoginForm() {
  const login = useLogin();

  const handleSubmit = async (credentials) => {
    await login.mutateAsync(credentials);
    // User is automatically redirected to dashboard
  };

  return <form onSubmit={handleSubmit}>{/* login form */}</form>;
}
```

### Protected Routes

```tsx
import { useCurrentUser } from "@/hooks/use-auth";

function ProtectedComponent() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) {
    // Redirect to login
    window.location.href = "/login";
    return null;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

## 📊 Analytics Integration

```tsx
import { useAnalyticsOverview } from "@/hooks/use-analytics";

function Dashboard() {
  const { data: analytics } = useAnalyticsOverview({
    timeFilter: "last_30_days",
  });

  return (
    <div>
      <div>Total Revenue: {analytics?.totalRevenue.value}</div>
      <div>Total Orders: {analytics?.totalOrders.value}</div>
      {/* more analytics */}
    </div>
  );
}
```

## ⚙️ Settings Management

```tsx
import {
  useGeneralSettings,
  useUpdateGeneralSettings,
} from "@/hooks/use-settings";

function SettingsPage() {
  const { data: settings } = useGeneralSettings();
  const updateSettings = useUpdateGeneralSettings();

  const handleSave = async (newSettings) => {
    await updateSettings.mutateAsync(newSettings);
  };

  return <form onSubmit={handleSave}>{/* settings form */}</form>;
}
```

## 📱 WhatsApp Integration

```tsx
import {
  useWhatsAppGroups,
  useSendWhatsAppMessage,
} from "@/hooks/use-whatsapp";

function WhatsAppPage() {
  const { data: groups } = useWhatsAppGroups();
  const sendMessage = useSendWhatsAppMessage();

  const handleSendMessage = async (groupId, message) => {
    await sendMessage.mutateAsync({
      groupId,
      message,
      messageType: "order_alert",
    });
  };

  return (
    <div>
      {groups?.map((group) => (
        <div key={group.id}>
          <h3>{group.name}</h3>
          <button onClick={() => handleSendMessage(group.id, "Test message")}>
            Send Message
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 Best Practices

### 1. Error Handling

- Always handle loading and error states
- Use the provided error components for consistent UX
- Implement retry mechanisms for failed requests

### 2. Caching Strategy

- React Query automatically handles caching
- Use appropriate `staleTime` for different data types
- Invalidate related queries after mutations

### 3. Type Safety

- All API responses are fully typed
- Use TypeScript for better development experience
- Leverage the provided type definitions

### 4. Performance

- Use React Query's built-in optimizations
- Implement proper loading states
- Avoid unnecessary re-renders

### 5. User Experience

- Show loading states during API calls
- Display meaningful error messages
- Provide retry options for failed requests

## 🔄 Data Flow

1. **Component** calls a hook (e.g., `useAgents`)
2. **Hook** uses React Query to manage the request
3. **Service** makes the actual API call
4. **API Client** handles HTTP communication
5. **Response** is cached and returned to the component
6. **Component** renders the data or loading/error states

## 🛠️ Development Tools

### React Query DevTools

The React Query DevTools are automatically enabled in development mode, providing:

- Query inspection
- Cache visualization
- Performance monitoring

### Error Boundary

Wrap your components with the ErrorBoundary for better error handling:

```tsx
import { ErrorBoundary } from "@/components/error-boundary";

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## 📝 API Endpoints

All endpoints follow the RESTful convention:

- `GET /admin/orders` - List orders
- `GET /admin/orders/:id` - Get order details
- `PUT /admin/orders/:id/status` - Update order status
- `POST /admin/orders/:id/assign-agent` - Assign agent

See the API documentation for complete endpoint details.

## 🚨 Error Codes

Common error codes and their meanings:

- `401` - Unauthorized (redirect to login)
- `403` - Forbidden
- `404` - Not found
- `422` - Validation error
- `500` - Server error
- `NETWORK_ERROR` - Network connectivity issue

## 🔧 Customization

### Adding New Services

1. Create a new service file in `src/services/`
2. Define TypeScript types in `src/types/api.ts`
3. Create React Query hooks in `src/hooks/`
4. Add query keys in `src/lib/query-client.ts`

### Custom Error Handling

```tsx
// Custom error handler
const customErrorHandler = (error: ApiError) => {
  if (error.code === "CUSTOM_ERROR") {
    // Handle custom error
  }
};
```

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

When adding new features:

1. Follow the established patterns
2. Add proper TypeScript types
3. Include error handling
4. Write comprehensive tests
5. Update this documentation

---

This integration provides a robust, scalable, and maintainable foundation for the FreshMarket Admin Panel API layer.
