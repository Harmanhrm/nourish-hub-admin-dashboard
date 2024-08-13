import React , {useState} from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_ALL_USERS = gql`
  query GetAllUsers($orderBy: String, $isBlocked: Boolean, $isDeleted: Boolean) {
    getAllUsers(orderBy: $orderBy, isBlocked: $isBlocked, isDeleted: $isDeleted) {
      uuid
      user_name
      mail
      sign_up_date
      isBlocked
      isDeleted
    }
  }
`;
const BLOCK_USER = gql`
  mutation BlockUser($uuid: String!) {
    blockUser(uuid: $uuid) {
      uuid
      isBlocked
    }
  }
`;

const UNBLOCK_USER = gql`
  mutation UnblockUser($uuid: String!) {
    unblockUser(uuid: $uuid) {
      uuid
      isBlocked
    }
  }
`;

function UserManagement() {
  const [orderBy, setOrderBy] = useState('');
  const [isBlocked, setIsBlocked] = useState(null); 
  const [isDeleted, setIsDeleted] = useState(null); 
  const { loading, error, data, refetch } = useQuery(GET_ALL_USERS, {
    variables: {
      orderBy, 
      isBlocked: isBlocked === null ? undefined : isBlocked,
      isDeleted: isDeleted === null ? undefined : isDeleted,  
    },
  });
  const [blockUser] = useMutation(BLOCK_USER);
  const [unblockUser] = useMutation(UNBLOCK_USER);
  
  const handleBlock = async (uuid) => {
    try {
      await blockUser({ variables: { uuid } });
      refetch();  
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblock = async (uuid) => {
    try {
      await unblockUser({ variables: { uuid } });
      refetch(); 
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
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
return (
  <div className="user-management">
    <h1>User Management Section</h1>
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
          Blocked Users:
          <select value={isBlocked} onChange={(e) => setIsBlocked(e.target.value === 'null' ? null : (e.target.value === 'true' ? true : false))}>
            <option value="null">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label>
          Deleted Users:
          <select value={isDeleted} onChange={(e) => setIsDeleted(e.target.value === 'null' ? null : (e.target.value === 'true' ? true : false))}>
            <option value="null">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      </div>
    <table>
<thead>
  <tr>
    <th>User Name</th>
    <th>Email</th>
    <th>Sign Up Date</th>
    <th>IsDeleted</th>
    <th>IsBlocked</th>
    <th></th>
  </tr>
</thead>
<tbody>
  {data.getAllUsers.map(user => (
    <tr key={user.uuid}>
      <td>{user.user_name}</td>
      <td>{user.mail}</td>
      <td>{calculateTimeSinceCreation(user.sign_up_date)}</td>
      <td>{user.isDeleted ? "yes" : "No"}</td>
      <td>{user.isBlocked ? "Yes": "No"}</td>
      <td>
        {user.isBlocked ? (
          <button onClick={() => handleUnblock(user.uuid)}>Unblock</button>
        ) : (
          <button onClick={() => handleBlock(user.uuid)}>Block</button>
        )}
      </td>
    </tr>
  ))}
</tbody>
</table>
  </div>
);
}

export default UserManagement;
