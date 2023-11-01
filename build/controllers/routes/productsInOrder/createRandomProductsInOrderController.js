"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("../../decorators");
const customError_1 = require("../../../errors/customError");
const randomItems_1 = require("../../../randomItems");
const productsInOrder_1 = require("../../../models/productsInOrder");
let CreateRandomProductInOrders = 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CreateRandomProductInOrders {
    createRandomProductInOrders(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const store = new productsInOrder_1.ProductsInOrder();
                const allProductInOrders = yield store.getAllProductInOrders();
                if (allProductInOrders.length !== 0) {
                    throw new customError_1.CustomError(`${allProductInOrders.length} product-in-orders already exist in database.`, 409);
                }
                for (const productInOrder of randomItems_1.randomProductInOrder) {
                    yield store.createProductsInOrders(productInOrder);
                }
                console.log(allProductInOrders);
                res.status(201).send(`${randomItems_1.randomProductInOrder.length} random product-in-orders created.`);
            }
            catch (err) {
                if (err instanceof customError_1.CustomError)
                    next(err);
                next(new customError_1.CustomError(`${err}`, 500));
            }
        });
    }
};
__decorate([
    (0, decorators_1.post)(`/product-in-orders/create-random-product-in-orders`),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", Promise)
], CreateRandomProductInOrders.prototype, "createRandomProductInOrders", null);
CreateRandomProductInOrders = __decorate([
    (0, decorators_1.controller)("/api" /* AppRoutePath.PREFIX_ROUTE */)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
], CreateRandomProductInOrders);
