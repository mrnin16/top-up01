"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = exports.PaymentStatus = exports.PaymentMethod = exports.TopupMethod = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PAID"] = "PAID";
    OrderStatus["DELIVERING"] = "DELIVERING";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["FAILED"] = "FAILED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var TopupMethod;
(function (TopupMethod) {
    TopupMethod["DIRECT"] = "DIRECT";
    TopupMethod["CODE"] = "CODE";
})(TopupMethod || (exports.TopupMethod = TopupMethod = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["KHQR"] = "KHQR";
    PaymentMethod["BANK"] = "BANK";
    PaymentMethod["CARD"] = "CARD";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["INITIATED"] = "INITIATED";
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCEEDED"] = "SUCCEEDED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["EXPIRED"] = "EXPIRED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
//# sourceMappingURL=enums.js.map