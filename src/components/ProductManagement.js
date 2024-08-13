import React, { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';

const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    getAllProducts {
      id
      name
      image
      price
      isSpecial
      discount
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation ($id: String!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $name: String!, $price: Float!, $isSpecial: Boolean!, $discount: Int) {
    updateProduct(id: $id, name: $name, price: $price, isSpecial: $isSpecial, discount: $discount) {
      id
      name
      price
      isSpecial
      discount
    }
  }
`;

const ADD_PRODUCT = gql`
  mutation AddProduct($name: String!, $image: String!, $price: Float!) {
    addProduct(name: $name, image: $image, price: $price) {
      name
      image
      price
      isSpecial
      discount
    }
  }
`;

function ProductManagement() {
  const [errorMessage, setErrorMessage] = useState('');
  const { loading, error, data, refetch } = useQuery(GET_ALL_PRODUCTS);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  const [editProductId, setEditProductId] = useState(null);
  const [editableProduct, setEditableProduct] = useState({ name: '', image: '', price: '', isSpecial: false, discount: '' });
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [addProduct] = useMutation(ADD_PRODUCT);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', image: '', price: '', isSpecial: false, discount: '' });

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  const handleEdit = (product) => {
    setEditProductId(product.id);
    setEditableProduct({ ...product, isSpecial: product.isSpecial ? 'true' : 'false' }); // Ensure boolean is converted for select
  };

  const handleCancel = () => {
    setEditProductId(null);
    setEditableProduct(null);
  };

  const handleSubmit = async () => {
    if (!editableProduct.name || !editableProduct.price || isNaN(editableProduct.price)) {
      alert('Please enter valid values');
      return;
    }
    try {
      await updateProduct({
        variables: {
          id: editableProduct.id,
          name: editableProduct.name,
          price: parseFloat(editableProduct.price),
          isSpecial: editableProduct.isSpecial === 'true',
          discount: editableProduct.isSpecial === 'true' ? parseInt(editableProduct.discount, 10) || null : null
        }
      });
      setEditProductId(null);
      setEditableProduct(null);
      refetch();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again. ' + error.message);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteProduct({ variables: { id: productId } });
      refetch();
      alert('Product Removed')
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditableProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNewProductChange = (event) => {
    const { name, value, type, checked } = event.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSubmit = async () => {
    if (!newProduct.name || !newProduct.price || isNaN(newProduct.price)) {
      alert('Please enter valid values');
      return;
    }
    try {
      await addProduct({
        variables: {
          name: newProduct.name,
          image: newProduct.image,
          price: parseFloat(newProduct.price),
        }
      });
      setNewProduct({ name: '', image: '', price: ''});
      setShowAddForm(false);
      refetch();
      alert(newProduct.name + " added")
    } catch (error) {
      if (parseFloat(newProduct.price) <= 0.9)  {
        alert('Price must be greater than 0.9');
      }
      else {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
      }
    }
  };
  

  return (
    <div className="product-management">
      <h1>Product Catalog  <button onClick={() => setShowAddForm(true)} style={{ marginLeft: '20px' }}>Add</button></h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Image Link</th>
            <th>Price</th>
            <th>Special</th>
            <th>Discount (%)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.getAllProducts.map(product => (
            <tr key={product.id}>
              <td>
                {editProductId === product.id ? (
                  <input type="text" value={editableProduct.name} name="name" onChange={handleChange} />
                ) : product.name}
              </td>
              <td>
                {product.image && <a href={product.image} target="_blank" rel="noopener noreferrer">View Image</a>}
              </td>
              <td>
                {editProductId === product.id ? (
                  <input type="number" step="0.01" value={editableProduct.price} name="price" onChange={handleChange} />
                ) : `$${product.price.toFixed(2)}`}
              </td>
              <td>
                {editProductId === product.id ? (
                  <select name="isSpecial" value={editableProduct.isSpecial} onChange={handleChange}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : product.isSpecial ? "Yes" : "No"}
              </td>
              <td>
                {editProductId === product.id ? (
                  <input type="number" value={editableProduct.discount} name="discount" onChange={handleChange} />
                ) : product.discount ? `${product.discount}%` : "N/A"}
              </td>
              <td>
                {editProductId === product.id ? (
                  <>
                    <button onClick={handleSubmit}>Submit</button>
                    <button onClick={handleCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(product)}>Edit</button>
                    <button onClick={() => handleDelete(product.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <label>
              Name:
              <input type="text" name="name" value={newProduct.name} onChange={handleNewProductChange} />
            </label>
            <label>
              Image URL:
              <input type="text" name="image" value={newProduct.image} onChange={handleNewProductChange} />
            </label>
            <label>
              Price:
              <input type="number" step="0.01" name="price" value={newProduct.price} onChange={handleNewProductChange} />
            </label>
            <button onClick={handleAddSubmit}>Submit</button>
            <button onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
