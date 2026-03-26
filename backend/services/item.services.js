import { Item } from "../models/item.model.js";
import { HTTP_STATUS } from "../utils/httpCode.js";
import ApiError from "../utils/apiError.js";
import { getPagination, getPaginationMeta } from "../utils/pagination.js";

export const createItemService = async (itemData) => {
  const { name, sku, price, currentStock, lowStockThreshold } = itemData;
  if (!name || !sku) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Name and SKU are required");
  }

  if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Price must be greater than zero",
    );
  }

  if (currentStock !== undefined && currentStock !== 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "currentStock cannot be set directly. Use stock movement endpoints",
    );
  }

  const normalizedSku = sku.trim().toUpperCase();
  const item = await Item.findOne({ sku: normalizedSku });
  if (item) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Item with this SKU already exists",
    );
  }

  const newItem = await Item.create({
    name: name.trim(),
    sku: normalizedSku,
    price,
    currentStock: 0,
    lowStockThreshold,
  });

  return newItem;
};

export const getAllItemsService = async (query = {}) => {
  const filter = {};
  const usePagination = query.page !== undefined || query.limit !== undefined || query.skip !== undefined;

  if (query.lowStockOnly === "true") {
    filter.$expr = { $lte: ["$currentStock", "$lowStockThreshold"] };
  }

  if (!usePagination) {
    const items = await Item.find(filter).sort({ createdAt: -1 });
    return {
      data: items.map((item) => ({
        ...item.toObject(),
        isLowStock: item.currentStock <= item.lowStockThreshold,
      })),
      pagination: null,
    };
  }

  const { page, limit, skip } = getPagination({
    page: query.page,
    limit: query.limit,
    skip: query.skip,
  });
  const totalItems = await Item.countDocuments(filter);
  const items = await Item.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    data: items.map((item) => ({
      ...item.toObject(),
      isLowStock: item.currentStock <= item.lowStockThreshold,
    })),
    pagination: getPaginationMeta(totalItems, page, limit),
  };
};

export const getItemByIdService = async (itemId) => {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Item not found");
  }
  return item;
};
