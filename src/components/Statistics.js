import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GET_REVIEW_COUNTS = gql`
  query GetReviewCounts {
    getReviewCounts {
      productId
      product_name
      reviewCount
    }
  }
`;

const GET_AVERAGE_RATINGS = gql`
  query GetAverageRatings {
    getAverageRatings {
      productId
      product_name
      averageRating
    }
  }
`;

const GET_USER_REVIEW_COUNTS = gql`
  query GetUserReviewCounts {
    getUserReviewCounts {
      userId
      userName
      reviewCount
    }
  }
`;

function Statistics() {
  const { loading: loadingCounts, error: errorCounts, data: dataCounts } = useQuery(GET_REVIEW_COUNTS);
  const { loading: loadingRatings, error: errorRatings, data: dataRatings } = useQuery(GET_AVERAGE_RATINGS);
  const { loading: loadingUserCounts, error: errorUserCounts, data: dataUserCounts } = useQuery(GET_USER_REVIEW_COUNTS);

  if (loadingCounts || loadingRatings || loadingUserCounts) return <p>Loading metrics...</p>;
  if (errorCounts) return <p>Error loading review counts: {errorCounts.message}</p>;
  if (errorRatings) return <p>Error loading average ratings: {errorRatings.message}</p>;
  if (errorUserCounts) return <p>Error loading user review counts: {errorUserCounts.message}</p>;

  const reviewCounts = {
    labels: dataCounts.getReviewCounts.map(item => item.product_name),
    datasets: [
      {
        label: 'Review Counts',
        data: dataCounts.getReviewCounts.map(item => item.reviewCount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }
    ]
  };

  const averageRatings = {
    labels: dataRatings.getAverageRatings.map(item => item.product_name),
    datasets: [
      {
        label: 'Average Ratings',
        data: dataRatings.getAverageRatings.map(item => item.averageRating),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }
    ]
  };

  const userReviewCounts = {
    labels: dataUserCounts.getUserReviewCounts.map(item => item.userName),
    datasets: [
      {
        label: 'User Review Counts',
        data: dataUserCounts.getUserReviewCounts.map(item => item.reviewCount),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      }
    ]
  };

  return (
    <div className="metrics-dashboard">
      <h2>Metrics Dashboard</h2>
      <div>
        <h3>Review Counts by Product</h3>
        <Bar data={reviewCounts} />
      </div>
      <div>
        <h3>Average Ratings by Product</h3>
        <Line data={averageRatings} />
      </div>
      <div>
        <h3>Review Counts by User</h3>
        <Bar data={userReviewCounts} />
      </div>
    </div>
  );
}

export default Statistics;
