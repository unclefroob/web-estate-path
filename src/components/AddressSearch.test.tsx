import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressSearch } from "./AddressSearch";
import { addressService } from "../services/addressService";

vi.mock("../services/addressService", () => ({
  addressService: {
    searchAddresses: vi.fn(),
  },
}));

describe("AddressSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input and header", () => {
    render(<AddressSearch />);

    expect(
      screen.getByRole("heading", { name: /find your australian address/i })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter street address/i)
    ).toBeInTheDocument();
  });

  it("shows hint message when input is less than 3 characters", async () => {
    const user = userEvent.setup();
    render(<AddressSearch />);

    const input = screen.getByPlaceholderText(/enter street address/i);
    await user.type(input, "ab");

    expect(
      screen.getByText(/type at least 3 characters to search/i)
    ).toBeInTheDocument();
  });

  it("searches for addresses after typing 3+ characters with debounce", async () => {
    const user = userEvent.setup();
    const mockResponse = {
      success: true,
      suggestions: [
        {
          display_name: "123 Test St, Sydney NSW 2000, Australia",
          place_id: 1,
          lat: "-33.8688",
          lon: "151.2093",
          address: {
            road: "Test St",
            suburb: "Sydney",
            state: "NSW",
            postcode: "2000",
          },
        },
      ],
    };

    vi.mocked(addressService.searchAddresses).mockResolvedValue(mockResponse);

    render(<AddressSearch />);

    const input = screen.getByPlaceholderText(/enter street address/i);
    await user.type(input, "123 Test");

    // Wait for debounce and API call
    await waitFor(
      () => {
        expect(addressService.searchAddresses).toHaveBeenCalledWith("123 Test");
      },
      { timeout: 1000 }
    );

    await waitFor(() => {
      expect(
        screen.getByText(/123 Test St, Sydney NSW 2000, Australia/i)
      ).toBeInTheDocument();
    });
  });

  it("displays suggestions list", async () => {
    const user = userEvent.setup();
    const mockResponse = {
      success: true,
      suggestions: [
        {
          display_name: "123 Main St, Melbourne VIC 3000, Australia",
          place_id: 1,
          lat: "-37.8136",
          lon: "144.9631",
          address: {
            road: "Main St",
            suburb: "Melbourne",
            state: "VIC",
            postcode: "3000",
          },
        },
        {
          display_name: "456 Queen St, Brisbane QLD 4000, Australia",
          place_id: 2,
          lat: "-27.4698",
          lon: "153.0251",
          address: {
            road: "Queen St",
            suburb: "Brisbane",
            state: "QLD",
            postcode: "4000",
          },
        },
      ],
    };

    vi.mocked(addressService.searchAddresses).mockResolvedValue(mockResponse);

    render(<AddressSearch />);

    const input = screen.getByPlaceholderText(/enter street address/i);
    await user.type(input, "main street");

    await waitFor(() => {
      expect(
        screen.getByText(/123 Main St, Melbourne VIC 3000, Australia/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/456 Queen St, Brisbane QLD 4000, Australia/i)
      ).toBeInTheDocument();
    });
  });

  it("selects address when suggestion is clicked", async () => {
    const user = userEvent.setup();
    const mockResponse = {
      success: true,
      suggestions: [
        {
          display_name: "123 Test St, Sydney NSW 2000, Australia",
          place_id: 1,
          lat: "-33.8688",
          lon: "151.2093",
          address: {
            road: "Test St",
            suburb: "Sydney",
            state: "NSW",
            postcode: "2000",
          },
        },
      ],
    };

    vi.mocked(addressService.searchAddresses).mockResolvedValue(mockResponse);

    render(<AddressSearch />);

    const input = screen.getByPlaceholderText(/enter street address/i);
    await user.type(input, "123 Test");

    await waitFor(() => {
      expect(
        screen.getByText(/123 Test St, Sydney NSW 2000, Australia/i)
      ).toBeInTheDocument();
    });

    const suggestion = screen.getByText(
      /123 Test St, Sydney NSW 2000, Australia/i
    );
    await user.click(suggestion);

    expect(
      screen.getByRole("heading", { name: /selected address/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/sydney/i)).toBeInTheDocument();
    expect(screen.getByText(/2000/i)).toBeInTheDocument();
  });

  it("clears search when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddressSearch />);

    const input = screen.getByPlaceholderText(
      /enter street address/i
    ) as HTMLInputElement;
    await user.type(input, "test");

    expect(input.value).toBe("test");

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    await user.click(clearButton);

    expect(input.value).toBe("");
  });

  it("displays error message when search fails", async () => {
    const user = userEvent.setup();
    vi.mocked(addressService.searchAddresses).mockRejectedValue(
      new Error("Network error")
    );

    render(<AddressSearch />);

    const input = screen.getByPlaceholderText(/enter street address/i);
    await user.type(input, "test address");

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("shows loading indicator while searching", async () => {
    const user = userEvent.setup();
    vi.mocked(addressService.searchAddresses).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<AddressSearch />);

    const input = screen.getByPlaceholderText(/enter street address/i);
    await user.type(input, "testing");

    await waitFor(() => {
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });
  });
});
