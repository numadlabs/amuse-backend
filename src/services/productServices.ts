import { Insertable, Updateable } from "kysely";
import { Product } from "../types/db/types";
import { employeeRepository } from "../repository/employeeRepository";
import { CustomError } from "../exceptions/CustomError";
import { productRepository } from "../repository/productRepository";
import { deleteFromS3, uploadToS3 } from "../utils/aws";
import { randomUUID } from "crypto";

export const productServices = {
  create: async (
    data: Insertable<Product>,
    file: Express.Multer.File,
    ownerId: string
  ) => {
    const owner = await employeeRepository.getById(ownerId);
    if (!owner) throw new CustomError("Owner not found.", 400);

    if (!owner.restaurantId)
      throw new CustomError("You are not allowed to create products.", 400);

    data.restaurantId = owner.restaurantId;

    const product = await productRepository.create(data);

    let updatedProduct = product;
    if (file) {
      const randomKey = randomUUID();
      await uploadToS3(`product/${randomKey}`, file);

      product.imageUrl = randomKey;
      updatedProduct = await productRepository.update(product.id, product);
    }

    return updatedProduct;
  },
  update: async (
    id: string,
    data: Updateable<Product>,
    file: Express.Multer.File,
    issuerId: string
  ) => {
    const issuer = await employeeRepository.getById(issuerId);
    if (!issuer) throw new CustomError("Issuer not found.", 400);
    if (!issuer.restaurantId)
      throw new CustomError("You are not allowed to update products.", 400);

    const product = await productRepository.getById(id);
    if (!product) throw new CustomError("Product not found.", 400);

    if (issuer.restaurantId !== product.restaurantId)
      throw new CustomError("You are not allowed to update this product.", 400);

    const updatedProduct = await productRepository.update(id, data);

    if (file) {
      const randomKey = randomUUID();
      await uploadToS3(`product/${randomKey}`, file);

      product.imageUrl = randomKey;
      await productRepository.update(id, product);
    }

    return updatedProduct;
  },
  delete: async (id: string, issuerId: string) => {
    const issuer = await employeeRepository.getById(issuerId);
    if (!issuer) throw new CustomError("Issuer not found.", 400);
    if (!issuer.restaurantId)
      throw new CustomError("You are not allowed to delete products.", 400);

    const product = await productRepository.getById(id);
    if (!product) throw new CustomError("Product not found.", 400);

    if (issuer.restaurantId !== product.restaurantId)
      throw new CustomError("You are not allowed to delete this product.", 400);

    await deleteFromS3(`product/${product.imageUrl}`);

    const deletedProduct = await productRepository.delete(id);

    return deletedProduct;
  },
  getById: async (id: string) => {
    const product = await productRepository.getById(id);

    return product;
  },
  getByRestaurantId: async (restaurantId: string) => {
    const products = await productRepository.getByRestaurantId(restaurantId);

    return products;
  },
};
