import { Router } from "express";
import { 
  listIngredients, 
  createIngredient, 
  recordPurchase, 
  listTransactions, 
  linkRecipe 
} from "../controllers/inventory.controller";
import { 
  zIngredientCreate, 
  zPurchase, 
  zTransactionQuery, 
  zRecipeLink 
} from "../validation/inventory";
import { validateQuery, validateBody } from "../validation/common";

const router = Router();

// GET /api/inventory/vendor/:vendorId/ingredients
router.get("/vendor/:vendorId/ingredients", listIngredients);

// POST /api/inventory/vendor/:vendorId/ingredients
router.post("/vendor/:vendorId/ingredients", validateBody(zIngredientCreate), createIngredient);

// POST /api/inventory/vendor/:vendorId/purchase
router.post("/vendor/:vendorId/purchase", validateBody(zPurchase), recordPurchase);

// GET /api/inventory/vendor/:vendorId/transactions
router.get("/vendor/:vendorId/transactions", validateQuery(zTransactionQuery), listTransactions);

// POST /api/inventory/vendor/:vendorId/link-recipe
router.post("/vendor/:vendorId/link-recipe", validateBody(zRecipeLink), linkRecipe);

export default router;
