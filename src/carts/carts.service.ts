import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { generateUuid } from '../utils/uuid.util';
import { Cart, CartItem, cartsDatabase } from './database/database';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) {}

  create(createCartDto: CreateCartDto) {
    const user = this.usersService.findActiveOne(createCartDto.userId);
    const cart: Cart = {
      id: generateUuid(),
      userId: user.id,
      status: 'ACTIVE',
      items: [],
      createdAt: new Date().toISOString(),
    };

    cartsDatabase.push(cart);
    return this.buildCartSummary(cart);
  }

  findOne(cartId: string) {
    const cart = this.getActiveOrCheckedOutCart(cartId);
    return this.buildCartSummary(cart);
  }

  addItem(cartId: string, productId: string, quantity: number) {
    const cart = this.getActiveCart(cartId);
    const product = this.productsService.findOne(productId);

    if (!product.isActive) {
      throw new BadRequestException('Cannot add inactive product to cart');
    }

    const existingItem = cart.items.find((item) => item.productId === productId);
    const requestedQuantity = (existingItem?.quantity ?? 0) + quantity;
    this.assertSufficientStock(productId, requestedQuantity);

    if (existingItem) {
      existingItem.quantity = requestedQuantity;
      existingItem.unitPrice = product.price;
    } else {
      cart.items.push({
        productId,
        quantity,
        unitPrice: product.price,
      });
    }

    return this.buildCartSummary(cart);
  }

  updateItemQuantity(cartId: string, productId: string, quantity: number) {
    const cart = this.getActiveCart(cartId);
    const item = cart.items.find((cartItem) => cartItem.productId === productId);

    if (!item) {
      throw new NotFoundException(`Product ${productId} is not in cart ${cartId}`);
    }

    this.assertSufficientStock(productId, quantity);
    item.quantity = quantity;
    item.unitPrice = this.productsService.findOne(productId).price;

    return this.buildCartSummary(cart);
  }

  removeItem(cartId: string, productId: string) {
    const cart = this.getActiveCart(cartId);
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      throw new NotFoundException(`Product ${productId} is not in cart ${cartId}`);
    }

    cart.items.splice(itemIndex, 1);
    return this.buildCartSummary(cart);
  }

  checkout(cartId: string, checkoutCartDto: CheckoutCartDto) {
    const cart = this.getActiveCart(cartId);
    if (cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty cart');
    }

    for (const item of cart.items) {
      this.assertSufficientStock(item.productId, item.quantity);
    }

    const order = this.ordersService.create({
      userId: cart.userId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    cart.status = 'CHECKED_OUT';
    cart.checkedOutAt = new Date().toISOString();

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return {
      message: 'Checkout completed successfully',
      note: checkoutCartDto.note ?? null,
      cart: this.buildCartSummary(cart),
      checkout: {
        totalItems,
        grandTotal,
        orderCount: 1,
      },
      order,
    };
  }

  private getActiveOrCheckedOutCart(cartId: string): Cart {
    const cart = cartsDatabase.find((item) => item.id === cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }
    return cart;
  }

  private getActiveCart(cartId: string): Cart {
    const cart = this.getActiveOrCheckedOutCart(cartId);
    if (cart.status !== 'ACTIVE') {
      throw new BadRequestException(`Cart ${cartId} has already been checked out`);
    }
    return cart;
  }

  private assertSufficientStock(productId: string, requestedQuantity: number) {
    const availableStock = this.productsService.getAvailableQuantity(productId);
    if (requestedQuantity > availableStock) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}. Available: ${availableStock}, requested: ${requestedQuantity}`,
      );
    }
  }

  private buildCartSummary(cart: Cart) {
    const user = this.usersService.findOne(cart.userId);
    const items = cart.items.map((item: CartItem) => {
      const product = this.productsService.findOne(item.productId);
      return {
        productId: item.productId,
        productCode: product.code,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      };
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      ...cart,
      user: {
        id: user.id,
        code: user.code,
        fullName: user.fullName,
        email: user.email,
      },
      items,
      summary: {
        totalItems,
        grandTotal,
      },
    };
  }
}
