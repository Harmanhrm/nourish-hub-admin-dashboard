import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_ALL_REVIEWS = gql`
  query GetAllReviews($orderBy: String, $isFlagged: Boolean, $rating: Int, $isDeleted: Boolean) {
    getAllReviews(orderBy: $orderBy, isFlagged: $isFlagged, rating: $rating, isDeleted: $isDeleted) {
      review_id
      product_id
      user_id
      content
      submission_date
      rating
      isDeleted
      isFlagged
      product_name
      user_name
    }
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteReview($review_id: Int!) {
    deleteReview(review_id: $review_id) {
      review_id
    }
  }
`;

const UPDATE_REVIEW_CONTENT = gql`
  mutation UpdateReviewContent($review_id: Int!, $content: String!) {
    updateReviewContent(review_id: $review_id, content: $content) {
      review_id
      content
    }
  }
`;

function ReviewManagement() {
  const [orderBy, setOrderBy] = useState('');
  const [isFlagged, setIsFlagged] = useState(null);
  const [isDeleted, setIsDeleted] = useState(null);
  const [rating, setRating] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [newContent, setNewContent] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_ALL_REVIEWS, {
    variables: {
      orderBy,
      isFlagged: isFlagged === null ? undefined : isFlagged,
      isDeleted: isDeleted === null ? undefined : isDeleted,
      rating: rating !== '' ? parseInt(rating, 10) : undefined
    },
  });

  const [deleteReview] = useMutation(DELETE_REVIEW);
  const [updateReviewContent] = useMutation(UPDATE_REVIEW_CONTENT);

  const handleDelete = async (review_id) => {
    try {
      await deleteReview({ variables: { review_id } });
      refetch();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setNewContent(review.content);
  };

  const handleSave = async () => {
    if (newContent.length < 1 || newContent.length > 100) {
      alert('Content must be between 1 and 100 characters.');
      return;
    }
    try {
      await updateReviewContent({ variables: { review_id: editingReview.review_id, content: newContent } });
      setEditingReview(null);
      setNewContent('');
      refetch();
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleCancel = () => {
    setEditingReview(null);
    setNewContent('');
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  function calculateTimeSinceCreation(signUpDate) {
    const signUpTimestamp = parseInt(signUpDate);
    const signUpDateTime = new Date(signUpTimestamp);
    const currentDate = new Date();
    const differenceMs = currentDate - signUpDateTime;
    const seconds = Math.floor(differenceMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const years = Math.floor(days / 365);
    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (weeks > 0) {
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
}
const truncatedContent = (content) => {
  if (content.length > 8) {
    return content.slice(0, 8) + '...';
  }
  return content;
};

  return (
    <div className="review-management">
      <h1>Review Management Section</h1>
      <div>
        <label>
          Sort by Date:
          <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            <option value="">Select</option>
            <option value="asc">Oldest First</option>
            <option value="desc">Newest First</option>
          </select>
        </label>
        <label>
          Flagged Reviews:
          <select value={isFlagged} onChange={(e) => setIsFlagged(e.target.value === 'null' ? null : (e.target.value === 'true' ? true : false))}>
            <option value="null">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Deleted Reviews:
          <select value={isDeleted} onChange={(e) => setIsDeleted(e.target.value === 'null' ? null : (e.target.value === 'true' ? true : false))}>
            <option value="null">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Rating:
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">All Ratings</option>
            {[0, 1, 2, 3, 4, 5].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Product</th>
            <th>Content</th>
            <th>Submission Date</th>
            <th>Rating</th>
            <th>Is Deleted</th>
            <th>Is Flagged</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data && data.getAllReviews.map(review => (
            <tr key={review.review_id}>
              <td>{review.user_name}</td>
              <td>{review.product_name}</td>
              <td>{truncatedContent(review.content)}</td>
              <td>{calculateTimeSinceCreation(review.submission_date)}</td>
              <td>{review.rating + "/5"}</td>
              <td>{review.isDeleted ? "Yes" : "No"}</td>
              <td>{review.isFlagged ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => handleEdit(review)}>Edit</button>
                <button onClick={() => handleDelete(review.review_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingReview && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Review</h2>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows="5"
              cols="50"
            />
            <div className="modal-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewManagement;
