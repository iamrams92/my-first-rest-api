import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { CreateCartDto } from './dto/create-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartsRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemsRepository: Repository<CartItemEntity>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) {}

  async create(createCartDto: CreateCartDto) {
    const user = await this.usersService.findActiveOne(createCartDto.userId);
    const cart = this.cartsRepository.create({
      user,
      status: 'ACTIVE',
      items: [],
    });
    const savedCart = await this.cartsRepository.save(cart);
    return this.buildCartSummary(savedCart);
  }

  async findOne(cartId: string) {
    const cart = await this.getActiveOrCheckedOutCart(cartId);
    return this.buildCartSummary(cart);
  }

  async addItem(cartId: string, productId: string, quantity: number) {
    const cart = await this.getActiveCart(cartId);
    const product = await this.productsService.findOne(productId);

    if (!product.isActive) {
      throw new BadRequestException('Cannot add inactive product to cart');
    }

    const existingItem = (cart.items || []).find(
      (item) => item.product.id === productId,
    );
    const requestedQuantity = (existingItem?.quantity ?? 0) + quantity;
    await this.assertSufficientStock(productId, requestedQuantity);

    if (existingItem) {
      existingItem.quantity = requestedQuantity;
      existingItem.unitPrice = product.price;
      await this.cartItemsRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemsRepository.create({
        cart,
        product,
        quantity,
        unitPrice: product.price,
      });
      await this.cartItemsRepository.save(cartItem);
    }

    return this.findOne(cartId);
  }

  async updateItemQuantity(cartId: string, productId: string, quantity: number) {
    const cart = await this.getActiveCart(cartId);
    const item = cart.items.find((cartItem) => cartItem.product.id === productId);

    if (!item) {
      throw new NotFoundException(`Product ${productId} is not in cart ${cartId}`);
    }

    await this.assertSufficientStock(productId, quantity);
    item.quantity = quantity;
    item.unitPrice = (await this.productsService.findOne(productId)).price;
    await this.cartItemsRepository.save(item);

    return this.findOne(cartId);
  }

  async removeItem(cartId: string, productId: string) {
    const cart = await this.getActiveCart(cartId);
    const item = cart.items.find((cartItem) => cartItem.product.id === productId);
    if (!item) {
      throw new NotFoundException(`Product ${productId} is not in cart ${cartId}`);
    }
    await this.cartItemsRepository.remove(item);
    return this.findOne(cartId);
  }

  async checkout(cartId: string, checkoutCartDto: CheckoutCartDto) {
    const cart = await this.getActiveCart(cartId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty cart');
    }

    for (const item of cart.items) {
      await this.assertSufficientStock(item.product.id, item.quantity);
    }

    const order = await this.ordersService.create({
      userId: cart.user.id,
      items: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    });

    cart.status = 'CHECKED_OUT';
    cart.checkedOutAt = new Date();
    await this.cartsRepository.save(cart);

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const grandTotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return {
      message: 'Checkout completed successfully',
      note: checkoutCartDto.note ?? null,
      cart: await this.buildCartSummary(cart),
      checkout: {
        totalItems,
        grandTotal,
        orderCount: 1,
      },
      order,
    };
  }

  private async getActiveOrCheckedOutCart(cartId: string): Promise<CartEntity> {
    const cart = await this.cartsRepository.findOne({
      where: { id: cartId },
      relations: { items: { product: true }, user: true },
    });
    if (!cart) {
      throw new NotFoundException(`Cart with id ${cartId} not found`);
    }
    return cart;
  }

  private async getActiveCart(cartId: string): Promise<CartEntity> {
    const cart = await this.getActiveOrCheckedOutCart(cartId);
    if (cart.status !== 'ACTIVE') {
      throw new BadRequestException(`Cart ${cartId} has already been checked out`);
    }
    return cart;
  }

  private async assertSufficientStock(
    productId: string,
    requestedQuantity: number,
  ) {
    const availableStock = await this.productsService.getAvailableQuantity(productId);
    if (requestedQuantity > availableStock) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}. Available: ${availableStock}, requested: ${requestedQuantity}`,
      );
    }
  }

  private async buildCartSummary(cart: CartEntity) {
    const user = await this.usersService.findOne(cart.user.id);
    const items = cart.items.map((item: CartItemEntity) => {
      const product = item.product;
      return {
        productId: product.id,
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
