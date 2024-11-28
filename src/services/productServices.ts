import { Insertable, Updateable } from "kysely";
import { Product } from "../types/db/types";
import { employeeRepository } from "../repository/employeeRepository";
import { CustomError } from "../exceptions/CustomError";
import { productRepository } from "../repository/productRepository";
import { deleteFromS3, uploadToS3 } from "../utils/aws";
import { randomUUID } from "crypto";
import { auditTrailRepository } from "../repository/auditTrailRepository";
import { db } from "../utils/db";
import { employeeServices } from "./employeeServices";
import { parseChangedFieldsFromObject } from "../lib/parseChangedFieldsFromObject";

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
      updatedProduct = await productRepository.update(db, product.id, product);
    }

    await auditTrailRepository.create(db, {
      tableName: "PRODUCT",
      operation: "INSERT",
      data: updatedProduct,
      updatedEmployeeId: owner.id,
    });

    return updatedProduct;
  },
  update: async (
    id: string,
    data: Updateable<Product>,
    file: Express.Multer.File,
    issuerId: string
  ) => {
    const product = await productRepository.getById(id);
    if (!product) throw new CustomError("Product not found.", 400);

    const issuer = await employeeServices.checkIfEligible(
      issuerId,
      product.restaurantId
    );

    // const updatedProduct = await productRepository.update(id, data);

    // if (file) {
    //   const randomKey = randomUUID();
    //   await uploadToS3(`product/${randomKey}`, file);

    //   product.imageUrl = randomKey;
    //   await productRepository.update(id, product);
    // }

    const result = await db.transaction().execute(async (trx) => {
      if (file && product.imageUrl) {
        await deleteFromS3(`product/${product.imageUrl}`);
      }

      if (file) {
        const randomKey = randomUUID();
        await uploadToS3(`product/${randomKey}`, file);

        data.imageUrl = randomKey;
      }
      const updatedProduct = await productRepository.update(trx, id, data);
      const changedData = parseChangedFieldsFromObject(product, updatedProduct);

      await auditTrailRepository.create(trx, {
        tableName: "PRODUCT",
        operation: "UPDATE",
        data: changedData,
        updatedEmployeeId: issuer.id,
      });

      return updatedProduct;
    });

    return result;
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
