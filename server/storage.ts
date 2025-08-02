import { type User, type InsertUser, type Group, type InsertGroup, type Message, type InsertMessage, type Command, type InsertCommand, type Statistics, type InsertStatistics, type BotStatus, type InsertBotStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getActiveUsers(): Promise<User[]>;

  // Groups
  getGroup(id: string): Promise<Group | undefined>;
  getAllGroups(): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined>;
  getActiveGroups(): Promise<Group[]>;

  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByGroup(groupId: string, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getRecentMessages(limit?: number): Promise<Message[]>;

  // Commands
  getCommand(name: string): Promise<Command | undefined>;
  getAllCommands(): Promise<Command[]>;
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommand(id: string, updates: Partial<Command>): Promise<Command | undefined>;
  incrementCommandUsage(name: string): Promise<void>;

  // Statistics
  getStatistics(date: string): Promise<Statistics | undefined>;
  createOrUpdateStatistics(stats: InsertStatistics): Promise<Statistics>;
  getStatisticsRange(startDate: string, endDate: string): Promise<Statistics[]>;

  // Bot Status
  getBotStatus(): Promise<BotStatus | undefined>;
  updateBotStatus(updates: Partial<BotStatus>): Promise<BotStatus>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private groups: Map<string, Group> = new Map();
  private messages: Map<string, Message> = new Map();
  private commands: Map<string, Command> = new Map();
  private statistics: Map<string, Statistics> = new Map();
  private botStatus: BotStatus;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize bot status
    this.botStatus = {
      id: "bot_status",
      isConnected: false,
      connectionMethod: null,
      lastConnection: null,
      uptime: 0,
      memoryUsage: 247,
      cpuUsage: 23,
      version: "2.0.1",
      qrCode: null,
      pinCode: "A1B2-C3D4",
    };

    // Initialize default groups
    const groups = [
      {
        id: "group1",
        name: "🦈 Gura Fans",
        description: "Official Gawr Gura fan group",
        avatar: "🦈",
        memberCount: 156,
        isActive: true,
        settings: { allowCommands: true, autoWelcome: true, antiSpam: false },
        createdAt: new Date(),
      },
      {
        id: "group2",
        name: "🌊 Ocean Chat",
        description: "General ocean discussion",
        avatar: "🌊",
        memberCount: 89,
        isActive: true,
        settings: { allowCommands: true, autoWelcome: true, antiSpam: false },
        createdAt: new Date(),
      },
      {
        id: "group3",
        name: "🐠 Aquatic Life",
        description: "Marine biology discussions",
        avatar: "🐠",
        memberCount: 67,
        isActive: true,
        settings: { allowCommands: true, autoWelcome: false, antiSpam: true },
        createdAt: new Date(),
      },
    ];

    groups.forEach(group => this.groups.set(group.id, group));

    // Initialize default users
    const users = [
      {
        id: "user1",
        username: "Usuario123",
        displayName: "Usuario123",
        phone: "+1234567890",
        level: 5,
        experience: 1250,
        role: "member",
        isActive: true,
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      {
        id: "user2",
        username: "MarineFan",
        displayName: "MarineFan",
        phone: "+1234567891",
        level: 8,
        experience: 2100,
        role: "admin",
        isActive: true,
        lastSeen: new Date(),
        createdAt: new Date(),
      },
      {
        id: "user3",
        username: "SharkLover",
        displayName: "SharkLover",
        phone: "+1234567892",
        level: 3,
        experience: 750,
        role: "member",
        isActive: true,
        lastSeen: new Date(),
        createdAt: new Date(),
      },
    ];

    users.forEach(user => this.users.set(user.id, user));

    // Initialize default commands
    const commands = [
      {
        id: "cmd1",
        name: "help",
        description: "Muestra la lista de comandos disponibles",
        usage: "/help",
        category: "general",
        isActive: true,
        usageCount: 342,
        lastUsed: new Date(),
        response: "🦈 ¡Hola chummm! Aquí están mis comandos súper geniales:\n\n⚡ **Comandos Generales:**\n/help - Muestra esta ayuda\n/sticker [nombre] - Genera stickers\n/level - Ve tu nivel actual\n\n🎮 **Juegos:**\n/trivia [tema] - Inicia trivia\n/dados - Lanza dados\n\n👥 **Admin:**\n/kick [@usuario] - Expulsa usuario\n/warn [@usuario] - Advierte usuario\n\n🌊 ¡Úsalos sabiamente, chum!",
        requiredRole: "member",
        cooldown: 3,
      },
      {
        id: "cmd2",
        name: "sticker",
        description: "Genera y envía stickers personalizados",
        usage: "/sticker [nombre]",
        category: "fun",
        isActive: true,
        usageCount: 189,
        lastUsed: new Date(),
        response: "🦈 ¡Sticker enviado! *chomp chomp*",
        requiredRole: "member",
        cooldown: 5,
      },
      {
        id: "cmd3",
        name: "trivia",
        description: "Inicia juegos de trivia interactivos",
        usage: "/trivia [tema]",
        category: "games",
        isActive: true,
        usageCount: 156,
        lastUsed: new Date(),
        response: "🌊 **Trivia del Océano** 🌊\n\n¿Cuál es el animal marino más grande del mundo?\n\nA) Tiburón ballena\nB) Ballena azul 🐋\nC) Calamar gigante\n\n¡Responde con la letra correcta! Tienes 30 segundos.",
        requiredRole: "member",
        cooldown: 10,
      },
    ];

    commands.forEach(cmd => this.commands.set(cmd.name, cmd));

    // Initialize today's statistics
    const today = new Date().toISOString().split('T')[0];
    const todayStats: Statistics = {
      id: randomUUID(),
      date: today,
      totalMessages: 1247,
      totalCommands: 890,
      activeUsers: 156,
      activeGroups: 42,
      hourlyData: {
        "00": { messages: 12, commands: 8, users: 5 },
        "04": { messages: 19, commands: 12, users: 8 },
        "08": { messages: 45, commands: 32, users: 23 },
        "12": { messages: 89, commands: 67, users: 45 },
        "16": { messages: 156, commands: 121, users: 78 },
        "20": { messages: 134, commands: 98, users: 65 },
      },
    };

    this.statistics.set(today, todayStats);

    // Initialize some sample messages
    const messages = [
      {
        id: "msg1",
        groupId: "group1",
        userId: "user1",
        content: "a!",
        messageType: "text",
        isFromBot: false,
        metadata: {},
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: "msg2",
        groupId: "group1",
        userId: null,
        content: "¡¡¡AAAAAA!!! 🦈✨ ¡Hola chummmmm! *chomp chomp* ¿Necesitas ayuda? Usa /help para ver todos mis comandos súper geniales del fondo del mar! 🌊",
        messageType: "text",
        isFromBot: true,
        metadata: {},
        timestamp: new Date(Date.now() - 4 * 60 * 1000), // 4 minutes ago
      },
      {
        id: "msg3",
        groupId: "group1",
        userId: "user2",
        content: "/sticker shark",
        messageType: "command",
        isFromBot: false,
        metadata: { command: "sticker" },
        timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
      },
    ];

    messages.forEach(msg => this.messages.set(msg.id, msg));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      lastSeen: new Date(),
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isActive);
  }

  // Groups
  async getGroup(id: string): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async getAllGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = randomUUID();
    const group: Group = {
      ...insertGroup,
      id,
      createdAt: new Date(),
    };
    this.groups.set(id, group);
    return group;
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<Group | undefined> {
    const group = this.groups.get(id);
    if (!group) return undefined;
    
    const updatedGroup = { ...group, ...updates };
    this.groups.set(id, updatedGroup);
    return updatedGroup;
  }

  async getActiveGroups(): Promise<Group[]> {
    return Array.from(this.groups.values()).filter(group => group.isActive);
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByGroup(groupId: string, limit = 50): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.groupId === groupId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .reverse();
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getRecentMessages(limit = 10): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Commands
  async getCommand(name: string): Promise<Command | undefined> {
    return this.commands.get(name);
  }

  async getAllCommands(): Promise<Command[]> {
    return Array.from(this.commands.values());
  }

  async createCommand(insertCommand: InsertCommand): Promise<Command> {
    const id = randomUUID();
    const command: Command = {
      ...insertCommand,
      id,
      usageCount: 0,
      lastUsed: null,
    };
    this.commands.set(command.name, command);
    return command;
  }

  async updateCommand(id: string, updates: Partial<Command>): Promise<Command | undefined> {
    const command = Array.from(this.commands.values()).find(cmd => cmd.id === id);
    if (!command) return undefined;
    
    this.commands.delete(command.name);
    const updatedCommand = { ...command, ...updates };
    this.commands.set(updatedCommand.name, updatedCommand);
    return updatedCommand;
  }

  async incrementCommandUsage(name: string): Promise<void> {
    const command = this.commands.get(name);
    if (command) {
      command.usageCount++;
      command.lastUsed = new Date();
    }
  }

  // Statistics
  async getStatistics(date: string): Promise<Statistics | undefined> {
    return this.statistics.get(date);
  }

  async createOrUpdateStatistics(insertStats: InsertStatistics): Promise<Statistics> {
    const existing = this.statistics.get(insertStats.date);
    if (existing) {
      const updated = { ...existing, ...insertStats };
      this.statistics.set(insertStats.date, updated);
      return updated;
    } else {
      const id = randomUUID();
      const stats: Statistics = { ...insertStats, id };
      this.statistics.set(insertStats.date, stats);
      return stats;
    }
  }

  async getStatisticsRange(startDate: string, endDate: string): Promise<Statistics[]> {
    return Array.from(this.statistics.values())
      .filter(stats => stats.date >= startDate && stats.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Bot Status
  async getBotStatus(): Promise<BotStatus | undefined> {
    return this.botStatus;
  }

  async updateBotStatus(updates: Partial<BotStatus>): Promise<BotStatus> {
    this.botStatus = { ...this.botStatus, ...updates };
    if (updates.isConnected !== undefined && updates.isConnected) {
      this.botStatus.lastConnection = new Date();
    }
    return this.botStatus;
  }
}

export const storage = new MemStorage();
