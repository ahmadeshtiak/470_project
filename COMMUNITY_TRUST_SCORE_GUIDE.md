# Community Trust Score Feature - Implementation Guide

## Overview
The Community Trust Score feature has been successfully implemented. This system allows users to rate and review each other after successful purchases or exchanges, building a trust-based reputation system.

## Feature Components

### 1. Backend Implementation

#### Database Models
- **Rating Model** - Stores individual ratings with ratedBy, ratedUser, rating (1-5), review text, order reference
- **User Model** - Enhanced with `averageRating` and `totalRatings` fields
- **Order Model** - Added `isRatedByBuyer` flag to track rating status

#### API Endpoints
All endpoints located at `/api/ratings`:

**POST /api/ratings**
- Create a new rating after order completion
- Requires: orderId, ratedUserId, rating (1-5), optional review
- Authentication: Required (buyer only)
- Auto-updates user's averageRating and totalRatings

**GET /api/ratings/:userId**
- Retrieve all ratings for a specific user
- Optional pagination: ?limit=10&skip=0
- Returns: Array of ratings with rater information

**GET /api/ratings/check/:orderId**
- Check if current user has already rated an order
- Authentication: Required
- Returns: { isRated, data }

**DELETE /api/ratings/:ratingId**
- Remove a rating (only rater or admin)
- Recalculates user's average rating automatically

### 2. Frontend Components

#### RatingModal Component
**Location:** `client/src/components/RatingModal.jsx`

Features:
- 5-star interactive rating selector with hover effects
- Optional text review (500 character limit)
- Loading state during submission
- Error handling and display
- Visual feedback for selected rating

Usage:
```jsx
<RatingModal
  orderId={orderId}
  sellerId={sellerId}
  sellerName="Seller Name"
  onClose={closeHandler}
  onSuccess={refreshHandler}
/>
```

#### UserRatingsDropdown Component
**Location:** `client/src/components/UserRatingsDropdown.jsx`

Features:
- Dropdown menu showing top 5 recent ratings
- Average rating display
- Individual review cards with truncation
- Click-outside handling
- Responsive design

Usage:
```jsx
<UserRatingsDropdown userId={userId} userName="User Name" />
```

### 3. Page Updates

#### My Orders Page (`client/src/pages/MyOrders.jsx`)
- New "Rate Seller" button appears for shipped/delivered orders
- Button only visible if order hasn't been rated yet
- Clicking button opens RatingModal
- Shows "✓ Rated" badge for completed ratings
- Automatically refreshes after successful submission

#### Seller Analytics (`client/src/pages/SellerAnalytics.jsx`)
- New "Community Trust Score" card at top of dashboard
- Displays:
  - Average rating (0-5.0)
  - Total number of ratings received
  - UserRatingsDropdown button to view all reviews
- Styled with matching color scheme (yellow/gold for trust)

#### Product Detail Pages
- **CarDetail.jsx** - UserRatingsDropdown in "Seller Information" section
- **PartDetail.jsx** - UserRatingsDropdown in "Seller Information" section
- Allows buyers to see seller ratings before purchasing

## User Flow

### For Buyers
1. Place an order for a car or part
2. Order gets shipped by the seller
3. On "My Orders" page, see "Rate Seller" button
4. Click button to open rating modal
5. Select 1-5 stars and write optional review
6. Submit rating
7. Badge changes to "✓ Rated"

### For Sellers
1. Receive orders from buyers
2. Ship the order
3. Receive ratings from buyers
4. View ratings in Analytics dashboard
5. See seller ratings displayed on product pages
6. Buyers can view your ratings before purchasing

## Database Changes

### User Schema Addition
```javascript
averageRating: { type: Number, default: 0, min: 0, max: 5 }
totalRatings: { type: Number, default: 0, min: 0 }
```

### Order Schema Addition
```javascript
isRatedByBuyer: { type: Boolean, default: false }
```

### New Collections
- **ratings** - Stores all user ratings and reviews

## Testing Checklist

1. **Rating Creation**
   - [ ] Create an order
   - [ ] Update order status to "shipped"
   - [ ] Rate seller (1-5 stars)
   - [ ] Add optional review text
   - [ ] Verify user averageRating updates

2. **View Ratings**
   - [ ] Check seller analytics - trust score displayed
   - [ ] View product page - seller ratings visible
   - [ ] Click dropdown - shows all reviews
   - [ ] Verify average rating calculation

3. **Prevent Duplicates**
   - [ ] Try to rate same order twice
   - [ ] Should get error message
   - [ ] Rating button should disappear after first rating

4. **Error Handling**
   - [ ] Try to rate without selecting stars
   - [ ] Try to rate from non-buyer user
   - [ ] Verify error messages displayed

## API Interaction Example

```javascript
// Create a rating
const response = await axiosInstance.post('/ratings', {
  orderId: '12345',
  ratedUserId: '67890',
  rating: 5,
  review: 'Great seller, fast shipping!'
});

// Fetch ratings
const ratings = await axiosInstance.get('/ratings/67890?limit=10');

// Check if order rated
const status = await axiosInstance.get('/ratings/check/12345');
```

## Important Notes

- Ratings can only be given by order buyers
- Ratings can only be given for shipped/delivered orders
- Review text is limited to 500 characters
- Average rating is automatically recalculated when ratings change
- Deleted ratings also trigger recalculation
- Only the rater or admin can delete a rating

## Future Enhancement Ideas

- Add rating for buyers as well (seller rating buyer)
- Response from seller to reviews
- Filter/sort ratings by rating level
- Helpful/unhelpful votes on reviews
- Rating trends visualization
- Reward system for highly-rated sellers
- Badge/achievement system
