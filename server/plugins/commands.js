"use strict";
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
exports.basicCommands = exports.CommandManager = void 0;
var storage_1 = require("../storage");
var CommandManager = /** @class */ (function () {
    function CommandManager() {
        this.commands = new Map();
    }
    CommandManager.prototype.registerCommand = function (command) {
        this.commands.set(command.name, command);
    };
    CommandManager.prototype.executeCommand = function (socket, message, commandText) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, commandName, args, command, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = commandText.substring(1).split(' '), commandName = _a[0], args = _a.slice(1);
                        command = this.commands.get(commandName.toLowerCase());
                        if (!!command) return [3 /*break*/, 2];
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                                text: "\uD83E\uDD88 Comando \"".concat(commandName, "\" no encontrado. Usa /help para ver todos los comandos.")
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                    case 2:
                        _b.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, command.handler(socket, message, args)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Error ejecutando comando ".concat(commandName, ":"), error_1);
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                                text: "\uD83D\uDEA8 Error ejecutando comando: ".concat(error_1)
                            })];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.getCommands = function () {
        return Array.from(this.commands.values());
    };
    CommandManager.prototype.getCommandsByCategory = function (category) {
        return Array.from(this.commands.values()).filter(function (cmd) { return cmd.category === category; });
    };
    return CommandManager;
}());
exports.CommandManager = CommandManager;
// Comandos básicos
exports.basicCommands = [
    {
        name: 'help',
        description: 'Muestra ayuda de comandos',
        category: 'general',
        handler: function (socket, message, args) { return __awaiter(void 0, void 0, void 0, function () {
            var helpText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        helpText = "\uD83E\uDD88 **Gawr Gura Bot - Comandos** \uD83E\uDD88\n\n\u26A1 **Generales:**\n/help - Muestra esta ayuda\n/ping - Verifica latencia\n/level - Ve tu nivel actual\n/sticker [nombre] - Genera stickers\n\n\uD83C\uDFAE **Juegos:**\n/trivia [tema] - Inicia trivia\n/dados [cantidad] - Lanza dados\n/adivinanza - Juego de adivinanzas\n\n\uD83D\uDC65 **Admin (Solo administradores):**\n/kick [@usuario] - Expulsa usuario\n/warn [@usuario] - Advierte usuario\n/mute [@usuario] - Silencia usuario\n\n\uD83C\uDF0A \u00A1\u00DAsalos sabiamente, chum!";
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, { text: helpText })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    },
    {
        name: 'ping',
        description: 'Verifica la latencia del bot',
        category: 'general',
        handler: function (socket, message, args) { return __awaiter(void 0, void 0, void 0, function () {
            var start;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = Date.now();
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                                text: "\uD83E\uDD88 Pong! Latencia: ".concat(Date.now() - start, "ms\n\u00A1Estoy nadando a toda velocidad!")
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    },
    {
        name: 'level',
        description: 'Muestra tu nivel actual',
        category: 'general',
        handler: function (socket, message, args) { return __awaiter(void 0, void 0, void 0, function () {
            var level, xp, maxXp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        level = Math.floor(Math.random() * 10) + 1;
                        xp = Math.floor(Math.random() * 1000) + 500;
                        maxXp = Math.floor(Math.random() * 500) + 1500;
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                                text: "\uD83E\uDD88 **Tu Nivel Actual** \uD83C\uDF1F\n\nNivel: ".concat(level, "\nExperiencia: ").concat(xp, "/").concat(maxXp, " XP\n\n\u00A1Sigue chateando para subir de nivel, chum!")
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    },
    {
        name: 'dados',
        description: 'Lanza dados',
        category: 'games',
        handler: function (socket, message, args) { return __awaiter(void 0, void 0, void 0, function () {
            var diceCount, results, diceEmojis, resultText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        diceCount = Math.min(parseInt(args[0]) || 1, 6);
                        results = Array.from({ length: diceCount }, function () { return Math.floor(Math.random() * 6) + 1; });
                        diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
                        resultText = "\uD83C\uDFB2 **Lanzando ".concat(diceCount, " dado(s)** \uD83C\uDFB2\n\nResultados: ").concat(results.map(function (r) { return diceEmojis[r - 1]; }).join(' '), "\nTotal: ").concat(results.reduce(function (a, b) { return a + b; }, 0));
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, { text: resultText })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    },
    {
        name: 'trivia',
        description: 'Inicia un juego de trivia',
        category: 'games',
        handler: function (socket, message, args) { return __awaiter(void 0, void 0, void 0, function () {
            var topic, triviaText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        topic = args.join(' ') || 'océano';
                        triviaText = "\uD83C\uDF0A **Trivia de ".concat(topic, "** \uD83C\uDF0A\n\n\u00BFCu\u00E1l es el animal marino m\u00E1s grande del mundo?\n\nA) Tibur\u00F3n ballena\nB) Ballena azul \uD83D\uDC0B\nC) Calamar gigante\n\n\u00A1Responde con la letra correcta! Tienes 30 segundos.");
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, { text: triviaText })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    },
    {
        name: 'sticker',
        description: 'Genera un sticker personalizado',
        category: 'fun',
        handler: function (socket, message, args) { return __awaiter(void 0, void 0, void 0, function () {
            var stickerName, stickerText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stickerName = args.join(' ') || 'shark';
                        stickerText = "\uD83E\uDD88 \u00A1Generando sticker \"".concat(stickerName, "\"! *chomp chomp*\n\n[\uD83E\uDD88 STICKER: ").concat(stickerName.toUpperCase(), " \uD83E\uDD88]");
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, { text: stickerText })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    },
    // Comandos de admin
    {
        name: 'kick',
        description: 'Expulsa un usuario del grupo',
        category: 'admin',
        adminOnly: true,
        handler: function (socket, message, args) { return __awaiter(void 0, void 0, void 0, function () {
            var userMention;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!((_a = message.key.remoteJid) === null || _a === void 0 ? void 0 : _a.endsWith('@g.us'))) return [3 /*break*/, 2];
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                                text: '🚨 Este comando solo funciona en grupos.'
                            })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                    case 2:
                        userMention = args[0];
                        if (!!userMention) return [3 /*break*/, 4];
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                                text: '🚨 Menciona a un usuario para expulsarlo. Ejemplo: /kick @usuario'
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                            text: "\uD83E\uDD88 [SIMULADO] Usuario ".concat(userMention, " ha sido expulsado del grupo.")
                        })];
                    case 5:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    },
    {
        name: 'warn',
        description: 'Advierte a un usuario',
        category: 'admin',
        adminOnly: true,
        handler: function (socket, message, args) { return __awaiter(void 0, void 0, void 0, function () {
            var userMention;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userMention = args[0];
                        if (!!userMention) return [3 /*break*/, 2];
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                                text: '🚨 Menciona a un usuario para advertirlo. Ejemplo: /warn @usuario'
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                            text: "\u26A0\uFE0F **Advertencia para ".concat(userMention, "**\n\nPor favor respeta las reglas del grupo. Esta es tu advertencia oficial.\n\n\uD83E\uDD88 - Gawr Gura Bot")
                        })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    },
    {
        name: 'createsubbot',
        description: 'Crea un nuevo sub-bot',
        category: 'admin',
        handler: function (socket, message, args) { return __awaiter(void 0, void 0, void 0, function () {
            var userId, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = message.key.remoteJid;
                        if (!!userId) return [3 /*break*/, 2];
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                                text: 'Error: No se pudo obtener el ID del usuario.'
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, storage_1.storage.getUser(userId)];
                    case 3:
                        user = _a.sent();
                        if (!(!user || user.role !== 'premium')) return [3 /*break*/, 5];
                        return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                                text: '🚨 Este comando es solo para usuarios premium.'
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                    case 5: return [4 /*yield*/, socket.sendMessage(message.key.remoteJid, {
                            text: '¡Felicidades! 🎉 Tu sub-bot ha sido creado y está siendo configurado. Recibirás una notificación cuando esté listo.'
                        })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }
    }
];
