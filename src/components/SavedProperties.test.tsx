import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SavedProperties } from "./SavedProperties";
import { AuthContext } from "../context/AuthContext";
import { propertyService } from "../services/propertyService";
import type { Property } from "../types/property";

// Mock the property service
vi.mock("../services/propertyService", () => ({
  propertyService: {
    getUserProperties: vi.fn(),
    deleteProperty: vi.fn(),
  },
}));

const mockProperties: Property[] = [
  {
    _id: "1",
    userId: "user1",
    unit: "5",
    number: "123",
    street: "Main St",
    suburb: "Sydney",
    state: "NSW",
    postcode: "2000",
    fullAddress: "Unit 5, 123 Main St, Sydney NSW 2000",
    coordinates: { lat: "-33.8688", lon: "151.2093" },
    createdAt: "2023-10-01T10:00:00Z",
    updatedAt: "2023-10-01T10:00:00Z",
  },
  {
    _id: "2",
    userId: "user1",
    number: "456",
    street: "High St",
    suburb: "Melbourne",
    state: "VIC",
    postcode: "3000",
    fullAddress: "456 High St, Melbourne VIC 3000",
    createdAt: "2023-10-02T12:00:00Z",
    updatedAt: "2023-10-02T12:00:00Z",
  },
];

const renderWithAuth = (component: React.ReactElement, authValue: any = {}) => {
  const defaultAuthValue = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...authValue,
  };

  return render(
    <AuthContext.Provider value={defaultAuthValue}>
      {component}
    </AuthContext.Provider>
  );
};

describe("SavedProperties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows login prompt when user is not logged in", () => {
    renderWithAuth(<SavedProperties />);

    expect(screen.getByText("Please Log In")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You need to be logged in to view your saved properties."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Go to Login")).toBeInTheDocument();
  });

  it("shows loading state while fetching properties", () => {
    vi.mocked(propertyService.getUserProperties).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithAuth(<SavedProperties />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    expect(screen.getByText("Loading your properties...")).toBeInTheDocument();
  });

  it("displays properties when loaded successfully", async () => {
    vi.mocked(propertyService.getUserProperties).mockResolvedValue({
      success: true,
      data: {
        properties: mockProperties,
        count: mockProperties.length,
      },
    });

    renderWithAuth(<SavedProperties />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("My Saved Properties")).toBeInTheDocument();
    });

    expect(screen.getByText("2 properties saved")).toBeInTheDocument();
    expect(
      screen.getByText("Unit 5, 123 Main St, Sydney NSW 2000")
    ).toBeInTheDocument();
    expect(
      screen.getByText("456 High St, Melbourne VIC 3000")
    ).toBeInTheDocument();
  });

  it("shows empty state when no properties are saved", async () => {
    vi.mocked(propertyService.getUserProperties).mockResolvedValue({
      success: true,
      data: {
        properties: [],
        count: 0,
      },
    });

    renderWithAuth(<SavedProperties />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("No Properties Saved Yet")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Start by searching for an address and saving properties you're interested in."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Search for Properties")).toBeInTheDocument();
  });

  it("displays error message when fetching fails", async () => {
    vi.mocked(propertyService.getUserProperties).mockResolvedValue({
      success: false,
      message: "Failed to load properties",
    });

    renderWithAuth(<SavedProperties />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to load properties")).toBeInTheDocument();
    });
  });

  it("displays property details correctly", async () => {
    vi.mocked(propertyService.getUserProperties).mockResolvedValue({
      success: true,
      data: {
        properties: [mockProperties[0]],
        count: 1,
      },
    });

    renderWithAuth(<SavedProperties />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("Unit 5, 123 Main St")).toBeInTheDocument();
    });

    expect(screen.getByText("Sydney")).toBeInTheDocument();
    expect(screen.getByText("NSW")).toBeInTheDocument();
    expect(screen.getByText("2000")).toBeInTheDocument();
    expect(screen.getByText("-33.8688, 151.2093")).toBeInTheDocument();
  });

  it("handles property deletion successfully", async () => {
    const user = userEvent.setup();
    vi.mocked(propertyService.getUserProperties).mockResolvedValue({
      success: true,
      data: {
        properties: mockProperties,
        count: mockProperties.length,
      },
    });

    vi.mocked(propertyService.deleteProperty).mockResolvedValue({
      success: true,
      message: "Property deleted successfully",
    });

    // Mock window.confirm
    global.confirm = vi.fn(() => true);

    renderWithAuth(<SavedProperties />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("2 properties saved")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(propertyService.deleteProperty).toHaveBeenCalledWith(
        "1",
        "token123"
      );
    });

    // Property should be removed from the list
    await waitFor(() => {
      expect(
        screen.queryByText("Unit 5, 123 Main St, Sydney NSW 2000")
      ).not.toBeInTheDocument();
    });
  });

  it("shows error message when deletion fails", async () => {
    const user = userEvent.setup();
    vi.mocked(propertyService.getUserProperties).mockResolvedValue({
      success: true,
      data: {
        properties: mockProperties,
        count: mockProperties.length,
      },
    });

    vi.mocked(propertyService.deleteProperty).mockResolvedValue({
      success: false,
      message: "Failed to delete property",
    });

    global.confirm = vi.fn(() => true);

    renderWithAuth(<SavedProperties />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("2 properties saved")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Failed to delete property")).toBeInTheDocument();
    });
  });

  it("does not delete when user cancels confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(propertyService.getUserProperties).mockResolvedValue({
      success: true,
      data: {
        properties: mockProperties,
        count: mockProperties.length,
      },
    });

    global.confirm = vi.fn(() => false);

    renderWithAuth(<SavedProperties />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("2 properties saved")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    expect(propertyService.deleteProperty).not.toHaveBeenCalled();
  });

  it("formats address correctly for properties without fullAddress", async () => {
    const propertyWithoutFullAddress: Property = {
      ...mockProperties[1],
      fullAddress: "",
    };

    vi.mocked(propertyService.getUserProperties).mockResolvedValue({
      success: true,
      data: {
        properties: [propertyWithoutFullAddress],
        count: 1,
      },
    });

    renderWithAuth(<SavedProperties />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(
        screen.getByText("456 High St, Melbourne, VIC, 3000")
      ).toBeInTheDocument();
    });
  });
});
