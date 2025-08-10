import { 
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type Brand,
  type InsertBrand,
  type Product,
  type InsertProduct,
  type BlogPost,
  type InsertBlogPost,
  type Testimonial,
  type InsertTestimonial
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, categories, brands, products, blogPosts, testimonials } from "@shared/schema";
import { eq, and, or, like, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Brands
  getBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  
  // Products
  getProducts(filters?: {
    categoryId?: string;
    brandId?: string;
    isNew?: boolean;
    isBestseller?: boolean;
    isOnSale?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Blog Posts
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // Testimonials
  getTestimonials(approved?: boolean): Promise<Testimonial[]>;
  getTestimonial(id: string): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
}

// Using DatabaseStorage directly

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true));
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return await db.select().from(brands).where(eq(brands.isActive, true));
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand || undefined;
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(brands).values(insertBrand).returning();
    return brand;
  }

  // Product methods
  async getProducts(filters?: {
    categoryId?: string;
    brandId?: string;
    isNew?: boolean;
    isBestseller?: boolean;
    isOnSale?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));

    if (filters) {
      const conditions = [eq(products.isActive, true)];
      
      if (filters.categoryId) {
        conditions.push(eq(products.categoryId, filters.categoryId));
      }
      if (filters.brandId) {
        conditions.push(eq(products.brandId, filters.brandId));
      }
      if (filters.isNew !== undefined) {
        conditions.push(eq(products.isNew, filters.isNew));
      }
      if (filters.isBestseller !== undefined) {
        conditions.push(eq(products.isBestseller, filters.isBestseller));
      }
      if (filters.isOnSale !== undefined) {
        conditions.push(eq(products.isOnSale, filters.isOnSale));
      }
      if (filters.search) {
        conditions.push(
          or(
            like(products.name, `%${filters.search}%`),
            like(products.description, `%${filters.search}%`)
          )!
        );
      }

      query = query.where(and(...conditions));
      
      if (filters.offset) {
        query = query.offset(filters.offset);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
    }

    return await query;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.count > 0;
  }

  // Blog post methods
  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    
    if (published !== undefined) {
      query = query.where(eq(blogPosts.isPublished, published));
    }
    
    return await query.orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  // Testimonial methods
  async getTestimonials(approved?: boolean): Promise<Testimonial[]> {
    let query = db.select().from(testimonials);
    
    if (approved !== undefined) {
      query = query.where(eq(testimonials.isApproved, approved));
    }
    
    return await query.orderBy(desc(testimonials.createdAt));
  }

  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial || undefined;
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials).values(insertTestimonial).returning();
    return testimonial;
  }
}

export const storage = new DatabaseStorage();
