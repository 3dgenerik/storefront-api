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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardQueries = void 0;
const database_1 = __importDefault(require("../database"));
const store_1 = require("../models/utils/store");
class DashboardQueries extends store_1.Store {
    constructor() {
        super(...arguments);
        this.SQL_MOST_POPULAR_PRODUCTS = 'SELECT products_table.name, SUM(products_in_orders_table.quantity) as total_quantity FROM products_table JOIN products_in_orders_table ON products_table.id = products_in_orders_table.product_id GROUP BY products_table.name ORDER BY total_quantity DESC LIMIT 5';
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mostPopularProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield database_1.default.connect();
            const sql = this.SQL_MOST_POPULAR_PRODUCTS;
            const result = yield conn.query(sql);
            conn.release();
            return result.rows;
        });
    }
}
exports.DashboardQueries = DashboardQueries;
