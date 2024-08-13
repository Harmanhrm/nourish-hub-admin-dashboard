const { ApolloServer, gql } = require('apollo-server');
const db = require('./models');
const { User, sequelize, Review, Products } = db;

// GraphQL schema
const typeDefs = gql`
  type User {
    uuid: String!
    user_name: String!
    mail: String!
    sign_up_date: String!
    isBlocked: Boolean!
    isDeleted: Boolean!
  }

  type Review {
    review_id: Int!
    product_id: String!
    user_id: String!
    content: String!
    submission_date: String!
    rating: Int!
    isDeleted: Boolean!
    isFlagged: Boolean!
    product_name: String
    user_name: String
  }

  type Product {
    id: String!
    name: String!
    image: String!
    price: Float!
    isSpecial: Boolean!
    discount: Int
  }

  type ReviewCount {
    productId: String!
    product_name: String!
    reviewCount: Int!
  }

  type AverageRating {
    productId: String!
    product_name: String!
    averageRating: Float!
  }

  type UserReviewCount {
    userId: String!
    userName: String!
    reviewCount: Int!
  }

  type Query {
    getAllUsers(orderBy: String, isBlocked: Boolean, isDeleted: Boolean): [User]
    getAllReviews(orderBy: String, isFlagged: Boolean, rating: Int, isDeleted: Boolean): [Review]
    getAllProducts: [Product]
    getReviewCounts: [ReviewCount]
    getAverageRatings: [AverageRating]
    getUserReviewCounts: [UserReviewCount]
  }

  type Mutation {
    updateReviewContent(review_id: Int!, content: String!): Review
    addProduct(name: String!, image: String!, price: Float!): Product
    updateProduct(id: String!, name: String, image: String, price: Float, isSpecial: Boolean, discount: Int): Product
    deleteUser(uuid: String!): User
    blockUser(uuid: String!): User
    unblockUser(uuid: String!): User
    deleteReview(review_id: Int!): Review
    deleteProduct(id: String!): Product
  }

`;

const resolvers = {
  Query: {
    getAllUsers: async (_, { orderBy, isBlocked, isDeleted }) => {
      let order = [];
      if (orderBy) {
        order.push(['sign_up_date', orderBy]);
      }

      let where = {};
      if (isBlocked !== undefined) {
        where.isBlocked = isBlocked;
      }
      if (isDeleted !== undefined) {
        where.isDeleted = isDeleted;
      }

      return await User.findAll({
        where: where,
        order: order.length ? order : undefined,
      });
    },
    getAllProducts: async () => {
      return await Products.findAll();
    },
    getAllReviews: async (_, { orderBy, isFlagged, rating, isDeleted }) => {
      let order = [];
      if (orderBy) {
        order.push(['submission_date', orderBy]);
      }

      let where = {};
      if (isFlagged !== undefined) {
        where.isFlagged = isFlagged;
      }
      if (isDeleted !== undefined) {
        where.isDeleted = isDeleted;
      }
      if (rating !== undefined) {
        where.rating = rating;
      }

      const reviews = await Review.findAll({
        where: where,
        include: [
          {
            model: Products,
            as: 'Product',
            attributes: ['name']
          },
          {
            model: User,
            as: 'User',
            attributes: ['user_name']
          }
        ],
        order: order.length ? order : undefined,
      });

      return reviews.map(review => ({
        ...review.get(),
        product_name: review.Product ? review.Product.name : null,
        user_name: review.User ? review.User.user_name : null
      }));
    },
    getReviewCounts: async () => {
      const reviewCounts = await Review.findAll({
        attributes: ['product_id', [sequelize.fn('COUNT', sequelize.col('review_id')), 'reviewCount']],
        group: ['product_id'],
        include: [{
          model: Products,
          as: 'Product',
          attributes: ['name']
        }]
      });

      return reviewCounts.filter(count => count.product_id !== null).map(count => ({
        productId: count.product_id,
        product_name: count.Product.name,
        reviewCount: count.dataValues.reviewCount,
      }));
    },
    getAverageRatings: async () => {
      const averageRatings = await Review.findAll({
        attributes: ['product_id', [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']],
        group: ['product_id'],
        include: [{
          model: Products,
          as: 'Product',
          attributes: ['name']
        }]
      });
      return averageRatings.filter(rating => rating.product_id !== null).map(rating => ({
        productId: rating.product_id,
        product_name: rating.Product.name,
        averageRating: rating.dataValues.averageRating,
      }));
    },
    getUserReviewCounts: async () => {
      const userReviewCounts = await Review.findAll({
        attributes: ['user_id', [sequelize.fn('COUNT', sequelize.col('review_id')), 'reviewCount']],
        group: ['user_id'],
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['user_name']
          }
        ]
      });

      return userReviewCounts.filter(count => count.user_id !== null).map(count => ({
        userId: count.user_id,
        userName: count.User ? count.User.user_name : null,
        reviewCount: count.dataValues.reviewCount,
      }));
    },
  },
  Mutation: {
    addProduct: async (_, { name, image, price }) => {
      if (price <= 0.9) {
        throw new Error('Price must be greater than 0.9');
      }
      return await Products.create({ name, image, price});
    },
    updateReviewContent: async (_, { review_id, content }) => {
      if (content.length < 1 || content.length > 100) {
        throw new Error('Content must be between 1 and 100 characters.');
      }
      const review = await Review.findByPk(review_id);
      if (!review) throw new Error('Review not found.');
      review.content = content;
      await review.save();
      return review;
    },
    updateProduct: async (_, { id, name, image, price, isSpecial, discount }) => {
      const product = await Products.findByPk(id);
      if (!product) {
        throw new Error('Product not found.');
      }
      if (isSpecial && discount === undefined) {
        throw new Error('Discount must be provided for special products.');
      }
      if (!isSpecial && discount !== undefined) {
        throw new Error('Discount cannot be set for non-special products.');
      }

      product.name = name || product.name;
      product.image = image || product.image;
      product.price = price !== undefined ? price : product.price;
      product.isSpecial = isSpecial !== undefined ? isSpecial : product.isSpecial;
      product.discount = isSpecial ? discount : null;

      await product.save();
      return product;
    },
    deleteUser: async (_, { uuid }) => {
      const user = await User.findByPk(uuid);
      if (!user) throw new Error('User not found.');
      await user.destroy();
      return user;
    },
    deleteProduct: async (_, { id }) => {
      const product = await Products.findByPk(id);
      if (!product) throw new Error('Product not found.');
      await product.destroy();
      return product;
    },
    unblockUser: async (_, { uuid }) => {
      const user = await User.findByPk(uuid);
      if (!user) throw new Error('User not found.');
      user.isBlocked = false;
      await user.save();
      return user;
    },
    blockUser: async (_, { uuid }) => {
      const user = await User.findByPk(uuid);
      if (!user) throw new Error('User not found.');
      user.isBlocked = true;
      await user.save();
      return user;
    },
    deleteReview: async (_, { review_id }) => {
      const review = await Review.findByPk(review_id);
      if (!review) throw new Error('Review not found.');
      review.isDeleted = true;
      await review.save();
      return review;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

sequelize.authenticate().then(() => {
  console.log('Database connected!');
  server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });
});
