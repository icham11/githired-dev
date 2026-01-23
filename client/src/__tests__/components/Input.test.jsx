import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Input from "../../components/Input";

describe("Input Component", () => {
  it("should render input element", () => {
    const { container } = render(<Input />);
    expect(container.querySelector("input")).toBeTruthy();
  });

  it("should render with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
  });
});
