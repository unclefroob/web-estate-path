import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PropertyDetails } from "./PropertyDetails";
import { AuthContext } from "../context/AuthContext";
import { propertyService } from "../services/propertyService";
import type { Property } from "../types/property";

// Mock the property service
vi.mock("../services/propertyService", () => ({
  propertyService: {
    getPropertyById: vi.fn(),
    deleteProperty: vi.fn(),
  },
}));

const mockProperty: Property = {
  _id: "123",
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
};

const renderWithRouter = (
  component: React.ReactElement,
  authValue: any = {},
  initialRoute = "/properties/123"
) => {
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
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthContext.Provider value={defaultAuthValue}>
        <Routes>
          <Route path="/properties/:id" element={component} />
          <Route path="/properties" element={<div>Properties List</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("PropertyDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.confirm = vi.fn(() => true);
    global.open = vi.fn();
  });

  it("shows login prompt when user is not logged in", () => {
    renderWithRouter(<PropertyDetails />);

    expect(screen.getByText("Please Log In")).toBeInTheDocument();
    expect(
      screen.getByText("You need to be logged in to view property details.")
    ).toBeInTheDocument();
  });

  it("shows loading state while fetching property", () => {
    vi.mocked(propertyService.getPropertyById).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    expect(screen.getByText("Loading property details...")).toBeInTheDocument();
  });

  it("displays property details when loaded successfully", async () => {
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: mockProperty },
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(
        screen.getByText("Unit 5, 123 Main St, Sydney NSW 2000")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("5")).toBeInTheDocument(); // Unit
    expect(screen.getByText("123")).toBeInTheDocument(); // Number
    expect(screen.getByText("Main St")).toBeInTheDocument(); // Street
    expect(screen.getByText("Sydney")).toBeInTheDocument(); // Suburb
    expect(screen.getByText("NSW")).toBeInTheDocument(); // State
    expect(screen.getByText("2000")).toBeInTheDocument(); // Postcode
  });

  it("displays coordinates when available", async () => {
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: mockProperty },
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("-33.8688")).toBeInTheDocument();
    });

    expect(screen.getByText("151.2093")).toBeInTheDocument();
    expect(screen.getByText("View on Google Maps")).toBeInTheDocument();
  });

  it("does not display coordinates section when not available", async () => {
    const propertyWithoutCoords = { ...mockProperty, coordinates: undefined };
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: propertyWithoutCoords },
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(
        screen.getByText("Unit 5, 123 Main St, Sydney NSW 2000")
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("View on Google Maps")).not.toBeInTheDocument();
  });

  it("shows error message when property not found", async () => {
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: false,
      message: "Property not found",
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("Property Not Found")).toBeInTheDocument();
    });

    expect(screen.getByText("Property not found")).toBeInTheDocument();
  });

  it("opens Google Maps when map button is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: mockProperty },
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("View on Google Maps")).toBeInTheDocument();
    });

    const mapButton = screen.getByText("View on Google Maps");
    await user.click(mapButton);

    expect(global.open).toHaveBeenCalledWith(
      "https://www.google.com/maps?q=-33.8688,151.2093",
      "_blank"
    );
  });

  it("handles property deletion successfully", async () => {
    const user = userEvent.setup();
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: mockProperty },
    });

    vi.mocked(propertyService.deleteProperty).mockResolvedValue({
      success: true,
      message: "Property deleted successfully",
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("Delete Property")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Delete Property");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(propertyService.deleteProperty).toHaveBeenCalledWith(
        "123",
        "token123"
      );
    });
  });

  it("shows error message when deletion fails", async () => {
    const user = userEvent.setup();
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: mockProperty },
    });

    vi.mocked(propertyService.deleteProperty).mockResolvedValue({
      success: false,
      message: "Failed to delete property",
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("Delete Property")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Delete Property");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to delete property")).toBeInTheDocument();
    });
  });

  it("does not delete when user cancels confirmation", async () => {
    const user = userEvent.setup();
    global.confirm = vi.fn(() => false);

    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: mockProperty },
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("Delete Property")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Delete Property");
    await user.click(deleteButton);

    expect(propertyService.deleteProperty).not.toHaveBeenCalled();
  });

  it("displays property ID in monospace font", async () => {
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: mockProperty },
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("123")).toBeInTheDocument();
    });

    const propertyIdElement = screen.getByText("123");
    expect(propertyIdElement).toHaveClass("property-id");
  });

  it("does not display unit field when unit is not available", async () => {
    const propertyWithoutUnit = { ...mockProperty, unit: undefined };
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: propertyWithoutUnit },
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(
        screen.getByText("Unit 5, 123 Main St, Sydney NSW 2000")
      ).toBeInTheDocument();
    });

    // Check that "Unit" label is not present in the address details section
    const unitLabels = screen.queryAllByText("Unit");
    // Should only appear in the full address, not as a separate field
    expect(unitLabels.length).toBeLessThanOrEqual(1);
  });

  it("has back button linking to properties list", async () => {
    vi.mocked(propertyService.getPropertyById).mockResolvedValue({
      success: true,
      data: { property: mockProperty },
    });

    renderWithRouter(<PropertyDetails />, {
      user: { id: "1", email: "test@example.com", name: "Test User" },
      accessToken: "token123",
    });

    await waitFor(() => {
      expect(screen.getByText("← Back to Properties")).toBeInTheDocument();
    });

    const backButton = screen.getByText("← Back to Properties");
    expect(backButton).toHaveAttribute("href", "/properties");
  });
});
