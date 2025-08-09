"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.MemStorage = void 0;
var crypto_1 = require("crypto");
var MemStorage = /** @class */ (function () {
    function MemStorage() {
        this.users = new Map();
        this.groups = new Map();
        this.messages = new Map();
        this.commands = new Map();
        this.statistics = new Map();
        this.statsUpdateInterval = null;
        this.initializeData();
        this.startStatsUpdater();
    }
    MemStorage.prototype.initializeData = function () {
        var _this = this;
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
        var groups = [
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
        groups.forEach(function (group) { return _this.groups.set(group.id, group); });
        // Initialize default users
        var users = [
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
        users.forEach(function (user) { return _this.users.set(user.id, user); });
        // Initialize default commands
        var commands = [
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
        commands.forEach(function (cmd) { return _this.commands.set(cmd.name, cmd); });
        // Initialize today's statistics with dynamic data
        var today = new Date().toISOString().split('T')[0];
        var todayStats = this.generateRealtimeStatistics(today);
        this.statistics.set(today, todayStats);
        // Initialize some sample messages
        var messages = [
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
        messages.forEach(function (msg) { return _this.messages.set(msg.id, msg); });
    };
    MemStorage.prototype.generateRealtimeStatistics = function (date) {
        var baseMessages = 1200;
        var baseCommands = 800;
        var baseUsers = 150;
        var baseGroups = 40;
        // Generar variaciones realistas basadas en la hora del día
        var currentHour = new Date().getHours();
        var timeMultiplier = this.getTimeMultiplier(currentHour);
        return {
            id: (0, crypto_1.randomUUID)(),
            date: date,
            totalMessages: Math.floor(baseMessages + (Math.random() * 100 * timeMultiplier)),
            totalCommands: Math.floor(baseCommands + (Math.random() * 50 * timeMultiplier)),
            activeUsers: Math.floor(baseUsers + (Math.random() * 20 * timeMultiplier)),
            activeGroups: Math.floor(baseGroups + (Math.random() * 5 * timeMultiplier)),
            hourlyData: this.generateHourlyData(currentHour),
        };
    };
    MemStorage.prototype.getTimeMultiplier = function (hour) {
        // Simular actividad más alta durante el día y más baja en la noche
        if (hour >= 6 && hour <= 10)
            return 1.3; // Mañana alta
        if (hour >= 11 && hour <= 14)
            return 1.5; // Mediodía muy alta
        if (hour >= 15 && hour <= 18)
            return 1.4; // Tarde alta
        if (hour >= 19 && hour <= 22)
            return 1.2; // Noche moderada
        return 0.8; // Madrugada baja
    };
    MemStorage.prototype.generateHourlyData = function (currentHour) {
        var hourlyData = {};
        for (var i = 0; i < 24; i++) {
            var hour = i.toString().padStart(2, '0');
            var multiplier = this.getTimeMultiplier(i);
            var isCurrentHour = i === currentHour;
            // Datos más dinámicos para la hora actual
            var baseActivity = isCurrentHour ? Math.random() * 20 + 10 : Math.random() * 15 + 5;
            hourlyData[hour] = {
                messages: Math.floor(baseActivity * multiplier * 3),
                commands: Math.floor(baseActivity * multiplier * 2),
                users: Math.floor(baseActivity * multiplier),
            };
        }
        return hourlyData;
    };
    MemStorage.prototype.startStatsUpdater = function () {
        var _this = this;
        // Actualizar estadísticas cada 10 segundos para que se vean más dinámicas
        this.statsUpdateInterval = setInterval(function () {
            var _a;
            var today = new Date().toISOString().split('T')[0];
            // Solo generar estadísticas realistas si el bot está conectado
            var updatedStats = ((_a = _this.botStatus) === null || _a === void 0 ? void 0 : _a.isConnected)
                ? _this.generateRealtimeStatistics(today)
                : _this.generateZeroStatistics(today);
            _this.statistics.set(today, updatedStats);
        }, 10000);
    };
    MemStorage.prototype.generateZeroStatistics = function (date) {
        var _a;
        return {
            id: ((_a = this.statistics.get(date)) === null || _a === void 0 ? void 0 : _a.id) || (0, crypto_1.randomUUID)(),
            date: date,
            totalMessages: 0,
            totalCommands: 0,
            activeUsers: 0,
            activeGroups: 0,
            hourlyData: this.generateZeroHourlyData(),
        };
    };
    MemStorage.prototype.generateZeroHourlyData = function () {
        var hourlyData = {};
        for (var i = 0; i < 24; i++) {
            var hour = i.toString().padStart(2, '0');
            hourlyData[hour] = {
                messages: 0,
                commands: 0,
                users: 0,
            };
        }
        return hourlyData;
    };
    // Método para limpiar el intervalo si es necesario
    MemStorage.prototype.cleanup = function () {
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
        }
    };
    // Users
    MemStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(id)];
            });
        });
    };
    MemStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values()).find(function (user) { return user.username === username; })];
            });
        });
    };
    MemStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, void 0, function () {
            var id, user;
            return __generator(this, function (_a) {
                id = (0, crypto_1.randomUUID)();
                user = __assign(__assign({}, insertUser), { id: id, lastSeen: new Date(), createdAt: new Date() });
                this.users.set(id, user);
                return [2 /*return*/, user];
            });
        });
    };
    MemStorage.prototype.updateUser = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var user, updatedUser;
            return __generator(this, function (_a) {
                user = this.users.get(id);
                if (!user)
                    return [2 /*return*/, undefined];
                updatedUser = __assign(__assign({}, user), updates);
                this.users.set(id, updatedUser);
                return [2 /*return*/, updatedUser];
            });
        });
    };
    MemStorage.prototype.getActiveUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values()).filter(function (user) { return user.isActive; })];
            });
        });
    };
    // Groups
    MemStorage.prototype.getGroup = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.groups.get(id)];
            });
        });
    };
    MemStorage.prototype.getAllGroups = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.groups.values())];
            });
        });
    };
    MemStorage.prototype.createGroup = function (insertGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var id, group;
            return __generator(this, function (_a) {
                id = (0, crypto_1.randomUUID)();
                group = __assign(__assign({}, insertGroup), { id: id, createdAt: new Date() });
                this.groups.set(id, group);
                return [2 /*return*/, group];
            });
        });
    };
    MemStorage.prototype.updateGroup = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var group, updatedGroup;
            return __generator(this, function (_a) {
                group = this.groups.get(id);
                if (!group)
                    return [2 /*return*/, undefined];
                updatedGroup = __assign(__assign({}, group), updates);
                this.groups.set(id, updatedGroup);
                return [2 /*return*/, updatedGroup];
            });
        });
    };
    MemStorage.prototype.getActiveGroups = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.groups.values()).filter(function (group) { return group.isActive; })];
            });
        });
    };
    // Messages
    MemStorage.prototype.getMessage = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.messages.get(id)];
            });
        });
    };
    MemStorage.prototype.getMessagesByGroup = function (groupId_1) {
        return __awaiter(this, arguments, void 0, function (groupId, limit) {
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.messages.values())
                        .filter(function (msg) { return msg.groupId === groupId; })
                        .sort(function (a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); })
                        .slice(0, limit)
                        .reverse()];
            });
        });
    };
    MemStorage.prototype.createMessage = function (insertMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var id, message;
            return __generator(this, function (_a) {
                id = (0, crypto_1.randomUUID)();
                message = __assign(__assign({}, insertMessage), { id: id, timestamp: new Date() });
                this.messages.set(id, message);
                return [2 /*return*/, message];
            });
        });
    };
    MemStorage.prototype.getRecentMessages = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.messages.values())
                        .sort(function (a, b) { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); })
                        .slice(0, limit)];
            });
        });
    };
    // Commands
    MemStorage.prototype.getCommand = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.commands.get(name)];
            });
        });
    };
    MemStorage.prototype.getAllCommands = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.commands.values())];
            });
        });
    };
    MemStorage.prototype.createCommand = function (insertCommand) {
        return __awaiter(this, void 0, void 0, function () {
            var id, command;
            return __generator(this, function (_a) {
                id = (0, crypto_1.randomUUID)();
                command = __assign(__assign({}, insertCommand), { id: id, usageCount: 0, lastUsed: null });
                this.commands.set(command.name, command);
                return [2 /*return*/, command];
            });
        });
    };
    MemStorage.prototype.updateCommand = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var command, updatedCommand;
            return __generator(this, function (_a) {
                command = Array.from(this.commands.values()).find(function (cmd) { return cmd.id === id; });
                if (!command)
                    return [2 /*return*/, undefined];
                this.commands.delete(command.name);
                updatedCommand = __assign(__assign({}, command), updates);
                this.commands.set(updatedCommand.name, updatedCommand);
                return [2 /*return*/, updatedCommand];
            });
        });
    };
    MemStorage.prototype.incrementCommandUsage = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = this.commands.get(name);
                if (command) {
                    command.usageCount++;
                    command.lastUsed = new Date();
                }
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.deleteCommand = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var command;
            return __generator(this, function (_a) {
                command = Array.from(this.commands.values()).find(function (cmd) { return cmd.id === id; });
                if (!command)
                    return [2 /*return*/, false];
                this.commands.delete(command.name);
                return [2 /*return*/, true];
            });
        });
    };
    // Statistics
    MemStorage.prototype.getStatistics = function (date) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.statistics.get(date)];
            });
        });
    };
    MemStorage.prototype.createOrUpdateStatistics = function (insertStats) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated, id, stats;
            return __generator(this, function (_a) {
                existing = this.statistics.get(insertStats.date);
                if (existing) {
                    updated = __assign(__assign({}, existing), insertStats);
                    this.statistics.set(insertStats.date, updated);
                    return [2 /*return*/, updated];
                }
                else {
                    id = (0, crypto_1.randomUUID)();
                    stats = __assign(__assign({}, insertStats), { id: id });
                    this.statistics.set(insertStats.date, stats);
                    return [2 /*return*/, stats];
                }
                return [2 /*return*/];
            });
        });
    };
    MemStorage.prototype.getStatisticsRange = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.statistics.values())
                        .filter(function (stats) { return stats.date >= startDate && stats.date <= endDate; })
                        .sort(function (a, b) { return a.date.localeCompare(b.date); })];
            });
        });
    };
    // Bot Status
    MemStorage.prototype.getBotStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.botStatus];
            });
        });
    };
    MemStorage.prototype.updateBotStatus = function (updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.botStatus = __assign(__assign({}, this.botStatus), updates);
                if (updates.isConnected !== undefined && updates.isConnected) {
                    this.botStatus.lastConnection = new Date();
                }
                return [2 /*return*/, this.botStatus];
            });
        });
    };
    return MemStorage;
}());
exports.MemStorage = MemStorage;
exports.storage = new MemStorage();
