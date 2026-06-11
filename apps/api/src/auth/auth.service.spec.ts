import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

import { AuthService } from "./auth.service";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue("mock-jwt-token"),
};

const createService = () =>
  new AuthService(mockPrisma as never, mockJwt as never);

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-uuid",
        email: "new@email.com",
        name: "New User",
        role: "USER",
        createdAt: new Date(),
        password: "hashed",
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const service = createService();
      const result = await service.register({
        email: "new@email.com",
        password: "password123",
        name: "New User",
      });

      expect(result.accessToken).toBe("mock-jwt-token");
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe("new@email.com");
    });

    it("should throw ConflictException if email already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "existing-user",
      });

      const service = createService();
      await expect(
        service.register({
          email: "existing@email.com",
          password: "password123",
          name: "Existing User",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should login with correct credentials", async () => {
      const hashedPassword = await bcrypt.hash("validpassword", 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-uuid",
        email: "user@email.com",
        name: "User",
        role: "USER",
        createdAt: new Date(),
        deletedAt: null,
        password: hashedPassword,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const service = createService();
      const result = await service.login({
        email: "user@email.com",
        password: "validpassword",
      });

      expect(result.accessToken).toBe("mock-jwt-token");
      expect(result.user.email).toBe("user@email.com");
    });

    it("should throw UnauthorizedException for wrong password", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-uuid",
        email: "user@email.com",
        name: "User",
        role: "USER",
        deletedAt: null,
        password: hashedPassword,
      });

      const service = createService();
      await expect(
        service.login({
          email: "user@email.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const service = createService();
      await expect(
        service.login({
          email: "nobody@email.com",
          password: "password",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-uuid",
        email: "user@email.com",
        name: "User",
        role: "USER",
        createdAt: new Date("2024-01-01"),
        deletedAt: null,
      });

      const service = createService();
      const result = await service.getProfile("user-uuid");

      expect(result.id).toBe("user-uuid");
      expect(result.email).toBe("user@email.com");
    });
  });

  describe("logout", () => {
    it("should revoke all user refresh tokens", async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

      const service = createService();
      await service.logout("user-uuid");

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-uuid", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
