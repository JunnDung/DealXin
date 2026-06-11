import { JwtStrategy } from "./strategies/jwt.strategy";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(
      mockPrisma as never,
      { get: (key: string) => "test-secret" } as never,
    );
  });

  it("should validate and return user from payload", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      email: "user@email.com",
      name: "Test User",
      role: "USER",
      deletedAt: null,
    });

    const result = await strategy.validate({
      sub: "user-123",
      email: "user@email.com",
      role: "USER",
    } as never);

    expect(result).toEqual({
      id: "user-123",
      email: "user@email.com",
      name: "Test User",
      role: "USER",
    });
  });

  it("should return null for deleted user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await strategy.validate({
      sub: "deleted-user",
      email: "deleted@email.com",
      role: "USER",
    } as never);

    expect(result).toBeNull();
  });
});
