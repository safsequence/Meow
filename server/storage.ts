// Simple storage for the pet shop
interface SimpleProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  stock: number;
}

interface SimpleCategory {
  id: string;
  name: string;
  products: SimpleProduct[];
}

export interface IStorage {
  getCategories(): Promise<SimpleCategory[]>;
  getProducts(): Promise<SimpleProduct[]>;
}

export class MemStorage implements IStorage {
  private categories: SimpleCategory[];

  constructor() {
    this.categories = [
      {
        id: 'cat-food',
        name: 'Cat Food',
        products: [
          {
            id: '1',
            name: 'Premium Dry Cat Food',
            price: 1850,
            category: 'cat-food',
            image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            rating: 4.8,
            stock: 50
          }
        ]
      },
      {
        id: 'dog-food', 
        name: 'Dog Food',
        products: [
          {
            id: '2',
            name: 'Premium Dog Kibble',
            price: 2100,
            category: 'dog-food',
            image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
            rating: 4.7,
            stock: 30
          }
        ]
      }
    ];
  }

  async getCategories(): Promise<SimpleCategory[]> {
    return this.categories;
  }

  async getProducts(): Promise<SimpleProduct[]> {
    return this.categories.flatMap(cat => cat.products);
  }
}

export const storage = new MemStorage();