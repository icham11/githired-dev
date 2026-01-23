import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Button from "../../components/Button";

describe("Button Component", () => {
  it("should render button with correct text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("should render without crashing", () => {
    const { container } = render(<Button>Test Button</Button>);
    expect(container).toBeTruthy();
  });
});
