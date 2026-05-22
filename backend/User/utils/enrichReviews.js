import User from "../../models/User.js";

/** Resolve display name for a review (embedded or standalone). */
export const resolveReviewerName = (review, userDoc) => {
  if (review?.name?.trim()) return review.name.trim();
  if (userDoc?.name?.trim()) return userDoc.name.trim();
  const email = userDoc?.email;
  if (email && !email.includes("@mobile.sheetalya.local")) {
    return email.split("@")[0];
  }
  return "Anonymous";
};

/** Attach reviewer `name` to each embedded product review. */
export const enrichEmbeddedReviews = async (product) => {
  if (!product?.reviews?.length) return product;

  const userIds = [
    ...new Set(
      product.reviews
        .map((r) => r?.user?.toString?.() || r?.user)
        .filter(Boolean)
    ),
  ];

  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } }).select("name email").lean()
    : [];

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  return {
    ...product,
    reviews: product.reviews.map((review) => {
      const userId = review?.user?.toString?.() || review?.user;
      const userDoc = userId ? userMap.get(String(userId)) : null;
      return {
        ...review,
        name: resolveReviewerName(review, userDoc),
      };
    }),
  };
};

/** Format standalone Review documents with populated user. */
export const formatReviewResponse = (review) => {
  const userDoc =
    review?.user && typeof review.user === "object" ? review.user : null;
  const userId = userDoc?._id || review?.user;

  return {
    _id: review._id,
    user: userId,
    product: review.product,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    name: resolveReviewerName(review, userDoc),
    reviewerName: resolveReviewerName(review, userDoc),
  };
};
