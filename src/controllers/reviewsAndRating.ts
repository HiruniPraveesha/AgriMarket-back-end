import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Function to fetch all reviews and ratings
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.reviewAndRating.findMany();
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getReviewsByProductId = async (req: Request, res: Response) => {
  const { productId } = req.params;
  console.log(`Received productId: ${productId}`);

  if (!productId || isNaN(parseInt(productId))) {
    return res.status(400).json({ error: 'Invalid productId parameter' });
  }

  try {
    const reviews = await prisma.reviewAndRating.findMany({
      where: {
        productId: parseInt(productId),
      },
      include: {
        buyer: true,
          },
        
      
    });
    console.log(`Fetched reviews: ${JSON.stringify(reviews)}`);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews for product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




// Function to create a new review and rating
export const createReview = async (req: Request, res: Response) => {
  const { rating, comment, productId, buyerId } = req.body;

  if (rating == null || !comment || !productId || !buyerId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newReview = await prisma.reviewAndRating.create({
      data: { rating, comment, productId, buyerId },
    });
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to update a review and rating by ID
export const updateReviewById = async (req: Request, res: Response) => {
  const reviewId = parseInt(req.params.id);
  const { rating, comment } = req.body;
  try {
    const updatedReview = await prisma.reviewAndRating.update({
      where: {
        id: reviewId,
      },
      data: {
        rating,
        comment,
      },
    });
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to delete a review and rating by ID
export const deleteReviewById = async (req: Request, res: Response) => {
  const reviewId = parseInt(req.params.id);
  try {
    const deletedReview = await prisma.reviewAndRating.delete({
      where: {
        id: reviewId,
      },
    });
    res.status(200).json(deletedReview);
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// New function to get the total rating for a product
export const getTotalRatingByProductId = async (req: Request, res: Response) => {
    const { productId } = req.params;
    try {
      const totalRating = await prisma.reviewAndRating.aggregate({
        _sum: {
          rating: true,
        },
        where: {
          productId: parseInt(productId),
        },
      });
      res.status(200).json({ totalRating: totalRating._sum.rating });
    } catch (error) {
      console.error('Error fetching total rating for product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // Function to get totals for each rating value (1 to 5) for a specific product ID
export const getRatingTotalsByProductId = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const ratings = await prisma.reviewAndRating.groupBy({
      by: ['rating'],
      where: {
        productId: parseInt(productId),
      },
      _count: true,
    });

    // Initialize totals object with default values
    const totals: { [key: string]: number } = {
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0,
    };

    // Update totals based on received ratings
    ratings.forEach(ratingGroup => {
      const ratingValue = ratingGroup.rating;
      const count = ratingGroup._count;
      if (ratingValue >= 1 && ratingValue <= 5) {
        totals[`rating${ratingValue}`] = count;
      }
    });

    res.status(200).json(totals);
  } catch (error) {
    console.error('Error fetching rating totals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to get count of reviews by product ID
export const getReviewCountByProductId = async (req: Request, res: Response) => {
  const { productId } = req.params;
  try {
    const reviewCount = await prisma.reviewAndRating.count({
      where: {
        productId: parseInt(productId),
      },
    });
    res.status(200).json({ reviewCount });
  } catch (error) {
    console.error('Error fetching review count for product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
