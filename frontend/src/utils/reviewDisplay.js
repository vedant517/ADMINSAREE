/** Display name for a product review on the user storefront. */
export const getReviewerDisplayName = (review) => {
  if (!review) return 'Anonymous';
  if (review.name?.trim()) return review.name.trim();
  if (review.reviewerName?.trim()) return review.reviewerName.trim();
  if (typeof review.user === 'object' && review.user?.name?.trim()) {
    return review.user.name.trim();
  }
  const email = typeof review.user === 'object' ? review.user?.email : null;
  if (email && !email.includes('@mobile.sheetalya.local')) {
    return email.split('@')[0];
  }
  return 'Anonymous';
};
