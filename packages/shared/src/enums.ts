export enum OrderStatus {
  PENDING     = 'PENDING',
  PAID        = 'PAID',
  DELIVERING  = 'DELIVERING',
  DELIVERED   = 'DELIVERED',
  FAILED      = 'FAILED',
  REFUNDED    = 'REFUNDED',
}

export enum TopupMethod {
  DIRECT = 'DIRECT',
  CODE   = 'CODE',
}

export enum PaymentMethod {
  KHQR = 'KHQR',
  BANK = 'BANK',
  CARD = 'CARD',
}

export enum PaymentStatus {
  INITIATED = 'INITIATED',
  PENDING   = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED    = 'FAILED',
  EXPIRED   = 'EXPIRED',
}

export enum Role {
  USER  = 'USER',
  ADMIN = 'ADMIN',
}
