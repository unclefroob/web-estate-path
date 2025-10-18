# Estate Path Web

A modern React + TypeScript web application for Estate Path, featuring authentication and user management.

## Features

- 🔐 **User Authentication** - Login and registration with email/password
- 🏠 **Address Search** - Search Australian addresses with autocomplete (public access)
- 💾 **Save Properties** - Save addresses for later review (auto-login flow for unauthenticated users)
- 📋 **Property Listing** - View and manage all saved properties in one place
- 🗑️ **Property Management** - Delete saved properties with confirmation
- 🗺️ **Routing** - Client-side routing with protected and public routes
- 🧭 **Navigation** - Dynamic navigation bar with auth-aware links
- 🎨 **Modern UI** - Beautiful, responsive design with gradient themes
- ⚡ **Vite + React** - Fast development and optimized production builds
- 📝 **TypeScript** - Full type safety throughout the application
- ✅ **Comprehensive Tests** - Full test coverage with Vitest and React Testing Library
- 🔄 **Token Management** - JWT access and refresh tokens with automatic storage
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript
- **Routing**: React Router v7
- **Testing**: Vitest + React Testing Library
- **State Management**: React Context API
- **API Integration**: Fetch API with custom service layer
- **Address API**: Nominatim (OpenStreetMap) - Free geocoding

## Prerequisites

- **Node.js v18 or higher** (required for Vite 5 and Vitest)
- npm or yarn
- Running instance of [estate-path-api](../estate-path-api)

> ⚠️ **Important**: This project requires Node.js v18+. If you're running Node v16, you'll encounter errors. See [NODE_VERSION_NOTE.md](./NODE_VERSION_NOTE.md) for upgrade instructions.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Routes

The application has the following routes:

- `/` - Redirects to `/search`
- `/search` - **Public** address search page with autocomplete
- `/auth` - **Public** login and registration page
- `/properties` - **Protected** saved properties list (requires authentication)
- `/properties/:id` - **Protected** property details page (requires authentication)
- `/dashboard` - **Protected** user dashboard (requires authentication)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Lint code with ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── AddressSearch.tsx   # Address search with autocomplete
│   ├── SavedProperties.tsx # Saved properties list & management
│   ├── PropertyDetails.tsx # Property details page
│   ├── Navigation.tsx      # Navigation bar component
│   ├── AuthPage.tsx        # Main authentication page
│   ├── LoginForm.tsx       # Login form component
│   ├── SignupForm.tsx      # Registration form component
│   ├── Dashboard.tsx       # Protected dashboard
│   └── *.test.tsx          # Component tests
├── context/             # React context providers
│   └── AuthContext.tsx     # Authentication context
├── services/            # API service layer
│   ├── api.ts              # Base API utilities
│   ├── authService.ts      # Authentication service
│   ├── addressService.ts   # Address search service
│   └── propertyService.ts  # Property management service
├── types/               # TypeScript type definitions
│   ├── auth.ts             # Authentication types
│   ├── address.ts          # Address search types
│   └── property.ts         # Property types
├── test/                # Test configuration
│   └── setup.ts            # Test setup file
├── App.tsx              # Main App with routing
├── App.css              # Application styles
├── main.tsx             # Application entry point
├── index.css            # Global styles
└── vite-env.d.ts        # Vite environment types
```

## Features in Detail

### Authentication Flow

1. **Login**: Users can log in with their email and password
2. **Registration**: New users can create an account with email, password, and name
3. **Token Management**: Access and refresh tokens are automatically stored in localStorage
4. **Auto-login**: Users stay logged in across browser sessions
5. **Logout**: Secure logout that clears tokens and notifies the API

### Form Validation

Both login and registration forms include comprehensive validation:

- Email format validation
- Password length requirements (minimum 6 characters)
- Password confirmation matching
- Name length validation
- Real-time error messages

### Address Search & Property Management

1. **Search Addresses**: Search for Australian addresses using free Nominatim API
2. **Save Properties**: Save addresses to your account (with auto-login flow)
3. **View Saved Properties**: View all saved properties in the `/properties` page
4. **Property Details**: Click on any property to view comprehensive details
5. **Delete Properties**: Remove properties with confirmation dialog
6. **View on Maps**: Open property location in Google Maps
7. **Australian Format Support**: Handles unit notation (e.g., "1/17" for Unit 1, 17 Main St)

**Save Without Login Flow:**

- Unauthenticated users can search and click "Save Property"
- Address is stored in localStorage
- User is redirected to login/signup
- After successful authentication, property is automatically saved
- User is redirected to the property details page

**Property Details Page:**

- Beautiful gradient header with property address
- Organized sections for address, location, and property info
- View property location on Google Maps
- Delete property from details page
- Clickable property cards from list view

### Protected Routes

The Dashboard, Saved Properties, and Property Details pages are only accessible to authenticated users. The app automatically redirects to the login page if the user is not authenticated.

## Testing

All components have comprehensive test coverage:

```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage Includes:

- Component rendering
- Form validation
- User interactions
- API integration
- Error handling
- Loading states
- Authentication flow

## API Integration

This application integrates with the [estate-path-api](../estate-path-api) backend.

### API Endpoints Used:

**Authentication:**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

**Address Search:**

- `GET /api/address/search?query={searchTerm}` - Search Australian addresses

**Property Management:**

- `GET /api/properties` - Get all saved properties
- `POST /api/properties` - Save a new property
- `GET /api/properties/:id` - Get a single property
- `DELETE /api/properties/:id` - Delete a property

### Authentication Headers

Protected API calls automatically include the Bearer token:

```
Authorization: Bearer <access-token>
```

## Environment Variables

| Variable       | Description  | Default                     |
| -------------- | ------------ | --------------------------- |
| `VITE_API_URL` | API base URL | `http://localhost:3000/api` |

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Related Projects

- [estate-path-api](../estate-path-api) - Backend API server

---

Built with ❤️ using React, TypeScript, and Vite
